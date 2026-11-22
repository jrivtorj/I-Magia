import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, getPictogramsByCategory } from "@/lib/pictograms";

function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1" role="tablist">
      {CATEGORIES.map((c) => {
        const selected = active === c.id;
        return (
          <motion.button
            key={c.id}
            role="tab"
            aria-selected={selected}
            aria-label={c.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(c.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-body font-semibold text-sm whitespace-nowrap transition-all duration-200 border-2 ${
              selected
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="hidden sm:inline">{c.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function PictogramCard({ pictogram, onSelect, isSelected }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => onSelect(pictogram)}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-150 min-w-[80px] min-h-[80px] ${
        isSelected
          ? "bg-primary/10 border-primary shadow-lg shadow-primary/20 scale-105"
          : "bg-white/70 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md shadow-sm"
      }`}
    >
      <span className="text-3xl sm:text-4xl leading-none" aria-hidden="true">
        {pictogram.emoji}
      </span>
      <span className="text-xs font-body font-semibold text-foreground/70 text-center leading-tight">
        {pictogram.label}
      </span>
    </motion.button>
  );
}

export default function PictogramPicker({ onSelect, selectedIds }) {
  const [category, setCategory] = useState("personajes");
  const items = getPictogramsByCategory(category);
  return (
    <div className="space-y-4">
      <CategoryTabs active={category} onChange={setCategory} />
      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-1"
        >
          {items.map((p) => (
            <PictogramCard key={p.id} pictogram={p} onSelect={onSelect} isSelected={selectedIds.includes(p.id)} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
