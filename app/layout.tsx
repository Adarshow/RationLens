import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Malayalam, Noto_Serif } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { TopBar } from "@/components/TopBar";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ml",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RationLens",
  description: "See ration shop stock before you travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoMalayalam.variable} ${notoSerif.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <LanguageProvider>
          <TopBar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
