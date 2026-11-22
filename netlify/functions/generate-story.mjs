import { admin, json, requireUser } from "./_lib/common.mjs";
import { generateStoryJson } from "./_lib/ai.mjs";
import { buildSentence, getPictogram } from "../../src/lib/pictograms.js";

const LANGS = { es: "Spanish", en: "English", fr: "French", de: "German", it: "Italian", pt: "Portuguese", ca: "Catalan" };
const MAX_PICTOGRAMS = 12;

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Método no permitido" });
  const db = admin();
  const user = await requireUser(req, db);
  if (!user) return json(401, { error: "Inicia sesión para crear cuentos" });

  const { pictogramIds, language } = await req.json().catch(() => ({}));
  // Solo se aceptan ids de la lista oficial: evita que alguien inyecte texto libre en el prompt.
  const sequence = (Array.isArray(pictogramIds) ? pictogramIds : []).slice(0, MAX_PICTOGRAMS).map(getPictogram).filter(Boolean);
  if (!sequence.length) return json(400, { error: "Elige al menos un pictograma" });
  const lang = LANGS[language] ? language : "es";

  // Límite diario por usuario para controlar el gasto de IA.
  const limit = Number(process.env.DAILY_STORY_LIMIT || 20);
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await db.from("stories").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= limit) return json(429, { error: `Has llegado al límite de ${limit} cuentos por día. ¡Vuelve mañana!` });

  const sentence = buildSentence(sequence);
  const prompt = `You are a children's story writer. The user has selected pictograms to build a story.
Selected pictograms: ${sentence}

Write a short story (maximum 200 words) for children based on these pictograms.
The story must be magical, positive, with a beautiful message.
Use simple, accessible language.
Include the elements represented by the pictograms creatively.
IMPORTANT: Write the entire story (title and text) in ${LANGS[lang]}.`;

  let result;
  try {
    result = await generateStoryJson(prompt);
  } catch (e) {
    console.error("generate-story", e);
    return json(502, { error: "La IA no ha podido crear el cuento. Inténtalo de nuevo." });
  }

  const { data, error } = await db
    .from("stories")
    .insert({
      user_id: user.id,
      title: result.title,
      pictogram_sequence: sequence,
      generated_prompt: result.image_prompt, // se reutiliza en generate-image
      story_text: result.story,
      language: lang,
      status: "illustrating",
    })
    .select("id")
    .single();
  if (error) {
    console.error("insert", error);
    return json(500, { error: "No se pudo guardar el cuento" });
  }
  return json(200, { id: data.id });
};
