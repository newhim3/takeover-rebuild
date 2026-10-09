"""Extract campaign AI technology and edict bonuses from LevelInfo.as."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
source = root.parent / 'takeover拆解/extracted/swf2/scripts_clean/scripts'
enum = (source / '§_-d-§/§_-kj§.as').read_text(encoding='utf-8-sig')
fields = {name: int(value) for name, value in re.findall(r'public static var (§[^§]+§):int = (\d+);', enum)}
level = (source / 'data/LevelInfo.as').read_text(encoding='utf-8-sig')
body = level.split('public function §_-dh§()', 1)[1].split('private function §_-ZF§', 1)[0]
campaigns = {'WESTARIA': 'Green', 'KHAGANATE': 'Red', 'CULT': 'Blue'}
colors = {'Westaria': 'Green', 'TheKhaganate': 'Red', 'TheCult': 'Blue', 'TheEmpire': 'Purple'}
defaults = {'bonusWestaria': {0: 0, 5: 1}, 'bonusHorde': {0: 0, 17: 1}, 'bonusIcedale': {0: 0, 29: 1}, 'bonusEmpire': {}}
variables = dict(zip(colors, ['bonusWestaria', 'bonusHorde', 'bonusIcedale', 'bonusEmpire']))
result = {}
parts = re.split(r'case CompanyInfo\.(\w+):', body)
for name, text in zip(parts[1::2], parts[2::2]):
    stages = []
    cases = re.split(r'case (\d+):', text)
    for stage, code in zip(cases[1::2], cases[2::2]):
        assert int(stage) == len(stages)
        bonuses = {key: value.copy() for key, value in defaults.items()}
        enemies = {}
        statements = re.findall(r'bonus\w+\.§_-Ta§\([^;]+;|enemyPlayers\.push\([^;]+;', code)
        for statement in statements:
            mutation = re.search(r'(bonus\w+)\.§_-Ta§\(§_-kj§\.(§[^§]+§),(\d+)\)', statement)
            if mutation:
                variable, field, value = mutation.groups()
                bonuses[variable][fields[field]] = int(value)
                continue
            enemy = re.search(r'§_-Q§\.(\w+),0,0(?:,(bonus\w+))?', statement)
            assert enemy, statement
            race, variable = enemy.groups()
            enemies[colors[race]] = bonuses[variable or variables[race]].copy()
        stages.append(enemies)
    assert len(stages) == 8
    result[campaigns[name]] = stages
out = json.dumps(result, ensure_ascii=False, separators=(',', ':'))
(root / 'ai-presets.js').write_text('/* Generated from original LevelInfo enemy presets. */\n(function(root){const presets=' + out + ';if(typeof module!=="undefined")module.exports=presets;else root.NativeAI=presets;})(typeof window!=="undefined"?window:globalThis);\n', encoding='utf-8')
print('Restored 24 original campaign AI presets.')
