import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const ScholarshipNormalizationSchema = z.object({
  name: z.string(),
  provider: z.string(),
  amount_min: z.number().nullable(),
  amount_max: z.number().nullable(),
  deadline: z.string().nullable(),
  eligibility_tags: z.array(z.string()),
  essay_required: z.boolean(),
  locality_level: z.enum(["local", "state", "national", "international"]).default("national"),
});

export type NormalizedScholarship = z.infer<typeof ScholarshipNormalizationSchema>;

export async function normalizeScholarshipData(rawText: string, html: string): Promise<NormalizedScholarship | null> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are a precise data extraction engine. Return ONLY JSON.",
  });

  const prompt = `Extract details from this snippet:\n${rawText}\n\n${html}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(responseText);
    return ScholarshipNormalizationSchema.parse(parsed);
  } catch (error) {
    console.error("[Normalizer] Extraction failed:", error);
    return null;
  }
}

/**
 * Batch normalization to save on API overhead.
 */
export async function normalizeScholarshipBatch(
  items: { rawText: string; html: string }[]
): Promise<NormalizedScholarship[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are a lead data extraction engine. Extract scholarship details from the provided batch. Return a JSON array of objects matching the schema. If data is missing, use null.
    
    Schema for each object:
    {
      "name": string,
      "provider": string,
      "amount_min": number | null,
      "amount_max": number | null,
      "deadline": "YYYY-MM-DD" | null,
      "eligibility_tags": string[],
      "essay_required": boolean,
      "locality_level": "local" | "state" | "national" | "international"
    }`,
  });

  const prompt = `Process these ${items.length} scholarship snippets:\n\n${items
    .map((it, i) => `ITEM ${i + 1}:\nTEXT: ${it.rawText}\nHTML: ${it.html}`)
    .join("\n\n---\n\n")}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(text);
    return z.array(ScholarshipNormalizationSchema).parse(parsed);
  } catch (error) {
    console.error("[Normalizer] Batch processing failed:", error);
    return [];
  }
}
