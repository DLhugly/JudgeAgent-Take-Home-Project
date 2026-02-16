#!/usr/bin/env python3
"""Run the judge agent on a text string or a local video file. Requires OPENROUTER_API_KEY."""
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from judge_agent import JudgeAgent


def main() -> None:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Set OPENROUTER_API_KEY in the environment or .env file.", file=sys.stderr)
        sys.exit(1)
    if len(sys.argv) < 3:
        print("Usage: python run_judge.py text <string>")
        print("       python run_judge.py video <path_to_video>")
        sys.exit(1)
    mode = sys.argv[1].lower()
    if mode == "text":
        text = " ".join(sys.argv[2:])
        if not text.strip():
            print("Provide non-empty text.")
            sys.exit(1)
        agent = JudgeAgent(api_key=api_key)
        result = agent.judge_text(text)
    elif mode == "video":
        path = Path(sys.argv[2])
        if not path.exists():
            print(f"File not found: {path}")
            sys.exit(1)
        agent = JudgeAgent(api_key=api_key)
        result = agent.judge_video_path(path)
    else:
        print("Mode must be 'text' or 'video'.")
        sys.exit(1)
    print(json.dumps(result.model_dump(), indent=2))


if __name__ == "__main__":
    main()
