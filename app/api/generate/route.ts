import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address, budget, notes, photo } = await req.json();
  
  // Simulate "thinking" so it feels real in the demo
  await new Promise((r) => setTimeout(r, 900));

  const budgetTier =
    budget < 8000 ? "starter" : budget < 25000 ? "mid" : "premium";

  const recommendedFocus =
    budgetTier === "starter"
      ? "High-impact, low-cost xeriscape upgrades + simple phase plan."
      : budgetTier === "mid"
      ? "Full concept + phased implementation (hardscape + planting)."
      : "Premium integrated build (features + hardscape + irrigation + planting).";

  return NextResponse.json({
  id: crypto.randomUUID(),
  address,
  budget,
  notes,
  photo: photo
    ? {
        name: photo.name,
        type: photo.type,
        size: photo.size
      }
    : null,
  concept: {
    budgetTier,
    recommendedFocus,
    sampleZones: [
      "Entry xeriscape planting bed",
      "Backyard shade + seating pocket",
      "Pollinator corridor strip",
      "Water-smart drip zones"
    ],
    roughCostBuckets: {
      demo_range_low: Math.round(budget * 0.85),
      demo_range_high: Math.round(budget * 1.15)
    }
  }
});

}
