import { admin, json, requireUser } from "./_lib/common.mjs";
import { generateImageBytes } from "./_lib/ai.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Método no permitido" });
  const db = admin();
  const user = await requireUser(req, db);
  if (!user) return json(401, { error: "No autorizado" });

  const { storyId } = await req.json().catch(() => ({}));
  const { data: story } = await db.from("stories").select("id, user_id, generated_prompt, story_image_url").eq("id", storyId).single();
  if (!story || story.user_id !== user.id) return json(404, { error: "Cuento no encontrado" });
  if (story.story_image_url) return json(200, { ok: true, url: story.story_image_url });

  let url = null;
  let reason = null;
  try {
    const { bytes, mimeType } = await generateImageBytes(story.generated_prompt);
    const ext = mimeType.includes("jpeg") ? "jpg" : mimeType.split("/")[1] || "png";
    const path = `${user.id}/${story.id}.${ext}`;
    const { error: upErr } = await db.storage.from("story-images").upload(path, bytes, { contentType: mimeType, upsert: true });
    if (upErr) throw upErr;
    url = db.storage.from("story-images").getPublicUrl(path).data.publicUrl;
  } catch (e) {
    // Si falla la imagen, el cuento se conserva sin ilustración.
    console.error("generate-image", e);
    reason = String(e.message || e).slice(0, 300);
  }
  await db.from("stories").update({ story_image_url: url, status: "completed" }).eq("id", story.id);
  return json(200, { ok: Boolean(url), url, reason });
};
