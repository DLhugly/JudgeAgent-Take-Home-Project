#!/usr/bin/env python3
"""
Run the judge on labeled text and report accuracy. Labels must have real provenance:
  - AI: generate with tests/generate_origin_fixtures.py (labels by construction).
  - Human: add entries yourself with text you know you wrote.

Usage:
  1. python tests/generate_origin_fixtures.py   # creates AI-labeled rows
  2. Optionally edit tests/origin_labels.json to add label "human" + your text
  3. OPENROUTER_API_KEY=... python tests/test_origin_detection.py
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from judge_agent import JudgeAgent
from judge_agent.models import OriginPrediction

FIXTURES = Path(__file__).parent / "origin_labels.json"


def main() -> None:
    if not os.getenv("OPENROUTER_API_KEY"):
        print("Set OPENROUTER_API_KEY to run this test.", file=sys.stderr)
        sys.exit(1)
    if not FIXTURES.exists():
        print(f"Fixtures not found: {FIXTURES}. Run tests/generate_origin_fixtures.py first.", file=sys.stderr)
        sys.exit(1)
    with open(FIXTURES) as f:
        items = json.load(f)
    if not items:
        print("No fixtures. Run tests/generate_origin_fixtures.py first.", file=sys.stderr)
        sys.exit(1)

    agent = JudgeAgent(api_key=os.getenv("OPENROUTER_API_KEY"))
    correct = 0
    for i, item in enumerate(items):
        label = item["label"]
        text = item["text"]
        expected = OriginPrediction.AI_GENERATED if label == "ai" else OriginPrediction.HUMAN_GENERATED
        result = agent.judge_text(text)
        pred = result.ai_detection.prediction
        confidence = result.ai_detection.confidence
        ok = pred == expected
        if ok:
            correct += 1
        print(f"  [{i+1}] expected={expected.value} predicted={pred.value} confidence={confidence:.2f} {'OK' if ok else 'MISS'}")

    accuracy = correct / len(items)
    print()
    print(f"Accuracy: {correct}/{len(items)} = {accuracy:.0%}")


if __name__ == "__main__":
    main()
