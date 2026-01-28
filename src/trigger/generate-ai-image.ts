import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

export const generateEntryImage = task({
  id: "generate-entry-image",
  run: async (payload: { entryId: string }) => {
    await prisma.imageGeneration.update({
      where: { entryId: payload.entryId },
      data: { status: "pending" },
    });
  },
});
