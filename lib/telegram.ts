import axios from "axios";

const TELEGRAM_API = "https://api.telegram.org";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_bot?: boolean;
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  duration?: number;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  voice?: TelegramFile;
  audio?: TelegramFile;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export class TelegramBot {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private apiUrl(method: string): string {
    return `${TELEGRAM_API}/bot${this.token}/${method}`;
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
      reply_markup?: any;
    }
  ): Promise<any> {
    const response = await axios.post(this.apiUrl("sendMessage"), {
      chat_id: chatId,
      text,
      ...options,
    });

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    return response.data.result;
  }

  async sendChatAction(chatId: number, action: string): Promise<void> {
    const response = await axios.post(this.apiUrl("sendChatAction"), {
      chat_id: chatId,
      action,
    });

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }
  }

  async getFile(fileId: string): Promise<any> {
    const response = await axios.get(this.apiUrl("getFile"), {
      params: { file_id: fileId },
    });

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    return response.data.result;
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const file = await this.getFile(fileId);
    const fileUrl = `${TELEGRAM_API}/file/bot${this.token}/${file.file_path}`;

    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    return Buffer.from(response.data);
  }

  async setWebhook(url: string, options?: any): Promise<any> {
    const response = await axios.post(this.apiUrl("setWebhook"), {
      url,
      allowed_updates: ["message"],
      ...options,
    });

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    return response.data.result;
  }

  async getWebhookInfo(): Promise<any> {
    const response = await axios.get(this.apiUrl("getWebhookInfo"));

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    return response.data.result;
  }

  async deleteWebhook(): Promise<void> {
    const response = await axios.post(this.apiUrl("deleteWebhook"));

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }
  }

  async getMe(): Promise<TelegramUser> {
    const response = await axios.get(this.apiUrl("getMe"));

    if (!response.data.ok) {
      throw new Error(response.data.description);
    }

    return response.data.result;
  }
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function escapeMarkdown(text: string): string {
  return text
    .replace(/[\\_*[\]()~`>#+\\-.|!]/g, "\\$&");
}

export function formatMessage(text: string): string {
  return text
    .trim()
    .replace(/\n\n+/g, "\n\n")
    .substring(0, 4096);
}
