# Telegram Audio Transcriber Bot - Setup Guide

## Overview
This is a Telegram bot that receives audio files and transcribes them to Persian (Farsi) text using AI services.

## Prerequisites
- Node.js 18+
- A Vercel account for hosting
- Telegram Bot Token (you already have: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`)
- AssemblyAI API key (for transcription service)

## Step 1: Get AssemblyAI API Key
1. Go to https://www.assemblyai.com/
2. Sign up for a free account
3. Go to your dashboard and copy your API key
4. You'll use this in step 3

## Step 2: Deploy to Vercel
1. Push your code to GitHub (if not already done)
2. Go to https://vercel.com and sign in
3. Import your repository
4. In the environment variables section, add:
   - `TELEGRAM_BOT_TOKEN`: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
   - `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key
5. Click Deploy

## Step 3: Set Webhook URL
After your app is deployed on Vercel:

1. Visit this URL in your browser:
   ```
   https://your-vercel-app.vercel.app/api/setup-webhook
   ```
   (Make a POST request with the webhook URL)

   Or use curl:
   ```bash
   curl -X POST https://your-vercel-app.vercel.app/api/setup-webhook \
     -H "Content-Type: application/json" \
     -d '{"webhookUrl":"https://your-vercel-app.vercel.app/api/webhook"}'
   ```

2. You should get a success response confirming the webhook is set.

## Step 4: Test Your Bot
1. Find your bot on Telegram by searching for its username
   - To find the username, go to BotFather and check your bot's settings
2. Send `/start` to see the welcome message
3. Send an audio file or voice message
4. The bot will transcribe it and send back the Persian text

## How It Works

### Architecture
- **Webhook**: Telegram sends updates to your Vercel app via webhook
- **Download**: Bot downloads the audio file from Telegram servers
- **Transcription**: Audio is sent to AssemblyAI for transcription to Persian
- **Response**: Transcribed text is sent back to the user

### Supported Audio Formats
- Voice messages (OGG format)
- Audio files (MP3, WAV, M4A, OPUS, etc.)
- Files up to 50MB

### Language Support
The bot specifically transcribes to Persian (Farsi) using AssemblyAI's language detection and transcription.

## Troubleshooting

### Bot doesn't respond
1. Check if webhook is set correctly:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```
2. Verify `TELEGRAM_BOT_TOKEN` is correct in Vercel environment variables
3. Check Vercel logs for errors

### Transcription fails
1. Ensure `ASSEMBLYAI_API_KEY` is set in environment variables
2. Check that audio file is clear and not corrupted
3. Verify audio duration isn't too long (AssemblyAI has limits)

### Webhook setup fails
1. Ensure your Vercel deployment is active
2. Check that the webhook URL is accessible
3. Verify the bot token is correct

## File Structure
```
.
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── api/
│       ├── webhook/
│       │   └── route.ts     # Telegram webhook handler
│       └── setup-webhook/
│           └── route.ts     # Webhook setup endpoint
├── package.json
├── tsconfig.json
├── next.config.js
└── SETUP.md
```

## Environment Variables
- `TELEGRAM_BOT_TOKEN`: Your Telegram Bot token (provided)
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key (required for transcription)

## Features
- ✅ Receive voice messages and audio files
- ✅ Transcribe to Persian (Farsi)
- ✅ Real-time processing status
- ✅ Error handling and user feedback
- ✅ Webhook-based (no polling)
- ✅ Serverless deployment ready

## Next Steps
1. Get AssemblyAI API key
2. Deploy to Vercel with both environment variables
3. Set the webhook using the setup endpoint
4. Test with your Telegram bot

Need help? Check the webhook info endpoint to debug issues.
