import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { address, budget, notes, photo } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const prompt = `
You are an ecological landscape designer for Fort Collins, Colorado.
Generate a concise landscape concept for:
- address/location: ${address}
- budget: ${budget}
- goals/notes: ${notes || "(none)"}

Return JSON that matches the schema exactly.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini", // you can change later
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "landscape_concept",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              budgetTier: { type: "string" },
              recommendedFocus: { type: "string" },
              sampleZones: { type: "array", items: { type: "string" } },
              roughCostBuckets: {
                type: "object",
                additionalProperties: false,
                properties: {
                  demo_range_low: { type: "number" },
                  demo_range_high: { type: "number" }
                },
                required: ["demo_range_low", "demo_range_high"]
              }
            },
            required: ["budgetTier", "recommendedFocus", "sampleZones", "roughCostBuckets"]
          }
        }
      }
    });

    // The SDK returns a convenience string on many responses:
    const outputText =
      // @ts-ignore
      response.output_text ??
      JSON.stringify(response);

    const concept = JSON.parse(outputText);

    return NextResponse.json({
      id: crypto.randomUUID(),
      address,
      budget,
      notes,
      photo: photo
        ? { name: photo.name, type: photo.type, size: photo.size }
        : null,
      concept
    });
  } catch (err: any) {
    console.error("AI generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
