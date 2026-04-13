// app/api/essays/recycle/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getEmbedding } from "@/lib/embeddings";

// ── GET /api/essays/recycle?prompt=... ────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = req.nextUrl.searchParams.get("prompt");
  if (!prompt) {
    return NextResponse.json({ error: "prompt query parameter is required" }, { status: 400 });
  }

  try {
    const embedding = await getEmbedding(prompt);
    const embeddingStr = JSON.stringify(embedding);

    const result = await db.execute(sql`
      SELECT
        id,
        title,
        archetype,
        word_count AS "wordCount",
        round((1 - (embedding <=> ${embeddingStr}::vector))::numeric, 2) AS similarity
      FROM student_essays
      WHERE user_id = ${userId}
        AND embedding IS NOT NULL
        AND (embedding <=> ${embeddingStr}::vector) < 0.25
      ORDER BY similarity DESC
      LIMIT 5
    `);

    const rows = (result.rows as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      similarity: Number(r.similarity),
    }));
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("[GET /api/essays/recycle]", err);
    return NextResponse.json({ error: "Failed to search essays" }, { status: 500 });
  }
}
