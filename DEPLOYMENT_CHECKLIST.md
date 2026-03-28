# Deployment Checklist

## ✅ Pre-Deployment

- [x] Bot token available: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
- [ ] AssemblyAI account created at https://www.assemblyai.com/
- [ ] AssemblyAI API key copied and saved securely
- [ ] Repository pushed to GitHub
- [ ] Vercel account created at https://vercel.com

## ✅ Vercel Deployment

1. **Import Project**
   - [ ] Go to https://vercel.com/dashboard
   - [ ] Click "Add New..." → "Project"
   - [ ] Select your GitHub repository
   - [ ] Click "Import"

2. **Configure Environment Variables**
   - [ ] Add `TELEGRAM_BOT_TOKEN` = `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
   - [ ] Add `ASSEMBLYAI_API_KEY` = Your AssemblyAI API key
   - [ ] Click "Deploy"

3. **Wait for Deployment**
   - [ ] Check deployment logs for errors
   - [ ] Confirm "Deployment successful" message
   - [ ] Note your Vercel URL (e.g., https://my-bot.vercel.app)

## ✅ Webhook Configuration

After deployment is successful:

1. **Option A: Using Vercel Dashboard**
   - [ ] Go to your Vercel deployment
   - [ ] Find the API endpoint showing the webhook URL
   - [ ] Use the setup endpoint to configure webhook

2. **Option B: Using cURL**
   ```bash
   curl -X POST https://YOUR_VERCEL_URL/api/setup-webhook \
     -H "Content-Type: application/json"
   ```
   - [ ] Replace `YOUR_VERCEL_URL` with your Vercel app URL
   - [ ] Run the command
   - [ ] Confirm success response

3. **Verify Webhook**
   ```bash
   curl https://YOUR_VERCEL_URL/api/setup-webhook
   ```
   - [ ] Check webhook status in response
   - [ ] Confirm `url` matches your Vercel app URL
   - [ ] Verify `pending_update_count` is 0

## ✅ Test Your Bot

1. **Find Your Bot on Telegram**
   - [ ] Open Telegram
   - [ ] Use BotFather to get bot username (if needed)
   - [ ] Search for your bot by username

2. **Send Commands**
   - [ ] Send `/start` command
   - [ ] Confirm welcome message appears
   - [ ] Send `/help` command
   - [ ] Confirm help message appears

3. **Test Transcription**
   - [ ] Send a short voice message (5-10 seconds)
   - [ ] Confirm bot receives it (status message appears)
   - [ ] Wait for transcription
   - [ ] Confirm Persian text appears

4. **Test Different Formats**
   - [ ] Send an audio file (MP3, WAV, etc.)
   - [ ] Confirm transcription works
   - [ ] Try longer audio (30+ seconds)
   - [ ] Confirm chunking and processing works

## ✅ Monitor & Maintain

1. **Check Logs**
   - [ ] Go to Vercel dashboard
   - [ ] View "Function Logs" tab
   - [ ] Confirm successful requests being logged

2. **Monitor Usage**
   - [ ] Check AssemblyAI dashboard for usage
   - [ ] Confirm staying within free tier limits
   - [ ] Monitor for any errors

3. **Keep Updated**
   - [ ] Monitor Telegram Bot API changes
   - [ ] Update dependencies regularly
   - [ ] Review security best practices

## 🆘 Troubleshooting

### Bot doesn't respond to messages
1. Check webhook status:
   ```bash
   curl https://YOUR_VERCEL_URL/api/setup-webhook
   ```
2. Confirm webhook URL is correct
3. Check Vercel logs for errors
4. Verify environment variables are set

### Transcription always fails
1. Verify `ASSEMBLYAI_API_KEY` is set correctly
2. Check AssemblyAI account has available credits
3. Test with a very short audio file (2-3 seconds)
4. Review Vercel logs for specific error messages

### Webhook setup returns error
1. Ensure Vercel deployment is complete
2. Verify bot token is correct (no extra spaces)
3. Ensure webhook URL is publicly accessible
4. Try deleting old webhook and setting new one

### 502 Bad Gateway errors
1. Check if deployment is still building
2. Verify all environment variables are set
3. Check for Node.js version compatibility
4. Review function logs for timeout errors

## 📋 Success Criteria

Your bot is ready when:
- ✅ Bot responds to `/start` command
- ✅ Bot accepts audio files and voice messages
- ✅ Bot returns Persian transcriptions
- ✅ Vercel logs show successful requests
- ✅ No errors in webhook configuration

## 📚 Quick Links

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Vercel Documentation](https://vercel.com/docs)
- [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Need help?** Check the README.md or SETUP.md for detailed instructions.
