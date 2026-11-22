import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/utils";

/** Lectura en voz alta con la síntesis de voz del navegador, en el idioma del cuento. */
export default function ReadAloud({ text, language = "es" }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!("speechSynthesis" in window) || !text) return null;

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const lang = LANGUAGES.find((l) => l.value === language)?.speech || "es-ES";
    const u = new SpeechSynthesisUtterance(text.replace(/[*_#>`]/g, ""));
    u.lang = lang;
    u.rate = 0.9;
    u.pitch = 1.1;
    const prefix = lang.slice(0, 2);
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(prefix));
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  return (
    <Button
      variant="outline"
      onClick={toggle}
      className={`rounded-xl font-body gap-2 transition-colors ${
        speaking ? "border-secondary text-secondary hover:bg-secondary/10" : ""
      }`}
    >
      {speaking ? (
        <>
          <Square className="w-4 h-4 fill-secondary text-secondary" /> Detener
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" /> Leer en voz alta
        </>
      )}
    </Button>
  );
}
