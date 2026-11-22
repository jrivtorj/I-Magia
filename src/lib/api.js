import { supabase } from "./supabase";

const COLUMNS =
  "id, user_id, title, pictogram_sequence, story_text, story_image_url, language, status, created_at";

export async function listMyStories(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("stories")
    .select(COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Lectura pública por id (para enlaces compartidos), vía función SQL security definer. */
export async function getStory(id) {
  const { data, error } = await supabase.rpc("get_story", { story_id: id });
  if (error) throw error;
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function countAllStories() {
  const { data, error } = await supabase.rpc("count_stories");
  if (error) throw error;
  return Number(data) || 0;
}

export async function deleteStory(id) {
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw error;
}

async function callFunction(name, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json;
}

/** Paso 1: genera el texto del cuento y lo guarda. Devuelve { id }. */
export const generateStory = (pictogramIds, language) =>
  callFunction("generate-story", { pictogramIds, language });

/** Paso 2: genera la ilustración (separado para no superar el límite de tiempo de las funciones). */
export const generateImage = (storyId) => callFunction("generate-image", { storyId });

export const deleteAccount = () => callFunction("delete-account");
