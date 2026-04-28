# Bold Layers AI Assistant — Telegram Bot via GitHub Codespaces

No local install. Run everything in your browser via GitHub Codespaces.

---

## Setup (5 minutes)

### Step 1 — Push this repo to GitHub
```bash
git add .
git commit -m "add openclaw assistant"
git push
```

### Step 2 — Create a Telegram Bot (free, 2 min)
1. Open Telegram → search **@BotFather**
2. Send `/newbot` → follow prompts → copy the **HTTP API token**

### Step 3 — Add Codespace Secrets
Go to: `github.com/YOUR_USERNAME/bold-layers` → **Settings → Secrets → Codespaces**

Add these two secrets:
| Name | Value |
|------|-------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key (same as Bold Layers) |
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |

### Step 4 — Open in Codespaces
On GitHub: **Code → Codespaces → Create codespace on main**

The devcontainer auto-installs OpenClaw and dependencies.

### Step 5 — Start the bot
In the Codespace terminal:
```bash
node openclaw/bold-layers-bot.js
```

That's it. Open Telegram and message your bot!

---

## What You Can Do

Send any of these to your Telegram bot:

| Message | What happens |
|---------|--------------|
| `Instagram poster for Manam Canteen biryani special` | Generates Illustrator blueprint |
| `Flyer for Hotel Shore Peak luxury suites launch` | Generates InDesign blueprint |
| `30-second reel for Cake Dudes birthday promotion` | Generates After Effects blueprint |
| `3D cinematic for real estate villa project` | Generates Blender blueprint |
| `SCRIPT` | Get production-ready ExtendScript / Python code |
| `NEW` | Start a fresh brief |
| `/help` | Show help message |

---

## How It Works

```
Your Telegram Message
        ↓
bold-layers-bot.js (Node.js, running in Codespace)
        ↓
Google Gemini 2.0 Flash (same API key as Bold Layers UI)
        ↓
Design Blueprint → back to your Telegram
```

The bot auto-detects the platform from keywords in your brief:
- "poster", "instagram" → Illustrator
- "flyer", "print", "a5" → InDesign  
- "reel", "video", "animation" → After Effects
- "3d", "cinematic", "blender" → Blender

---

## Files

```
openclaw/
├── bold-layers-bot.js      ← The Telegram bot (run this)
├── openclaw.config.json5   ← OpenClaw gateway config (optional)
├── skills/
│   └── bold-layers.md      ← AI skill definition
└── README.md               ← This file

.devcontainer/
├── devcontainer.json        ← Codespace auto-setup
└── setup.sh                 ← Post-create script
```
