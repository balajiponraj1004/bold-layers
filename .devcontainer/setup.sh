#!/usr/bin/env bash
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Bold Layers + OpenClaw Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy OpenClaw config to the expected location
mkdir -p ~/.openclaw/skills
cp openclaw/openclaw.config.json5 ~/.openclaw/config.json5
cp openclaw/skills/bold-layers.md ~/.openclaw/skills/bold-layers.md

echo ""
echo "✓ OpenClaw config installed"
echo "✓ Bold Layers skill installed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NEXT STEPS:"
echo ""
echo "  1. Start the Bold Layers UI:"
echo "     npm run dev"
echo ""
echo "  2. Start the AI assistant bot (new terminal):"
echo "     node openclaw/bold-layers-bot.js"
echo ""
echo "  3. (Optional) Start OpenClaw gateway:"
echo "     openclaw gateway --port 18789"
echo ""
echo "  See openclaw/README.md for Telegram setup."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
