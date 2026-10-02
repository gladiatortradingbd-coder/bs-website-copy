import Image from "next/image";
import PlantSlider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";


export default function HeroSection() {
  return (
    <section aria-label="Hero" className="flex justify-center px-3 sm:px-5">
      <div className="
        relative
        h-[36svh]
        sm:h-[42svh]
        md:h-screen
        w-full
        max-w-7xl
        rounded-2xl
        sm:rounded-3xl
        bg-muted
        overflow-hidden
      ">

        {/* CONTENT */}
        <div className="
          relative
          z-10
          flex
          flex-col
          items-center
          pt-4
          pb-4
          gap-2
          sm:pt-10
          sm:pb-6
          sm:gap-3
          md:pt-20
          md:pb-10
          md:gap-5
        ">
          <FadeIn delay={100} direction="up">
            <h1 className="font-bold text-3xl leading-tight text-center sm:text-5xl md:text-7xl">
              Eco-friendly plants
            </h1>
          </FadeIn>

          <FadeIn delay={250} direction="up">
            <p className="
              text-xs
              text-foreground
              max-w-[280px]
              text-center
              leading-snug
              sm:text-sm
              sm:max-w-lg
              md:text-lg
              md:max-w-2xl
            ">
              Handpicked indoor plants, rare tropicals, and curated pots —
              delivered fresh to your door across Bangladesh.
            </p>
          </FadeIn>

          <FadeIn delay={400} direction="up">
            <Button href="/shop" variant="primary" size="sm" className="btn-shimmer sm:h-12 sm:px-5 sm:text-sm md:h-14 md:px-8">
              Shop now
            </Button>
          </FadeIn>
        </div>

        {/* IMAGE */}
        <div className="absolute inset-0 top-20 sm:top-28 md:top-40">
          <Image
            src="https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_1600/v1780243571/HeroImage3_qlnxu6.png"
            alt="Hero Image"
            fill
            priority
            className="relative mt-0 object-contain object-bottom sm:mt-2 md:mt-6 md:object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          />
          <div className="absolute bottom-0 left-0 w-full z-20">
            <PlantSlider />
          </div>
        </div>
      </div>
    </section>
  );
}
