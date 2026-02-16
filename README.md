# Judge Agent

## What I Built

A video judge agent that evaluates whether video content is AI-generated or human-produced, scores its viral potential, and recommends distribution strategies. It works by extracting 20 frames (OpenCV) and 20 evenly-spaced 4-second audio clips (ffmpeg) from a video, then sending everything to Gemini 3 Flash in a single multimodal API call — the model sees the frames and hears the speech natively, no separate transcription step. The result is structured JSON with confidence scores, explanations, and audience segmentation. A React frontend with three sample videos (live-action, CGI, AI-generated) lets you try it immediately.

## How to Run

```bash
# 1. Install Python dependencies
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Set your OpenRouter API key
echo "OPENROUTER_API_KEY=your-key-here" > .env
# Get one at https://openrouter.ai

# 3. Ensure ffmpeg is installed (for audio extraction)
brew install ffmpeg   # macOS
# apt install ffmpeg  # Linux

# 4. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 5. Start the server
uvicorn main:app --reload

# 6. Open http://127.0.0.1:8000
```

**CLI usage** (no server): `python run_judge.py video path/to/video.mp4`

**Frontend development**:
```bash
cd frontend && npm install && npm run dev   # Vite dev server on :5173
uvicorn main:app --reload                    # Backend on :8000
```

## Assumptions

1. **Single multimodal call**: One LLM call per video — 20 frames as images + 20 audio clips sent together. No multi-step agent or tool use.
2. **Heuristic detection**: AI-origin detection is prompt-based (not a trained classifier). Confidence is indicative, not calibrated.
3. **Visual evidence over transcript**: Human creators often use AI-written scripts, so the prompt weights visual artifacts more heavily than script style for origin detection.
4. **Content-only analysis**: Virality and distribution are judged from the content itself — no historical engagement data or platform APIs.
5. **ffmpeg required**: Audio extraction depends on ffmpeg. If unavailable, analysis falls back to frames only.
6. **OpenRouter + Gemini 3 Flash**: Chosen for native multimodal support (images + audio in one call) at low cost via OpenRouter's unified API.

## What I Would Improve With More Time

- **Container/bucket storage (S3)**: Store uploaded videos in cloud storage instead of processing them in-memory, enabling async processing and replay.
- **User authentication and paywalls**: Add auth (OAuth/JWT), usage tiers, and rate limiting for a production API.
- **Persistent database**: Store video metadata, classifications, and prompt logs in PostgreSQL for retrieval, analytics, and audit trails.
- **Deeper video processing**: Extract more frames (50+), longer audio clips, use optical flow analysis for motion artifacts, and run multiple analysis passes.
- **Stronger LLM models**: Use Claude or GPT-4o for higher-accuracy detection; ensemble multiple models and compare predictions.
- **Prompt calibration**: Tune prompts against a labeled dataset and document confidence bounds per content type.
- **Streaming/background jobs**: Queue long video processing with Celery/Redis, stream results via WebSocket for a better UX.
- **Model swapping**: Support runtime model selection via environment variable since OpenRouter provides a unified API across providers.

---

[GitHub](https://github.com/DLhugly/) · [LinkedIn](https://www.linkedin.com/in/jameslhebert/)
