import { requireOnboarding } from "@/lib/requireOnboarding";
import { db } from "@/db";
import { studentEssays } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { EssayEngineClient } from "@/components/essay-engine-client";

export default async function EssaysPage() {
  const userId = await requireOnboarding();

  const essays = await db
    .select({
      id:        studentEssays.id,
      title:     studentEssays.title,
      archetype: studentEssays.archetype,
      wordCount: studentEssays.wordCount,
      prompt:    studentEssays.prompt,
      content:   studentEssays.content,
      createdAt: studentEssays.createdAt,
    })
    .from(studentEssays)
    .where(eq(studentEssays.userId, userId))
    .orderBy(desc(studentEssays.createdAt));

  return <EssayEngineClient essays={essays} />;
}
