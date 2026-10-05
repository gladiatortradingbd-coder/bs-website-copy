import "./globals.css";
import AppProviders from "./providers";
import SiteShell from "./SiteShell";

export const metadata = {
  title: "Aarong",
  description: "Saree shop e-commerce website",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body
        className="min-h-full flex flex-col pb-24 md:pb-0"
        suppressHydrationWarning
      >
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
