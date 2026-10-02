import { Icon } from "@/lib/iconify";
import Button from "@/components/ui/Button";

const team = [
  {
    name: "Esmat Ara Anisha",
    role: "CEO & Founder",
    img: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244809/CEO_Profile_Pic_v7qxm2.jpg",
  },
  {
    name: "Sophie Moore",
    role: "VP of Marketing",
    img: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244439/photo-1438761681033-6461ffad8d80_x7imzt.jpg",
  },
  {
    name: "Matt Cannon",
    role: "VP of Product",
    img: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244356/photo-1500648767791-00dcc994a43e_xgvqav.jpg",
  },
  {
    name: "Lilly Woods",
    role: "VP of Design",
    img: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244385/photo-1494790108377-be9c29b29330_nycy5j.jpg",
  },
  {
    name: "Sajjad Hossain",
    role: "Lead Developer",
    img: "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244802/Lead_Developer_yth3d4.png",
  },
];

export default function OurTeam() {
  return (
    <section className="w-full bg-background py-10 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Our team
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              A dedicated group of professionals committed to building quality
              experiences and strong execution.
            </p>
          </div>

          <Button variant="primary" className="rounded-full px-5 py-2 hover:scale-105">
            Follow
            <Icon icon="lucide:arrow-right" className="text-[18px]" />
          </Button>
        </header>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <ul className="flex w-max animate-marquee gap-4 will-change-transform" aria-label="Team members">
            {[...team, ...team].map((member, index) => (
              <li
                key={index}
                className="min-w-60 md:min-w-75 bg-background rounded-2xl shadow-md overflow-hidden border"
              >
                {/* Image */}
                <div className="h-56 md:h-80 bg-gray-200 overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Content */}
                <article className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>

                  {/* Social Icons */}
                  <ul className="flex justify-center gap-3 mt-4" aria-label={`${member.name} social profiles`}>
                    <li>
                      <Icon
                        icon="lucide:facebook"
                        className="text-[18px] text-muted-foreground hover:text-foreground"
                      />
                    </li>
                    <li>
                      <Icon
                        icon="lucide:twitter"
                        className="text-[18px] text-muted-foreground hover:text-foreground"
                      />
                    </li>
                    <li>
                      <Icon
                        icon="lucide:instagram"
                        className="text-[18px] text-muted-foreground hover:text-foreground"
                      />
                    </li>
                    <li>
                      <Icon
                        icon="lucide:linkedin"
                        className="text-[18px] text-muted-foreground hover:text-foreground"
                      />
                    </li>
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}