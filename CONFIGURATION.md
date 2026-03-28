# Configuration Guide

## Environment Variables

All sensitive information is stored as environment variables. These should never be committed to git.

### Required Variables

#### `TELEGRAM_BOT_TOKEN`
- **What it is**: Your Telegram bot's API token
- **Value**: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`
- **Where to set**: Vercel project environment variables
- **How to get**: Use BotFather on Telegram
- **Example**: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`

#### `ASSEMBLYAI_API_KEY`
- **What it is**: API key for speech-to-text service
- **Where to get**: https://www.assemblyai.com/
- **How to get**:
  1. Go to https://www.assemblyai.com/
  2. Click "Sign up" (free tier available)
  3. Complete registration
  4. Go to dashboard/settings
  5. Copy your API key
  6. Click copy button next to "API Token"
- **Where to set**: Vercel project environment variables
- **Example**: `aab9c4c5d6e7f8g9h0i1j2k3l4m5n6o7`
- **Keep private**: Never share this key!

### Optional Variables

#### `NEXT_PUBLIC_APP_URL`
- **What it is**: Your Vercel app URL (for webhook configuration)
- **Format**: `https://your-app-name.vercel.app`
- **Auto-set**: Vercel provides this automatically
- **When needed**: Only if manually setting webhook

## Vercel Environment Setup

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project
3. Click "Settings" in the top navigation

### Step 2: Add Environment Variables
1. Click "Environment Variables" in left sidebar
2. Under "Environment Variables", add:

**Production Environment:**
```
TELEGRAM_BOT_TOKEN = 8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY
ASSEMBLYAI_API_KEY = [Your AssemblyAI API Key]
```

**Preview Environment** (optional):
- Same variables for testing before production
- Can use test API keys if needed

3. Click "Save"
4. Redeploy for changes to take effect

### Step 3: Verify Variables
1. Go to deployments tab
2. Click latest deployment
3. Check "Environment Variables" section
4. Confirm variables are present (values hidden for security)

## Local Development Setup

### Step 1: Create `.env.local`
```bash
# In project root directory
touch .env.local
```

### Step 2: Add Variables
```env
TELEGRAM_BOT_TOKEN=8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Keep Private
Make sure `.env.local` is in `.gitignore`:
```bash
# .gitignore should already have this:
.env.local
.env
```

## AssemblyAI Setup (Detailed)

### Get Free API Key

1. **Go to AssemblyAI Website**
   - Visit https://www.assemblyai.com/

2. **Sign Up for Free Account**
   - Click "Sign up"
   - Enter email address
   - Create password
   - Verify email

3. **Access Dashboard**
   - Log in to https://app.assemblyai.com/
   - You'll see your dashboard

4. **Find API Key**
   - Look for "Your API token" section
   - Or go to Account Settings → API Token
   - Click copy icon to copy your key

5. **Save Securely**
   - Don't share this key publicly
   - Don't commit to GitHub
   - Only store in Vercel environment variables

### Free Tier Limits

- **Monthly**: Up to ~$10 worth of transcriptions
- **Duration**: Approximately 360 minutes (6 hours)
- **Reset**: Monthly (charges every month)
- **Overages**: Can upgrade to paid plan if needed

### Monitor Usage

1. Go to AssemblyAI dashboard
2. Check "Usage" section
3. See current month's usage
4. Monitor before hitting limits

## Telegram Bot Configuration

### Bot Token Explanation
Your token: `8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY`

**Format**: `<bot_id>:<bot_token>`
- **Bot ID**: `8710987121` (unique bot identifier)
- **Bot Token**: `AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY` (secret key)

### Using BotFather

**Find Your Bot's Settings:**
1. Open Telegram
2. Search for `@BotFather`
3. Click `/start`
4. See your bot in the list
5. Use `/mybots` to manage
6. Select your bot
7. View settings or edit

**Create New Bot (if needed):**
1. Message @BotFather
2. Click `/newbot`
3. Follow prompts
4. Receive token for new bot

### Bot Privacy

- **Keep token secret**: Treat like password
- **Don't share**: Never post in public channels
- **Rotate if leaked**: Ask BotFather to generate new token
- **Use environment variables**: Never hardcode in code

## Webhook Configuration

### What is a Webhook?

A webhook tells Telegram where to send messages:
```
User sends message to bot
         ↓
Telegram receives message
         ↓
Telegram sends HTTP POST to your webhook URL
         ↓
Your app processes and responds
```

### Webhook URL Format

```
https://your-vercel-app.vercel.app/api/webhook
```

Replace `your-vercel-app` with your actual Vercel project name.

### Set Webhook

**Option 1: Automatic (Recommended)**
```bash
curl -X POST https://YOUR_VERCEL_URL/api/setup-webhook
```

**Option 2: With cURL**
```bash
curl -X POST https://api.telegram.org/bot8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-vercel-app.vercel.app/api/webhook",
    "allowed_updates": ["message"]
  }'
```

**Option 3: Telegram Client**
1. Message @BotFather
2. Click `/mybots`
3. Select your bot
4. Click "Edit Bot"
5. Follow webhook instructions

### Check Webhook Status

```bash
# Option 1: Using your setup endpoint
curl https://YOUR_VERCEL_URL/api/setup-webhook

# Option 2: Using Telegram API directly
curl https://api.telegram.org/bot8710987121:AAHFXQX2FJCOvx25gWzJdKi5w2qyGCHtfEY/getWebhookInfo
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "ip_address": "...",
    "last_error_date": null,
    "max_connections": 40,
    "allowed_updates": ["message"]
  }
}
```

## Project Configuration Files

### `next.config.js`
Controls Next.js behavior:
```javascript
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',  // Allow large audio files
    },
  },
};
```

**Customization:**
- Change `sizeLimit` if needed for larger files
- Add other Next.js config as needed

### `.vercelignore`
Files to exclude from Vercel deployment:
```
*.md          # Skip markdown files
.env          # Skip env files
node_modules  # Skip dependencies (installed by Vercel)
```

### `package.json`
Project dependencies:
```json
{
  "dependencies": {
    "next": "^16.0.0",        // Web framework
    "grammy": "^1.28.0",      // Telegram bot helper (optional)
    "axios": "^1.7.0"         // HTTP requests
  }
}
```

**Adding Dependencies:**
```bash
npm install package-name
```

## Security Best Practices

### Do's ✅
- ✅ Store tokens in environment variables
- ✅ Use HTTPS for all communication
- ✅ Keep API keys private and secure
- ✅ Rotate keys if compromised
- ✅ Use .gitignore for local .env files
- ✅ Review webhook logs regularly
- ✅ Monitor API usage and costs

### Don'ts ❌
- ❌ Commit `.env` files to GitHub
- ❌ Hardcode API keys in source code
- ❌ Share tokens in messages or emails
- ❌ Use same token for multiple bots
- ❌ Expose tokens in error messages
- ❌ Use weak or predictable patterns
- ❌ Leave default configurations

## Troubleshooting Configuration

### "API key not found"
- Check environment variables in Vercel dashboard
- Verify variable names match exactly (case-sensitive)
- Redeploy after adding variables
- Check `.env.local` for local development

### "Invalid bot token"
- Verify token doesn't have extra spaces
- Check token is not modified
- Ensure using correct token (not another bot's)
- Try regenerating token with BotFather

### "Webhook setup failed"
- Ensure Vercel deployment is complete
- Verify webhook URL is public and accessible
- Check network connectivity
- Review error message for details

### "AssemblyAI API key invalid"
- Double-check key copied correctly
- Verify no extra spaces
- Check account is active (not expired)
- Test with their dashboard first

## Monitoring & Logs

### Vercel Logs
1. Go to Vercel dashboard
2. Click your project
3. Go to "Deployments" tab
4. Click a deployment
5. View "Function Logs" tab
6. See all function invocations

### Check Health
```bash
# Visit your bot's home page
curl https://YOUR_VERCEL_URL/

# Should return HTML with status info
```

## Reset/Update Configuration

### Change Telegram Token
1. Ask BotFather for new token
2. Update `TELEGRAM_BOT_TOKEN` in Vercel
3. Redeploy project
4. Reconfigure webhook

### Change AssemblyAI Key
1. Log into AssemblyAI account
2. Get new key from dashboard
3. Update `ASSEMBLYAI_API_KEY` in Vercel
4. Redeploy project

### Reconfigure Webhook
```bash
# Delete old webhook
curl https://api.telegram.org/bot8710987121:.../deleteWebhook

# Set new webhook
curl -X POST https://YOUR_VERCEL_URL/api/setup-webhook
```

## Advanced Configuration

### Custom Language
In `/app/api/webhook/route.ts`, change:
```typescript
const transcription = await transcribeAudio(audioBuffer);
// Change language code from "fa" to other codes
```

Supported languages:
- `fa` = Persian (Farsi) - default
- `en` = English
- `es` = Spanish
- `fr` = French
- etc. (see AssemblyAI docs for full list)

### Custom Message Templates
Edit message text in `/app/api/webhook/route.ts`:
```typescript
await sendMessage(
  chatId,
  `<b>📝 Transcription:</b>\n\n<pre>${escapeHtml(transcription)}</pre>`
);
```

### Custom API Endpoints
Add new routes in `/app/api/`:
```
app/api/new-endpoint/route.ts
```

---

Need help? Check [SETUP.md](./SETUP.md) or [QUICKSTART.md](./QUICKSTART.md)
