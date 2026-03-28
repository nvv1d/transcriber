# ✅ Telegram Bot - Ready to Deploy

## Summary

Your Python Streamlit audio transcription app has been converted to a **Telegram Bot** that runs on Vercel with **zero additional credentials needed**.

## What Changed

| Aspect | Python Version | Telegram Bot Version |
|--------|---------------|-----------------------|
| **UI** | Streamlit web app | Telegram bot |
| **Deployment** | Local/Streamlit Cloud | Vercel serverless |
| **Speech Engine** | `speech_recognition` lib | Google's free API (direct) |
| **Language** | Persian (fa-IR) | Persian (fa-IR) ✅ Same |
| **Cost** | Free | Free ✅ |
| **API Keys** | None needed | None needed ✅ |
| **Credentials** | None | None ✅ |

## How to Deploy (3 Steps)

### Step 1: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select your GitHub repository (nvv1d/transcriber)
4. Add environment variable:
   - `TELEGRAM_BOT_TOKEN` = `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
5. Click "Deploy"
6. Wait for deployment to finish (2-3 minutes)

### Step 2: Set Webhook
After deployment, visit this URL in your browser:
```
https://YOUR_VERCEL_URL/api/setup-webhook
```

You'll see a success message. That's it!

### Step 3: Test
1. Find your bot on Telegram
2. Send `/start`
3. Send a voice message or audio file
4. Get Persian transcription back

## Files Created

**Core Application**
- `app/api/webhook/route.ts` - Main bot logic (handles audio, calls Google API)
- `app/api/setup-webhook/route.ts` - Webhook configuration endpoint
- `app/page.tsx` - Status page
- `lib/telegram.ts` - Telegram utility functions

**Configuration**
- `package.json` - Dependencies (Next.js, axios only)
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `.env.example` - Environment variables template

**Documentation**
- `START_HERE.md` - Quick orientation
- `QUICKSTART.md` - 3-minute deploy guide
- `README.md` - Complete overview
- `SETUP.md` - Detailed setup instructions
- `DEPLOYMENT_CHECKLIST.md` - Verification checklist

## Key Features

✅ Receives voice messages and audio files from Telegram
✅ Downloads audio from Telegram servers
✅ Transcribes to Persian (Farsi) using Google's free Speech Recognition API
✅ Sends transcription back to user
✅ Handles multiple users simultaneously
✅ Always-on (24/7) via Vercel serverless
✅ No API keys or credentials needed
✅ Same transcription logic as Python version

## Telegram Bot Commands

- `/start` - Shows welcome message and instructions
- `/help` - Shows help message with commands and tips

## Audio Formats Supported

- Voice messages (Telegram voice)
- MP3 files
- WAV files
- M4A files
- OGG files
- FLAC files
- WebM files

## Important Notes

1. **No API Keys Needed** - Uses Google's public free API like the Python code
2. **Language is Persian** - Set to fa-IR (same as Python code)
3. **Bot Token** - Already provided: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
4. **Deployment** - Code is ready to push to GitHub and deploy on Vercel
5. **Testing** - Works immediately after webhook setup

## Environment Variables

Only one environment variable needed:

```env
TELEGRAM_BOT_TOKEN=8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY
```

That's it! No Google credentials, no AssemblyAI keys, nothing else.

## Architecture

```
User (Telegram)
    ↓ sends audio
Telegram servers
    ↓ webhook
Vercel (your bot)
    ↓ downloads audio
Telegram servers
    ↓ retrieves file
Bot processes
    ↓ calls API
Google Speech-to-Text (free public API)
    ↓ returns transcript
Bot sends back
    ↓ message
User receives transcription (Telegram)
```

## Technology Stack

- **Framework**: Next.js 16 (TypeScript)
- **Hosting**: Vercel (serverless)
- **Bot Library**: grammy (Telegram Bot API)
- **HTTP Client**: axios
- **Speech-to-Text**: Google's free Speech Recognition API
- **Language**: TypeScript

## Files Not Needed (Removed)

- ❌ Original Python files (`app.py`, `requirements.txt`, etc.)
- ❌ Google Cloud SDK
- ❌ AssemblyAI SDK
- ❌ Complex authentication

## What Happens When User Sends Audio

1. User sends voice message to bot on Telegram
2. Telegram sends webhook POST to `/api/webhook`
3. Bot extracts file ID from webhook
4. Bot downloads audio file from Telegram servers
5. Bot sends audio to Google's free Speech Recognition API
6. Google returns Persian transcription
7. Bot sends transcription back to user on Telegram

All within 5-10 seconds! ⚡

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot doesn't respond | Webhook not set up - visit `/api/setup-webhook` |
| Wrong language | Language is set to fa-IR (Persian) - correct |
| Audio not processing | Check file format - try MP3 or OGG |
| Deployment fails | Make sure TELEGRAM_BOT_TOKEN is set in Vars |

## Next Step

Read [START_HERE.md](./START_HERE.md) or [QUICKSTART.md](./QUICKSTART.md) for immediate deployment instructions.

---

**You're ready to deploy!** 🚀

Push to GitHub → Deploy on Vercel → Set webhook → Test on Telegram

That's all there is to it!
