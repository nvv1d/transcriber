import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = "https://api.telegram.org";

// Store user language preferences (in production, use a database)
const userLanguages: Map<number, string> = new Map();

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
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data?: string;
  };
}

async function downloadFile(fileId: string): Promise<Buffer> {
  const getFileResponse = await fetch(
    `${TELEGRAM_API}/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const fileData = await getFileResponse.json();
  const filePath = fileData.result.file_path;
  const downloadUrl = `${TELEGRAM_API}/file/bot${BOT_TOKEN}/${filePath}`;

  const response = await fetch(downloadUrl);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Transcribe audio using Google's Speech Recognition API
 * This uses the same endpoint as Python's speech_recognition library
 */
async function transcribeAudio(audioBuffer: Buffer, language: string): Promise<string> {
  try {
    // The Google Speech Recognition API endpoint used by the speech_recognition Python library
    const url = `https://www.google.com/speech-api/v2/recognize?client=chromium&lang=${language}&key=AIzaSyBOti4mM-6x9CfaR3lVgHL8Ms5yKsxsDbA`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "audio/l16; rate=16000",
      },
      body: audioBuffer,
    });

    const text = await response.text();
    
    // Parse the response (Google returns multiple JSON objects separated by newlines)
    const lines = text.split("\n").filter(line => line.trim());
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.result && json.result.length > 0) {
          const alternatives = json.result[0].alternative;
          if (alternatives && alternatives.length > 0) {
            return alternatives[0].transcript;
          }
        }
      } catch {
        continue;
      }
    }

    return language === "fa-IR" 
      ? "متنی شناسایی نشد. (No speech detected)"
      : "No speech detected in the audio.";
  } catch (error) {
    console.error("Transcription error:", error);
    return language === "fa-IR"
      ? "خطا در رونویسی. لطفا دوباره تلاش کنید."
      : "Error transcribing audio. Please try again.";
  }
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object): Promise<void> {
  await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

async function sendChatAction(chatId: number, action: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      action: action,
    }),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
    }),
  });
}

async function editMessage(chatId: number, messageId: number, text: string, replyMarkup?: object): Promise<void> {
  await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

function getUserLanguage(userId: number): string {
  return userLanguages.get(userId) || "fa-IR";
}

function setUserLanguage(userId: number, language: string): void {
  userLanguages.set(userId, language);
}

function getLanguageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇮🇷 فارسی (Persian)", callback_data: "lang_fa-IR" },
        { text: "🇺🇸 English", callback_data: "lang_en-US" },
      ],
    ],
  };
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

    // Handle callback queries (language selection)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const userId = callbackQuery.from.id;
      const chatId = callbackQuery.message?.chat.id;
      const messageId = callbackQuery.message?.message_id;
      const data = callbackQuery.data;

      if (data?.startsWith("lang_") && chatId && messageId) {
        const newLang = data.replace("lang_", "");
        setUserLanguage(userId, newLang);

        const confirmText = newLang === "fa-IR"
          ? "زبان به فارسی تغییر کرد. حالا صوت‌های شما به فارسی رونویسی می‌شوند."
          : "Language changed to English. Your audio will now be transcribed in English.";

        await editMessage(chatId, messageId, confirmText);
        await answerCallbackQuery(callbackQuery.id, newLang === "fa-IR" ? "فارسی" : "English");
      }

      return NextResponse.json({ ok: true });
    }

    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const firstName = message.from.first_name;
    const currentLang = getUserLanguage(userId);

    // Handle /start command
    if (message.text === "/start") {
      await sendMessage(
        chatId,
        `<b>Welcome ${escapeHtml(firstName)}!</b>\n\n` +
        `I can transcribe your voice messages and audio files to text.\n\n` +
        `<b>Current language:</b> ${currentLang === "fa-IR" ? "Persian (فارسی)" : "English"}\n\n` +
        `<b>Commands:</b>\n` +
        `/language - Change transcription language\n` +
        `/help - Show help\n\n` +
        `Send me a voice message or audio file to get started!`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /language command
    if (message.text === "/language" || message.text === "/lang") {
      await sendMessage(
        chatId,
        `<b>Select transcription language:</b>\n\n` +
        `Current: ${currentLang === "fa-IR" ? "Persian (فارسی)" : "English"}`,
        getLanguageKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (message.text === "/help") {
      await sendMessage(
        chatId,
        `<b>Audio Transcriber Bot</b>\n\n` +
        `Send me voice messages or audio files and I will transcribe them to text.\n\n` +
        `<b>Commands:</b>\n` +
        `/start - Welcome message\n` +
        `/language - Switch between Persian and English\n` +
        `/help - Show this help\n\n` +
        `<b>Supported formats:</b>\n` +
        `Voice messages, MP3, WAV, OGG, M4A\n\n` +
        `<b>Current language:</b> ${currentLang === "fa-IR" ? "Persian" : "English"}`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (message.voice) {
      await sendChatAction(chatId, "typing");
      
      const processingMsg = currentLang === "fa-IR" 
        ? "در حال پردازش صوت..."
        : "Processing audio...";
      await sendMessage(chatId, processingMsg);

      try {
        const audioBuffer = await downloadFile(message.voice.file_id);
        const transcription = await transcribeAudio(audioBuffer, currentLang);

        const header = currentLang === "fa-IR" ? "متن رونویسی شده:" : "Transcription:";
        await sendMessage(chatId, `<b>${header}</b>\n\n${escapeHtml(transcription)}`);
      } catch (error) {
        console.error("Voice processing error:", error);
        const errorMsg = currentLang === "fa-IR"
          ? "خطا در پردازش صوت. لطفا دوباره تلاش کنید."
          : "Error processing audio. Please try again.";
        await sendMessage(chatId, errorMsg);
      }

      return NextResponse.json({ ok: true });
    }

    // Handle audio files
    if (message.audio) {
      await sendChatAction(chatId, "typing");
      
      const processingMsg = currentLang === "fa-IR"
        ? "در حال پردازش فایل صوتی..."
        : "Processing audio file...";
      await sendMessage(chatId, processingMsg);

      try {
        const audioBuffer = await downloadFile(message.audio.file_id);
        const transcription = await transcribeAudio(audioBuffer, currentLang);

        const header = currentLang === "fa-IR" ? "متن رونویسی شده:" : "Transcription:";
        await sendMessage(chatId, `<b>${header}</b>\n\n${escapeHtml(transcription)}`);
      } catch (error) {
        console.error("Audio processing error:", error);
        const errorMsg = currentLang === "fa-IR"
          ? "خطا در پردازش فایل صوتی. لطفا دوباره تلاش کنید."
          : "Error processing audio file. Please try again.";
        await sendMessage(chatId, errorMsg);
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
        
        const processingMsg = currentLang === "fa-IR"
          ? "در حال پردازش فایل صوتی..."
          : "Processing audio file...";
        await sendMessage(chatId, processingMsg);

        try {
          const audioBuffer = await downloadFile(message.document.file_id);
          const transcription = await transcribeAudio(audioBuffer, currentLang);

          const header = currentLang === "fa-IR" ? "متن رونویسی شده:" : "Transcription:";
          await sendMessage(chatId, `<b>${header}</b>\n\n${escapeHtml(transcription)}`);
        } catch (error) {
          console.error("Document audio processing error:", error);
          const errorMsg = currentLang === "fa-IR"
            ? "خطا در پردازش فایل صوتی. لطفا دوباره تلاش کنید."
            : "Error processing audio file. Please try again.";
          await sendMessage(chatId, errorMsg);
        }

        return NextResponse.json({ ok: true });
      }
    }

    // Default response for text messages
    if (message.text && !message.text.startsWith("/")) {
      const helpMsg = currentLang === "fa-IR"
        ? "لطفا یک فایل صوتی یا پیام صوتی ارسال کنید.\n\nبرای تغییر زبان: /language"
        : "Please send me a voice message or audio file to transcribe.\n\nTo change language: /language";
      await sendMessage(chatId, helpMsg);
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
    message: "Audio Transcriber Bot - supports Persian and English",
    commands: ["/start", "/language", "/help"],
  });
}
