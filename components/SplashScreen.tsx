"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("rationlens-splash-shown");
    if (alreadyShown) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      sessionStorage.setItem("rationlens-splash-shown", "true");
      setVisible(false);
      router.push("/dashboard");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading RationLens"
      className="fixed inset-0 z-50 flex items-center justify-center bg-paper transition-opacity duration-500"
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <Image
          src="/splash-logo.png"
          alt="RationLens"
          width={220}
          height={220}
          priority
          className="h-44 w-44 rounded-3xl shadow-card md:h-56 md:w-56"
        />
      </div>
    </div>
  );
}
