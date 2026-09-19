"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/copy";

type Props = {
  lang: Lang;
  speakText: string;
};

function getVoiceForLang(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

export function RightsReadAloud({ lang, speakText }: Props) {
  const { t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [noVoiceWarning, setNoVoiceWarning] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    if (!("speechSynthesis" in window)) return;
    const load = () => {};
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function toggleSpeaking() {
    if (!speakText || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setNoVoiceWarning(false);
    const targetLangCode = lang === "ml" ? "ml-IN" : "en-IN";
    const voice = getVoiceForLang(targetLangCode);
    if (!voice && lang === "ml") {
      setNoVoiceWarning(true);
      // Continue to try speaking even if a specific Malayalam voice isn't found
    }
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = targetLangCode;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
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
      {noVoiceWarning ? (
        <p className="text-xs text-laterite" role="status">
          {t.noMalayalamVoice}
        </p>
      ) : null}
    </div>
  );
}
