import Image from "next/image"
import { Icon } from "@/lib/iconify"

export default function OurStorySection() {
  return (
    <section className="bg-background py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left Content */}
          <article>

            {/* Heading */}
            <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">A love for sarees, woven into every story</h2>

            {/* Paragraph */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              We curate expressive sarees that honour traditional craftsmanship while
              fitting beautifully into modern life. From festive gatherings to everyday
              elegance, each piece is chosen to help you dress with confidence.
            </p>

            {/* Stats */}
            <ul className="mt-8 flex flex-wrap gap-6 sm:flex-nowrap" aria-label="Company highlights">

              {/* Stat 1 */}
              <li className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-black dark:bg-white">
                  <Icon
                    icon="solar:medal-star-bold"
                    className="text-[28px] text-white dark:text-black"
                  />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">100<span className="text-neutral-400">%</span></h3>

                  <p className="mt-1 text-base text-muted-foreground">
                    Customer satisfaction
                  </p>
                </div>
              </li>

              {/* Stat 2 */}
              <li className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-black dark:bg-white">
                  <Icon
                    icon="solar:box-bold"
                    className="text-[28px] text-white dark:text-black"
                  />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">200<span className="text-neutral-400">+</span></h3>

                  <p className="mt-1 text-base text-muted-foreground">
                    Products available
                  </p>
                </div>
              </li>
            </ul>
          </article>

          {/* Right Image */}
          <div className="relative mt-8 sm:mt-0">

            {/* Background Shape */}
            <div
              className="
                absolute -bottom-6 -right-6
                h-full w-full
                rounded-[36px]
                bg-black dark:bg-white
              "
            />

            {/* Main Image */}
            <div
              className="
                relative overflow-hidden
                rounded-[36px]
                border border-black/10 dark:border-white/10
                bg-muted
              "
            >
              <Image src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780245425/OurStoryImage_oouc5e.png" alt="Our Story" width={900} height={900} className="h-56 w-full object-cover sm:h-155" />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-3 left-3 rounded-2xl border border-white/10 dark:border-black/10 bg-background/90 px-3 py-2 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:left-4 sm:px-4 sm:py-3">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Trusted by
              </p>

              <h4 className="text-sm font-bold text-foreground sm:text-2xl">
                15,000+ customers
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}