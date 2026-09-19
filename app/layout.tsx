import type { Metadata } from "next";
import { Manrope, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Nav } from "@/components/Nav";
import { ChatWidget } from "@/components/ChatWidget";
import { UserLocationProvider } from "@/lib/useUserLocation";
import { SplashScreen } from "@/components/SplashScreen";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ml",
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
      className={`${manrope.variable} ${notoMalayalam.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <SplashScreen />
        <LanguageProvider>
          <UserLocationProvider>
            <Nav />
            {children}
            <ChatWidget />
          </UserLocationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
