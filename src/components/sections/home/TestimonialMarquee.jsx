import Image from "next/image"

// app/components/TestimonialMarquee.jsx

const testimonials = [
  {
    quote:
      "Best plants I've ever bought, thriving beautifully in my home garden!",
    name: "John Carter",
    location: "New York, NY",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244356/photo-1500648767791-00dcc994a43e_xgvqav.jpg",
  },
  {
    quote:
      "Our garden flourishes thanks to these incredible, high-quality plants!",
    name: "Lilly Woods",
    location: "Chicago, IL",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244385/photo-1494790108377-be9c29b29330_nycy5j.jpg",
  },
  {
    quote:
      "Top-quality plants, vibrant and healthy, the best I've ever purchased!",
    name: "Matt Cannon",
    location: "Los Angeles, CA",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244408/photo-1506794778202-cad84cf45f1d_nh1gsb.jpg",
  },
  {
    quote:
      "These plants transformed our garden, truly the best quality available!",
    name: "Sophie Moore",
    location: "San Francisco, CA",
    image:
      "https://res.cloudinary.com/drbe0jtgw/image/upload/f_auto,q_auto,w_600/v1780244439/photo-1438761681033-6461ffad8d80_x7imzt.jpg",
  },
]

export default function TestimonialMarquee() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-16 bg-black dark:bg-white" aria-label="Customer testimonials">
      {/* Fade Left */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-linear-to-r from-black to-transparent" />

      {/* Fade Right */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-linear-to-l from-black to-transparent" />

      {/* Marquee */}
      <ul className="flex w-max animate-marquee gap-4 sm:gap-6" aria-label="Testimonial cards">
        {[...testimonials, ...testimonials].map((item, index) => (
          <li
            key={index}
            className="w-65 sm:w-87.5 shrink-0 rounded-3xl border border-white/10 dark:border-black/10 bg-background/5 p-4 sm:p-6 backdrop-blur-sm"
          >
            <blockquote className="text-base sm:text-lg leading-relaxed text-white dark:text-black">
              “{item.quote}”
            </blockquote>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <cite className="not-italic">
                <span className="font-semibold text-white dark:text-black text-sm sm:text-base">{item.name}</span>
                <span className="block text-xs sm:text-sm text-gray-400">{item.location}</span>
              </cite>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}