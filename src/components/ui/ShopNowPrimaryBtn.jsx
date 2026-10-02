import Link from "next/link";

export default function ShopNowPrimaryBtn() {
    return (
        <div>
            <Link
                href="/shop"
                className="
            bg-black dark:bg-white
            text-white dark:text-black
            px-6
            py-3
            rounded-full  
            cursor-pointer
            transition-all duration-300 ease-out         
          hover:scale-105
          hover:shadow-lg
          active:scale-95
          "
            >
                Shop now
            </Link>
        </div>
    )
}
