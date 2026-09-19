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

    let shopContext = "";
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const shopsWithDistances = shops.map((shop) => ({
        ...shop,
        distance: shopDistanceKm(shop, userLocation),
        stock: getStockForShop(shop.id),
      })).sort((a, b) => a.distance - b.distance);

      shopContext = `
Nearby Shops and Current Stock Availability:
${shopsWithDistances.map(s => `- ${s.name} (${s.distance.toFixed(1)} km away)\n  Address: ${s.address}\n  Stock: ${s.stock.map(st => `${st.item.name}: ${st.status} (${st.quantity} ${st.item.unit})`).join(', ')}`).join('\n')}

When the user asks for the "nearest shop" or "closest store", refer to the shop with the smallest distance. If they ask about a specific item (e.g., Kerosene or Rice), ensure you tell them if it's available or out of stock at the nearby shops.
`;
    }

    const systemInstruction = `You are a helpful, concise assistant for the RationLens app, providing information about Kerala's Public Distribution System.
    The user is currently communicating in: ${lang === "ml" ? "Malayalam" : "English"}.
    Always respond in the user's language (${lang === "ml" ? "Malayalam" : "English"}).
    
    Here is the exact entitlement data for the ration cards:
    ${JSON.stringify(RATION_CARD_CATEGORIES, null, 2)}
    
    ${shopContext}
    
    Use this exact data to answer any questions regarding amounts of rice, wheat, or kerosene. 
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
