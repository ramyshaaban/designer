import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "demo-1",
      title: "Demo Card 1",
      description: "This is a demo card",
      type: "content" as const,
      order: 1
    },
    {
      id: "demo-2", 
      title: "Demo Card 2",
      description: "Another demo card",
      type: "collection" as const,
      order: 2
    }
  ]);
}
