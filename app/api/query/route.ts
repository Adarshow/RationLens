import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { items as fallbackItems, stock as fallbackStock } from "@/lib/mockData";
import type { ExtractedIntent, Item, Stock } from "@/lib/types";

type QueryBody = { query?: unknown };

type QueryResult = ExtractedIntent & {
  matches: { item: Item; stock: Stock[] }[];
};

const ITEM_ALIASES: Record<string, string[]> = {
  rice: ["rice", "arisi", "അരി"],
  wheat: ["wheat", "gothambu", "ഗോതമ്പ്"],
  sugar: ["sugar", "panchasara", "പഞ്ചസാര"],
};

function heuristicIntent(query: string): ExtractedIntent {
  const normalized = query.trim().toLowerCase();
  const item = Object.entries(ITEM_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => normalized.includes(alias.toLowerCase())),
  )?.[0] ?? null;
  const language = /[\u0D00-\u0D7F]/.test(query) ? "ml" : "en";
  const intent = /notify|alert|അറിയിക്ക|വിവരം/.test(normalized)
    ? "subscribe_notification"
    : /near|nearby|അടുത്ത|അരികിൽ/.test(normalized)
      ? "find_nearby_shop"
      : "check_stock";

  return { language, intent, item, radius_km: null };
}

function validIntent(value: unknown): value is ExtractedIntent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.language === "en" || candidate.language === "ml") &&
    ["check_stock", "find_nearby_shop", "subscribe_notification"].includes(
      String(candidate.intent),
    ) &&
    (candidate.item === null || typeof candidate.item === "string")
  );
}

async function extractWithModel(query: string, fallback: ExtractedIntent) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_QUERY_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Extract search intent only. Never state availability. Return JSON with language (en|ml), intent (check_stock|find_nearby_shop|subscribe_notification), item (string|null), and radius_km (number|null).',
        },
        { role: "user", content: query },
      ],
    }),
  });

  if (!response.ok) return fallback;
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return fallback;

  try {
    const parsed: unknown = JSON.parse(content);
    if (!validIntent(parsed)) return fallback;
    return {
      ...parsed,
      language: fallback.language,
      item: parsed.item ?? fallback.item,
    };
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  let body: QueryBody;
  try {
    body = (await request.json()) as QueryBody;
  } catch {
    return NextResponse.json({ error: "Enter a search query." }, { status: 400 });
  }

  if (typeof body.query !== "string" || !body.query.trim()) {
    return NextResponse.json({ error: "Enter a search query." }, { status: 400 });
  }

  const intent = await extractWithModel(body.query, heuristicIntent(body.query));
  const matches: QueryResult["matches"] = [];

  try {
    const supabase = createClient();
    let itemQuery = supabase
      .from("items")
      .select("id, name, localized_names, unit");
    if (intent.item) itemQuery = itemQuery.ilike("name", `%${intent.item}%`);
    const { data: itemRows, error: itemError } = await itemQuery;
    if (itemError) throw itemError;
    const foundItems = (itemRows ?? []) as Item[];
    for (const item of foundItems) {
      const { data: stockRows } = await supabase
        .from("stock")
        .select(
          "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by",
        )
        .eq("item_id", item.id);
      matches.push({ item, stock: (stockRows ?? []) as Stock[] });
    }
  } catch {
    const foundItems = fallbackItems.filter(
      (item) =>
        !intent.item ||
        item.name.toLowerCase().includes(intent.item.toLowerCase()) ||
        Object.values(item.localized_names).some((name) =>
          name.toLowerCase().includes(intent.item!.toLowerCase()),
        ),
    );
    for (const item of foundItems) {
      matches.push({
        item,
        stock: fallbackStock.filter((row) => row.item_id === item.id),
      });
    }
  }

  return NextResponse.json({ ...intent, matches } satisfies QueryResult);
}
