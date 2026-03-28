import { NextRequest, NextResponse } from "next/server";

// Retrieve the bot token from environment variables. Ensure this is set in Vercel.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

// Hardcoded Webhook URL for the Vercel deployment
const HARDCODED_WEBHOOK_URL = "https://transcriber-nine-steel.vercel.app/api/webhook";

export async function POST(request: NextRequest) {
  try {
    // 1. Check if the Bot Token is set
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables.");
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set. Please configure it in Vercel environment variables." },
        { status: 400 }
      );
    }

    // 2. Attempt to parse the request body
    let requestBody = {};
    try {
      requestBody = await request.json();
    } catch (e) {
      console.warn("Could not parse request body as JSON, proceeding without it.");
      // Proceeding without body if parsing fails or body is empty
    }

    // 3. Determine the webhook URL to use
    // Prioritize webhookUrl from request body if provided, otherwise use the hardcoded one.
    const webhookUrl = requestBody.webhookUrl || HARDCODED_WEBHOOK_URL;

    console.log(`Attempting to set webhook URL to: ${webhookUrl}`);

    // 4. Call the Telegram Bot API to set the webhook
    const response = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          // You can adjust allowed_updates as needed.
          // 'message' covers text messages, 'callback_query' for inline buttons.
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );

    // 5. Process the response from Telegram API
    const data = await response.json();

    if (!data.ok) {
      // Throw an error if Telegram API returns an error
      console.error(`Telegram API error: ${data.description}`);
      throw new Error(data.description || "Failed to set webhook via Telegram API.");
    }

    // 6. Return success response
    console.log(`Webhook set successfully to: ${webhookUrl}`);
    return NextResponse.json({
      ok: true,
      message: "Webhook set successfully",
      webhookUrl: webhookUrl,
    });

  } catch (error) {
    // 7. Handle any errors during the process
    console.error("Webhook setup error:", error);
    // Provide a more detailed error message if it's an Error instance
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during webhook setup.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 } // Internal Server Error
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check if the Bot Token is set
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables.");
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set", setup: "Add TELEGRAM_BOT_TOKEN environment variable" },
        { status: 400 }
      );
    }

    // 2. Fetch webhook information from Telegram
    const infoResponse = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const infoData = await infoResponse.json();

    // 3. Determine the expected URL for comparison
    // Using the hardcoded URL ensures consistency with what we are trying to set.
    const expectedUrl = HARDCODED_WEBHOOK_URL;

    // 4. Determine the current webhook URL from the result
    const currentWebhookUrl = infoData.result?.url;

    // 5. Check if webhook is configured correctly
    const isConfigured = currentWebhookUrl === expectedUrl;

    // 6. Construct informative instructions
    let instructions;
    if (currentWebhookUrl) {
      if (isConfigured) {
        instructions = "Webhook is already configured correctly. Send POST to this endpoint to update it.";
      } else {
        instructions = `Webhook is set to '${currentWebhookUrl}', but expected '${expectedUrl}'. Send POST to this endpoint to update it.`;
      }
    } else {
      instructions = "Webhook not set. Send POST to this endpoint to configure it.";
    }

    // 7. Return webhook info and status
    return NextResponse.json({
      currentWebhook: infoData.result, // Contains details like url, pending_update_count, etc.
      expectedUrl: expectedUrl,
      isConfigured: isConfigured,
      instructions: instructions,
    });

  } catch (error) {
    // 8. Handle any errors during the process
    console.error("Error getting webhook info:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching webhook info.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

// Retrieve the bot token from environment variables. Ensure this is set in Vercel.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

// Hardcoded Webhook URL for the Vercel deployment
const HARDCODED_WEBHOOK_URL = "https://transcriber-nine-steel.vercel.app/api/webhook";

export async function POST(request: NextRequest) {
  try {
    // 1. Check if the Bot Token is set
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables.");
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set. Please configure it in Vercel environment variables." },
        { status: 400 }
      );
    }

    // 2. Attempt to parse the request body
    let requestBody = {};
    try {
      requestBody = await request.json();
    } catch (e) {
      console.warn("Could not parse request body as JSON, proceeding without it.");
      // Proceeding without body if parsing fails or body is empty
    }

    // 3. Determine the webhook URL to use
    // Prioritize webhookUrl from request body if provided, otherwise use the hardcoded one.
    const webhookUrl = requestBody.webhookUrl || HARDCODED_WEBHOOK_URL;

    console.log(`Attempting to set webhook URL to: ${webhookUrl}`);

    // 4. Call the Telegram Bot API to set the webhook
    const response = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          // You can adjust allowed_updates as needed.
          // 'message' covers text messages, 'callback_query' for inline buttons.
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );

    // 5. Process the response from Telegram API
    const data = await response.json();

    if (!data.ok) {
      // Throw an error if Telegram API returns an error
      console.error(`Telegram API error: ${data.description}`);
      throw new Error(data.description || "Failed to set webhook via Telegram API.");
    }

    // 6. Return success response
    console.log(`Webhook set successfully to: ${webhookUrl}`);
    return NextResponse.json({
      ok: true,
      message: "Webhook set successfully",
      webhookUrl: webhookUrl,
    });

  } catch (error) {
    // 7. Handle any errors during the process
    console.error("Webhook setup error:", error);
    // Provide a more detailed error message if it's an Error instance
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during webhook setup.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 } // Internal Server Error
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check if the Bot Token is set
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is not set in environment variables.");
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN not set", setup: "Add TELEGRAM_BOT_TOKEN environment variable" },
        { status: 400 }
      );
    }

    // 2. Fetch webhook information from Telegram
    const infoResponse = await fetch(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const infoData = await infoResponse.json();

    // 3. Determine the expected URL for comparison
    // Using the hardcoded URL ensures consistency with what we are trying to set.
    const expectedUrl = HARDCODED_WEBHOOK_URL;

    // 4. Determine the current webhook URL from the result
    const currentWebhookUrl = infoData.result?.url;

    // 5. Check if webhook is configured correctly
    const isConfigured = currentWebhookUrl === expectedUrl;

    // 6. Construct informative instructions
    let instructions;
    if (currentWebhookUrl) {
      if (isConfigured) {
        instructions = "Webhook is already configured correctly. Send POST to this endpoint to update it.";
      } else {
        instructions = `Webhook is set to '${currentWebhookUrl}', but expected '${expectedUrl}'. Send POST to this endpoint to update it.`;
      }
    } else {
      instructions = "Webhook not set. Send POST to this endpoint to configure it.";
    }

    // 7. Return webhook info and status
    return NextResponse.json({
      currentWebhook: infoData.result, // Contains details like url, pending_update_count, etc.
      expectedUrl: expectedUrl,
      isConfigured: isConfigured,
      instructions: instructions,
    });

  } catch (error) {
    // 8. Handle any errors during the process
    console.error("Error getting webhook info:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching webhook info.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
