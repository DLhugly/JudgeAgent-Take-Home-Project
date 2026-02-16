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


class JudgeResult(BaseModel):
    ai_detection: AIDetectionResult
    virality: ViralityResult
    distribution: DistributionResult
    content_type: str = Field(description="text or video")
