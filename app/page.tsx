"use client";

import { useState } from "react";

type Result = {
  id: string;
  address: string;
  budget: number;
  notes: string;
  concept: any;
  imageUrl?: string | null;
};

export default function Page() {
  const [address, setAddress] = useState("fort collins");
  const [budget, setBudget] = useState(15000);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, budget, notes }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.details || data?.error || "Request failed");
      }

      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Fort Collins Landscape Design Tool</h1>

      <div style={{ marginTop: 16 }}>
        <label>Property address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Budget: ${budget.toLocaleString()}</label>
        <input
          type="range"
          min={1000}
          max={75000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          style={{ width: "100%", marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Goals / notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., xeriscape + shade + seating + native pollinators"
          style={{ width: "100%", padding: 10, marginTop: 6, minHeight: 90 }}
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          fontWeight: 700,
        }}
      >
        {loading ? "Generating..." : "Generate Concept"}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#ffe6e6" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <h3>Generated concept image</h3>
              <img
                src={result.imageUrl}
                alt="Generated landscape concept"
                style={{ width: "100%", maxWidth: 700, borderRadius: 12 }}
              />
            </div>
          )}

          <h3>Concept JSON</h3>
          <pre style={{ padding: 12, background: "#f4f4f4", overflowX: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
