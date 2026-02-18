#!/bin/bash
# OpenRouter Price Updater Wrapper

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export NEXT_PUBLIC_SUPABASE_URL="https://caamywhuejgexlcvupod.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_HqQVymk9xKsfmKjDmqCGyA_A2fpoSV2"

cd /Users/svengrewe/.openclaw/workspace/paymodel-ai
/opt/homebrew/bin/node scripts/openrouter-updater.js
