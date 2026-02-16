import { useState } from "react";

export default function ResultCard({ data }) {
  const { ai_detection: ai, virality, distribution, content_type, prompt_log } = data;
  const isAI = ai.prediction === "ai_generated";
  const pct = Math.round(ai.confidence * 100);
  const viralPct = Math.round(virality.score * 100);

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/70">
      {/* Header */}
      <div className="border-b border-neutral-800/60 bg-neutral-900 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Results &mdash; {content_type}
        </span>
      </div>

      <div className="divide-y divide-neutral-800/40 p-5">
        {/* AI Detection */}
        <div className="pb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Origin Detection
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isAI
                  ? "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20"
                  : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAI ? "bg-purple-400" : "bg-emerald-400"
                }`}
              />
              {isAI ? "AI-generated" : "Human-generated"}
            </span>
            <span className="text-sm text-neutral-500">{pct}% confidence</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            {ai.explanation}
          </p>
        </div>

        {/* Virality */}
        <div className="py-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Virality Score
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-white">
              {viralPct}
            </span>
            <span className="text-sm text-neutral-500">/ 100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${viralPct}%`,
                background: `linear-gradient(90deg, ${
                  viralPct > 60
                    ? "#a855f7, #ec4899"
                    : viralPct > 30
                      ? "#8b5cf6, #6366f1"
                      : "#6b7280, #4b5563"
                })`,
              }}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            {virality.explanation}
          </p>
        </div>

        {/* Distribution */}
        <div className="pt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Distribution Strategy
          </h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            {distribution.explanation}
          </p>

          {distribution.segments?.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {distribution.segments.map((seg, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-800/50 bg-neutral-950/50 p-3.5"
                >
                  <p className="text-sm font-medium text-neutral-200">
                    {seg.audience}
                  </p>
                  {seg.platforms?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {seg.platforms.map((p, j) => (
                        <span
                          key={j}
                          className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-400"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                    {seg.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Log */}
        {prompt_log && <PromptLogSection log={prompt_log} />}
      </div>
    </div>
  );
}

function PromptLogSection({ log }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-neutral-800/40 pt-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left"
      >
        <svg
          className={`h-4 w-4 text-neutral-500 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Prompt Log
        </h3>
        {log.total_tokens != null && (
          <span className="ml-auto text-xs tabular-nums text-neutral-600">
            {log.total_tokens.toLocaleString()} tokens
          </span>
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Token summary */}
          <div className="flex flex-wrap gap-4 text-xs">
            <Stat label="Model" value={log.model} />
            <Stat label="Frames sent" value={log.frames_sent} />
            <Stat label="Audio clips sent" value={log.audio_clips_sent} />
            {log.prompt_tokens != null && (
              <Stat label="Prompt tokens" value={log.prompt_tokens.toLocaleString()} />
            )}
            {log.completion_tokens != null && (
              <Stat label="Completion tokens" value={log.completion_tokens.toLocaleString()} />
            )}
            {log.total_tokens != null && (
              <Stat label="Total tokens" value={log.total_tokens.toLocaleString()} />
            )}
          </div>

          {/* System prompt */}
          <LogBlock title="System Prompt" content={log.system_prompt} />

          {/* User prompt */}
          <LogBlock title="User Prompt" content={log.user_prompt} />

          {/* Raw response */}
          <LogBlock title="Raw LLM Response" content={log.raw_response} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-neutral-950/60 px-3 py-1.5">
      <span className="text-neutral-500">{label}: </span>
      <span className="font-medium text-neutral-300">{value}</span>
    </div>
  );
}

function LogBlock({ title, content }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
        {title}
      </p>
      <pre className="max-h-48 overflow-auto rounded-lg bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-400">
        {content}
      </pre>
    </div>
  );
}
