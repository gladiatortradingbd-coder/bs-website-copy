export default function PlantSlider() {
    const plants = [
        "Outdoor Plants",
        "Office Plants",
        "Indoor Plants",
        "Flowering Plants",
        "Air-Purifying Plants",
        "Pet Friendly",
        "Low-Light Plants",
    ];

    return (
        <div className="
      w-full
      overflow-hidden
      bg-[#000000]
            py-2
            sm:py-3
            md:py-5
      
    ">

            <div className="flex w-max animate-marquee">

                {/* First Set */}
                <div className="flex items-center gap-6 px-4 sm:gap-8 sm:px-6 md:gap-12 md:px-8">
                    {plants.map((plant, index) => (
                        <div
                            key={index}
                            className="
                flex
                items-center
                gap-2
                sm:gap-3
                md:gap-4
                whitespace-nowrap
                text-white
                text-xs
                sm:text-sm
                md:text-xl
                font-medium
              "
                        >
                            <span>{plant}</span>

                            <span className="
                w-1.5 h-1.5
                sm:w-2 sm:h-2
                rounded-full
                bg-lime-400
              "></span>
                        </div>
                    ))}
                </div>

                {/* Duplicate Set for Infinite Effect */}
                                <div className="flex items-center gap-6 px-4 sm:gap-8 sm:px-6 md:gap-12 md:px-8">
                    {plants.map((plant, index) => (
                        <div
                            key={index}
                            className="
                flex
                items-center
                                gap-2
                                sm:gap-3
                                md:gap-4
                whitespace-nowrap
                text-white
                                text-xs
                                sm:text-sm
                                md:text-xl
                font-medium
              "
                        >
                            <span>{plant}</span>

                            <span className="
                                w-1.5 h-1.5
                                sm:w-2 sm:h-2
                rounded-full
                bg-lime-400
              "></span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}