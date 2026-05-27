import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tryaksh SOP — TRYAKSH-SOP-PCB-001",
  description:
    "Controlled document. PCB Design Standard Operating Procedure v2.0 — workflow management, stage-gated approvals, tamper-evident audit.",
  icons: {
    icon: [{ url: "/tryaksh-logo.png", type: "image/png" }],
  },
};

/**
 * Allow server actions and page renders up to 30s. Supabase free-tier cold
 * starts can take 15-30s; the Vercel default (10s) is too short and surfaces
 * as "Unexpected end of JSON input" when a server action transport times out.
 */
export const maxDuration = 30;

/**
 * Sets the `dark` class on <html> BEFORE first paint, based on:
 *   1. saved preference in localStorage ('tryaksh-theme')
 *   2. system preference (prefers-color-scheme: dark)
 * Prevents a flash of the wrong theme on initial load.
 */
const themeInitScript = `
(function(){try{
  var t = localStorage.getItem('tryaksh-theme');
  var sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark = t === 'dark' || (!t && sys);
  if (dark) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
