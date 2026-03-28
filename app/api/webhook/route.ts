import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

interface Update {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    voice?: {
      file_id: string;
      file_unique_id: string;
      duration: number;
      mime_type?: string;
      file_size?: number;
    };
    audio?: {
      file_id: string;
      file_unique_id: string;
      duration: number;
      performer?: string;
      title?: string;
      mime_type?: string;
      file_size?: number;
    };
    text?: string;
  };
}

async function downloadFile(
  fileId: string,
  fileName: string
): Promise<Buffer> {
  try {
    // Get file path from Telegram
    const getFileResponse = await axios.get(
      `${TELEGRAM_API}/bot${BOT_TOKEN}/getFile`,
      {
        params: { file_id: fileId },
      }
    );

    const filePath = getFileResponse.data.result.file_path;
    const downloadUrl = `${TELEGRAM_API}/file/bot${BOT_TOKEN}/${filePath}`;

    // Download the file
    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Using AssemblyAI API for transcription
    // This is a more reliable alternative that works server-side
    const API_TOKEN = process.env.ASSEMBLYAI_API_KEY;

    if (!API_TOKEN) {
      // Fallback: Use Web Speech API via a different service
      // For now, return a message asking user to set up AssemblyAI
      return "⚠️ Transcription service not configured. Please set ASSEMBLYAI_API_KEY environment variable.";
    }

    // Upload audio file
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      audioBuffer,
      {
        headers: {
          Authorization: API_TOKEN,
        },
      }
    );

    const uploadUrl = uploadResponse.data.upload_url;

    // Create transcription job
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: uploadUrl,
        language_code: "fa",
      },
      {
        headers: {
          Authorization: API_TOKEN,
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;

    // Poll for completion
    let transcript = transcriptResponse.data;
    while (transcript.status !== "completed" && transcript.status !== "error") {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const checkResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: API_TOKEN,
          },
        }
      );

      transcript = checkResponse.data;
    }

    if (transcript.status === "error") {
      return "❌ Error transcribing audio. Please try again.";
    }

    return transcript.text || "No text detected in audio.";
  } catch (error) {
    console.error("Transcription error:", error);
    return "❌ Error during transcription. Please try again later.";
  }
}

async function sendMessage(chatId: number, text: string): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function sendChatAction(
  chatId: number,
  action: string
): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendChatAction`, {
      chat_id: chatId,
      action: action,
    });
  } catch (error) {
    console.error("Error sending chat action:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Update;

    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const firstName = message.from.first_name;

    console.log(`[v0] Received message from ${firstName} (${userId})`);

    // Handle /start command
    if (message.text === "/start") {
      await sendMessage(
        chatId,
        `<b>👋 Welcome to Audio Transcriber Bot!</b>\n\n` +
          `Send me any audio file or voice message and I'll transcribe it to Persian (Farsi) text.\n\n` +
          `<b>Supported formats:</b>\n` +
          `🎵 Voice messages\n` +
          `🎧 Audio files (MP3, WAV, OGG, etc.)\n\n` +
          `<b>How to use:</b>\n` +
          `1. Send me an audio file or voice message\n` +
          `2. I'll transcribe it and send back the text\n\n` +
          `⏱️ Processing time depends on audio length.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle help command
    if (message.text === "/help") {
      await sendMessage(
        chatId,
        `<b>📖 Help</b>\n\n` +
          `Send me any audio file and I'll transcribe it to Persian text.\n\n` +
          `<b>Commands:</b>\n` +
          `/start - Show welcome message\n` +
          `/help - Show this help message\n\n` +
          `<b>Example:</b>\n` +
          `Just send a voice message or audio file!`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (message.voice) {
      console.log(
        `[v0] Processing voice message from ${firstName}, duration: ${message.voice.duration}s`
      );

      await sendChatAction(chatId, "typing");
      await sendMessage(chatId, "🎤 Processing your audio...");

      try {
        const audioBuffer = await downloadFile(
          message.voice.file_id,
          `voice_${Date.now()}.ogg`
        );
        console.log(
          `[v0] Downloaded voice file, size: ${audioBuffer.length} bytes`
        );

        const transcription = await transcribeAudio(audioBuffer);
        console.log(`[v0] Transcription complete: ${transcription.substring(0, 50)}...`);

        await sendMessage(
          chatId,
          `<b>📝 Transcription:</b>\n\n<pre>${escapeHtml(transcription)}</pre>`
        );
      } catch (error) {
        console.error("[v0] Voice processing error:", error);
        await sendMessage(
          chatId,
          "❌ Error processing voice message. Please try again."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle audio files
    if (message.audio) {
      console.log(
        `[v0] Processing audio file from ${firstName}, duration: ${message.audio.duration}s`
      );

      await sendChatAction(chatId, "typing");
      await sendMessage(chatId, "🎧 Processing your audio file...");

      try {
        const audioBuffer = await downloadFile(
          message.audio.file_id,
          `audio_${Date.now()}.mp3`
        );
        console.log(
          `[v0] Downloaded audio file, size: ${audioBuffer.length} bytes`
        );

        const transcription = await transcribeAudio(audioBuffer);
        console.log(`[v0] Transcription complete: ${transcription.substring(0, 50)}...`);

        await sendMessage(
          chatId,
          `<b>📝 Transcription:</b>\n\n<pre>${escapeHtml(transcription)}</pre>`
        );
      } catch (error) {
        console.error("[v0] Audio processing error:", error);
        await sendMessage(
          chatId,
          "❌ Error processing audio file. Please try again."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Default response for text messages
    if (message.text) {
      await sendMessage(
        chatId,
        "🎵 Please send me an audio file or voice message to transcribe!"
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[v0] Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "Bot is running",
    message: "Send audio files to the bot on Telegram",
  });
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
