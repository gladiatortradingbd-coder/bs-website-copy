import OurStorySection from "@/components/sections/about/OurStory"
import Bringlife from "@/components/sections/about/Bringlife"
import OurTeam from "@/components/sections/about/OurTeam"
import OurValues from "@/components/sections/about/OurValues"
import VisitOurOffices  from "@/components/sections/about/VisitOurOffices"
import InstagramMarquee from "@/components/sections/home/InstagramMarquee"
import FAQ from "../../../components/sections/about/FAQ"

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background px-4 py-4 sm:p-10">
            <OurStorySection />
            <Bringlife />
            <OurTeam />
            <OurValues />
            <VisitOurOffices />
            <InstagramMarquee />
            <FAQ />
        </main>
    )
}