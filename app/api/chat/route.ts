import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { RATION_CARD_CATEGORIES } from "@/lib/rationCardRights";
import { shops, items, getStockForShop, shopDistanceKm } from "@/lib/mockData";

const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY! });

export async function POST(request: Request) {
  try {
    const { messages, lang, userLocation } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const shopsData = shops.map((shop) => {
      let dist: number | null = null;
      if (userLocation && typeof userLocation.latitude === "number" && typeof userLocation.longitude === "number") {
        dist = shopDistanceKm(shop, userLocation);
      }
      return {
        ...shop,
        distance: dist,
        stock: getStockForShop(shop.id),
      };
    });

    if (userLocation && typeof userLocation.latitude === "number") {
      shopsData.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    const shopContext = `
Nearby Shops and Current Stock Availability:
${shopsData.map(s => `- ${s.name} ${s.distance !== null ? `(${s.distance.toFixed(1)} km away)` : ''}\n  Address: ${s.address}\n  Stock: ${s.stock.map(st => `${st.item.name}: ${st.status} (${st.quantity} ${st.item.unit})`).join(', ')}`).join('\n')}

When the user asks for the "nearest shop" or "closest store":
- If distances are provided (e.g. "km away"), refer to the shop with the smallest distance.
- If no distances are provided, inform the user that their live location is not available and list the shops without distances.
If they ask about a specific item (e.g., Kerosene or Rice), ensure you tell them if it's available or out of stock at the shops.
`;

    const systemInstruction = `You are a helpful, concise assistant for the RationLens app, providing information about Kerala's Public Distribution System, ration card entitlements, nearby ration shops, and their current stock levels.
    The user is currently communicating in: ${lang === "ml" ? "Malayalam" : "English"}.
    Always respond in the user's language (${lang === "ml" ? "Malayalam" : "English"}).
    
    Here is the exact entitlement data for the ration cards:
    ${JSON.stringify(RATION_CARD_CATEGORIES, null, 2)}
    
    ${shopContext}
    
    Use this exact data to answer any questions regarding amounts of rice, wheat, or kerosene, as well as shop locations and stock availability. 
    Be direct and to the point.
    `;

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: lastMessage.content }] },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: `The conversational reply to the user. MUST BE IN ${
                lang === "ml" ? "MALAYALAM" : "ENGLISH"
              }.`,
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `A list of 1-3 short suggested follow-up questions or actions the user might want to take. MUST BE IN ${
                lang === "ml" ? "MALAYALAM" : "ENGLISH"
              }.`,
            },
          },
          required: ["reply", "suggestedActions"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from LLM");
    }

    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
