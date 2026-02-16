const VIDEO_STEPS = [
  {
    label: "Upload Video",
    detail: "MP4, MOV, etc.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    label: "Extract Frames & Audio",
    detail: "OpenCV samples 20 frames, ffmpeg extracts 20 audio clips (4s each)",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
  {
    label: "Multimodal LLM",
    detail: "Gemini 3 Flash — images + audio in one call via OpenRouter",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    label: "Structured Results",
    detail: "AI detection, virality score, distribution analysis",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

function Arrow() {
  return (
    <div className="hidden items-center text-neutral-700 sm:flex">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </div>
  );
}

export default function Pipeline() {
  return (
    <section className="border-b border-neutral-800/50 bg-neutral-900/30">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          How it works
        </h2>
        <p className="mb-8 text-sm text-neutral-400">
          The video pipeline samples 20 frames and extracts 20 evenly-spaced
          4-second audio clips, then sends everything to a multimodal LLM in a
          single call — the model sees the frames <em>and</em> hears the speech
          natively. No separate transcription step.
        </p>

        {/* Steps */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:gap-0">
          {VIDEO_STEPS.map((step, i) => (
            <div key={i} className="contents">
              {i > 0 && <Arrow />}
              <div className="flex-1 rounded-lg border border-neutral-800/60 bg-neutral-900/80 p-4">
                <div className="mb-2 text-purple-400">{step.icon}</div>
                <p className="text-sm font-medium text-neutral-200">
                  {step.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-neutral-600">
          For short videos (&lt;80s), the full audio track is sent instead of
          clips.
        </p>
      </div>
    </section>
  );
}
