# Judge Agent

## What You Built

A FastAPI service with a demo frontend that exposes a judge agent for text and video. The agent uses a single Gemini 3 Flash call (via OpenRouter) per request to produce: (1) AI vs human origin prediction with confidence and explanation, (2) virality score 0–1 with explanation, and (3) distribution analysis (audience segments, platforms, reasons) with explanation. Video is handled by sampling frames with OpenCV and extracting audio with ffmpeg, then sending frames + audio in a single multimodal API call — the model sees the visuals and hears the speech natively.

## How to Run

1. Create a virtualenv and install deps: `python -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt`
2. Set `OPENROUTER_API_KEY` in the environment or in a `.env` file (get one at [openrouter.ai](https://openrouter.ai))
3. Ensure `ffmpeg` is installed (for video audio extraction): `brew install ffmpeg` / `apt install ffmpeg`
4. Start the server: `uvicorn main:app --reload`
5. Open http://127.0.0.1:8000 for the demo UI (text input or video upload). API docs: http://127.0.0.1:8000/docs

CLI (no server): `python run_judge.py text "Some text"` or `python run_judge.py video path/to/video.mp4`

## Assumptions

1. OpenRouter API with Gemini 3 Flash is the LLM provider; API key is required. No local models.
2. AI-origin detection is heuristic (LLM-based); no ground-truth labels or classifier training. Confidence is indicative, not calibrated.
3. Video input is a single file (e.g. MP4); we sample 6 frames and extract the audio track. Both are sent to the model in one multimodal call — the model processes images and audio natively.
4. Virality and distribution are judged from content only; no historical engagement data or platform APIs.
5. Single LLM call per request; no multi-step agent or tool use.
6. ffmpeg is required for audio extraction from video; if unavailable, video analysis falls back to frames only.

One approach we considered was judging AI vs human origin from the video script (transcript) alone—e.g. whether the wording seemed human- or AI-written. A problem: even creative agencies and human content creators often use AI to draft or polish scripts, so a real human-made video can still have an AI-written script. Classifying by script alone would then misattribute the whole video. We therefore use frames plus audio together and let the judge reason over both, rather than reducing origin to script style.

## What You Would Improve With More Time

1. Calibrate or tune prompts with a small labeled set and document confidence bounds.
2. Streaming or background jobs for large videos; rate limiting and caching for repeat inputs.
3. Optional second pass (e.g. separate prompts per dimension) for clearer chain-of-thought and more stable outputs.
4. Tests: unit tests for parsing and frame extraction; integration test with mocked API.
5. Support swapping models via environment variable (e.g. Claude, GPT-4o) since OpenRouter provides a unified API.
