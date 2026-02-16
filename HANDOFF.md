# Judge Agent — Conversation Export & Pick-Up Guide

## Goal

Build a take-home "Judge Agent" that evaluates **text and video** and returns:

1. Prediction: AI-generated vs human-generated (with confidence and explanation)
2. Virality score (0–1) and explanation
3. Distribution analysis (audiences, platforms, why) and explanation
4. Concise explanation for each output

Spec is intentionally open; they care about reasoning, assumptions, and design choices. ~6 hours work, 48h to submit. Deliver: public GitHub repo + README (what you built, how to run, assumptions, what you’d improve); optional Loom.

Full instructions are in **project_instructions.md**.

---

## What Was Built

1. **Backend (FastAPI)**  
   - `POST /judge/text` (JSON body `{ "text": "..." }`)  
   - `POST /judge/video` (multipart: `file` + optional `transcript`)  
   - `GET /health`, `GET /` (demo UI), `GET /docs` (Scalar API docs)  
   - Graceful start: app runs without `OPENAI_API_KEY`; judge endpoints return 503 with a clear message if key is missing.  
   - `.env` loaded via `python-dotenv` so you can set `OPENAI_API_KEY` in `.env`.

2. **Judge agent (hand-built, no CrewAI/LangGraph)**  
   - **Text:** one GPT-4o call with a structured prompt; response parsed to Pydantic (`JudgeResult`).  
   - **Video:** OpenCV samples 6 frames → base64 to GPT-4o vision; speech transcribed with **OpenAI Whisper API** (no manual transcript). Transcript + frames sent in one prompt.  
   - Single LLM call per request; outputs: `ai_detection`, `virality`, `distribution`, each with explanation.

3. **Frontend**  
   - Single page at `/`: Text tab (textarea + Evaluate) and Video tab (file upload; speech auto-transcribed). Dark UI, shows result (origin badge, virality bar, distribution segments).

4. **Docs**  
   - Scalar at `/docs` (replaced default Swagger).  
   - README: what you built, how to run, assumptions, “what you’d improve,” plus a note that we considered script-only origin detection but rejected it because human creators often use AI for scripts.

5. **Testing AI-origin**  
   - No fake labels: **AI** labels are created by running `tests/generate_origin_fixtures.py` (calls API to generate text, saves with `label: "ai"`). **Human** labels require you to add your own text with known provenance to `tests/origin_labels.json`.  
   - Run: `python tests/generate_origin_fixtures.py` then `OPENAI_API_KEY=... python tests/test_origin_detection.py`.

---

## Key Decisions (From Conversation)

1. **No agent framework** — Hand-built pipeline (FastAPI + judge module). Avoids CrewAI/LangChain so the reviewer sees your structure and reasoning.
2. **FastAPI** — Chosen for async, Pydantic, and common use for LLM APIs.
3. **Whisper** — Manual transcript removed; video speech is transcribed via OpenAI Whisper API so the judge gets transcript + frames.
4. **Script-only origin** — We considered judging “AI vs human” from the transcript only. Rejected: many human-made videos use AI-written scripts (agencies, creators), so script style would misattribute. We use frames + transcript together. This is documented in the README.
5. **Testing “AI-generated”** — Static “human”/“ai” labels were seen as “made up.” Switched to: generate AI examples via API (labels by construction); human examples = add your own with known provenance.

---

## Repo Layout (Excluding .venv)

```
main.py                 # FastAPI app, routes, dotenv, Scalar /docs
run_judge.py            # CLI: python run_judge.py text "..." | video <path>
requirements.txt
README.md
project_instructions.md # Verbatim assessment instructions
HANDOFF.md              # This file
.gitignore
static/
  index.html            # Demo UI (text + video tabs)
judge_agent/
  __init__.py
  models.py             # Pydantic: JudgeResult, AIDetectionResult, etc.
  parse.py              # JSON → JudgeResult
  prompts.py            # System/user prompts for text and video
  text_analyzer.py      # analyze_text(client, text) → JudgeResult
  video_analyzer.py     # transcribe_video, extract_frames, analyze_video(bytes)
  judge_agent.py        # JudgeAgent: judge_text, judge_video_path, judge_video_bytes
tests/
  origin_labels.json    # Filled by generate_origin_fixtures.py (+ optional human rows)
  generate_origin_fixtures.py  # Calls API to create AI-labeled rows
  test_origin_detection.py     # Runs judge on origin_labels.json, prints accuracy
```

---

## How to Run

1. `cd "Take Home"` (or repo root)  
2. `python3 -m venv .venv` && `source .venv/bin/activate`  
3. `pip install -r requirements.txt`  
4. Set `OPENAI_API_KEY` (env or `.env` in repo root)  
5. `uvicorn main:app --reload`  
6. Open http://127.0.0.1:8000 (UI), http://127.0.0.1:8000/docs (Scalar)

CLI (no server):  
`python run_judge.py text "Some post here"` or `python run_judge.py video /path/to/video.mp4`

---

## How to Test AI-Origin Detection

1. `python tests/generate_origin_fixtures.py` — writes AI-labeled samples to `tests/origin_labels.json`.  
2. Optionally edit `origin_labels.json` to add `{"label": "human", "text": "..."}` for text you know you wrote.  
3. `OPENAI_API_KEY=... python tests/test_origin_detection.py` — runs judge on each row and prints accuracy.

---

## Pick-Up / Open Items

1. **Submit** — Push to a public GitHub repo; reply with link; ensure README has the four requested sections. Optional Loom 2–4 min.  
2. **README** — Already has what you built, how to run, assumptions, what you’d improve; script-origin note is in place.  
3. **Optional improvements** (from README): prompt calibration, streaming/large-video handling, second-pass prompts, unit/integration tests.  
4. **Video testing** — Test with real videos (e.g. short clips from Pexels/Pixabay or your own) to confirm Whisper + frame pipeline end-to-end.

---

## Conversation Summary (Condensed)

- Started with assessment text; added README with verbatim requirements, then moved those to **project_instructions.md**.  
- Decided hand-built agent + FastAPI (no CrewAI); confirmed FastAPI good for LLM APIs.  
- Built judge (text + video), Pydantic models, prompts, parse; added Whisper for auto transcript; added demo UI and Scalar at `/docs`; graceful start and `.env`.  
- Discussed how to “really” test AI-origin; introduced fixture generator + test script so AI labels aren’t made up.  
- Documented why we don’t judge origin from script alone (human creators use AI scripts).  
- You asked for an export of the conversation and goal to pick up later → this HANDOFF.md.

You can resume by: reading **project_instructions.md** and **README.md**, then running the app and optionally the origin test as above.
