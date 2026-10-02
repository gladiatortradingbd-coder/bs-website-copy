import Image from "next/image";
import Button from "@/components/ui/Button";

export default function BlogHero() {
  return (
    <section className="px-4 py-10 sm:py-20 md:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl bg-[#6C8E6E]">
        <div className="grid items-center lg:grid-cols-2">
          {/* Left Content */}
          <header className="relative z-10 p-6 sm:p-8 md:p-14 lg:p-16">
            <h1 className="max-w-xl text-2xl sm:text-4xl font-bold leading-tight text-white dark:text-black md:text-5xl lg:text-6xl">Our blog</h1>

            <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-neutral-300 md:text-lg">
              Discover stories, ideas, tips, and inspiration from our team.
              Stay updated with the latest insights and industry trends.
            </p>

            {/* Newsletter Form */}
            <div className="mt-10 max-w-xl">
              <form className="flex flex-col gap-4 sm:flex-row" action="/blog" method="get">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="h-14 w-full rounded-full border border-white/10 dark:border-black/10 bg-background px-6 text-sm outline-none placeholder:text-muted-foreground focus:border-green-500"
                />

                <Button type="submit" variant="primary" size="lg" className="h-14 rounded-full bg-green-600 px-8 text-sm font-semibold text-white dark:text-black hover:bg-green-700">
                  Subscribe
                </Button>
              </form>
            </div>
          </header>

          {/* Right Image */}
          <div className="relative h-56 sm:h-90 w-full lg:h-112.5">
            <Image
              src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780243571/BlogHeroImage_bdlrr8.jpg"
              alt="Newsletter"
              fill
              className="object-cover object-left"
              priority
            />

            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent lg:bg-linear-to-l" />
          </div>
        </div>
      </div>
    </section>
  );
}