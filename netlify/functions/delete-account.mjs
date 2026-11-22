import { admin, json, requireUser } from "./_lib/common.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Método no permitido" });
  const db = admin();
  const user = await requireUser(req, db);
  if (!user) return json(401, { error: "No autorizado" });

  // 1) Borrar ilustraciones del usuario
  const { data: files } = await db.storage.from("story-images").list(user.id, { limit: 1000 });
  if (files?.length) await db.storage.from("story-images").remove(files.map((f) => `${user.id}/${f.name}`));
  // 2) Borrar el usuario (sus cuentos caen por ON DELETE CASCADE)
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
};
