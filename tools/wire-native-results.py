from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf-8-sig')
if 'native-results.css' not in s:s=s.replace('<link rel="stylesheet" href="native-world.css">','<link rel="stylesheet" href="native-world.css"><link rel="stylesheet" href="native-results.css">')
if 'results-ui.js' not in s:s=s.replace('<script src="flow.js"></script>','<script src="results-ui.js"></script><script src="flow.js"></script>')
p.write_text(s,encoding='utf8')
