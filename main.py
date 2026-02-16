import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from scalar_fastapi import get_scalar_api_reference

from judge_agent import JudgeAgent, JudgeResult
from judge_agent.parse import JudgeParseError

app = FastAPI(
    title="Judge Agent",
    description="Evaluates text and video content for origin, virality, and distribution.",
    docs_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/docs", include_in_schema=False)
async def docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

_agent: JudgeAgent | None = None


def get_agent() -> JudgeAgent:
    global _agent
    if _agent is None:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="OPENROUTER_API_KEY is not set. Add it to the environment or a .env file.",
            )
        _agent = JudgeAgent(api_key=api_key)
    return _agent


class TextInput(BaseModel):
    text: str


@app.post("/judge/text", response_model=JudgeResult)
def judge_text(body: TextInput) -> JudgeResult:
    """Evaluate a text string for origin, virality, and distribution."""
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text must be non-empty")
    agent = get_agent()
    try:
        return agent.judge_text(body.text)
    except JudgeParseError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/judge/video", response_model=JudgeResult)
async def judge_video(
    file: UploadFile = File(...),
    transcript: str | None = Form(None),
) -> JudgeResult:
    """Evaluate a video file for origin, virality, and distribution. Speech is transcribed automatically."""
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail="Upload must be a video file (e.g. video/mp4)",
        )
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    agent = get_agent()
    try:
        return await asyncio.to_thread(
            agent.judge_video_bytes, content, transcript
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except JudgeParseError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


_static_dir = Path(__file__).parent / "static"


@app.get("/")
async def index() -> FileResponse:
    path = _static_dir / "index.html"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Frontend not found. Run: cd frontend && npm run build")
    return FileResponse(path)


@app.get("/sample-{name}.mp4")
async def sample_video(name: str) -> FileResponse:
    if name not in ("natural", "cgi", "ai"):
        raise HTTPException(status_code=404)
    path = _static_dir / f"sample-{name}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Sample video not found")
    return FileResponse(path, media_type="video/mp4")


@app.get("/thumb-{name}.jpg")
async def sample_thumb(name: str) -> FileResponse:
    if name not in ("natural", "cgi", "ai"):
        raise HTTPException(status_code=404)
    path = _static_dir / f"thumb-{name}.jpg"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(path, media_type="image/jpeg")


if _static_dir.exists():
    app.mount("/assets", StaticFiles(directory=_static_dir / "assets"), name="static-assets")
