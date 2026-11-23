import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import PictogramBanner from "./PictogramBanner";
import ShareMenu from "./ShareMenu";

export default function StoryCard({ story, onClick, onDelete }) {
  const seq = story.pictogram_sequence || [];
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow text-left w-full"
    >
      <button className="w-full text-left" onClick={() => onClick(story)}>
        {story.story_image_url ? (
          <div className="aspect-video w-full overflow-hidden">
            <img src={story.story_image_url} alt={story.title} loading="lazy" className="w-full h-full object-cover" />
          </div>
        ) : (
          <PictogramBanner sequence={seq} size="sm" />
        )}
        <div className="p-4 pb-2 space-y-2">
          <h3 className="font-heading font-semibold text-foreground line-clamp-1">{story.title || "Sin título"}</h3>
          <div className="flex flex-wrap gap-1">
            {seq.slice(0, 6).map((p, i) => (
              <span key={i} className="text-lg">
                {p.emoji}
              </span>
            ))}
            {seq.length > 6 && <span className="text-sm text-muted-foreground font-body">+{seq.length - 6}</span>}
          </div>
          <p className="text-xs font-body text-muted-foreground">
            {story.created_at ? format(new Date(story.created_at), "d 'de' MMMM, yyyy", { locale: es }) : ""}
          </p>
        </div>
      </button>
      <div className="px-4 pb-4 flex items-center gap-2">
        <ShareMenu story={story} variant="ghost" size="sm" />
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`¿Eliminar "${story.title || "este cuento"}"?`)) onDelete(story.id);
            }}
            className="ml-auto p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Eliminar cuento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
