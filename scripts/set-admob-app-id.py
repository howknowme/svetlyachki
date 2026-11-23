#!/usr/bin/env python3
"""Copies the AdMob app id from ads.json into AndroidManifest.xml."""
import json, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
app_id = json.loads((root / 'ads.json').read_text(encoding='utf-8'))['appId']
m = root / 'android/app/src/main/AndroidManifest.xml'
s = m.read_text(encoding='utf-8')
s = re.sub(r'(android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"\s*android:value=")[^"]*(")', r'\g<1>' + app_id + r'\g<2>', s)
m.write_text(s, encoding='utf-8')
print('AdMob app id:', app_id)
