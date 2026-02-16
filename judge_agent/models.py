from enum import Enum
from pydantic import BaseModel, Field


class OriginPrediction(str, Enum):
    AI_GENERATED = "ai_generated"
    HUMAN_GENERATED = "human_generated"


class AIDetectionResult(BaseModel):
    prediction: OriginPrediction
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str


class ViralityResult(BaseModel):
    score: float = Field(ge=0.0, le=1.0, description="Likelihood content would perform well socially")
    explanation: str


class AudienceSegment(BaseModel):
    audience: str
    platforms: list[str] = Field(default_factory=list)
    reason: str


class DistributionResult(BaseModel):
    segments: list[AudienceSegment]
    explanation: str


class PromptLog(BaseModel):
    model: str = Field(description="LLM model used")
    system_prompt: str = Field(description="System prompt sent to the model")
    user_prompt: str = Field(description="User prompt / template sent to the model")
    raw_response: str = Field(description="Raw text response from the model")
    frames_sent: int = Field(default=0, description="Number of image frames sent")
    audio_clips_sent: int = Field(default=0, description="Number of audio clips sent")
    prompt_tokens: int | None = Field(default=None, description="Prompt token count")
    completion_tokens: int | None = Field(default=None, description="Completion token count")
    total_tokens: int | None = Field(default=None, description="Total token count")


class JudgeResult(BaseModel):
    ai_detection: AIDetectionResult
    virality: ViralityResult
    distribution: DistributionResult
    content_type: str = Field(description="text or video")
    prompt_log: PromptLog | None = Field(default=None, description="Raw prompt and token usage log")
