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
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Add Essay</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Save an essay to your library for recycling across scholarships.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Essay Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leadership Essay — Gates Scholarship 2025"
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
              />
            </div>

            {/* Prompt */}
            <div className="space-y-1.5">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Original Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What was the original essay prompt?"
                required
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors resize-y"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Essay Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your full essay here…"
                required
                rows={12}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors resize-y"
              />
              <p className={`text-xs ${wordCountOk ? "text-emerald-600" : "text-gray-400"}`}>
                {wordCount} {wordCount === 1 ? "word" : "words"}
                {!wordCountOk && wordCount > 0 && " — minimum 50 required"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 text-sm transition-colors shadow-sm"
            >
              {loading ? "Saving…" : "Save Essay"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
