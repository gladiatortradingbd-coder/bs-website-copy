import Image from "next/image"
import { Icon } from "@/lib/iconify"
import Button from "@/components/ui/Button"

export default function CommitmentSection() {
    return (
        <section className="bg-background py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">

                {/* Main Card */}
                <div
                    className="
            overflow-hidden rounded-[40px]
            border border-black/5 dark:border-white/5
            bg-black dark:bg-white
          "
                >

                    <div className="grid items-center lg:grid-cols-2">

                        {/* Left Content */}
                        <article className="px-6 py-10 sm:px-14 lg:py-20">

                            {/* Small Tag */}
                            <div
                                className="
                  mb-6 inline-flex items-center gap-2
                  rounded-full border border-white/10 dark:border-black/10
                  bg-background/5
                  px-4 py-2
                "
                            >
                                <div className="h-2 w-2 rounded-full bg-background" />

                                <span className="text-sm font-medium text-white/80 dark:text-black/80">
                                    Our Mission
                                </span>
                            </div>

                            {/* Heading */}
                            <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-white dark:text-black sm:text-4xl md:text-5xl">We are committed to bring life to your home with plants</h2>

                            {/* Paragraph */}
                            <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-lg">
                                We believe every home deserves warmth, freshness, and
                                natural beauty. Our mission is to deliver premium plants
                                that elevate spaces and improve everyday living.
                            </p>

                            {/* Features */}
                            <ul className="mt-8 space-y-4" aria-label="Mission highlights">

                                <FeatureItem
                                    icon="solar:leaf-bold"
                                    text="Premium quality indoor plants"
                                />

                                <FeatureItem
                                    icon="solar:box-bold"
                                    text="Secure and eco-friendly packaging"
                                />

                                <FeatureItem
                                    icon="solar:shield-check-bold"
                                    text="Trusted by thousands of customers"
                                />
                            </ul>

                            {/* CTA */}
                            <Button href="/shop" variant="secondary" size="lg" className="mt-8 rounded-full bg-background px-5 py-3 text-foreground hover:bg-background/90">
                                <span>Explore Collection</span>

                                <Icon
                                    icon="solar:arrow-right-linear"
                                    className="text-[20px]"
                                />
                            </Button>
                        </article>

                        {/* Right Image */}
                        <div className="relative h-full min-h-80 sm:min-h-125">

                            {/* Overlay */}
                            <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-r from-black/20 via-transparent to-transparent" />

                            <Image src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780245842/photo-1512428813834-c702c7702b78_u9r7yv.jpg" alt="Plants" fill className="object-cover" />

                            {/* Floating Card */}
                            <div
                                className="
                  absolute bottom-6 left-6 z-20
                  rounded-3xl
                  border border-white/10 dark:border-black/10
                  bg-background/10
                  p-5
                  backdrop-blur-xl
                "
                            >
                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-background
                    "
                                    >
                                        <Icon
                                            icon="solar:star-bold"
                                            className="text-[28px] text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <h4 className="text-2xl font-bold text-white dark:text-black">
                                            15k+
                                        </h4>

                                        <p className="text-sm text-white/70 dark:text-black/70">
                                            Happy customers
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function FeatureItem({ icon, text }) {
    return (
        <li className="flex items-center gap-4">

            <div
                className="
          flex h-12 w-12 items-center justify-center
          rounded-2xl bg-background/5
        "
            >
                <Icon
                    icon={icon}
                    className="text-[24px] text-white dark:text-black"
                />
            </div>

            <p className="text-lg text-white/90 dark:text-black/90">
                {text}
            </p>
        </li>
    )
}