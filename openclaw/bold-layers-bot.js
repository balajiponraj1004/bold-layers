#!/usr/bin/env node
/**
 * Bold Layers AI Assistant — Telegram Bot
 * Powered by Google Gemini · Runs in GitHub Codespaces
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=xxx GEMINI_API_KEY=xxx node openclaw/bold-layers-bot.js
 *
 * Setup:
 *   1. Create a Telegram bot at t.me/BotFather → copy the token
 *   2. Set TELEGRAM_BOT_TOKEN and GEMINI_API_KEY as Codespace secrets
 *   3. Run this script in a terminal
 *   4. Message your bot on Telegram!
 */

import { GoogleGenAI } from "@google/genai";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!TELEGRAM_TOKEN) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN — get one from @BotFather on Telegram");
  process.exit(1);
}
if (!GEMINI_KEY) {
  console.error("❌ Missing GEMINI_API_KEY — set your Gemini API key");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

// ── Platform specs (mirrors src/lib/gemini.ts) ────────────────────────────────
const PLATFORMS = {
  illustrator: { label: "Instagram Poster", canvas: "1080×1080px", emoji: "🖼️" },
  indesign:    { label: "Promotional Flyer", canvas: "A5 (148×210mm)", emoji: "📄" },
  after_effects: { label: "Instagram Reel", canvas: "1080×1920px · 30s", emoji: "🎬" },
  blender:     { label: "3D Cinematic", canvas: "3840×2160px", emoji: "🎨" },
};

// ── Detect platform from brief ────────────────────────────────────────────────
function detectPlatform(text) {
  const t = text.toLowerCase();
  if (t.match(/reel|video|anim|motion|reels/))        return "after_effects";
  if (t.match(/3d|blender|cine|render|render/))        return "blender";
  if (t.match(/flyer|print|a5|leaflet|brochure/))      return "indesign";
  if (t.match(/poster|instagram|insta|square|social/)) return "illustrator";
  return null;
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM = `You are the Bold Layers AI Production Director — an expert at generating design blueprints for digital marketing assets.

Bold Layers produces:
- Instagram Posters (Adobe Illustrator, 1080×1080px)
- Promotional Flyers (Adobe InDesign, A5)
- Instagram Reels (Adobe After Effects, 1080×1920px, 30s)
- 3D Cinematics (Blender, 4K)

When given a brief and platform, respond EXACTLY in this format (use real emojis, be specific):

🎨 BOLD LAYERS BLUEPRINT
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Brief: [restate brief]
🖥️  Platform: [platform name]
📐 Canvas: [exact dimensions]

🎯 STRATEGY
[2-3 punchy sentences — creative approach, mood, visual direction]

🎨 COLOR PALETTE
■ [#hex] — [role e.g. Deep Background]
■ [#hex] — [role e.g. Brand Accent]
■ [#hex] — [role e.g. Light / Text]
■ [#hex] — [role e.g. Secondary Accent]

✍️  TYPOGRAPHY
Headline: [Google Font name] Bold/800
Body: [Google Font name] Regular/400

📋 LAYERS (top → bottom)
1. [Name] — [Type] — [What it does]
2. [Name] — [Type] — [What it does]
3. [Name] — [Type] — [What it does]
4. [Name] — [Type] — [What it does]
5. [Name] — [Type] — [What it does]
6. [Name] — [Type] — [What it does]

💡 DESIGN NOTES
• [Specific note about composition]
• [Specific note about color usage]
• [Specific note about typography or export]

─────────────────────────────
Reply *SCRIPT* to get the production code
Reply *NEW* to start a new brief`;

// ── Generate blueprint via Gemini ─────────────────────────────────────────────
async function generateBlueprint(brief, platform) {
  const p = PLATFORMS[platform];
  const prompt = `Brief: "${brief}"
Platform: ${p.label} (${p.canvas})

Generate a production blueprint for this brief.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { role: "user", parts: [{ text: SYSTEM }] },
      { role: "user", parts: [{ text: prompt }] },
    ],
  });
  return response.text ?? "Could not generate blueprint.";
}

// ── Generate ExtendScript/Python via Gemini ───────────────────────────────────
async function generateScript(brief, platform) {
  const p = PLATFORMS[platform];
  const isBlender = platform === "blender";
  const lang = isBlender ? "Python" : "Adobe ExtendScript (.jsx)";
  const target = { illustrator: "illustrator", indesign: "indesign", after_effects: "aftereffects", blender: "blender" }[platform];

  const prompt = `Write a complete, runnable ${lang} production script for:
Brief: "${brief}"
Platform: ${p.label}
Canvas: ${p.canvas}

${isBlender ? "Use bpy module. Include: scene reset, materials, lighting (key/fill/rim), camera animation, render settings (Cycles, correct resolution)." : `Use #target ${target}. Create the document/composition, add all layers/text frames, set fonts and colors, include export code.`}

Start the code block with \`\`\`${isBlender ? "python" : "javascript"} and end with \`\`\`.
Keep it under 80 lines, focused and runnable.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return response.text ?? "Could not generate script.";
}

// ── Telegram API helpers ──────────────────────────────────────────────────────
const TG = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function tgFetch(method, body) {
  const r = await fetch(`${TG}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function sendMessage(chatId, text, parseMode = "Markdown") {
  return tgFetch("sendMessage", { chat_id: chatId, text, parse_mode: parseMode });
}

async function sendTyping(chatId) {
  return tgFetch("sendChatAction", { chat_id: chatId, action: "typing" });
}

// ── Conversation state ────────────────────────────────────────────────────────
const sessions = new Map();
// sessions[chatId] = { brief, platform, step: 'idle'|'awaiting_platform'|'done' }

// ── Message handler ───────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  const session = sessions.get(chatId) || { step: "idle" };

  // Commands
  if (text === "/start" || text === "/help") {
    sessions.set(chatId, { step: "idle" });
    await sendMessage(chatId,
      `👋 *Bold Layers AI Assistant*\n\nSend me a design brief and I'll generate a production blueprint.\n\n*Examples:*\n• Instagram poster for Manam Canteen biryani weekend offer\n• Flyer for Hotel Shore Peak luxury suites launch\n• 30-second reel for Cake Dudes birthday promotion\n• 3D cinematic for real estate villa project\n\nJust type your brief! 🎨`
    );
    return;
  }

  if (text === "/new" || text.toUpperCase() === "NEW") {
    sessions.set(chatId, { step: "idle" });
    await sendMessage(chatId, "✅ Ready for a new brief! Send me your design request.");
    return;
  }

  // SCRIPT command
  if (text.toUpperCase() === "SCRIPT") {
    if (!session.brief || !session.platform) {
      await sendMessage(chatId, "⚠️ No active brief. Send a design brief first.");
      return;
    }
    await sendTyping(chatId);
    await sendMessage(chatId, `⚙️ Generating ${PLATFORMS[session.platform].label} production script...`);
    await sendTyping(chatId);
    try {
      const script = await generateScript(session.brief, session.platform);
      await sendMessage(chatId, script, null);
    } catch (e) {
      await sendMessage(chatId, `❌ Script generation failed: ${e.message}`);
    }
    return;
  }

  // Awaiting platform selection
  if (session.step === "awaiting_platform") {
    const map = { "1": "illustrator", "2": "indesign", "3": "after_effects", "4": "blender",
                  "poster": "illustrator", "flyer": "indesign", "reel": "after_effects", "3d": "blender" };
    const platform = map[text.toLowerCase()];
    if (!platform) {
      await sendMessage(chatId, "Please reply 1, 2, 3, or 4 to select a format.");
      return;
    }
    session.platform = platform;
    session.step = "generating";
    sessions.set(chatId, session);

    await sendTyping(chatId);
    const p = PLATFORMS[platform];
    await sendMessage(chatId, `${p.emoji} Generating *${p.label}* blueprint for:\n_${session.brief}_\n\nOne moment...`);
    await sendTyping(chatId);

    try {
      const blueprint = await generateBlueprint(session.brief, platform);
      session.step = "done";
      sessions.set(chatId, session);
      await sendMessage(chatId, blueprint);
    } catch (e) {
      await sendMessage(chatId, `❌ Error: ${e.message}`);
    }
    return;
  }

  // New brief
  const platform = detectPlatform(text);
  session.brief = text;

  if (!platform) {
    session.step = "awaiting_platform";
    sessions.set(chatId, session);
    await sendMessage(chatId,
      `Got your brief! Which format do you need?\n\n1️⃣ Instagram Poster (Illustrator)\n2️⃣ Promotional Flyer (InDesign)\n3️⃣ Instagram Reel (After Effects)\n4️⃣ 3D Cinematic (Blender)\n\nReply 1, 2, 3, or 4`
    );
    return;
  }

  session.platform = platform;
  session.step = "generating";
  sessions.set(chatId, session);

  await sendTyping(chatId);
  const p = PLATFORMS[platform];
  await sendMessage(chatId, `${p.emoji} Detected: *${p.label}*\n\nGenerating blueprint for:\n_${text}_\n\nOne moment...`);
  await sendTyping(chatId);

  try {
    const blueprint = await generateBlueprint(text, platform);
    session.step = "done";
    sessions.set(chatId, session);
    await sendMessage(chatId, blueprint);
  } catch (e) {
    await sendMessage(chatId, `❌ Error: ${e.message}`);
  }
}

// ── Long-polling loop ─────────────────────────────────────────────────────────
async function poll() {
  let offset = 0;
  console.log("🟢 Bold Layers Bot is running — message it on Telegram!");
  console.log("   Press Ctrl+C to stop.\n");

  while (true) {
    try {
      const data = await tgFetch("getUpdates", { offset, timeout: 30, allowed_updates: ["message"] });
      if (!data.ok) { await sleep(3000); continue; }

      for (const update of data.result ?? []) {
        offset = update.update_id + 1;
        if (update.message?.text) {
          console.log(`[${new Date().toLocaleTimeString()}] ${update.message.chat.first_name}: ${update.message.text}`);
          handleMessage(update.message).catch(console.error);
        }
      }
    } catch (e) {
      console.error("Poll error:", e.message);
      await sleep(5000);
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

poll();
