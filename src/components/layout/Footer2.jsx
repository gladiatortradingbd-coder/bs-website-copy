"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon } from "@/lib/iconify"
import siteData from '@/data/site.json'

const { footer } = siteData

const footerLinkRoutes = {
  home: "/",
  shop: "/shop",
  about: "/about",
  contact: "/contact",
}

function getFooterLinkHref(label) {
  const normalizedLabel = String(label ?? "").trim().toLowerCase()
  return footerLinkRoutes[normalizedLabel] ?? "/"
}

function isNavActive(href, pathname) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname.startsWith(href);
}

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className='w-full bg-black dark:bg-white text-white dark:text-black pt-12 sm:pt-16 md:pt-20 lg:pt-25 pb-7.5 rounded-tl-[40px] sm:rounded-tl-[70px] md:rounded-tl-[100px] lg:rounded-tl-[125px] text-[13px] leading-5'>
      {/* Container to center content and add horizontal padding */}
      <div className="container mx-auto px-4 sm:px-6">
        {/* Grid Layout: 1 column on mobile, 4 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">

          {/* Column 1: Logo & About */}
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Image src="https://res.cloudinary.com/drbe0jtgw/image/upload/v1780689937/logop2_mm0ib4.svg" alt={footer.companyName || 'logo'} width={56} height={56} className="rounded" />
              <span className="text-2xl font-bold tracking-wider">{footer.companyName}</span>
            </div>
            <p className="opacity-80 leading-relaxed">
              Discover timeless sarees, thoughtful craftsmanship, and elegant styles made for every occasion.
            </p>
          </div>

          {/* Column 2: Office Info */}
          <address className="not-italic">
            <h4 className="relative text-lg font-semibold mb-4 pb-2 inline-block">Visit us<div className='overflow-hidden mt-2 relative h-1.5 w-full rounded-[3px] bg-[#767676]'><span className='absolute top-0 left-2.5 h-full w-3.75 rounded-[3px] bg-background animate-moving'></span></div></h4>
            <div className="space-y-2 opacity-80">
              {footer.office.address.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              <div><a href={`mailto:${footer.office.email}`} className="hover:underline">{footer.office.email}</a></div>
              <div className='font-bold'><a href={`tel:${footer.office.phone.replace(/\s+/g, '')}`}>{footer.office.phone}</a></div>
            </div>
          </address>

          {/* Column 3: Links */}
          <div>
            <h4 className="relative text-lg font-semibold mb-4 pb-2 inline-block">Links<div className='overflow-hidden mt-2 relative h-1.25 w-full rounded-[3px] bg-[#767676]'><span className='absolute top-0 left-2.5 h-full w-3.75 rounded-[3px] bg-background animate-moving'></span></div></h4>
            <ul className="space-y-2">
              {footer.links.map((link) => {
                const href = getFooterLinkHref(link);
                const isActive = isNavActive(href, pathname);
                return (
                  <li key={link}>
                    <Link 
                      href={href} 
                      className={`transition-colors duration-300 inline-block ${
                        isActive 
                          ? "text-[#065f46] font-semibold" 
                          : "opacity-80 hover:opacity-100 hover:text-[#065f46]"
                      }`}
                    >
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h4 className="relative text-lg font-semibold mb-4 pb-2 inline-block">Newsletter<div className='overflow-hidden mt-2 relative h-1.25 w-full rounded-[3px] bg-[#767676]'><span className='absolute top-0 left-2.5 h-full w-3.75 rounded-[3px] bg-background animate-moving'></span></div></h4>
            <p className="opacity-80 mb-4">Get styling inspiration and updates from our latest collection.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()} aria-label="Subscribe to newsletter">
              <label className="sr-only">Email</label>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" aria-label="Email address" className="bg-background/10 border border-white/20 dark:border-black/20 p-2 rounded w-full outline-none focus:border-white dark:focus:border-black" />
                <button type="submit" className="px-3 py-2 bg-background text-foreground rounded">Subscribe</button>
              </div>
            </form>
            <ul className="flex flex-wrap gap-3 mt-4" aria-label="Social links">
              {footer.socialLinks.map((social) => (
                <li key={social.label}>
                  <a href={social.href} className="flex cursor-pointer items-center opacity-80 transition-opacity hover:opacity-100" aria-label={social.label}>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full border border-white/20 dark:border-black/20 bg-background/5 mr-2">
                      <Icon icon={social.icon} className="text-white dark:text-black text-[18px]" />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      <hr className="my-8 border-white/20 dark:border-black/20" ></hr>

      <div className="text-center opacity-70">
        &copy; {new Date().getFullYear()} {footer.companyName}. All rights reserved.
      </div>

    </footer>

  )
}
