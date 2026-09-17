import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, requireOwnedShop } from "@/lib/stockAuth";

export async function POST(request: Request) {
  let body: { shop_id?: unknown; image?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Choose an image first.", 400);
  }

  const auth = await requireOwnedShop(body.shop_id);
  if ("error" in auth) return auth.error;
  if (typeof body.image !== "string" || !body.image.startsWith("data:image/")) {
    return jsonError("Choose a valid image first.", 400);
  }

  const match = body.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return jsonError("Choose a valid image first.", 400);
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > 5 * 1024 * 1024) {
    return jsonError("Choose an image smaller than 5 MB.", 400);
  }

  try {
    const admin = createAdminClient();
    const path = `${auth.shopId}/${auth.user.id}/${crypto.randomUUID()}`;
    const { error } = await admin.storage.from("stock-images").upload(path, buffer, {
      contentType: match[1],
      upsert: false,
    });
    if (error) return jsonError("The image could not be uploaded.", 502);
    return NextResponse.json({ path });
  } catch {
    return jsonError("The image could not be uploaded.", 502);
  }
}
