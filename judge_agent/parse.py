import json
import re

from judge_agent.models import (
    JudgeResult,
    AIDetectionResult,
    ViralityResult,
    DistributionResult,
    AudienceSegment,
    OriginPrediction,
)


class JudgeParseError(Exception):
    """Raised when the LLM response cannot be parsed into a JudgeResult."""


def parse_judge_response(raw: str, content_type: str) -> JudgeResult:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise JudgeParseError(f"LLM returned invalid JSON: {e}. Raw: {cleaned[:200]}")

    try:
        return JudgeResult(
            content_type=content_type,
            ai_detection=AIDetectionResult(
                prediction=OriginPrediction(data["ai_detection"]["prediction"]),
                confidence=float(data["ai_detection"]["confidence"]),
                explanation=data["ai_detection"]["explanation"],
            ),
            virality=ViralityResult(
                score=float(data["virality"]["score"]),
                explanation=data["virality"]["explanation"],
            ),
            distribution=DistributionResult(
                segments=[
                    AudienceSegment(
                        audience=s["audience"],
                        platforms=s.get("platforms", []),
                        reason=s.get("reason", ""),
                    )
                    for s in data.get("distribution", {}).get("segments", [])
                ],
                explanation=data.get("distribution", {}).get("explanation", ""),
            ),
        )
    except (KeyError, TypeError, ValueError) as e:
        raise JudgeParseError(f"LLM response missing expected fields: {e}. Keys: {list(data.keys())}")
