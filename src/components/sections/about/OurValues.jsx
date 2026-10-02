import { Icon } from "@/lib/iconify";

const values = [
  {
    title: "Eco friendly",
    desc: "We prioritize sustainable materials and responsible production methods.",
    icon: "lucide:leaf",
  },
  {
    title: "Ethical",
    desc: "Fair practices, honest work, and respect for people and nature.",
    icon: "lucide:shield-check",
  },
  {
    title: "Done with love",
    desc: "Every product is crafted with care and attention to detail.",
    icon: "lucide:heart",
  },
  {
    title: "Hard work",
    desc: "Consistency and discipline drive everything we build.",
    icon: "lucide:hammer",
  },
  {
    title: "Diverse selection",
    desc: "A wide range of products to meet different needs and tastes.",
    icon: "lucide:layout-grid",
  },
  {
    title: "High quality",
    desc: "We never compromise on quality and long-term value.",
    icon: "lucide:award",
  },
];

export default function OurValues() {
  return (
    <section className="w-full bg-background py-8 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-foreground">
            Our values
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
            Principles that guide our decisions, shape our work, and define our
            long-term vision.
          </p>
        </header>

        {/* Grid */}
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3" aria-label="Core values">
          {values.map((item, index) => (
            <li
              key={index}
              className="rounded-2xl p-4 text-center transition hover:shadow-md sm:p-6"
            >
              <article>
              {/* Icon */}
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 sm:h-14 sm:w-14">
                <Icon icon={item.icon} className="text-[18px] text-foreground sm:text-[24px]" />
              </div>

              {/* Title */}
              <h3 className="mt-3 text-sm font-semibold text-foreground sm:mt-5 sm:text-lg">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
                {item.desc}
              </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}