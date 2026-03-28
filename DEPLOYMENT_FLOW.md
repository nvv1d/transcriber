# Deployment Flow & Architecture

## 🔄 Message Processing Flow

```
┌─────────────┐
│   Telegram  │
│    User     │
└──────┬──────┘
       │ Sends voice message or audio file
       ▼
┌─────────────────────────────────────┐
│    Telegram Bot API                 │
│  (Receives audio from user)         │
└──────┬──────────────────────────────┘
       │ Sends webhook POST
       ▼
┌─────────────────────────────────────┐
│    Vercel Serverless Function       │
│    /api/webhook (Next.js Route)     │
│                                     │
│  1. Parse Telegram update          │
│  2. Extract file_id               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Telegram File Download           │
│    (Download audio from URL)        │
└──────┬──────────────────────────────┘
       │ Get audio buffer
       ▼
┌─────────────────────────────────────┐
│    AssemblyAI API                   │
│    (Send audio for transcription)   │
│                                     │
│  1. Upload audio file              │
│  2. Create transcription job       │
│  3. Poll for completion            │
│  4. Get Persian text               │
└──────┬──────────────────────────────┘
       │ Return transcribed text
       ▼
┌─────────────────────────────────────┐
│    Telegram Bot API                 │
│    (Send message to user)           │
└──────┬──────────────────────────────┘
       │ Send transcription
       ▼
┌─────────────┐
│   Telegram  │
│    User     │ Receives Persian text!
└─────────────┘
```

## 📊 System Architecture

```
                        ┌──────────────────────────┐
                        │   Telegram Servers       │
                        │  (Message & File Store)  │
                        └────────────┬─────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                                 │
                    ▼ Webhook POST                   ▼ File Download
           ┌─────────────────────┐           ┌──────────────────┐
           │ Vercel Serverless   │           │ Telegram CDN     │
           │  /api/webhook       │◄──────────│ (Audio Files)    │
           │                     │           └──────────────────┘
           │ • Parse update      │
           │ • Validate message  │
           │ • Extract file ID   │
           └────────┬────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │ AssemblyAI API      │
           │                     │
           │ • Upload audio      │
           │ • Transcribe        │
           │ • Return Persian    │
           └────────┬────────────┘
                    │
                    ▼ Transcribed Text
           ┌─────────────────────┐
           │ Telegram Bot API    │
           │                     │
           │ sendMessage()       │
           └────────┬────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │ User Receives Text  │
           │ in Telegram Chat    │
           └─────────────────────┘
```

## 🚀 Deployment Steps

### Step 1: Prepare Code
```
Your Computer
     ▼
GitHub Repository
     │
     └─ Clone from nvv1d/transcriber
```

### Step 2: Set Up Vercel Project
```
Vercel Dashboard
     ▼
Import Repository
     ▼
Add Environment Variables
     │
     ├─ TELEGRAM_BOT_TOKEN
     └─ ASSEMBLYAI_API_KEY
     ▼
Click Deploy
     ▼
Vercel Builds & Deploys
```

### Step 3: Configure Webhook
```
Deployment Complete
     ▼
GET /api/setup-webhook
     ▼
Returns webhook URL
     ▼
POST /api/setup-webhook
     ▼
Telegram Receives Webhook Config
     ▼
Ready to Receive Messages!
```

## 📈 Infrastructure Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     VERCEL DEPLOYMENT                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                       │ │
│  │                                                        │ │
│  │  ┌─────────────┐                 ┌──────────────────┐│ │
│  │  │   Home Page │                 │  API Routes      ││ │
│  │  │   (/)       │                 │  (/api/*)        ││ │
│  │  │             │                 │                  ││ │
│  │  │ • Status    │                 │ • /webhook       ││ │
│  │  │ • Info      │                 │ • /setup-webhook ││ │
│  │  │             │                 │                  ││ │
│  │  └─────────────┘                 └──────────────────┘│ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Runtime: Node.js 18+                                       │
│  Framework: Next.js 16                                      │
│  Region: Global (Vercel Edge)                              │
│  Scaling: Automatic                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         │                           │
         │ HTTPS                     │ HTTPS
         ▼                           ▼
    Telegram            AssemblyAI (transcription)
    (webhooks)          (speech-to-text)
```

## 🔐 Environment Variables Flow

```
Vercel Secrets (Environment Variables)
     │
     ├─ TELEGRAM_BOT_TOKEN
     │   └─ Used in: /api/webhook, /api/setup-webhook
     │
     └─ ASSEMBLYAI_API_KEY
         └─ Used in: /api/webhook (transcription)
         
All encrypted at rest on Vercel servers
Only decrypted when function runs
Never exposed to client-side code
```

## ⚙️ Configuration Files

```
Project Root
│
├─ package.json          → Dependencies (Next.js, axios, etc.)
├─ tsconfig.json         → TypeScript configuration
├─ next.config.js        → Next.js configuration
├─ .vercelignore        → Files to exclude from deployment
├─ .env.example         → Environment variables template
│
├─ app/
│  ├─ layout.tsx        → Root layout
│  ├─ page.tsx          → Home page
│  └─ api/
│     ├─ webhook/
│     │  └─ route.ts    → Telegram webhook handler
│     └─ setup-webhook/
│        └─ route.ts    → Webhook configuration
│
├─ lib/
│  └─ telegram.ts       → Telegram utilities
│
├─ .github/
│  └─ workflows/
│     └─ deploy.yml     → GitHub Actions CI/CD
│
└─ Documentation
   ├─ README.md                → Main documentation
   ├─ SETUP.md                 → Detailed setup guide
   ├─ QUICKSTART.md            → Quick start guide
   ├─ DEPLOYMENT_CHECKLIST.md  → Checklist
   └─ DEPLOYMENT_FLOW.md       → This file
```

## 🔗 API Flow Example

### Request
```
POST https://your-app.vercel.app/api/webhook

Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": { "id": 123, "first_name": "John" },
    "chat": { "id": 123, "type": "private" },
    "date": 1699564800,
    "voice": {
      "file_id": "AwADBAADzg...",
      "duration": 30,
      "mime_type": "audio/ogg",
      "file_size": 50000
    }
  }
}
```

### Processing
```
1. Extract file_id from voice message
2. Download audio from Telegram CDN
3. Send audio to AssemblyAI
4. Poll for transcription result
5. Format response
6. Send message back to user
```

### Response
```
POST https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage

{
  "chat_id": 123,
  "text": "<b>📝 Transcription:</b>\n\n<pre>متن فارسی شده</pre>",
  "parse_mode": "HTML"
}
```

## 📊 Expected Latency

- **Download Audio**: 1-5 seconds (depends on file size)
- **Send to AssemblyAI**: <1 second
- **AssemblyAI Processing**: 5-30 seconds (depends on duration)
- **Send Response**: 1-2 seconds
- **Total**: 7-38 seconds typically

## 🎯 Next Steps After Deployment

1. ✅ Bot deployed and running
2. ✅ Webhook receiving messages
3. ✅ Audio files being transcribed
4. ✅ Users getting Persian text

Monitor your AssemblyAI usage and Vercel logs regularly!

---

For detailed setup instructions, see [SETUP.md](./SETUP.md)
For quick start, see [QUICKSTART.md](./QUICKSTART.md)
