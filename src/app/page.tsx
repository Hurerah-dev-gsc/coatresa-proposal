"use client";

import Link from "next/link";

export default function StartPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F1E9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter',system-ui,sans-serif",
        WebkitFontSmoothing: "antialiased",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <span
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,37,255,.10), transparent 70%)",
          animation: "gsBlob 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(146,209,92,.12), transparent 70%)",
          animation: "gsBlob 18s ease-in-out 2s infinite reverse",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          maxWidth: 600,
          textAlign: "center",
        }}
      >
        {/* Logos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Genai Sapiens Consulting"
            style={{ height: 72, width: "auto" }}
          />
          <span
            style={{
              width: 1,
              height: 48,
              background: "rgba(18,20,27,.15)",
            }}
          />
          <img
            src="/coatresa-logo.png"
            alt="COATRESA"
            style={{ height: 52, width: "auto", filter: "brightness(0)" }}
          />
        </div>

        {/* Title */}
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              lineHeight: 1.06,
              letterSpacing: "-.025em",
              color: "#12141B",
              margin: 0,
            }}
          >
            Propuesta
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "rgba(18,20,27,.45)",
              margin: "16px 0 0",
              fontWeight: 400,
            }}
          >
            Genai Sapiens Consulting &times; COATRESA
          </p>
        </div>

        {/* Start button */}
        <Link
          href="/propuesta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#0025FF",
            color: "#F5F1E9",
            borderRadius: 14,
            padding: "17px 40px",
            fontWeight: 600,
            fontSize: "1.05rem",
            fontFamily: "'Inter',sans-serif",
            textDecoration: "none",
            transition: "transform 0.3s cubic-bezier(.22,.8,.3,1), box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,37,255,.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Empezar
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
