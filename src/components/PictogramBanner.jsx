/** Cabecera ilustrada con los pictogramas del cuento (sustituye a la imagen generada). */
export default function PictogramBanner({ sequence = [], size = "lg" }) {
  const emojis = sequence.slice(0, 8).map((p) => p.emoji);
  return (
    <div
      className="aspect-video w-full bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className={`flex flex-wrap items-center justify-center gap-2 px-6 ${size === "lg" ? "text-5xl sm:text-6xl" : "text-4xl"}`}>
        {emojis.length ? emojis.map((e, i) => <span key={i} className="drop-shadow-sm">{e}</span>) : <span>📖</span>}
      </div>
    </div>
  );
}
