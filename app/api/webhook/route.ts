import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import speech from "@google-cloud/speech";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

// Google Cloud Speech-to-Text client
// Uses GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_CREDENTIALS env var
function getSpeechClient() {
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (credentials) {
    const parsedCredentials = JSON.parse(credentials);
    return new speech.SpeechClient({ credentials: parsedCredentials });
  }
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS file path
  return new speech.SpeechClient();
}

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
    document?: {
      file_id: string;
      file_unique_id: string;
      file_name?: string;
      mime_type?: string;
      file_size?: number;
    };
    text?: string;
  };
}

async function downloadFile(fileId: string): Promise<Buffer> {
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

/**
 * Transcribe audio using Google Cloud Speech-to-Text API
 * Following the same logic as the Python code:
 * - Uses Persian (fa-IR) language
 * - Processes audio in chunks for longer files
 */
async function transcribeAudio(audioBuffer: Buffer, mimeType?: string): Promise<string> {
  try {
    const client = getSpeechClient();

    // Determine encoding based on mime type
    let encoding: "OGG_OPUS" | "MP3" | "LINEAR16" | "FLAC" | "WEBM_OPUS" = "OGG_OPUS";
    let sampleRateHertz = 16000;

    if (mimeType) {
      if (mimeType.includes("ogg") || mimeType.includes("opus")) {
        encoding = "OGG_OPUS";
      } else if (mimeType.includes("mp3") || mimeType.includes("mpeg")) {
        encoding = "MP3";
      } else if (mimeType.includes("wav")) {
        encoding = "LINEAR16";
      } else if (mimeType.includes("flac")) {
        encoding = "FLAC";
      } else if (mimeType.includes("webm")) {
        encoding = "WEBM_OPUS";
      }
    }

    // Convert audio buffer to base64
    const audioContent = audioBuffer.toString("base64");

    // Configure request for Persian (Farsi) transcription
    // Same as Python: recognizer.recognize_google(audio_data, language='fa-IR')
    const request = {
      audio: {
        content: audioContent,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: "fa-IR", // Persian (Farsi) - same as Python code
        enableAutomaticPunctuation: true,
        model: "default",
      },
    };

    // For longer audio files (>1 minute), use longRunningRecognize
    // This follows the Python logic of chunking for longer files
    const fileSizeInMB = audioBuffer.length / (1024 * 1024);
    
    if (fileSizeInMB > 10) {
      // Use long running recognition for large files
      const [operation] = await client.longRunningRecognize(request);
      const [response] = await operation.promise();
      
      if (!response.results || response.results.length === 0) {
        return "متنی شناسایی نشد. (No text detected in audio)";
      }

      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || "")
        .join("\n");

      return transcription || "متنی شناسایی نشد. (No text detected in audio)";
    } else {
      // Use synchronous recognition for smaller files
      const [response] = await client.recognize(request);

      if (!response.results || response.results.length === 0) {
        return "متنی شناسایی نشد. (No text detected in audio)";
      }

      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || "")
        .join("\n");

      return transcription || "متنی شناسایی نشد. (No text detected in audio)";
    }
  } catch (error: unknown) {
    console.error("Google Speech-to-Text error:", error);
    
    // Check if credentials are missing
    if (error instanceof Error && error.message.includes("credentials")) {
      return "⚠️ Google Cloud credentials not configured. Please set GOOGLE_CLOUD_CREDENTIALS environment variable.";
    }
    
    return "❌ خطا در رونویسی صوت. لطفا دوباره تلاش کنید. (Error transcribing audio)";
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

async function sendChatAction(chatId: number, action: string): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendChatAction`, {
      chat_id: chatId,
      action: action,
    });
  } catch (error) {
    console.error("Error sending chat action:", error);
  }
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Update;

    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const firstName = message.from.first_name;

    // Handle /start command
    if (message.text === "/start") {
      await sendMessage(
        chatId,
        `<b>سلام ${escapeHtml(firstName)}! به ربات رونویسی صوت خوش آمدید</b>\n\n` +
          `<b>Welcome to Audio Transcriber Bot!</b>\n\n` +
          `یک فایل صوتی یا پیام صوتی برای من ارسال کنید تا آن را به متن فارسی تبدیل کنم.\n\n` +
          `Send me any audio file or voice message and I'll transcribe it to Persian (Farsi) text.\n\n` +
          `<b>فرمت‌های پشتیبانی شده:</b>\n` +
          `🎤 پیام صوتی (Voice messages)\n` +
          `🎧 فایل صوتی (MP3, WAV, OGG, M4A)\n\n` +
          `<b>نحوه استفاده:</b>\n` +
          `1. یک فایل صوتی یا پیام صوتی ارسال کنید\n` +
          `2. متن رونویسی شده برای شما ارسال می‌شود\n\n` +
          `⏱️ زمان پردازش بستگی به طول فایل صوتی دارد.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (message.text === "/help") {
      await sendMessage(
        chatId,
        `<b>📖 راهنما / Help</b>\n\n` +
          `یک فایل صوتی ارسال کنید تا آن را به متن فارسی تبدیل کنم.\n` +
          `Send me any audio file and I'll transcribe it to Persian text.\n\n` +
          `<b>دستورات / Commands:</b>\n` +
          `/start - نمایش پیام خوش‌آمدگویی\n` +
          `/help - نمایش این راهنما\n\n` +
          `<b>نکته:</b> برای بهترین نتیجه، از صدای واضح با حداقل نویز استفاده کنید.\n` +
          `<b>Tip:</b> For best results, use clear audio with minimal background noise.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (message.voice) {
      await sendChatAction(chatId, "typing");
      await sendMessage(chatId, "🎤 در حال پردازش صوت شما...\nProcessing your audio...");

      try {
        const audioBuffer = await downloadFile(message.voice.file_id);
        const transcription = await transcribeAudio(audioBuffer, message.voice.mime_type);

        await sendMessage(
          chatId,
          `<b>📝 متن رونویسی شده / Transcription:</b>\n\n${escapeHtml(transcription)}`
        );
      } catch (error) {
        console.error("Voice processing error:", error);
        await sendMessage(
          chatId,
          "❌ خطا در پردازش پیام صوتی. لطفا دوباره تلاش کنید.\nError processing voice message. Please try again."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle audio files
    if (message.audio) {
      await sendChatAction(chatId, "typing");
      await sendMessage(chatId, "🎧 در حال پردازش فایل صوتی شما...\nProcessing your audio file...");

      try {
        const audioBuffer = await downloadFile(message.audio.file_id);
        const transcription = await transcribeAudio(audioBuffer, message.audio.mime_type);

        await sendMessage(
          chatId,
          `<b>📝 متن رونویسی شده / Transcription:</b>\n\n${escapeHtml(transcription)}`
        );
      } catch (error) {
        console.error("Audio processing error:", error);
        await sendMessage(
          chatId,
          "❌ خطا در پردازش فایل صوتی. لطفا دوباره تلاش کنید.\nError processing audio file. Please try again."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle document files (audio sent as document)
    if (message.document) {
      const mimeType = message.document.mime_type || "";
      const isAudio = mimeType.includes("audio") || 
                      mimeType.includes("ogg") || 
                      mimeType.includes("mp3") ||
                      mimeType.includes("wav") ||
                      mimeType.includes("m4a") ||
                      mimeType.includes("mpeg");

      if (isAudio) {
        await sendChatAction(chatId, "typing");
        await sendMessage(chatId, "🎧 در حال پردازش فایل صوتی شما...\nProcessing your audio file...");

        try {
          const audioBuffer = await downloadFile(message.document.file_id);
          const transcription = await transcribeAudio(audioBuffer, mimeType);

          await sendMessage(
            chatId,
            `<b>📝 متن رونویسی شده / Transcription:</b>\n\n${escapeHtml(transcription)}`
          );
        } catch (error) {
          console.error("Document audio processing error:", error);
          await sendMessage(
            chatId,
            "❌ خطا در پردازش فایل صوتی. لطفا دوباره تلاش کنید.\nError processing audio file. Please try again."
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    // Default response for text messages
    if (message.text && !message.text.startsWith("/")) {
      await sendMessage(
        chatId,
        "🎵 لطفا یک فایل صوتی یا پیام صوتی برای رونویسی ارسال کنید!\nPlease send me an audio file or voice message to transcribe!"
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Bot is running",
    message: "Send audio files to the bot on Telegram for Persian transcription using Google Speech-to-Text",
    language: "fa-IR (Persian/Farsi)",
  });
}
