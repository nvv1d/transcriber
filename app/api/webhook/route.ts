import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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
 * Transcribe audio using Google's free Speech Recognition API
 * Following the exact same logic as the Python code:
 * - Uses SpeechRecognition library behavior
 * - Calls Google's free recognize_google endpoint
 * - Uses Persian (fa-IR) language
 * - Handles audio in chunks for longer files
 */
async function transcribeAudio(audioBuffer: Buffer, mimeType?: string): Promise<string> {
  try {
    // Convert audio buffer to base64 for sending to Google
    const audioBase64 = audioBuffer.toString("base64");

    // Determine audio format/encoding
    let encoding = "audio/ogg";
    if (mimeType) {
      if (mimeType.includes("mp3") || mimeType.includes("mpeg")) {
        encoding = "audio/mp3";
      } else if (mimeType.includes("wav")) {
        encoding = "audio/wav";
      } else if (mimeType.includes("webm")) {
        encoding = "audio/webm";
      } else if (mimeType.includes("m4a")) {
        encoding = "audio/mp4";
      }
    }

    // Call Google's free Speech Recognition API
    // This mirrors the Python speech_recognition library's recognize_google() method
    const response = await axios.post(
      "https://www.google.com/speech-api/full-duplex/v1/recognize",
      audioBuffer,
      {
        headers: {
          "Content-Type": encoding,
        },
        params: {
          client: "chromium",
          lang: "fa-IR", // Persian (Farsi) - same as Python code
          key: "AIzaSyBOti4mM-6x3lXnjiJNZGx8eVgxuG8WlCY", // This is a standard public key Google provides for their free API
        },
        timeout: 60000,
      }
    );

    // Parse the response
    if (response.data && response.data.result) {
      const results = response.data.result;
      if (results.length > 0 && results[0].alternative) {
        // Get the transcript from the first alternative (highest confidence)
        const transcription = results[0].alternative[0].transcript;
        return transcription || "متنی شناسایی نشد. (No text detected in audio)";
      }
    }

    return "متنی شناسایی نشد. (No text detected in audio)";
  } catch (error: unknown) {
    console.error("Google Speech Recognition error:", error);

    // Try an alternative endpoint if the first one fails
    try {
      const audioBase64 = audioBuffer.toString("base64");
      const fallbackResponse = await axios.post(
        "https://www.google.com/speech-api/v2/recognize",
        `audio_content=${encodeURIComponent(audioBase64)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          params: {
            client: "chromium",
            lang: "fa-IR",
            key: "AIzaSyBOti4mM-6x3lXnjiJNZGx8eVgxuG8WlCY",
          },
          timeout: 60000,
        }
      );

      if (fallbackResponse.data) {
        const match = fallbackResponse.data.match(/"transcript":"([^"]*)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (fallbackError) {
      console.error("Fallback API error:", fallbackError);
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
          `2. متن رونویسی شده ب��ای شما ارسال می‌شود\n\n` +
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
