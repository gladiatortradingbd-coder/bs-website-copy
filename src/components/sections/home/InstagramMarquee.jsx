import Image from "next/image"
import { Icon } from "@/lib/iconify"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"

const posts = [
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244770/AstrophytumCapricornCactus_twgfjw.jpg",
        likes: "126k",
        comments: "2.4k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244848/photo-1466692476868-aef1dfb1e735_gbp9gb.jpg",
        likes: "140k",
        comments: "1.8k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244791/Hibiscus_zvnoj1.png",
        likes: "98k",
        comments: "3.1k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244918/photo-1416879595882-3373a0480b5b_ysrvke.jpg",
        likes: "220k",
        comments: "4.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244815/MossForTerrarium_ox7tww.png",
        likes: "220k",
        comments: "5.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244787/Crassula_Buddha_s_Temple_ix6kaj.png",
        likes: "220k",
        comments: "5.7k",
    },
]

export default function InstagramMarquee() {
    return (
        <section className="overflow-hidden bg-background py-12 sm:py-24" aria-label="Instagram feed preview">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10 flex flex-col items-start justify-between gap-4 px-4 sm:gap-6 sm:px-6 md:flex-row md:items-center">

                    <FadeIn direction="up">
                    <div>
                        <p className="mb-2 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Social Feed
                        </p>

                        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-5xl">
                            Follow us on @succulenthutt
                        </h2>
                    </div>
                    </FadeIn>

                    <FadeIn direction="up" delay={200}>
                    <Button href="https://www.instagram.com/succulenthutt" target="_blank" rel="noreferrer" variant="primary" size="lg" className="btn-shimmer rounded-full bg-black dark:bg-white px-5 py-2 text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 sm:px-7 sm:py-4">
                        <Icon
                            icon="mdi:instagram"
                            className="text-[22px]"
                        />

                        <span className="font-medium">
                            Follow us
                        </span>
                    </Button>
                    </FadeIn>
                </div>

                {/* Marquee Wrapper */}
                <div className="relative overflow-hidden">

                    {/* Left Blur */}
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" />

                    {/* Right Blur */}
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" />

                    {/* Marquee */}
                    <ul className="flex w-max animate-post-marquee gap-5 px-4 sm:gap-7 sm:px-6" aria-label="Instagram posts">

                        {[...posts, ...posts].map((post, index) => (
                            <li
                                key={index}
                                className="group relative w-60 sm:w-80 shrink-0 overflow-hidden rounded-[28px] border border-black/5 dark:border-white/5 bg-black dark:bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
                            >

                                {/* Top */}
                                <div className="flex items-center justify-between p-3 sm:p-5">

                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 overflow-hidden rounded-full">
                                            <Image
                                                src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244597/AnishaProfilePic1_vtxgu2.jpg"
                                                alt="avatar"
                                                width={44}
                                                height={44}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-white dark:text-black">
                                                succulenthutt
                                            </h4>

                                            <p className="text-sm text-neutral-400">
                                                @succulenthutt
                                            </p>
                                        </div>
                                    </div>

                                    <Icon
                                        icon="mdi:dots-vertical"
                                        className="text-[22px] text-white dark:text-black"
                                    />
                                </div>

                                {/* Image */}
                                <div className="relative h-65 sm:h-105 overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt="post"
                                        fill
                                        className="
                      object-cover
                      transition-all duration-700
                      group-hover:scale-110
                    "
                                    />
                                </div>

                                {/* Bottom */}
                                <footer className="p-5">

                                    {/* Icons */}
                                    <div className="flex items-center justify-between">

                                        <div className="flex items-center gap-4">
                                            <Icon
                                                icon="solar:heart-outline"
                                                className="
                          text-[25px]
                          text-white dark:text-black
                          transition-all duration-300
                          hover:scale-110
                        "
                                            />

                                            <Icon
                                                icon="solar:chat-round-outline"
                                                className="
                          text-[24px]
                          text-white dark:text-black
                          transition-all duration-300
                          hover:scale-110
                        "
                                            />

                                            <Icon
                                                icon="solar:plain-outline"
                                                className="
                          text-[24px]
                          text-white dark:text-black
                          transition-all duration-300
                          hover:scale-110
                        "
                                            />
                                        </div>

                                        <Icon
                                            icon="solar:bookmark-outline"
                                            className="
                        text-[24px]
                        text-white dark:text-black
                        transition-all duration-300
                        hover:scale-110
                      "
                                        />
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-3">
                                        <p className="font-semibold text-white dark:text-black text-sm sm:text-base">
                                            {post.likes} likes
                                        </p>

                                        <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                                            View all {post.comments} comments
                                        </p>
                                    </div>
                                </footer>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}