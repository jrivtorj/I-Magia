/** Ilustraciones con IA: desactivadas salvo VITE_ENABLE_IMAGES=true (requiere facturación en Gemini/OpenAI). */
export const IMAGES_ENABLED = import.meta.env.VITE_ENABLE_IMAGES === "true";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Escapa texto antes de insertarlo en HTML generado a mano (impresión). */
export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const LANGUAGES = [
  { value: "es", label: "🇪🇸 Español", name: "Spanish", speech: "es-ES" },
  { value: "en", label: "🇬🇧 English", name: "English", speech: "en-GB" },
  { value: "fr", label: "🇫🇷 Français", name: "French", speech: "fr-FR" },
  { value: "de", label: "🇩🇪 Deutsch", name: "German", speech: "de-DE" },
  { value: "it", label: "🇮🇹 Italiano", name: "Italian", speech: "it-IT" },
  { value: "pt", label: "🇵🇹 Português", name: "Portuguese", speech: "pt-PT" },
  { value: "ca", label: "🏴 Català", name: "Catalan", speech: "ca-ES" },
];

const LANG_KEY = "story_language";

export function getStoryLanguage() {
  try {
    return localStorage.getItem(LANG_KEY) || "es";
  } catch {
    return "es";
  }
}

export function setStoryLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Abre una ventana de impresión con uno o varios cuentos. */
export function printStories(stories, docTitle) {
  const body = stories
    .map((s) => {
      const title = escapeHtml(s.title || "Mi cuento");
      const img = s.story_image_url
        ? `<img src="${escapeHtml(s.story_image_url)}" alt="${title}" />`
        : "";
      const emojis = escapeHtml((s.pictogram_sequence || []).map((p) => p.emoji).join(" "));
      return `<section>${img}<h1>${title}</h1><div class="pictograms">${emojis}</div><div class="story">${escapeHtml(
        s.story_text || "",
      )}</div></section>`;
    })
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(docTitle)}</title>
<style>
body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#222}
section{page-break-after:always;margin-bottom:40px}
section:last-child{page-break-after:auto}
h1{font-size:1.8rem;margin:0 0 8px}
.pictograms{font-size:1.4rem;margin-bottom:16px}
.story{font-size:1.1rem;line-height:1.8;white-space:pre-wrap}
img{width:100%;border-radius:12px;margin-bottom:24px}
</style></head><body>${body}<script>window.onload=function(){window.print()};window.onafterprint=function(){window.close()};</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
}

/** Guarda (solo en esta pestaña) por qué falló la ilustración de un cuento, para mostrarlo. */
export function rememberImageError(storyId, reason) {
  try {
    sessionStorage.setItem(`img-error-${storyId}`, reason);
  } catch {
    /* sin almacenamiento */
  }
}

export function readImageError(storyId) {
  try {
    return sessionStorage.getItem(`img-error-${storyId}`);
  } catch {
    return null;
  }
}
