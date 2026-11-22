import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MAX_PICTOGRAMS = 12;

export default function SequenceBar({ sequence, onRemove, onClear, onGenerate, isGenerating, error }) {
  const empty = sequence.length === 0;
  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border-2 border-dashed border-primary/20 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-foreground/80 text-sm">Tu historia</h3>
        {!empty && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Borrar todo
          </button>
        )}
      </div>

      <div className="min-h-[72px] flex items-center">
        {empty ? (
          <p className="text-muted-foreground font-body text-sm text-center w-full py-4">
            👆 Toca los pictogramas para crear tu historia
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {sequence.map((p, i) => (
                <motion.div
                  key={`${p.id}-${i}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  layout
                  className="relative group"
                >
                  <div className="flex flex-col items-center bg-white/80 border border-primary/25 rounded-2xl px-3 py-2 min-w-[60px] shadow-sm">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[10px] font-body text-foreground/60 mt-0.5">{p.label}</span>
                  </div>
                  {/* Visible siempre en táctil (no hay hover); en ratón aparece al pasar por encima */}
                  <button
                    onClick={() => onRemove(i)}
                    aria-label={`Quitar ${p.label}`}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center [@media(hover:hover)]:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!empty && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full rounded-2xl font-heading font-semibold text-lg h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/25 gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                Creando tu cuento...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Crear mi cuento
              </>
            )}
          </Button>
          {error && <p className="text-center text-sm font-body text-destructive">{error}</p>}
        </motion.div>
      )}
    </div>
  );
}
