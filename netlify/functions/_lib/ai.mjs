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

async function post(url, headers, body, deadline) {
  const signal = deadline ? AbortSignal.timeout(Math.max(1000, deadline - Date.now())) : undefined;
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal });
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
  // Gemini devuelve 503/429 en picos de demanda: reintento corto y modelo de respaldo,
  // sin pasar de ~9 s en total (límite de las funciones de Netlify).
  const models = [
    process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest",
  ];
  const deadline = Date.now() + 9000;
  let lastError;
  for (const model of models) {
    for (let attempt = 0; attempt < 2 && Date.now() < deadline; attempt++) {
      try {
        const data = await post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          { "x-goog-api-key": process.env.GEMINI_API_KEY },
          {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA },
          },
          deadline,
        );
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        if (!text) throw new Error(`Empty response (finishReason: ${data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || "unknown"})`);
        return JSON.parse(text);
      } catch (e) {
        lastError = e;
        if (!/^(429|500|503|504)\b|aborted|timeout/i.test(e.message)) throw e; // error no transitorio
        if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
      }
    }
  }
  const err = new Error(lastError?.message || "AI unavailable");
  err.busy = true;
  throw err;
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
