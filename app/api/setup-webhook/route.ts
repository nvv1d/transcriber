import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set" },
        { status: 400 }
      );
    }

    // Get the webhook URL from request body or environment
    const body = await request.json().catch(() => ({}));
    const webhookUrl =
      body.webhookUrl ||
      `${request.headers.get("origin")}/api/webhook`;

    console.log(`[v0] Setting webhook to: ${webhookUrl}`);

    // Set webhook
    const response = await axios.post(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        url: webhookUrl,
        allowed_updates: ["message"],
      }
    );

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    console.log(`[v0] Webhook set successfully`);

    return NextResponse.json({
      ok: true,
      message: "Webhook set successfully",
      webhookUrl: webhookUrl,
    });
  } catch (error) {
    console.error("[v0] Webhook setup error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set" },
        { status: 400 }
      );
    }

    // Get webhook info
    const response = await axios.get(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`
    );

    return NextResponse.json(response.data.result);
  } catch (error) {
    console.error("[v0] Error getting webhook info:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
