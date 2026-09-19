"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/copy";

type SpeechRecognitionEventLike = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type Props = {
  lang: Lang;
  onTranscript?: (value: string) => void;
  speakText?: string;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as Window & {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

export function VoiceControls({ lang, onTranscript, speakText }: Props) {
  const { t } = useLanguage();
  const recognitionRef = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(Boolean(getRecognition()) || "speechSynthesis" in window);
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function toggleListening() {
    const Recognition = getRecognition();
    if (!Recognition) {
      setSupported(false);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang === "ml" ? "ml-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript && onTranscript) onTranscript(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

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
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = lang === "ml" ? "ml-IN" : "en-IN";
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
    <div className="flex flex-wrap gap-2" aria-label={t.voiceControls}>
      {onTranscript ? (
        <Button
          type="button"
          variant={listening ? "danger" : "secondary"}
          fullWidth={false}
          aria-label={listening ? t.stopListening : t.voiceSearch}
          onClick={toggleListening}
        >
          <span aria-hidden>{listening ? "■" : "◉"}</span>
          <span className="ml-2">{listening ? t.stopListening : t.voiceSearch}</span>
        </Button>
      ) : null}
      {speakText ? (
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
      ) : null}
    </div>
  );
}
