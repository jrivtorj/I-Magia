import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, WandSparkles } from "lucide-react";
import PictogramPicker from "@/components/PictogramPicker";
import SequenceBar, { MAX_PICTOGRAMS } from "@/components/SequenceBar";
import { countAllStories, generateImage, generateStory } from "@/lib/api";
import { getStoryLanguage, rememberImageError } from "@/lib/utils";

export default function Home() {
  const [sequence, setSequence] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: total = 0 } = useQuery({ queryKey: ["stories-count"], queryFn: countAllStories });

  const add = (p) => setSequence((s) => (s.length >= MAX_PICTOGRAMS ? s : [...s, p]));
  const remove = (i) => setSequence((s) => s.filter((_, idx) => idx !== i));

  const generate = async () => {
    if (!sequence.length) return;
    setGenerating(true);
    setError("");
    try {
      const { id } = await generateStory(
        sequence.map((p) => p.id),
        getStoryLanguage(),
      );
      // La ilustración se genera en segundo plano; la vista del cuento se refresca sola.
      generateImage(id)
        .then((r) => r.reason && rememberImageError(id, r.reason))
        .catch((e) => rememberImageError(id, e.message))
        .finally(() => queryClient.invalidateQueries({ queryKey: ["story", id] }));
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories-count"] });
      navigate(`/story/${id}`);
    } catch (e) {
      setError(
        (e.message || "No se pudo crear el cuento. Inténtalo de nuevo.") + (e.detail ? ` (${e.detail})` : ""),
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary px-4 py-2 rounded-full font-body font-bold text-sm select-none shadow-sm">
          <WandSparkles className="w-4 h-4" /> ¡Crea tu cuento mágico! ✨
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
          ¿Qué historia quieres contar hoy?
        </h1>
        <p className="font-body text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Elige los pictogramas que quieras y nosotros crearemos un cuento especial para ti 🌈
        </p>
        <p className="font-body text-xs text-muted-foreground/70 max-w-sm mx-auto">
          🌍 Cuentos disponibles en español, inglés, francés, alemán, italiano, portugués y catalán — elige tu
          idioma en Ajustes ⚙️
        </p>
        {total > 0 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-body font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            {total} {total === 1 ? "cuento creado" : "cuentos creados"} por la comunidad
          </div>
        )}
      </motion.div>

      <SequenceBar
        sequence={sequence}
        onRemove={remove}
        onClear={() => setSequence([])}
        onGenerate={generate}
        isGenerating={generating}
        error={error}
      />
      <PictogramPicker onSelect={add} selectedIds={sequence.map((p) => p.id)} />
      <p className="text-center font-body text-xs text-muted-foreground/50 pt-4 pb-2">Aula Digital Studio</p>
    </div>
  );
}
