import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Library, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/StoryCard";
import PullToRefresh from "@/components/PullToRefresh";
import { deleteStory, listMyStories } from "@/lib/api";
import { printStories } from "@/lib/utils";

export default function MyStories() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: stories = [], isLoading } = useQuery({ queryKey: ["stories"], queryFn: () => listMyStories(50) });

  const del = useMutation({
    mutationFn: deleteStory,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["stories"] });
      const previous = qc.getQueryData(["stories"]);
      qc.setQueryData(["stories"], (old = []) => old.filter((s) => s.id !== id));
      return { previous };
    },
    onError: (_e, _id, ctx) => qc.setQueryData(["stories"], ctx.previous),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["stories"] });
      qc.invalidateQueries({ queryKey: ["stories-count"] });
    },
  });

  const filtered = stories.filter((s) => (s.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Library className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">Mis Cuentos</h1>
            <p className="font-body text-sm text-muted-foreground">
              {stories.length} {stories.length === 1 ? "cuento creado" : "cuentos creados"}
            </p>
          </div>
        </div>
        {stories.length > 0 && (
          <Button variant="outline" onClick={() => printStories(stories, "Mis Cuentos")} className="rounded-xl font-body gap-2">
            <Printer className="w-4 h-4" /> Imprimir todos
          </Button>
        )}
      </motion.div>

      {stories.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cuentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-border bg-card font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      <PullToRefresh onRefresh={() => qc.invalidateQueries({ queryKey: ["stories"] })}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-foreground">Aún no tienes cuentos</h3>
              <p className="font-body text-sm text-muted-foreground">¡Crea tu primer cuento con pictogramas!</p>
            </div>
            <Link to="/">
              <Button className="rounded-2xl font-heading gap-2 mt-2">
                <BookOpen className="w-4 h-4" /> Crear mi primer cuento
              </Button>
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <p className="text-center font-body text-sm text-muted-foreground py-10">
            No se encontraron cuentos con "{search}"
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <StoryCard key={s.id} story={s} onClick={(st) => navigate(`/story/${st.id}`)} onDelete={(id) => del.mutate(id)} />
            ))}
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
