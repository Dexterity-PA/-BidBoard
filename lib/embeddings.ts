// lib/embeddings.ts
import { VoyageAIClient } from "voyageai";

const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! });

/**
 * Generate a 1536-dimensional embedding for the given text using Voyage AI.
 * Uses the voyage-3-lite model — fast and cost-effective for semantic search.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await voyageClient.embed({
    input: [text],
    model: "voyage-3-lite",
  });
  const embedding = response.data?.[0]?.embedding;
  if (!embedding) throw new Error("Voyage AI returned no embedding");
  return embedding;
}
