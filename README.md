# 🎤 Telegram Audio Transcriber Bot

A Telegram bot that transcribes audio files and voice messages to Persian (Farsi) text, deployed serverlessly on Vercel.

## Features

- 🎵 **Audio Support**: Voice messages and audio files (MP3, WAV, M4A, OGG, etc.)
- 🌍 **Persian Transcription**: Converts speech to Farsi text using AI
- ⚡ **Serverless**: Deployed on Vercel with zero infrastructure to manage
- 🔄 **Webhook-Based**: Real-time processing via Telegram webhook
- 💬 **User-Friendly**: Simple commands and status updates
- 🛡️ **Reliable**: Error handling and user feedback

## How It Works

```
User sends audio to Telegram
         ↓
Telegram sends webhook to Vercel
         ↓
Bot downloads audio file
         ↓
Google's free Speech Recognition API transcribes to Persian (fa-IR)
         ↓
Bot sends transcription back to user
```

**Note**: Uses the same free Google Speech Recognition API as the original Python code. No API keys or credentials needed!

## Getting Started

### Prerequisites
- Node.js 18+
- Telegram Bot Token (provided: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`)
- Vercel account (free tier available)

That's it! No API keys needed - uses Google's free Speech Recognition API like the Python version.

### Quick Deploy

1. **Deploy to Vercel**
   - Push code to GitHub
   - Import in Vercel dashboard
   - Add environment variable:
     - `TELEGRAM_BOT_TOKEN`: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`

3. **Set Webhook**
   ```bash
   curl -X POST https://YOUR_VERCEL_URL/api/setup-webhook
   ```

4. **Start Using**
   - Find your bot on Telegram
   - Send `/start`
   - Send an audio file or voice message
   - Get transcription! ✨

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Show welcome message and instructions |
| `/help` | Show help and usage information |
| Send audio file | Transcribe the audio to Persian text |
| Send voice message | Transcribe the voice to Persian text |

## Project Structure

```
telegram-transcriber-bot/
├── app/
│   ├── layout.tsx              # Next.js layout
│   ├── page.tsx                # Home page
│   └── api/
│       ├── webhook/
│       │   └── route.ts        # Telegram webhook handler
│       └── setup-webhook/
│           └── route.ts        # Webhook configuration
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
├── SETUP.md                   # Detailed setup guide
├── QUICKSTART.md              # Quick start guide
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Environment Variables

Create a `.env.local` file (or set in Vercel):

```env
TELEGRAM_BOT_TOKEN=8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY
ASSEMBLYAI_API_KEY=your_api_key_here
```

## API Endpoints

### POST `/api/webhook`
Receives and processes Telegram messages (voice and audio files).

**Request**: Automatically from Telegram via webhook

**Response**: 
```json
{ "ok": true }
```

### POST `/api/setup-webhook`
Configures the Telegram webhook to point to your Vercel app.

**Request**:
```bash
curl -X POST https://your-app.vercel.app/api/setup-webhook
```

**Response**:
```json
{
  "ok": true,
  "message": "Webhook set successfully",
  "webhookUrl": "https://your-app.vercel.app/api/webhook"
}
```

### GET `/api/setup-webhook`
Gets current webhook information and status.

**Response**:
```json
{
  "url": "https://your-app.vercel.app/api/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0,
  "ip_address": "...",
  "last_error_date": null,
  "last_error_message": null,
  "last_synchronization_error_date": null,
  "max_connections": 40,
  "allowed_updates": ["message"]
}
```

## Troubleshooting

### Bot doesn't respond
1. Check webhook status: `GET /api/setup-webhook`
2. Verify environment variables are set
3. Check Vercel logs for errors

### Transcription fails
1. Ensure AssemblyAI API key is valid
2. Check audio file format (supported: OGG, MP3, WAV, M4A)
3. Verify audio is clear and not corrupted
4. Check AssemblyAI account for usage limits

### Webhook setup fails
1. Ensure Vercel deployment is complete
2. Verify bot token is correct
3. Check that app URL is accessible
4. Review error message for details

## Technologies

- **Next.js 16** - React framework with API routes
- **TypeScript** - Type-safe JavaScript
- **Telegram Bot API** - Bot communication
- **AssemblyAI** - AI-powered speech-to-text
- **Vercel** - Serverless hosting

## Limits

- **Audio Duration**: Up to 2 hours per file
- **File Size**: Up to 50 MB via Telegram
- **Language**: Persian (Farsi)
- **Processing**: Real-time or near real-time

## Cost

- **Telegram**: Free
- **Vercel**: Free tier includes hosting
- **AssemblyAI**: Free tier allows ~$10 worth of transcriptions/month

## Security

- Bot token stored as environment variable
- API key never exposed to client
- All communication over HTTPS
- Webhook validates Telegram updates
- No persistent file storage on server

## Support

For issues:
1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Review [QUICKSTART.md](./QUICKSTART.md) for quick reference
3. Check Vercel dashboard logs
4. Visit Telegram Bot API docs: https://core.telegram.org/bots/api

## Future Enhancements

- [ ] Support multiple languages
- [ ] Save transcription history
- [ ] Export to different formats (PDF, DOCX)
- [ ] Batch processing
- [ ] Custom language models
- [ ] User authentication

## License

MIT

## Author

Created with ❤️ for Telegram audio transcription

---

**Need help?** See [SETUP.md](./SETUP.md) or [QUICKSTART.md](./QUICKSTART.md)
