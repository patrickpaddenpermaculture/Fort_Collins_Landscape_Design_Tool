"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

export default function NewConceptPage() {
  const MIN = 1000;
  const MAX = 75000;
  const STEP = 500;

  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState(15000);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const budgetLabel = useMemo(() => formatUSD(budget), [budget]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, budget, notes })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
      setResult(data);
    } catch (err: any) {
      setResult({ error: err?.message ?? "Unknown error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Home
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0" }}>
        New Concept
      </h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Set a budget and generate a demo concept payload.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Property address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Fort Collins, CO"
            required
            style={{
              padding: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 10,
              fontSize: 16
            }}
          />
        </label>

        <section
          style={{
            padding: 16,
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 14
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>Budget</div>
              <div style={{ opacity: 0.7, fontSize: 14 }}>
                Drag to set your target project budget.
              </div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{budgetLabel}</div>
          </div>

          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: "100%", marginTop: 12 }}
            aria-label="Budget"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 12,
              opacity: 0.75
            }}
          >
            <span>{formatUSD(MIN)}</span>
            <span>{formatUSD(MAX)}</span>
          </div>
        </section>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Goals / notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., xeriscape + shade + seating + native pollinators"
            rows={4}
            style={{
              padding: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 10,
              fontSize: 16
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            fontWeight: 800,
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Generating..." : "Generate Concept"}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {result?.error && (
          <p style={{ color: "crimson", fontWeight: 800 }}>Error: {result.error}</p>
        )}

        {result && !result.error && (
          <pre
            style={{
              padding: 16,
              borderRadius: 12,
              background: "rgba(0,0,0,0.04)",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
