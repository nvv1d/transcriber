# Telegram Audio Transcriber Bot

A Telegram bot that transcribes audio files and voice messages to Persian or English text using Google Speech Recognition, deployed on Vercel.

## Features

- Voice messages and audio files (MP3, WAV, M4A, OGG)
- Persian (fa-IR) and English (en-US) transcription
- Language switching via /language command
- Serverless deployment on Vercel
- No API keys required - uses Google's free Speech Recognition

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/language` | Switch between Persian and English |
| `/help` | Show help |

## Deploy

1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variable: `TELEGRAM_BOT_TOKEN`
4. Deploy
5. Visit `https://YOUR_URL/api/setup-webhook` to configure webhook

## Project Structure

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── webhook/route.ts
│       └── setup-webhook/route.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token
```

## License

MIT
