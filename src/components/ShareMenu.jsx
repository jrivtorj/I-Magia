import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, Facebook, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const row =
  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-body text-foreground";

export default function ShareMenu({ story, variant = "default", size = "default" }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/story/${story.id}`;
  const text = `¡Mira el cuento que creé con I-magIA! "${story.title}" ✨`;
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant={variant}
          size={size}
          className="rounded-xl font-body gap-2 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-4 h-4" /> Compartir
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-50 w-52 p-2 rounded-2xl border bg-popover text-popover-foreground shadow-md outline-none"
        >
          <div className="space-y-1">
            <button onClick={stop(copy)} className={row}>
              {copied ? <Check className="w-4 h-4 text-accent" /> : <LinkIcon className="w-4 h-4 text-muted-foreground" />}
              {copied ? "¡Enlace copiado!" : "Copiar enlace"}
            </button>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={stop(() => navigator.share({ title: story.title, text, url }).catch(() => {}))}
                className={row}
              >
                <Share2 className="w-4 h-4 text-muted-foreground" /> Compartir…
              </button>
            )}
            <button
              onClick={stop(() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener",
                ),
              )}
              className={row}
            >
              <Twitter className="w-4 h-4 text-muted-foreground" /> X / Twitter
            </button>
            <button
              onClick={stop(() =>
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener"),
              )}
              className={row}
            >
              <Facebook className="w-4 h-4 text-muted-foreground" /> Facebook
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
