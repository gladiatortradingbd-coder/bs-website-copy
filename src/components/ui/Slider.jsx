export default function PlantSlider() {
    const categories = [
        "Silk Sarees",
        "Cotton Sarees",
        "Jamdani Sarees",
        "Muslin Sarees",
        "Tant Sarees",
        "Kantha Sarees",
        "Banarasi Sarees",
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
                    {categories.map((item, index) => (
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
                            <span>{item}</span>

                            <span className="
                w-1.5 h-1.5
                sm:w-2 sm:h-2
                rounded-full
                bg-rose-400
              "></span>
                        </div>
                    ))}
                </div>

                {/* Duplicate Set for Infinite Effect */}
                                <div className="flex items-center gap-6 px-4 sm:gap-8 sm:px-6 md:gap-12 md:px-8">
                    {categories.map((item, index) => (
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
                            <span>{item}</span>

                            <span className="
                                w-1.5 h-1.5
                                sm:w-2 sm:h-2
                rounded-full
                bg-rose-400
              "></span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}