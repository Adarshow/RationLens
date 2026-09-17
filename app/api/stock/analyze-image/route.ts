import { NextResponse } from "next/server";
import type { ImageStockProposal } from "@/lib/types";

const SYSTEM_PROMPT =
  'Extract stock information from this ration shop inventory image. Return only JSON: {"items":[{"item":"string","quantity":number,"unit":"string"}],"confidence":"high|medium|low"}. If unreadable, blurry, or ambiguous, return an empty items array and low confidence. Never invent quantities.';

function isProposal(value: unknown): value is ImageStockProposal {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (!["high", "medium", "low"].includes(String(candidate.confidence))) {
    return false;
  }
  return (
    Array.isArray(candidate.items) &&
    candidate.items.every((item) => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return (
        typeof row.item === "string" &&
        typeof row.quantity === "number" &&
        Number.isFinite(row.quantity) &&
        row.quantity >= 0 &&
        typeof row.unit === "string"
      );
    })
  );
}

export async function POST(request: Request) {
  let body: { image?: unknown };
  try {
    body = (await request.json()) as { image?: unknown };
  } catch {
    return NextResponse.json({ error: "Choose an image first." }, { status: 400 });
  }

  if (typeof body.image !== "string" || !body.image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Choose a valid image first." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      items: [],
      confidence: "low",
      message: "Image analysis is not configured. Enter the stock manually.",
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Read the stock quantities in this image." },
            { type: "image_url", image_url: { url: body.image } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "The image could not be analyzed." }, { status: 502 });
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "The image could not be analyzed." }, { status: 502 });
  }

  try {
    const proposal: unknown = JSON.parse(content);
    if (!isProposal(proposal)) throw new Error("Invalid proposal");
    return NextResponse.json(proposal);
  } catch {
    return NextResponse.json({
      items: [],
      confidence: "low",
      message: "Unable to confidently read the stock information.",
    });
  }
}
