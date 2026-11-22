import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpen, Image as ImageIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReadAloud from "@/components/ReadAloud";
import ShareMenu from "@/components/ShareMenu";
import Spinner from "@/components/Spinner";
import { getStory } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { printStories } from "@/lib/utils";

// Si la generación de imagen se cortó (p. ej. por tiempo límite), dejar de esperar a los 3 minutos.
const isIllustrating = (s) =>
  s?.status === "illustrating" && Date.now() - new Date(s.created_at).getTime() < 3 * 60 * 1000;

export default function StoryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: story, isLoading } = useQuery({
    queryKey: ["story", id],
    queryFn: () => getStory(id),
    enabled: !!id,
    // Mientras se genera la ilustración, refrescar cada 4 s
    refetchInterval: (q) => (isIllustrating(q.state.data) ? 4000 : false),
  });

  if (isLoading) return <Spinner />;
  if (!story)
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="font-heading font-bold text-xl">Cuento no encontrado</h2>
        <Button onClick={() => navigate("/")} className="rounded-2xl font-heading">
          Crear un cuento
        </Button>
      </div>
    );

  const illustrating = isIllustrating(story);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate(user ? "/mis-cuentos" : "/")}
          className="rounded-xl font-body gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <ReadAloud text={story.story_text} language={story.language} />
          <Button variant="outline" onClick={() => printStories([story], story.title || "Mi cuento")} className="rounded-xl font-body gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <ShareMenu story={story} variant="outline" />
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
        {story.story_image_url ? (
          <div className="aspect-video w-full overflow-hidden">
            <img src={story.story_image_url} alt={story.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <div className="text-center space-y-2 text-muted-foreground">
              <ImageIcon className={`w-12 h-12 mx-auto opacity-40 ${illustrating ? "animate-pulse" : ""}`} />
              <p className="font-body text-sm">{illustrating ? "Generando ilustración..." : "Sin ilustración"}</p>
            </div>
          </div>
        )}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground">{story.title || "Tu cuento"}</h2>
          </div>
          {story.pictogram_sequence?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {story.pictogram_sequence.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-sm font-body">
                  <span>{p.emoji}</span>
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                </span>
              ))}
            </div>
          )}
          <div className="prose prose-lg max-w-none font-body text-foreground/85 leading-relaxed">
            <ReactMarkdown>{story.story_text || ""}</ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
