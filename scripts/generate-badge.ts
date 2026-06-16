import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function loadApiKey(): string {
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
    if (match && match[1].trim()) return match[1].trim();
  }
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  throw new Error(
    "GEMINI_API_KEY not found. Add it to .env.local or set as environment variable."
  );
}

async function generateBadge(id: string, prompt: string, type: "module" | "learning-path" = "module") {
  const apiKey = loadApiKey();
  const contentDir = type === "learning-path" ? "src/content/learning-paths" : "src/content/modules";
  const contentPath = join(process.cwd(), contentDir, id);
  const outputPath = join(contentPath, "badge.png");

  if (!existsSync(contentPath)) {
    throw new Error(`Directory not found: ${contentPath}`);
  }

  console.log(`Generating badge for ${type} "${id}"...`);
  console.log(`Prompt: ${prompt}`);

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error(
      "No image returned from Gemini API. Try a different prompt."
    );
  }

  const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  writeFileSync(outputPath, imageBuffer);
  console.log(`Badge saved to ${outputPath} (${imageBuffer.length} bytes)`);
}

const args = process.argv.slice(2);
const typeFlag = args.indexOf("--learning-path");
const type: "module" | "learning-path" = typeFlag !== -1 ? "learning-path" : "module";
const filteredArgs = args.filter((a) => a !== "--learning-path");
const [id, ...promptParts] = filteredArgs;

if (!id || promptParts.length === 0) {
  console.error(
    'Usage: npx tsx scripts/generate-badge.ts <id> "<prompt>" [--learning-path]'
  );
  process.exit(1);
}

generateBadge(id, promptParts.join(" "), type).catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
