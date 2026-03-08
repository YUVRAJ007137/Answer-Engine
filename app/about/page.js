"use client";

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main
      className="min-h-screen py-12 px-4 sm:px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            About Answer Engine
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Built with passion for students
          </p>
        </header>

        <section
          className="rounded-2xl border p-6 sm:p-8 space-y-6"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="space-y-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Developer
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden relative shrink-0">
                <Image
                  src="https://drive.google.com/file/d/1e38V8_KvMFRMg-UGwG2GLbNR383uPGmg/view?usp=drivesdk"
                  alt="Yuvraj"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center 25%" }}
                />
              </div>
              <div>
                <p
                  className="text-lg font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Tech Desk
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Building the future.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--foreground)" }}
            >
              About the Project
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Answer Engine is an AI-powered tool designed to help students generate
              well-structured, handwriting-ready answers for their assignments. Simply
              upload or paste your questions, and get detailed answers with proper
              formatting, examples, and explanations.
            </p>
          </div>

          <div className="space-y-3">
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "Tailwind CSS", "Groq AI", "Llama 3.3"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                    }}
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Connect
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/yuvraj007137"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "var(--card-border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/yuvraj-chaudhari-72a9072a0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "var(--card-border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="mailto:yuvrajsc42@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "var(--card-border)",
                  color: "var(--foreground)",
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              <a
                href="https://www.buymeacoffee.com/yuvraj_chaudhari_007"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: "#FFDD00",
                  color: "#000",
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.216 5.415A2.647 2.647 0 0 0 18.2 4.25h-.027a2.647 2.647 0 0 0-2.016.932 2.647 2.647 0 0 0-.646 1.883v.027a2.647 2.647 0 0 0 .646 1.883 2.647 2.647 0 0 0 2.016.932h.027a2.647 2.647 0 0 0 2.016-1.415 2.647 2.647 0 0 0 0-2.083zm-4.32 0A2.647 2.647 0 0 0 13.88 4.25h-.027a2.647 2.647 0 0 0-2.016.932 2.647 2.647 0 0 0-.646 1.883v.027a2.647 2.647 0 0 0 .646 1.883 2.647 2.647 0 0 0 2.016.932h.027a2.647 2.647 0 0 0 2.016-1.415 2.647 2.647 0 0 0 0-2.083zM2.5 8.75h19a1.25 1.25 0 0 1 1.25 1.25v1.5a1.25 1.25 0 0 1-1.25 1.25h-1.5v6.5a2.75 2.75 0 0 1-2.75 2.75h-11a2.75 2.75 0 0 1-2.75-2.75v-6.5h-1.5A1.25 1.25 0 0 1 1.25 11.5v-1.5A1.25 1.25 0 0 1 2.5 8.75z" />
                </svg>
                Buy Me a Coffee
              </a>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/chat/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--primary)" }}
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </main>
  );
}
