import { describe, it, expect } from "vitest";
import { CardSchema } from "@/lib/schemas";

describe("schemas", () => {
  it("validates a card", () => {
    const parsed = CardSchema.parse({
      id: "id",
      title: "T",
      type: "content",
      layout: { w: 1, h: 1 },
      order: 1,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user",
    });
    expect(parsed.title).toBe("T");
  });
});


