import OpenAI from "openai";

let _openai: OpenAI | undefined;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("OpenAI returned no embedding");
  return embedding;
}
