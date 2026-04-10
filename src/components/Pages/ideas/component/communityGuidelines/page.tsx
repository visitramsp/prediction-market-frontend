import React from "react";
import MobileMenu from "../IdeaList/page";

export default function CommunityGuidelines() {
  return (
    <div>
      <div className="max-w-[1450px] mx-auto px-4 pt-8 sm:pt-24 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky top-32">
              <h1 className="dark:text-white text-gray-800 md:ml-0 ml-16 lg:text-3xl text-xl mb-0 mt-3">
                Ideas
              </h1>
              <span className="dark:text-text text-text text-xs md:ml-0 ml-16">
                Serving public conversation
              </span>
              <MobileMenu />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 lg:border-l dark:border-gray-700 border-gray-200 min-h-1/2">
            <div className="lg:border-r dark:border-gray-700 border-gray-200">
              <div className="dark:text-[var(--color-text)] text-[var(--color-text)] md:p-6 p-4 space-y-8">
                {/* Header */}
                <div className="text-center">
                  <p className="text-xl dark:text-white font-semibold">
                    Opinion Kings – Community Guidelines
                  </p>
                  <p className="text-xs mt-1">
                    Last Updated:{" "}
                    <span className="font-bold">February 2026</span>
                  </p>
                  <p className="text-xs">
                    Version: <span className="font-bold">1.0</span>
                  </p>
                </div>

                {/* Intro */}
                <section className="space-y-3 text-sm">
                  <p>
                    At Opinion Kings, we believe that the power of a prediction
                    market lies in the collective wisdom of its users. To ensure
                    that our platform remains a place for healthy debate, fair
                    trading, and genuine insight, we have established these
                    Community Guidelines.
                  </p>
                  <p>
                    By using Opinion Kings, you agree to abide by these rules.
                    Failure to comply may result in content removal, account
                    suspension, or a permanent ban.
                  </p>
                </section>

                {/* Section 1 */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold dark:text-white">
                    1. The Core Principle: Integrity First
                  </h2>
                  <p className="text-sm">
                    Opinion Kings is a financial exchange, not a gambling den or
                    a social media battleground. The integrity of our markets is
                    paramount.
                  </p>

                  <div>
                    <h3 className="font-semibold">
                      Zero Tolerance for Market Manipulation
                    </h3>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>Wash Trading is strictly prohibited.</li>
                      <li>No insider trading using non-public information.</li>
                      <li>No front-running using bots or latency exploits.</li>
                      <li>No collusion to manipulate markets.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold">Authenticity</h3>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>One person, one account only.</li>
                      <li>No impersonation of staff or public figures.</li>
                    </ul>
                  </div>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold dark:text-white">
                    2. Respect & Safety
                  </h2>

                  <div>
                    <h3 className="font-semibold">Be Respectful</h3>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>No hate speech of any kind.</li>
                      <li>No harassment or intimidation.</li>
                      <li>Avoid excessive profanity.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold">Prohibited Content</h3>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>No NSFW or explicit material.</li>
                      <li>No threats or incitement to violence.</li>
                      <li>No promotion of illegal activities.</li>
                    </ul>
                  </div>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold dark:text-white">
                    3. Privacy & Security
                  </h2>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>No doxxing or sharing personal information.</li>
                    <li>No attempts to access other accounts.</li>
                    <li>Never share login credentials or OTPs.</li>
                  </ul>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold dark:text-white">
                    4. Platform Usage
                  </h2>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>No spam, ads, or external promotions.</li>
                    <li>No guaranteed-return schemes.</li>
                    <li>No unauthorized bots or automation tools.</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold dark:text-white">
                    5. Enforcement
                  </h2>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Warnings for minor violations.</li>
                    <li>Temporary suspension for repeated offenses.</li>
                    <li>Permanent ban for serious violations.</li>
                  </ul>

                  <div>
                    <h3 className="font-semibold mt-3">Reporting Violations</h3>
                    <p className="text-sm">
                      Report issues at{" "}
                      <a
                        href="mailto:support@opinionkings.com"
                        className="text-blue-500 underline"
                      >
                        support@opinionkings.com
                      </a>
                      .
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
