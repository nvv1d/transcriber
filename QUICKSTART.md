# Quick Start Guide

## 🚀 Deploy in 5 Minutes

### 1. Get AssemblyAI API Key
```bash
# Go to https://www.assemblyai.com/
# Sign up (free tier available)
# Copy your API key
```

### 2. Deploy to Vercel
```bash
git push origin main
```

Then:
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select your repository
4. Add Environment Variables:
   - `TELEGRAM_BOT_TOKEN` = `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
   - `ASSEMBLYAI_API_KEY` = Your AssemblyAI key
5. Click Deploy

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
