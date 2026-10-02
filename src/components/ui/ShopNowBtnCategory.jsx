import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ShopNowBtnCategory() {
    return (
        <div>
            <Link
                href="/shop"
                className="
                  mt-8
                  bg-background
                  text-foreground
                  px-6
                  py-4
                  rounded-full
                  hover:bg-muted
                  transition-all
                  duration-300
                  flex
                  items-center
                  gap-2
                  group
                  w-fit
                "
            >
                Shop Now

                <ArrowUpRight
                    size={18}
                    className="
                    transition-transform
                    duration-300
                    group-hover:rotate-45
                  "
                />
                        </Link>
        </div>
    )
}
