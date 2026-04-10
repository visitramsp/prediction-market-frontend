import React, { useState } from "react";
import MobileMenu from "../IdeaList/page";

const faqSections = [
  {
    title: "Introduction",
    items: [
      {
        question: "What is Opinion Kings?",
        answer: (
          <>
            <p>
              Opinion Kings is India’s premier online prediction trading
              platform where users can trade on the outcomes of real-world
              events through Event Contracts.
            </p>
            <p className="mt-2">
              Each market represents a specific question, such as “Who will win
              the match?” or “What will be the closing price range?”. Markets
              may contain multiple possible options, and users can buy or sell
              positions across one or more options based on their analysis.
            </p>
          </>
        ),
      },
      {
        question: "Is this betting?",
        answer: (
          <>
            <p>
              No. Opinion Kings is a trading exchange, similar to a stock
              market.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Price Discovery:</strong> Prices are determined by
                supply and demand from other traders in the order book.
              </li>
              <li>
                <strong>Trading Strategy:</strong> You can buy and sell
                positions before the event occurs to lock in profits or minimize
                losses.
              </li>
            </ul>
          </>
        ),
      },
      {
        question: "Who can trade on Opinion Kings?",
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>Be at least 18 years old.</li>
            <li>Reside in India.</li>
            <li>Complete mandatory KYC verification.</li>
            <li>Comply with all local laws and platform terms.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: "Account Management",
    items: [
      {
        question: "How do I create an account?",
        answer: (
          <ol className="list-decimal list-inside space-y-1">
            <li>Register using your email or mobile number.</li>
            <li>Verify OTP sent to your device.</li>
            <li>Complete KYC with government-issued ID.</li>
            <li>Add funds and start trading.</li>
          </ol>
        ),
      },
      {
        question: "What is the account policy?",
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Single Account Rule:</strong> Each user is limited to one
              account.
            </li>
            <li>
              <strong>Suspension:</strong> Multiple accounts may result in
              suspension and forfeiture of funds.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    title: "Wallet & Funds",
    items: [
      {
        question: "What deposit methods are supported?",
        answer: (
          <>
            <p>We support instant payment methods for Indian users:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>UPI (GPay, PhonePe, Paytm, BHIM, etc.)</li>
              <li>Bank Transfer (IMPS/NEFT)</li>
              <li>Supported Digital Wallets</li>
            </ul>
            <p className="mt-2">
              Most deposits are processed instantly, though rare banking delays
              may occur.
            </p>
          </>
        ),
      },
      {
        question: "How do withdrawals work?",
        answer: (
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to the Wallet section.</li>
            <li>Select Withdraw.</li>
            <li>Enter amount and confirm bank/UPI details.</li>
            <li>Processing takes 24–48 hours.</li>
          </ol>
        ),
      },
    ],
  },
  {
    title: "Trading Mechanics",
    items: [
      {
        question: "How does pricing work?",
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>Contracts range between ₹0 and ₹100.</li>
            <li>Price reflects market probability.</li>
            <li>If event happens, contract pays ₹100.</li>
            <li>If not, contract settles at ₹0.</li>
          </ul>
        ),
      },
      {
        question: "What are order types?",
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Market Order:</strong> Executes immediately at best price.
            </li>
            <li>
              <strong>Limit Order:</strong> Executes at your chosen price.
            </li>
          </ul>
        ),
      },
      {
        question: "Can I exit a trade early?",
        answer: (
          <ul className="list-disc list-inside space-y-1">
            <li>Sell to lock in profits.</li>
            <li>Sell to reduce losses.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: "Contact Us",
    items: [
      {
        question: "How can I contact support?",
        answer: (
          <span>
            Email:{" "}
            <a
              href="mailto:support@opinionkings.com"
              className="text-blue-500 underline"
            >
              support@opinionkings.com
            </a>
          </span>
        ),
      },
    ],
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div>
      <div className="max-w-[1450px] mx-auto sm:px-4  pt-8 sm:pt-24 lg:pt-24">
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

          {/* Main Content */}
          <div className="lg:col-span-3 lg:border-l dark:border-gray-700 border-gray-200 relative -top-8  sm:top-0">
            <div className="lg:border-r dark:border-gray-700 border-gray-200">
              <div className="md:p-6 p-4 space-y-8">
                {/* Header */}
                <div className="text-center">
                  <p className="text-xl dark:text-white font-semibold">
                    Opinion Kings - Official Help Center & FAQ
                  </p>
                  <p className="text-xs mt-1">
                    Last Updated:{" "}
                    <span className="font-bold">February 2026</span>
                  </p>
                </div>

                {/* Accordion */}
                {faqSections.map((section, sIndex) => (
                  <div key={sIndex} className="space-y-3">
                    <h2 className="text-lg font-semibold dark:text-white">
                      {section.title}
                    </h2>

                    {section.items.map((item, iIndex) => {
                      const id = `${sIndex}-${iIndex}`;
                      const isOpen = openIndex === id;

                      return (
                        <div
                          key={id}
                          className="border dark:border-gray-700 border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggle(id)}
                            className="w-full text-left px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-[#1f2937]"
                          >
                            <span className="font-medium">{item.question}</span>
                            <span
                              className={`text-xl transform transition-transform duration-300 ${
                                isOpen ? "rotate-45" : ""
                              }`}
                            >
                              +
                            </span>
                          </button>

                          <div
                            className={`transition-all duration-300 overflow-hidden ${
                              isOpen
                                ? "max-h-[500px] opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="px-4 py-3 text-sm bg-white dark:bg-[#111827] border-t dark:border-gray-700 border-gray-200">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
