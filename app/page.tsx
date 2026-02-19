import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
        Fort Collins Xeriscape Design Tool
      </h1>
      <p style={{ opacity: 0.75, marginTop: 10 }}>
        MVP demo — enter an address, set a budget, and generate a concept payload.
      </p>

      <div style={{ marginTop: 18 }}>
        <Link
          href="/new"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            fontWeight: 700,
            textDecoration: "none"
          }}
        >
          Start a new concept →
        </Link>
      </div>
    </main>
  );
}
