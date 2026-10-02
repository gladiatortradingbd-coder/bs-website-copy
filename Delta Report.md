Delta Report — Semantic HTML refactor

Summary
- Performed a conservative semantic-HTML pass (Option A) across the site: replaced top-level non-semantic wrappers with semantic landmarks (section/article/header/nav/aside/address/ul/li) where safe and non-invasive.
- Fixed two build-blocking JSX syntax errors introduced during edits and verified the project builds successfully.

Changed files (high level)
- src/components/layout/Navbar.jsx — adjusted nav markup and grouping (non-sticky layout retained).
- src/components/layout/Footer2.jsx — converted newsletter/social blocks to semantic markup (`<form>`, `<ul>`, `<address>`).

- src/components/sections/home/HeroSection.jsx — fixed JSX and converted root to `<section aria-label="Hero">`.
- src/components/sections/home/BestSellers.jsx — converted desktop grid to `<ul>/<li>` semantics; fixed malformed opening tag that caused a parser error.
- src/components/sections/home/NewArrivalsSection.jsx — converted grid to list semantics; fixed malformed opening tag.
- src/components/sections/home/PlantCareSection.jsx — applied section/article semantics.
- src/components/sections/home/InstagramMarquee.jsx — list semantics for cards.
- src/components/sections/home/TestimonialMarquee.jsx — quote/list semantics applied.

- src/components/sections/blog/BlogHero.jsx — semantic hero and newsletter form.
- src/components/sections/blog/BlogSection.jsx — posts rendered as `<ul>/<li>/<article>`; added `aria-label` for categories.

- src/components/sections/about/OurStory.jsx — semantic headings, stats as lists, images wrapped semantically.
- src/components/sections/about/Bringlife.jsx — main card uses `<article>` and list semantics.
- src/components/sections/about/OurValues.jsx, OurTeam.jsx, VisitOurOffices.jsx — semantic wrappers and `<address>` where applicable.

- src/app/shop/ShopClient.jsx — product list converted to `<ul>/<li>`; `aside` preserved for filters.
- src/app/shop/[id]/ProductDetailClient.jsx — top-level product detail wrapped in `<article>`.

- src/app/checkout/page.jsx, src/app/wishlist/page.jsx, src/app/track-order/page.jsx — page-level landmarks (`<main>`, `<section>`) applied.
- src/app/SiteShell.jsx — ensured layout includes Navbar and Footer correctly.

Fixes & verification
- Fixed parsing errors in:
  - `src/components/sections/home/BestSellers.jsx` (string literal inserted in opening tag).
  - `src/components/sections/home/NewArrivalsSection.jsx` (same issue).
- Ran `get_errors` checks and verified `npm run build` completes; routes are prerendered/static as expected.

Notes and recommendations
- Approach: conservative edits only at top-level containers to avoid breaking logic or stateful components.
- Recommend reviewing the delta and running the site's visual smoke tests to ensure layout/spacing preserved (Tailwind classes unchanged).
- Next possible steps: (1) continue deeper semantic pass for non-top-level wrappers, (2) prepare a Git commit/PR with these changes, (3) add ARIA labels where helpful for screen readers.

If you want a PR or commit created here, tell me the branch name and commit message and I'll prepare it.

Static Generation Updates
- Added `generateStaticParams` to `src/app/(store)/blog/[slug]/page.jsx` to pre-render up to 100 published blog posts at build time.
- Added `generateStaticParams` to `src/app/shop/[id]/page.jsx` to pre-render the latest 100 product pages at build time and removed the `force-dynamic` hint so those params can be served statically.

Notes on static generation
- These static pages are generated at build time and improve runtime performance and caching. They require access to the MongoDB instance during the build to fetch slugs/IDs. Pages not included in `generateStaticParams` will continue to be rendered dynamically.
- Consider adding `export const revalidate = <seconds>` to enable ISR (periodic revalidation) if you want static pages to update on a schedule without full redeploys.