import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
// Initialize OpenAI client with the server-side API key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Generate an image for a gratitude entry by fetching the entry text, building a prompt, and calling OpenAI’s image API.
export const generateEntryImage = task({
  id: "generate-entry-image",
  run: async ({ entryId }: { entryId: string }) => {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { text: true },
    });

    if (!entry) throw new Error("Entry not found");

    const prompt = `Create a simple, abstract illustration representing gratitude. Theme: ${entry.text}`;
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const image = result.data?.[0];
    const base64 = image?.b64_json;

    if (!base64) {
      throw new Error("OpenAI image generation returned no base64 image data");
    }

    const buffer = Buffer.from(base64, "base64");

    const blob = await put(`entries/${entryId}.png`, buffer, {
      access: "public",
      contentType: "image/png",
    });

    await prisma.imageGeneration.update({
      where: { entryId },
      data: {
        status: "complete",
        prompt,
        model: "gpt-image-1",
        imageUrl: blob.url,
      },
    });
  },
});
