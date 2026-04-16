// app/api/essays/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentEssays } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { classifyEssayPrompt } from "@/lib/essay-classifier";
import { getEmbedding } from "@/lib/embeddings";
import { logActivity } from "@/lib/activity";

// ── POST /api/essays ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string; prompt?: string; content?: string; scholarshipId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, prompt, content, scholarshipId } = body;

  if (!title || !prompt || !content) {
    return NextResponse.json(
      { error: "title, prompt, and content are required" },
      { status: 400 }
    );
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    return NextResponse.json(
      { error: `Content must be at least 50 words (got ${wordCount})` },
      { status: 400 }
    );
  }

  try {
    const [archetype, embedding] = await Promise.all([
      classifyEssayPrompt(prompt),
      getEmbedding(prompt),
    ]);

    const [inserted] = await db
      .insert(studentEssays)
      .values({
        userId,
        title,
        prompt,
        content,
        archetype,
        embedding,
        wordCount,
        scholarshipId: scholarshipId ?? null,
      })
      .returning({ id: studentEssays.id, createdAt: studentEssays.createdAt });

    await logActivity(userId, "essay_created", inserted.id);

    return NextResponse.json(inserted, { status: 200 });
  } catch (err) {
    console.error("[POST /api/essays]", err);
    return NextResponse.json({ error: "Failed to save essay" }, { status: 500 });
  }
}

// ── GET /api/essays ───────────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const essays = await db
      .select({
        id:        studentEssays.id,
        title:     studentEssays.title,
        archetype: studentEssays.archetype,
        wordCount: studentEssays.wordCount,
        prompt:    studentEssays.prompt,
        createdAt: studentEssays.createdAt,
      })
      .from(studentEssays)
      .where(eq(studentEssays.userId, userId))
      .orderBy(desc(studentEssays.createdAt));

    return NextResponse.json(essays, { status: 200 });
  } catch (err) {
    console.error("[GET /api/essays]", err);
    return NextResponse.json({ error: "Failed to fetch essays" }, { status: 500 });
  }
}
