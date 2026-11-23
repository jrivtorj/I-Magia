// Adaptador de IA: Gemini (por defecto) u OpenAI, vía REST, sin SDKs.
const provider = () => (process.env.AI_PROVIDER || "gemini").toLowerCase();

const STORY_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Story title" },
    story: { type: "string", description: "The complete story" },
    image_prompt: {
      type: "string",
      description:
        "A detailed english prompt to generate a children's book illustration for this story. Describe the scene, characters, style (whimsical watercolor children's book illustration), colors, and mood.",
    },
  },
  required: ["title", "story", "image_prompt"],
};

const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: Object.fromEntries(
    Object.entries(STORY_SCHEMA.properties).map(([k, v]) => [k, { ...v, type: "STRING" }]),
  ),
  required: STORY_SCHEMA.required,
};

async function post(url, headers, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${data?.error?.status || ""} ${data?.error?.message || "AI provider error"}`.trim());
  return data;
}

export async function generateStoryJson(prompt) {
  if (provider() === "openai") {
    const data = await post(
      "https://api.openai.com/v1/chat/completions",
      { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      {
        model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: { name: "story", strict: true, schema: { ...STORY_SCHEMA, additionalProperties: false } },
        },
      },
    );
    return JSON.parse(data.choices[0].message.content);
  }
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest";
  const data = await post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { "x-goog-api-key": process.env.GEMINI_API_KEY },
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA },
    },
  );
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) throw new Error(`Empty response (finishReason: ${data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || "unknown"})`);
  return JSON.parse(text);
}

/** Devuelve { bytes: Buffer, mimeType } */
export async function generateImageBytes(prompt) {
  if (provider() === "openai") {
    const data = await post(
      "https://api.openai.com/v1/images/generations",
      { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      { model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size: "1536x1024", quality: "medium" },
    );
    return { bytes: Buffer.from(data.data[0].b64_json, "base64"), mimeType: "image/png" };
  }
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  const data = await post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { "x-goog-api-key": process.env.GEMINI_API_KEY },
    {
      contents: [{ role: "user", parts: [{ text: `${prompt}\nLandscape 16:9 composition. No text in the image.` }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    },
  );
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const inline = part?.inlineData || part?.inline_data;
  if (!inline) throw new Error("The model returned no image");
  return { bytes: Buffer.from(inline.data, "base64"), mimeType: inline.mimeType || inline.mime_type || "image/png" };
}
