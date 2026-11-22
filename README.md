# I-magIA

Herramienta accesible basada en pictogramas para que personas con dificultades de lenguaje expresen su imaginación y creen cuentos con IA. Reconstrucción independiente de la app publicada en Base44 (`imagia.base44.app`).

**Stack:** Vite + React 18 + Tailwind · Supabase (login, base de datos y almacenamiento de imágenes) · Netlify (web estática + funciones serverless para la IA) · Gemini u OpenAI.

## Qué se conserva del original

- Las 3 pantallas: **Crear** (`/`), **Mis Cuentos** (`/mis-cuentos`) y **cuento** (`/story/:id`).
- Los 96 pictogramas y 8 categorías, textos, colores, tipografías (Fredoka + Nunito) y animaciones.
- El mismo prompt para el cuento (máx. 200 palabras, 7 idiomas) y para la ilustración.
- Leer en voz alta, imprimir uno o todos, compartir (enlace, X, Facebook, menú nativo), buscar, borrar, tirar para refrescar, ajustes de idioma y eliminar cuenta.

## Qué cambia respecto a Base44 (y por qué)

| Base44 | Aquí | Motivo |
|---|---|---|
| `base44.auth` | Supabase Auth (enlace mágico por correo; Google opcional) | Login propio |
| `entities.Story` | Tabla `stories` en Postgres con RLS | Cada usuario solo ve y borra lo suyo |
| `Core.InvokeLLM` | `netlify/functions/generate-story` | La clave de IA nunca llega al navegador |
| `Core.GenerateImage` | `netlify/functions/generate-image` → Supabase Storage | Se separa del texto para no superar el tiempo límite de las funciones |
| Enlace compartido requería login | `/story/:id` es público (función `get_story`) | Los enlaces de "Compartir" funcionan para cualquiera |

Correcciones sobre el original:

- **"Eliminar mi cuenta"** en Base44 borraba los cuentos que devolvía `Story.list()` y solo cerraba sesión: no eliminaba la cuenta y, según la configuración de permisos, podía intentar borrar cuentos de otros usuarios. Ahora borra solo lo del usuario y elimina la cuenta de verdad, con doble confirmación.
- **Contador "por la comunidad"** y **Mis Cuentos** usaban la misma consulta sin filtrar, así que una de las dos cosas era incorrecta. Ahora el contador es global y Mis Cuentos muestra solo los propios.
- **Leer en voz alta** usaba siempre la voz `es-ES`, aunque el cuento estuviera en otro idioma. Ahora se usa el idioma del cuento.
- **Imprimir** insertaba el texto de la IA en HTML sin escapar. Ahora se escapa.
- El servidor solo acepta **ids de pictogramas válidos** (como máximo 12), lo que evita que alguien inyecte texto en el prompt. Además hay un **límite diario por usuario** (`DAILY_STORY_LIMIT`) para controlar el gasto.
- Si falla la ilustración, **el cuento se guarda igual** sin imagen. En el original se perdía el cuento entero.

## Puesta en marcha (unos 20 minutos)

### 1. Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com) (el plan gratuito basta).
2. Ve a **SQL Editor**, pega `supabase/schema.sql` y pulsa **Run**.
3. En **Authentication → URL Configuration**, pon en *Site URL* la URL de Netlify y añádela también a *Redirect URLs*.
4. En **Project Settings → API**, copia la *Project URL*, la `anon key` y la `service_role key`.

### 2. Clave de IA
- **Gemini** (por defecto): crea la clave en [aistudio.google.com](https://aistudio.google.com/apikey). La generación de imágenes requiere activar la facturación.
- **OpenAI**: `AI_PROVIDER=openai` y `OPENAI_API_KEY`.

### 3. Netlify
1. *Add new site → Import from GitHub →* este repositorio. La configuración de build ya está en `netlify.toml`.
2. En *Site configuration → Environment variables*, añade todas las variables de `.env.example`.
3. Despliega. Para usar un dominio propio, configúralo en *Domain management* y actualiza la URL en Supabase.

### Desarrollo local
```bash
npm install
cp .env.example .env   # y rellena los valores
npx netlify dev        # web + funciones en http://localhost:8888
```

## Migrar los cuentos existentes de Base44
Desde fuera no se pueden extraer los datos de Base44. En el panel de Base44, ve a **Data → Story** y exporta a CSV. Después se importan a la tabla `stories` con su `user_id` correspondiente. Las imágenes están alojadas en `media.base44.com`: conviene descargarlas y subirlas al bucket `story-images` antes de cerrar la app de Base44.

## Notas
- Las funciones síncronas de Netlify tienen un tiempo límite (10 s por defecto). Si la ilustración tarda más, el cuento queda sin imagen. En ese caso tienes dos opciones: usar un modelo de imagen más rápido o desplegar en Vercel (60 s).
- Los nombres de modelo son configurables (`GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`…), por si Google u OpenAI los renuevan.
