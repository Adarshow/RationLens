"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTTS } from "@/lib/useTTS";
import { Button } from "./ui/Button";
import { useUserLocation, resolveUserLocation } from "@/lib/useUserLocation";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: string[];
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const { lang, t } = useLanguage();
  const { speak, stop, speaking } = useTTS(lang);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { location, status } = useUserLocation();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setRoleChecked(true);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
      setRoleChecked(true);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          // Automatically send the transcribed message
          sendMessage(transcript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const msg = lang === "ml" ? "നമസ്കാരം! റേഷൻ കാർഡ് വിവരങ്ങളെക്കുറിച്ച് ഞാൻ എങ്ങനെ സഹായിക്കാം?" : "Hello! How can I help you with ration card details today?";
    if (!messages.find(m => m.id === "welcome_new")) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: msg,
      }]);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang === "ml" ? "ml-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const userLocation = resolveUserLocation(status, location);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, lang, userLocation }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      if (autoSpeak) {
        speak(data.reply);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleActionClick(action: string) {
    sendMessage(action);
  }

  if (!roleChecked || isAdmin) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-laterite text-white rounded-full p-4 shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center"
        aria-label="Open Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-sm h-[600px] max-h-[80vh] bg-paper border border-paper-dim rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-laterite text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Assistant
          <button 
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (speaking) stop();
            }} 
            className={`text-xs px-2 py-1 rounded-full border ${autoSpeak ? 'bg-white/20 border-white/40' : 'bg-transparent border-white/20 opacity-70'}`}
            title="Toggle Auto-Speak"
          >
            {autoSpeak ? "🔊 Speak ON" : "🔇 Speak OFF"}
          </button>
        </h3>
        <button onClick={() => { setIsOpen(false); stop(); }} className="hover:opacity-80">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-[85%] ${
                m.role === "user"
                  ? "bg-backwater text-white rounded-br-sm"
                  : "bg-paper-dim text-ink rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
            
            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {m.suggestedActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleActionClick(action)}
                    className="text-xs px-3 py-1.5 bg-paper border border-backwater text-backwater rounded-full hover:bg-backwater hover:text-white transition-colors text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="self-start px-4 py-2 bg-paper-dim text-ink/60 rounded-2xl rounded-bl-sm">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-paper-dim flex gap-2 bg-white items-center"
      >
        {recognitionRef.current && (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors shrink-0 ${isListening ? 'bg-laterite text-white animate-pulse' : 'bg-paper-dim text-ink/60 hover:bg-paper-dim/80 hover:text-ink/80'}`}
            title={lang === "ml" ? "സംസാരിക്കുക" : "Dictate with Voice"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "ml" ? "ചോദിക്കുക..." : "Ask something..."}
          className="flex-1 bg-paper-dim rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-laterite/50 min-w-0"
          disabled={isLoading || isListening}
        />
        <Button type="submit" disabled={!input.trim() || isLoading} fullWidth={false} className="rounded-full px-4 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </div>
  );
}
