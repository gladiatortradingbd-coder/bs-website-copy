"use client";

import { useState } from "react";

const offices = [
  {
    city: "New York, NY",
    address: "123 Main Street, New York, NY 10001",
    description:
      "A central hub connecting operations and customer support across the East Coast.",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246194/677c0cb8cb8c7ef4098f2769_new-york-office-store-x-webflow-template_md8roh.jpg",
  },
  {
    city: "San Francisco, CA",
    address: "58 Middle Point Rd, San Francisco, CA 94124",
    description:
      "Our innovation center focusing on product development and technology.",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246207/677c0cb8cb8c7ef4098f276b_san-francisco-office-store-x-webflow-template_qwg0pw.jpg",
  },
  {
    city: "Chicago, IL",
    address: "1355 N Sandburg Terrace, Chicago, IL 60610",
    description:
      "Midwest operations base ensuring smooth logistics and coordination.",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780246273/677c0cb8cb8c7ef4098f276a_chicago-office-store-x-webflow-template_kkyrfl.jpg",
  },
];

export default function VisitOurOffices() {
  const [activeIndex, setActiveIndex] = useState(0);
  const office = offices[activeIndex];

  return (
    <section className="py-12 sm:py-20 overflow-hidden bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Visit our offices
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We maintain strong physical presence across key cities to serve
            clients with reliability and trust.
          </p>
        </header>

        {/* Slider navigation dots */}
        <nav className="flex justify-center gap-3 mt-8" aria-label="Select office location">
          {offices.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${activeIndex === i ? "bg-black dark:bg-white scale-125" : "bg-gray-300 dark:bg-neutral-600"
                }`}
              aria-label={`Show ${offices[i].city}`}
            />
          ))}
        </nav>

        {/* Card */}
        <div className="mt-8 grid md:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl">
            <img
              src={office.image}
              alt={office.city}
              className="w-full h-56 sm:h-95 object-cover"
            />
          </div>

          {/* Content */}
          <article className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl font-semibold">{office.city}</h3>

            <p className="mt-4 text-muted-foreground">{office.description}</p>

            <address className="not-italic mt-6">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                {office.address}
                <span className="text-lg">→</span>
              </a>
            </address>
          </article>
        </div>
      </div>
    </section>
  );
}