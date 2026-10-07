#!/usr/bin/env python3
"""Assemble les pages intérieures du site SODIKART à partir des fragments _src/pages/*.html
et des blocs partagés (sprite, loader, nav, footer) extraits de site/index.html."""
import re, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
index = (SITE / 'index.html').read_text(encoding='utf-8')
def block(name):
    m = re.search(rf'<!-- {name}:START -->\n(.*?)\n<!-- {name}:END -->', index, re.S)
    if not m: sys.exit(f'bloc {name} introuvable dans index.html')
    return m.group(1)
SPRITE, LOADER, NAV, FOOTER = block('SPRITE'), block('LOADER'), block('NAV'), block('FOOTER')
HEAD = '''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/logo/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira:wght@400;500;600;700;800&family=Saira+Extra+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
'''
SCRIPTS = '''
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
<script src="assets/js/main.js"></script>
{extra}
</body>
</html>
'''
for frag in sorted((ROOT / '_src' / 'pages').glob('*.html')):
    src = frag.read_text(encoding='utf-8')
    meta = dict(re.findall(r'<!--\s*(title|desc|scripts)\s*:\s*(.*?)\s*-->', src))
    body = re.sub(r'<!--\s*(title|desc|scripts)\s*:.*?-->\n?', '', src, count=3)
    html = HEAD.format(title=meta.get('title', 'SODIKART'), desc=meta.get('desc', '')) + SPRITE + '\n' + LOADER + '\n' + NAV + '\n\n<main>\n' + body + '\n</main>\n\n' + FOOTER + SCRIPTS.format(extra=meta.get('scripts', ''))
    out = SITE / frag.name
    out.write_text(html, encoding='utf-8')
    print('écrit', out.name, len(html), 'octets')
