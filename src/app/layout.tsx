import type { Metadata, Viewport } from "next";
import { Inter, Spline_Sans_Mono } from "next/font/google";
import { TopNav } from "@/components/layout/top-nav";
import { SidebarNav } from "@/components/layout/sidebar";
import { MobileTabNav } from "@/components/layout/mobile-tab-nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-sans-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AssetSpan — Capital Expenditure Planning",
    template: "%s · AssetSpan",
  },
  description:
    "Asset lifecycle tracking, replacement cost forecasting, and capital project budget management for commercial real estate asset managers.",
};

export const viewport: Viewport = {
  themeColor: "#18181B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${splineSansMono.variable}`}>
      <body className="min-h-dvh bg-charcoal-50 font-sans text-charcoal-900 antialiased">
        <TopNav />
        <div className="mx-auto flex w-full max-w-[1600px]">
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r border-charcoal-200 bg-white lg:block">
            <SidebarNav />
          </aside>
          <main className="min-w-0 flex-1 pb-20 lg:pb-8">{children}</main>
        </div>
        <MobileTabNav />
      </body>
    </html>
  );
}
