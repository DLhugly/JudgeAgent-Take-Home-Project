from pathlib import Path

from openai import OpenAI

from judge_agent.models import JudgeResult
from judge_agent.text_analyzer import analyze_text
from judge_agent.video_analyzer import analyze_video, analyze_video_bytes

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "google/gemini-3-flash-preview"


class JudgeAgent:
    def __init__(self, api_key: str | None = None, model: str = DEFAULT_MODEL):
        self.client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
        )
        self.model = model

    def judge_text(self, text: str) -> JudgeResult:
        return analyze_text(self.client, text, model=self.model)

    def judge_video_path(self, video_path: Path, transcript: str | None = None) -> JudgeResult:
        return analyze_video(
            self.client, Path(video_path), transcript=transcript, model=self.model
        )

    def judge_video_bytes(
        self, video_bytes: bytes, transcript: str | None = None
    ) -> JudgeResult:
        return analyze_video_bytes(
            self.client, video_bytes, transcript=transcript, model=self.model
        )
