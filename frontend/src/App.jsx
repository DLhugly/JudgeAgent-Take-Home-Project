import { useState } from "react";
import VideoPanel from "./components/VideoPanel";
import ResultCard from "./components/ResultCard";
import Pipeline from "./components/Pipeline";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleResult(data) {
    setResult(data);
    setError(null);
  }

  function handleError(msg) {
    setError(msg);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-purple-500/30">
      {/* Hero */}
      <header className="border-b border-neutral-800/50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
            Take-Home Project
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Judge Agent
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-400">
            An AI-powered video evaluation agent. Upload a video and get instant
            analysis across three dimensions:{" "}
            <span className="text-neutral-300">AI-origin detection</span>,{" "}
            <span className="text-neutral-300">virality scoring</span>, and{" "}
            <span className="text-neutral-300">distribution strategy</span>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Built with FastAPI, OpenCV, ffmpeg, and Gemini&nbsp;3&nbsp;Flash via
            OpenRouter. A single multimodal LLM call per request — no agent
            frameworks, no multi-step chains.
          </p>
        </div>
      </header>

      {/* Pipeline */}
      <Pipeline />

      {/* Evaluate */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-6 text-lg font-semibold text-white">Try it</h2>

        <VideoPanel onResult={handleResult} onError={handleError} />

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {result && <ResultCard data={result} />}
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-8 text-center text-xs text-neutral-600">
        Judge Agent &middot; FastAPI + React + Tailwind &middot;{" "}
        <a
          href="/docs"
          className="text-neutral-500 underline underline-offset-2 hover:text-neutral-300"
        >
          API Docs
        </a>
      </footer>
    </div>
  );
}
