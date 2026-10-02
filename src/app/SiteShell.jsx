"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Navbar = dynamic(() => import("@/components/layout/Navbar"), {
  ssr: false,
  loading: () => null,
});
const Footer = dynamic(() => import("@/components/layout/Footer2"), {
  ssr: false,
  loading: () => null,
});
const MobileFooterNav = dynamic(() => import("@/components/layout/MobileFooterNav"), {
  ssr: false,
  loading: () => null,
});

export default function SiteShell({ children }) {
  const pathname = usePathname() || "";

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <MobileFooterNav />
    </>
  );
}
