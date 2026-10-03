import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/home/HeroSection";
import CategoriesSection from "@/components/sections/home/CategoriesSection";
import BestSellers from "@/components/sections/home/BestSellers";
import { getHeroImages } from "@/lib/hero-images";

const NewArrivalsSection = dynamic(() => import("@/components/sections/home/NewArrivalsSection"));
const TestimonialMarquee = dynamic(() => import("@/components/sections/home/TestimonialMarquee"));
const InstagramMarquee = dynamic(() => import("@/components/sections/home/InstagramMarquee"));
const PlantCareSection = dynamic(() => import("@/components/sections/home/PlantCareSection"));

export const revalidate = 3600;

export default async function Home() {
  const heroImages = await getHeroImages();

  return (
    <main>
      <HeroSection images={heroImages} />
      <CategoriesSection />
      <BestSellers />
      <NewArrivalsSection />
      <TestimonialMarquee />
      <InstagramMarquee />
      <PlantCareSection />
    </main>
  );
}
