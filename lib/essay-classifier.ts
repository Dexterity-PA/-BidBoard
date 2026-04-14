// lib/essay-classifier.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const VALID_ARCHETYPES = [
  "adversity",
  "career_goals",
  "community_impact",
  "identity",
  "leadership",
  "innovation",
  "financial_need",
  "other",
] as const;

type Archetype = typeof VALID_ARCHETYPES[number];

/**
 * Classify a scholarship essay prompt into one of 8 archetypes.
 * Returns the archetype label string. Falls back to "other" on unexpected output.
 */
export async function classifyEssayPrompt(prompt: string): Promise<Archetype> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 10,
    system:
      "You are an essay archetype classifier. Given a scholarship essay prompt, " +
      "return exactly one of these labels and nothing else: " +
      "adversity | career_goals | community_impact | identity | leadership | innovation | financial_need | other",
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text"
      ? response.content[0].text.trim().toLowerCase()
      : "other";

  return (VALID_ARCHETYPES as readonly string[]).includes(raw)
    ? (raw as Archetype)
    : "other";
}
