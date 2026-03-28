# Quick Start Guide

## 🚀 Deploy in 3 Minutes (No API Keys Needed!)

### 1. Deploy to Vercel
```bash
git push origin main
```

Then:
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select your repository
4. Add Environment Variable:
   - `TELEGRAM_BOT_TOKEN` = `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
5. Click Deploy

That's it! No other API keys needed. The bot uses Google's free Speech Recognition API just like the Python version.

### 3. Set Webhook (After Deployment)
Once your Vercel app is live:

```bash
# Replace YOUR_VERCEL_URL with your actual URL (e.g., https://my-bot.vercel.app)
curl -X POST https://YOUR_VERCEL_URL/api/setup-webhook \
  -H "Content-Type: application/json"
```

### 4. Test
1. Find your bot on Telegram
2. Send `/start`
3. Send a voice message or audio file
4. Bot responds with transcription ✅

## 🎯 Your Bot Details
- **Token**: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
- **BotFather**: Message @BotFather to manage your bot

## 📚 Need Help?
See [SETUP.md](./SETUP.md) for detailed instructions and troubleshooting.

## 🔗 Useful Links
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **AssemblyAI Docs**: https://www.assemblyai.com/docs
- **Vercel Docs**: https://vercel.com/docs

## 🌐 API Endpoints
- **Home**: `/` - Status page
- **Webhook**: `/api/webhook` - Receives Telegram messages (POST)
- **Setup**: `/api/setup-webhook` - Configure webhook (POST)
- **Info**: `/api/setup-webhook` - Get webhook info (GET)
