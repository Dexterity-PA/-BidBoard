// app/essays/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function NewEssayPage() {
  const router = useRouter();
  const [title, setTitle]     = useState("");
  const [prompt, setPrompt]   = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const wordCount   = countWords(content);
  const wordCountOk = wordCount >= 50;
  const canSubmit   = title.trim() && prompt.trim() && content.trim() && wordCountOk && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/essays");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Add Essay</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Save an essay to your library for recycling across scholarships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">
              Essay Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leadership Essay — Gates Scholarship 2025"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
              Original Prompt <span className="text-red-400">*</span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What was the original essay prompt?"
              required
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 resize-y"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label htmlFor="content" className="block text-sm font-medium text-slate-300">
              Essay Content <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your full essay here…"
              required
              rows={12}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 resize-y"
            />
            {/* Live word counter */}
            <p
              className={`text-xs ${
                wordCountOk ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
              {!wordCountOk && wordCount > 0 && " — minimum 50 required"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors duration-150"
          >
            {loading ? "Saving…" : "Save Essay"}
          </button>

        </form>
      </div>
    </main>
  );
}
