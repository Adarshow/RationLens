"use client";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/copy";
import { useTTS } from "@/lib/useTTS";

type Props = {
  lang: Lang;
  speakText: string;
  className?: string;
};

export function RightsReadAloud({ lang, speakText, className }: Props) {
  const { t } = useLanguage();
  const { speak, stop, speaking, supported } = useTTS(lang);

  function toggleSpeaking() {
    if (speaking) {
      stop();
    } else {
      speak(speakText);
    }
  }

  if (!supported) {
    return (
      <p className="text-xs text-ink/60" role="status">
        {t.voiceUnsupported}
      </p>
    );
  }

  return (
    <div className={cn("inline-flex", className)}>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-backwater hover:underline transition-all"
        aria-label={speaking ? t.stopSpeaking : t.speakResults}
        onClick={toggleSpeaking}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={speaking ? "animate-pulse" : ""}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
        <span>{speaking ? t.stopSpeaking : t.speakResults}</span>
      </button>
    </div>
  );
}

