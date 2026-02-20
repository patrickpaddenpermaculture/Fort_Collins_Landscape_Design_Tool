import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { address, budget, notes } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const budgetTier =
      budget < 8000 ? "starter" : budget < 25000 ? "mid" : "premium";

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are a professional regenerative landscape designer in Fort Collins, Colorado. Be practical, cost-aware, and implementation-oriented.",
        },
        {
          role: "user",
          content: `Create a landscape concept for:
Address: ${address}
Budget: $${budget} (${budgetTier})
Goals/Notes: ${notes}

Return ONLY valid JSON with the following keys:
design_summary (string)
recommended_features (array of 5 strings)
phased_plan (array of 3 strings)
plant_palette (array of 8-12 strings)
irrigation_strategy (string)
estimated_low (number)
estimated_high (number)
`,
        },
      ],
      text: { format: { type: "json_object" } },
    });

    const concept = JSON.parse(response.output_text);

    return NextResponse.json({
      id: crypto.randomUUID(),
      address,
      budget,
      notes,
      concept,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "AI generation failed." },
      { status: 500 }
    );
  }
}
