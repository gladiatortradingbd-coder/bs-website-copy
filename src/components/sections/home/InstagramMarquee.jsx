import Image from "next/image"
import { Icon } from "@/lib/iconify"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"

const posts = [
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576654/Nureh_Marina_k2wfuw.jpg",
        likes: "126k",
        comments: "2.4k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576654/Sobia_Nazir_NUR_Festive_mzyg8x.jpg",
        likes: "140k",
        comments: "1.8k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576654/Rang_Rasiya_Meet_Me_In_wqwx5m.jpg",
        likes: "98k",
        comments: "3.1k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576654/Rajbari_Sage_Luxury_Formals_xpqtin.jpg",
        likes: "280k",
        comments: "1.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576654/Jugnu_Karandi_AW26_vem9y7.jpg",
        likes: "270k",
        comments: "6.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/Maahi_Festive_Unstitched_26_kapv7e.jpg",
        likes: "460k",
        comments: "9.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/Izel_Musafir_Winter_26_djhgh9.jpg",
        likes: "620k",
        comments: "10.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/Jazmin_Chandni_Velvet_Formals_p9wavg.jpg",
        likes: "520k",
        comments: "4.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/M_Prints_Winter_Vol_1_by_Maria_ctsabe.jpg",
        likes: "120k",
        comments: "3.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/Hussain_Rehar_Festive_gaiwse.jpg",
        likes: "290k",
        comments: "5.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576653/Emaan_Adeel_Velvet_Affair_dixath.jpg",
        likes: "250k",
        comments: "4.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576652/Coco_Prints_Winter_2026_by_Blog_so2h8f.jpg",
        likes: "20k",
        comments: "1.7k",
    },
    {
        image:
            "https://res.cloudinary.com/drbe0jtgw/image/upload/v1791576652/Charizma_Vasal_Winter_V_2_whclln.jpg",
        likes: "230k",
        comments: "2.7k",
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
                            Follow us on @aarong
                        </h2>
                    </div>
                    </FadeIn>

                    <FadeIn direction="up" delay={200}>
                    <Button href="https://www.instagram.com/aarong" target="_blank" rel="noreferrer" variant="primary" size="lg" className="btn-shimmer rounded-full bg-black dark:bg-white px-5 py-2 text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 sm:px-7 sm:py-4">
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
                                                aarong
                                            </h4>

                                            <p className="text-sm text-neutral-400">
                                                @aarong
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