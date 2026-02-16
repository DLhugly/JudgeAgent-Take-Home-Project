import base64
import subprocess
import tempfile
from pathlib import Path

import cv2
from openai import OpenAI

from judge_agent.models import JudgeResult
from judge_agent.parse import parse_judge_response
from judge_agent.prompts import VIDEO_JUDGE_SYSTEM, VIDEO_JUDGE_USER

NUM_FRAMES = 6
JPEG_QUALITY = 85


def extract_audio(video_path: Path) -> bytes | None:
    """Extract audio from video as WAV using ffmpeg. Returns None if no audio or ffmpeg missing."""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        result = subprocess.run(
            [
                "ffmpeg", "-i", str(video_path),
                "-vn",              # no video
                "-ac", "1",         # mono
                "-ar", "16000",     # 16kHz sample rate
                "-f", "wav",        # wav format
                "-y",               # overwrite
                tmp_path,
            ],
            capture_output=True,
            timeout=30,
        )
        if result.returncode != 0:
            return None
        audio = Path(tmp_path).read_bytes()
        Path(tmp_path).unlink(missing_ok=True)
        return audio if len(audio) > 1000 else None  # skip tiny/empty files
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None


def extract_frames(video_path: Path, n: int = NUM_FRAMES) -> list[bytes]:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Could not open video file")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    indices = [
        min(int(total * i / (n + 1)), total - 1)
        for i in range(1, n + 1)
    ]
    if total < n:
        indices = list(range(total))
    frames = []
    for i in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, frame = cap.read()
        if not ok:
            continue
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        frames.append(buf.tobytes())
    cap.release()
    return frames


def analyze_video(
    client: OpenAI,
    video_path: Path,
    transcript: str | None = None,
    model: str = "google/gemini-3-flash-preview",
) -> JudgeResult:
    frames = extract_frames(video_path)
    if not frames:
        raise ValueError("No frames could be extracted from video")

    # Extract audio from video for speech analysis
    audio_bytes = extract_audio(video_path)

    # Build transcript info
    if transcript:
        transcript_text = transcript
    elif audio_bytes:
        transcript_text = "(Audio included below — transcribe and analyze the speech)"
    else:
        transcript_text = "(No audio available)"

    # Build multimodal content: text + frames + audio
    content: list[dict] = []

    # Add frames as images
    for raw in frames:
        b64 = base64.standard_b64encode(raw).decode("ascii")
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
        })

    # Add audio if extracted
    if audio_bytes and not transcript:
        audio_b64 = base64.standard_b64encode(audio_bytes).decode("ascii")
        content.append({
            "type": "input_audio",
            "input_audio": {
                "data": audio_b64,
                "format": "wav",
            },
        })

    # Add the text prompt last
    content.append({
        "type": "text",
        "text": VIDEO_JUDGE_USER.format(
            n_frames=len(frames),
            transcript=transcript_text,
        ),
    })

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": VIDEO_JUDGE_SYSTEM},
            {"role": "user", "content": content},
        ],
        temperature=0.2,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    raw_text = response.choices[0].message.content or "{}"
    return parse_judge_response(raw_text, "video")


def analyze_video_bytes(
    client: OpenAI,
    video_bytes: bytes,
    transcript: str | None = None,
    model: str = "google/gemini-3-flash-preview",
) -> JudgeResult:
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(video_bytes)
        path = Path(f.name)
    try:
        return analyze_video(client, path, transcript=transcript, model=model)
    finally:
        path.unlink(missing_ok=True)
