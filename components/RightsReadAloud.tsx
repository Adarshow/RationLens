"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/copy";
import { useTTS } from "@/lib/useTTS";

type Props = {
  lang: Lang;
  speakText: string;
};

export function RightsReadAloud({ lang, speakText }: Props) {
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
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="ghost"
        fullWidth={false}
        aria-label={speaking ? t.stopSpeaking : t.speakResults}
        onClick={toggleSpeaking}
      >
        <span aria-hidden>{speaking ? "■" : "◖"}</span>
        <span className="ml-2">{speaking ? t.stopSpeaking : t.speakResults}</span>
      </Button>
    </div>
  );
}

