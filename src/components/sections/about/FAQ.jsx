"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const faqData = {
  All: [
    {
      q: "How can I get in touch with customer support?",
      a: "You can contact support via email or live chat. We typically respond within 24 hours on business days.",
    },
    {
      q: "What is your response time for customer inquiries?",
      a: "Most inquiries are answered within 24 hours. Complex cases may take slightly longer.",
    },
    {
      q: "Can you help me choose a saree?",
      a: "Yes, our team can help you choose a saree based on the occasion, fabric, colour, and style you prefer.",
    },
    {
      q: "Do you ship internationally?",
      a: "Yes, we ship to multiple countries with varying delivery times depending on location.",
    },
  ],
  Company: [
    {
      q: "What is your response time for customer inquiries?",
      a: "We prioritize all company-related queries within standard support hours.",
    },
    {
      q: "How do I care for my saree?",
      a: "Care instructions vary by fabric. We share practical guidance with your order so your saree stays beautiful for years.",
    },
  ],
  Delivery: [
    {
      q: "Do you ship internationally?",
      a: "Yes, international shipping is available for selected regions.",
    },
  ],
  Support: [
    {
      q: "How can I get in touch with customer support?",
      a: "Reach us via support email or help desk. Response time is typically within 24 hours.",
    },
  ],
};

const tabs = Object.keys(faqData);

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("All");
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = faqData[activeTab];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        {/* Title */}
        <header className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Frequently asked questions
          </h2>
        </header>

        {/* Tabs */}
        <nav className="flex flex-wrap justify-center gap-3 mt-10" aria-label="FAQ categories">
          {tabs.map((tab) => (
            <Button
              key={tab}
              type="button"
              variant={activeTab === tab ? "primary" : "outline"}
              size="md"
              onClick={() => {
                setActiveTab(tab);
                setOpenIndex(0);
              }}
              className={`rounded-full px-5 py-2 text-sm border transition ${
                activeTab === tab
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "bg-background text-foreground border-gray-300 hover:border-black dark:hover:border-white"
              }`}
            >
              {tab}
            </Button>
          ))}
        </nav>

        {/* FAQ List */}
        <ul className="mt-10 space-y-4" aria-label="Frequently asked questions list">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <li
                key={index}
                className="border border-border-color rounded-xl overflow-hidden"
              >
                <article>
                {/* Question */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 rounded-none p-5 text-left hover:bg-transparent"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-base md:text-lg">
                    {item.q}
                  </span>

                  <span className={`ml-4 text-xl transition-transform ${isOpen ? "rotate-45" : "rotate-0"}`}>
                    +
                  </span>
                </button>

                {/* Answer */}
                <div className={`overflow-hidden px-5 text-left transition-all duration-300 ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}