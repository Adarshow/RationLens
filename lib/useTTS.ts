"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/copy";

function getVoiceForLang(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find(
    (v) => v.lang.toLowerCase() === langCode.toLowerCase()
  );
  if (exact) return exact;
  const prefix = langCode.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
}

export function useTTS(lang: Lang) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window || lang === "ml");
    if (!("speechSynthesis" in window)) return;
    const load = () => {};
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis?.cancel();
    };
  }, [lang]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  function stop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  async function playGoogleTTS(text: string) {
    const chunks = text.split(/(?<=[.!?])\s+|(?<=\n)\s*/).filter(Boolean);
    // Since we removed regex lookbehind earlier due to browser issues, let's just split by ". " and newline.
    const safeChunks = text.split(/\. |\n/).filter(Boolean);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const audio = new Audio();
    audioRef.current = audio;

    try {
      for (let i = 0; i < safeChunks.length; i++) {
        if (abortController.signal.aborted) break;
        const chunk = safeChunks[i];
        if (chunk.trim().length === 0) continue;

        const url = `/api/tts?lang=${lang}&text=${encodeURIComponent(chunk)}`;

        await new Promise<void>((resolve, reject) => {
          audio.src = url;
          audio.onended = () => resolve();
          audio.onerror = () => reject();

          abortController.signal.addEventListener(
            "abort",
            () => {
              audio.pause();
              resolve();
            },
            { once: true }
          );

          audio.play().catch(reject);
        });
      }
    } catch (e) {
      console.error("TTS Error:", e);
    } finally {
      if (abortControllerRef.current === abortController) {
        setSpeaking(false);
        abortControllerRef.current = null;
      }
    }
  }

  function speak(text: string) {
    if (!text) return;
    
    // Stop any currently playing audio
    stop();

    const targetLangCode = lang === "ml" ? "ml-IN" : "en-IN";
    let voice = null;
    if ("speechSynthesis" in window) {
      voice = getVoiceForLang(targetLangCode);
    }

    setSpeaking(true);

    if (!voice && lang === "ml") {
      playGoogleTTS(text);
      return;
    }

    if (!("speechSynthesis" in window)) {
      setSupported(false);
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLangCode;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return { speak, stop, speaking, supported };
}
