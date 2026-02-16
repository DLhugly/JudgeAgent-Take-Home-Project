import { useRef, useState } from "react";
import { judgeVideo } from "../api";

export default function VideoPanel({ onResult, onError }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleSubmit() {
    const file = fileRef.current?.files[0];
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

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
      setFileName(file.name);
    }
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver
            ? "border-purple-500/50 bg-purple-500/5"
            : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
        }`}
      >
        <svg
          className="mb-3 h-8 w-8 text-neutral-600"
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
          {fileName ? (
            <span className="text-neutral-200">{fileName}</span>
          ) : (
            <>
              <span className="font-medium text-neutral-300">
                Drop a video here
              </span>{" "}
              or click to browse
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          MP4, MOV, WebM &mdash; speech is extracted and analyzed automatically
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={(e) => setFileName(e.target.files[0]?.name || null)}
          className="hidden"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !fileName}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading && <Spinner />}
        {loading ? "Evaluating..." : "Evaluate Video"}
      </button>

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
