"use client";

import { useMemo, useState } from "react";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState(15000);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const pretty = useMemo(() => {
    if (!result) return "";
    return JSON.stringify(result, null, 2);
  }, [result]);

  async function onGenerate() {
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, budget, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.details || data?.error || "Request failed");
        setLoading(false);
        return;
      }

      setResult(data);
      setLoading(false);
    } catch (e: any) {
      setErrorMsg(e?.message || "Unknown error");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        Fort Collins Landscape Design Tool (MVP)
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <strong>Property address</strong>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Maple St, Fort Collins, CO"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Budget</strong>
            <strong>{formatUSD(budget)}</strong>
          </div>
          <div style={{ color: "#555", marginTop: 4 }}>
            Drag to set your target project budget.
          </div>
          <input
            type="range"
            min={1000}
            max={75000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{ width: "100%", marginTop: 10 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
            <span>{formatUSD(1000)}</span>
            <span>{formatUSD(75000)}</span>
          </div>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <strong>Goals / notes</strong>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., xeriscape + shade + seating + native pollinators"
            rows={4}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid #ccc",
            background: loading ? "#f0f0f0" : "#eee",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Concept"}
        </button>

        {errorMsg && (
          <div style={{ color: "crimson", fontWeight: 600 }}>
            Error: {errorMsg}
          </div>
        )}

        {result && (
          <div style={{ display: "grid", gap: 16 }}>
            {/* IMAGE (if present) */}
            {result?.imageBase64 ? (
              <div>
                <h3 style={{ marginBottom: 8 }}>Generated concept image</h3>
                <img
                  src={`data:image/png;base64,${result.imageBase64}`}
                  alt="Generated landscape concept"
                  style={{
                    width: "100%",
                    maxWidth: 700,
                    borderRadius: 14,
                    border: "1px solid #eee",
                  }}
                />
              </div>
            ) : (
              <div style={{ color: "#666" }}>
                No image returned yet (imageBase64 is missing).
              </div>
            )}

            {/* RAW JSON */}
            <div>
              <h3 style={{ marginBottom: 8 }}>Raw JSON</h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "#fafafa",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #eee",
                  overflowX: "auto",
                }}
              >
                {pretty}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
