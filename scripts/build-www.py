#!/usr/bin/env python3
"""Builds www/index.html for the Android app from the game page (game/index.html).

The game page is written for a claude.ai Artifact (no <html>/<head> of its own, fonts from
Google Fonts). This script wraps it in a full document, switches the fonts to the local
copies in www/fonts so the app works offline, and adds the AdMob ad unit ids.

Run:  python3 scripts/build-www.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
game = (ROOT / 'game' / 'index.html').read_text(encoding='utf-8')
ads = json.loads((ROOT / 'ads.json').read_text(encoding='utf-8'))

# local fonts instead of Google Fonts
game = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', game)
game = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="fonts/fonts.css">', game)
game = game.replace('<meta charset="utf-8">\n', '')

page_ads = {
    'rewarded': ads['rewarded'],
    'interstitial': ads['interstitial'],
    'testing': ads.get('testing', True),
}

head = f"""<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<style>
*,*::before,*::after{{box-sizing:border-box}}
:root{{color-scheme:light;padding-top:max(env(safe-area-inset-top,0px),var(--safe-area-inset-top,0px));padding-bottom:max(env(safe-area-inset-bottom,0px),var(--safe-area-inset-bottom,0px))}}
html{{background:#13152b}}
body{{margin:0;font:14px system-ui,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}
html,body{{overscroll-behavior:none}}
</style>
<script>window.SVET_ADS = {json.dumps(page_ads)};</script>
</head><body>
"""
out = head + game + '\n</body></html>\n'
(ROOT / 'www' / 'index.html').write_text(out, encoding='utf-8')
print('www/index.html written,', len(out) // 1024, 'KB; ads testing =', page_ads['testing'])
