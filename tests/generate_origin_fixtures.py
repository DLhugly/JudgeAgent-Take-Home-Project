#!/usr/bin/env python3
"""
Generate AI-origin test fixtures by calling the API. Labels are not made up:
we generate text with the API and label it "ai" by construction.

Usage:
  OPENROUTER_API_KEY=... python tests/generate_origin_fixtures.py

Writes tests/origin_labels.json. To test human detection, add entries with
label "human" and text you know you wrote (or from a verified source).
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from openai import OpenAI

FIXTURES = Path(__file__).parent / "origin_labels.json"

PROMPTS = [
    "Write two sentences giving advice on how to prioritize tasks at work.",
    "Explain in one short paragraph why reading is beneficial.",
    "List three tips for staying productive when working from home.",
    "Write a brief, neutral summary of the pros and cons of social media.",
    "In one paragraph, describe what makes a good team meeting.",
]


def main() -> None:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Set OPENROUTER_API_KEY.", file=sys.stderr)
        sys.exit(1)
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
    items = []
    for p in PROMPTS:
        r = client.chat.completions.create(
            model="google/gemini-3-flash-preview",
            max_tokens=200,
            messages=[{"role": "user", "content": p}],
            temperature=0.7,
        )
        text = (r.choices[0].message.content or "").strip()
        if text:
            items.append({"label": "ai", "text": text})
    with open(FIXTURES, "w") as f:
        json.dump(items, f, indent=2)
    print(f"Wrote {len(items)} AI-labeled items to {FIXTURES}")
    print("Human-labeled examples: add them manually with text you know you wrote.")


if __name__ == "__main__":
    main()
