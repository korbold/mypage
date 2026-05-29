#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PDF_OUT="$ROOT/public/cv/Danny_Barahona_CV.pdf"
PORT=8765
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

cd "$ROOT"
npm run build

cd "$ROOT/dist"
python3 -m http.server "$PORT" > /tmp/cv_serve.log 2>&1 &
SVR=$!
trap 'kill "$SVR" 2>/dev/null || true' EXIT

sleep 1

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$PDF_OUT" \
  --virtual-time-budget=4000 \
  "http://localhost:$PORT/cv/"

echo "PDF -> $PDF_OUT"
