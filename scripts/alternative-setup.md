# Alternative Setup: Using Google Speech Recognition (Like Original App)

If you want to use the original Google Speech Recognition library instead of AssemblyAI, you'll need a different approach since Vercel's serverless functions have limitations with pydub and speech_recognition.

## Option 1: Use AssemblyAI (Recommended)
- ✅ Works perfectly on Vercel serverless
- ✅ Better accuracy for Persian
- ✅ No file conversion needed
- ✅ Built into the current setup

## Option 2: Deploy as Long-Running Process
If you want to use speech_recognition + pydub:
1. Deploy to Render, Railway, or similar service that supports long-running processes
2. Update the webhook handler to use the Python library
3. This won't work on Vercel due to function timeout limits

## Option 3: Hybrid Approach
Run a separate Python service for transcription and call it from the Next.js bot.

**For now, the AssemblyAI approach is the easiest and most reliable.**
