import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { address, budget, notes, photo } = await req.json();

    const budgetTier =
      budget < 8000 ? "starter" : budget < 25000 ? "mid" : "premium";

    const systemPrompt = `
You are an expert ecological landscape designer in Fort Collins, Colorado.
You specialize in xeriscape, permaculture, native plants, water-wise design,
and phased residential implementations.

Always respond in structured JSON.
`;

    const userPrompt = `
Site address: ${address}
Budget: $${budget}
Budget tier: ${budgetTier}
Client notes: ${notes || "None provided"}

Generate:
- recommended design focus
- 4–6 landscape zones
- phased implementation notes
- rough cost range
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const aiOutput = JSON.parse(response.output_text);

    return NextResponse.json({
      id: crypto.randomUUID(),
      address,
      budget,
      notes,
      photo: photo
        ? { name: photo.name, type: photo.type, size: photo.size }
        : null,
      concept: aiOutput,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate concept" },
      { status: 500 }
    );
  }
}
