import { useRef, useState } from "react";
import { judgeVideo } from "../api";

const SAMPLES = [
  {
    key: "natural",
    label: "Natural (Live-Action)",
    file: "/sample-natural.mp4",
    desc: "Tears of Steel — real actors with VFX, has dialogue",
  },
  {
    key: "cgi",
    label: "CGI (Animated)",
    file: "/sample-cgi.mp4",
    desc: "Elephants Dream — Blender 3D animated short with dialogue",
  },
  {
    key: "ai",
    label: "AI-Generated",
    file: "/sample-ai.mp4",
    desc: "Sora — wooly mammoths in a snowy landscape",
  },
];

export default function VideoPanel({ onResult, onError }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  async function loadSample(sample) {
    setLoadingSample(sample.key);
    try {
      const r = await fetch(sample.file);
      if (!r.ok) throw new Error("Failed to load sample");
      const blob = await r.blob();
      const f = new File([blob], sample.file.split("/").pop(), {
        type: "video/mp4",
      });
      setFile(f);
      setFileName(sample.label);
    } catch {
      onError("Could not load sample video.");
    } finally {
      setLoadingSample(null);
    }
  }

  async function handleSubmit() {
    if (!file) {
      onError("Choose a video file.");
      return;
    }
    setLoading(true);
    try {
      const data = await judgeVideo(file);
      onResult(data);
    } catch (e) {
      onError(e.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function pickFile(f) {
    if (f) {
      setFile(f);
      setFileName(f.name);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) {
      pickFile(f);
    }
  }

  return (
    <div>
      {/* Sample picker */}
      <p className="mb-2 text-sm text-neutral-500">
        Pick a sample video or upload your own
      </p>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {SAMPLES.map((s) => (
          <button
            key={s.key}
            onClick={() => loadSample(s)}
            disabled={loadingSample !== null}
            className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
              fileName === s.label
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
            } disabled:opacity-50`}
          >
            <p className="text-sm font-medium text-neutral-200">{s.label}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{s.desc}</p>
            {loadingSample === s.key && (
              <p className="mt-1 text-xs text-purple-400">Loading...</p>
            )}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 transition-colors ${
          dragOver
            ? "border-purple-500/50 bg-purple-500/5"
            : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
        }`}
      >
        <svg
          className="mb-2 h-6 w-6 text-neutral-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-neutral-400">
          {file && !SAMPLES.some((s) => s.label === fileName) ? (
            <span className="text-neutral-200">{fileName}</span>
          ) : (
            <>
              <span className="font-medium text-neutral-300">
                Drop a video here
              </span>{" "}
              or click to upload your own
            </>
          )}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={(e) => pickFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Selected + Evaluate */}
      {file && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Spinner />}
            {loading ? "Evaluating..." : "Evaluate Video"}
          </button>
          {fileName && (
            <span className="text-sm text-neutral-500">
              {fileName}
            </span>
          )}
        </div>
      )}

      {loading && (
        <p className="mt-3 text-xs text-neutral-500">
          Extracting frames &amp; audio, sending to LLM — this may take a
          moment...
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
