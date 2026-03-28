import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";
const WEBHOOK_URL = "https://transcriber-nine-steel.vercel.app/api/webhook";

export async function POST(_request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: WEBHOOK_URL,
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
      webhookUrl: WEBHOOK_URL,
    });
  } catch (error) {
    console.error("Webhook setup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
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

    return NextResponse.json({
      currentWebhook: infoData.result,
      expectedUrl: WEBHOOK_URL,
      isConfigured: infoData.result?.url === WEBHOOK_URL,
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
