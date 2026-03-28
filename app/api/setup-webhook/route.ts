import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";
const webhookUrl = body.webhookUrl || "https://transcriber-nine-steel.vercel.app/api/webhook";

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const origin = request.headers.get("origin") || request.headers.get("host");
    const protocol = origin?.includes("localhost") ? "http" : "https";
    const webhookUrl = body.webhookUrl || `${protocol}://${origin}/api/webhook`;

    const response = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description);
    }

    return NextResponse.json({
      ok: true,
      message: "Webhook set successfully",
      webhookUrl: webhookUrl,
    });
  } catch (error) {
    console.error("Webhook setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set", setup: "Add TELEGRAM_BOT_TOKEN environment variable" },
        { status: 400 }
      );
    }

    const infoResponse = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const infoData = await infoResponse.json();

    const origin = request.headers.get("host");
    const expectedUrl = `https://${origin}/api/webhook`;

    return NextResponse.json({
      currentWebhook: infoData.result,
      expectedUrl: expectedUrl,
      isConfigured: infoData.result?.url === expectedUrl,
      instructions: infoData.result?.url 
        ? "Webhook is configured. Send POST to this endpoint to update it."
        : "Webhook not set. Send POST to this endpoint to configure it.",
    });
  } catch (error) {
    console.error("Error getting webhook info:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
