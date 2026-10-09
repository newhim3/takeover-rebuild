'use strict';
// Summarize existing zero-time audits. This tool never starts a game loop.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name)),json=name=>JSON.parse(read(name)),hash=name=>crypto.createHash('sha256').update(read(name)).digest('hex');
const economy=json('.tools/r22-campaign-economy-audit.json'),routes=json('.tools/r22-route-audit.json'),edicts=json('.tools/r22-campaign-edicts-supplement.json'),before=json('.tools/r21-source-check.json'),D=require('../difficulty');
assert.equal(economy.rows.length,64);assert.equal(routes.rows.length,64);
for(const [name,expected]of Object.entries({...before.protected,...before.aiUnchanged,...before.sourceHashes,...economy.sourceHashes,...routes.sourceHashes}))assert.equal(hash(name),expected,name+' source unchanged');
for(const row of economy.rows){const route=routes.rows.find(r=>r.country===row.country&&r.stage===row.stage);assert(route&&route.level===row.map);assert.equal(row.modes.normal.player.capacity,route.player.cap);assert.equal(row.modes.normal.player.goldRate,route.player.goldRate);assert(route.allReachable);}
const names={Green:'翡翠王国（绿国）',Red:'赤焰部落（红国）',Blue:'凛冬教团（雪国）',Purple:'黑暗帝国'},short={Green:'绿',Red:'红',Blue:'雪',Purple:'黑'},home=n=>[n.castles&&n.castles+'堡',n.towns&&n.towns+'镇',n.towers&&n.towers+'塔'].filter(Boolean).join('+');
const baselineRisk=row=>row.country==='Blue'&&[24,26,28].includes(row.map)?'需结合学院条令':row.risk==='red'?(row.country==='Blue'?'人口/经济互斥':'终关领土悬殊'):row.risk==='yellow'?'一般逆风':'未触发基础风险阈值';
const lines=[
'# 战役全关卡实力核查 r22',
'',
'2026-10-09。覆盖四国各 16 关、共 64 个关卡起点，并检查五种难度配置。普通/噩梦各构造一次初始战场，查询现有道路；另定点核对雪国合法条令方案。逻辑时间保持为零，没有推进 AI、战斗或浏览器实玩。',
'',
'## 结论',
'',
'没有发现因道路不通、没有己方据点或无可招募兵种造成的确定无解。确实存在悬殊的领土与发展空间：四国最终关都是重点，雪国第 12、14 关的单城镇与唯一建筑位也有明显常规补兵瓶颈。**静态经济与路网检查不足以证明绝对无解，更不足以证明所有关卡都已平衡。**',
'',
'最初仅按两项基础条令统计出 8 个重点配置，不能把它们直接说成 8 个无解关卡。雪国第 11、13、16 关的塔开局，能够通过原“魔法学院”解除基础人口瓶颈，且首通奖励已经足够点亮。下面分别说明基础起点、合法配点与路线机会。',
'',
'## 起步规则和难度',
'',
'普通在基础条令下双方各 300 金、70 法力，第 2 关起双方各真实支付 100 金买一队步兵，所以开局画面余额 200。附属建筑全为空，没有预建金矿，也没有每座敌堡免费一队兵。城堡多提供的是领土、人口、收入及兵种入口；当前招兵立即付费和显示，并不存在每堡独立自动训练产线。',
'',
'| 难度 | 敌军一次性额外金币 / 法力 | 发展期 | 决策间隔 | 起始敌城堡等级 |',
'| --- | ---: | ---: | ---: | ---: |'
];
for(const name of D.order){const d=D.get(name);lines.push('| '+d.label+' | '+d.initialAIGold+' / '+d.initialAIMana+' | '+d.opening+' 秒 | '+d.decision+' 秒 | '+d.initialCastle+' |');}
lines.push('',
'这些难度数值是已存在的设置。十秒发展期仍允许遇袭防守；较高难度的资源差为一次性，真实招兵、建造、升级都须付费。',
'',
'基础条令费用：步兵 100、弓手 120、骑兵 180、攻城车 200、法师 150。农庄 70 金增加 1 队常规人口，金矿 90 金增加 1.8 金/秒，方尖碑 100 金增加 0.9 法力/秒。城堡基础人口 2，可招步/弓/骑/车；城镇人口 1，可招步/弓；塔人口 1，可招步/法。其它条令会改变这些费用与容量。',
'',
'## 最终关和雪国的区别',
'',
'| 配置（基础两条令） | 玩家起点 | 最大单敌国起点 | 常规人口 | 基础金币/秒 | 玩家 / 敌建筑位 |',
'| --- | --- | --- | ---: | ---: | ---: |');
for(const country of Object.keys(names)){const row=economy.rows.find(r=>r.country===country&&r.stage===16),p=row.modes.normal.player,e=row.modes.normal.enemies.reduce((a,b)=>a.capacity>=b.capacity?a:b);lines.push('| '+names[country]+'第 16 关 | '+home(p)+' | '+home(e)+' | '+p.capacity+' : '+e.capacity+' | '+p.goldRate+' : '+e.goldRate+' | '+p.slots+' / '+e.slots+' |');}
lines.push('',
'基础收入 1:4 时，不计任何其它支出，一队 100 金步兵需要积累 100 秒与 25 秒。这是补兵预算差，不是 AI 实际每隔多少秒一定出兵。已有现金可先花完，建筑、宝箱、战损和法术也会改变之后的局面。',
'',
'### 雪国魔法学院不能漏算',
'',
'学院 n25 的门槛是已投入至少 11 点。合法 13 点方案 `{19:3,20:3,21:3,22:2,25:2}` 获得每塔 +1；合法 14 点方案将 25 点至三级，获得每塔 +2 人口、+2 金/秒、+2 法力/秒。当前战役首次通关至第 9 关，进入第 10 关前已经有 14 点；第 11、12 关前仍有 14 点，第 13、14 关前有 16 点，第 16 关前有 20 点，无须刷关才取得学院。',
'',
'因此雪国第 11、13、16 关（原地图 24、26、28）的单塔，在满学院下是 3 常规人口、3 金/秒、2.65 法力/秒；唯一位建农庄可到 4 人口，建矿则维持 3 人口并达到 4.8 金/秒。上述合法方案同时含建筑七折，农庄 49、金矿 63。普通敌国遵循现有共通属性映射，敌方塔也取得同样学院收益：雪国最终关实际可成为人口 3:13、基础收入 3:6，仍逆风，却不是裸配置的 1:11、1:4。',
'',
'雪国第 12、14 关（原地图 25、27）只有城镇，学院没有起始塔可以生效。唯一位在农庄与金矿之间互斥：维持常规两队补兵需农庄，无法同时放矿；改矿可以增加收入，但常规招募容量仍只有一队。拆农庄换矿可以暂时保留已招的部队，并不增加后续补兵容量。宝箱能给钱，不能直接增加槽位或容量。这里比单塔关卡更值得优先调整起点或争夺机会。',
'',
'### 法术和混战的例外',
'',
'常规人口不是所有场上部队的绝对上限。黑暗审判的转化条令、终极半数转化和绿国终极巨人可以合法超过常规招募容量；红/黑普通召唤仍检查容量。雪国城镇开局没有塔，终极法术须先获得有效塔再开始蓄能。多敌国互相敌对，不能把它们的金币和部队相加当成同一个联盟。',
'',
'## 偷据点和宝箱是否能即时补偿',
'',
'所有据点、箱子均有可达原道路，但所有 64 个配置都没有中立据点；扩张要先击破完整敌据点。以雪国最终关、基础条令满员单步兵为例：最近敌堡行军约 11.4 秒；最近 500 血城镇行军 19.4 秒，理想无干扰拆镇约 29.6 秒，单队修复约 41.7 秒，敌从邻堡支援该镇只需约 11.8 秒。偷到完整资源据点不是可靠的即时回本入口。',
'',
'同关最近箱子行军约 10 秒，单队满员平均伤害计算击倒食人魔还需约 30.8 秒；敌军到箱子约 13.3 秒。实际命中、击退、损员和争夺会更慢。这里保留升级、旗帜、多队集火等玩家策略，不能把这组裸步兵时间当作所有配点的耗时。',
'',
'## 全部 64 关起点清单',
'',
'以下统一为本国初始两条令的普通配置。人口单位是整队常规招募容量；建筑位为空位数。敌人按国家分别列出，格式为“起点 / 人口 / 金币每秒”。基础风险分类用于定位配置，不是胜率和无解判定。学院相关例外已在对应行注明。');
for(const country of Object.keys(names)){
 lines.push('','### '+names[country],'','| 当前关号 / 原地图 | 玩家起点 | 人口 / 建筑位 | 金/秒 | 各敌国起点、人口、金/秒 | 关注项 |','| --- | --- | ---: | ---: | --- | --- |');
 for(const row of economy.rows.filter(r=>r.country===country)){const p=row.modes.normal.player;lines.push('| '+row.stage+' / '+row.map+' | '+home(p)+' | '+p.capacity+' / '+p.slots+' | '+p.goldRate+' | '+row.modes.normal.enemies.map(e=>short[e.owner]+'：'+home(e)+' / '+e.capacity+' / '+e.goldRate).join('；')+' | '+baselineRisk(row)+' |');}
}
lines.push('',
'## 可复核的经济情景与后续调整方向',
'',
'完整 CSV/JSON 另列 60、120 秒现金比较：固定起始领地，不取箱、作战、占领、升级、拆除或追加招兵；在零时支付所需农庄后，矿场可负担就付费建，在各矿数中选择窗口末余额最高者。这只是受限开发模型，不是全局最优策略或实际 AI 的资源轨迹。雪国最终关裸配置的“最大现金”方案占唯一位建矿，仍只有一队人口，不能拿该余额同时假设已有四队兵。',
'',
'优先考虑雪国第 12、14 关的发展入口：复用同一原地形已有的其它起点配置，或将一个现存边界据点设为可争夺中立资源点；保留主敌国优势、原道路和建筑位置。最终关应保留逆风，但需确认玩家有能兑现的资源或法术破局路线。学院可解的塔关先检查提示与合法配点，不应仅因裸条令人口小就把敌主堡清掉。不能用任意补金币来掩盖建筑位和常规容量的限制。',
'',
'本轮交付核查结果，运行关卡配置、UI、AI 策略、兵种数值、法术效果和交付构建保持 r21。未使用静态风险表替用户实玩，也没有声称关卡全部可赢。',
'',
'复核数据：`reference/r22-campaign-configurations.csv`、`.tools/r22-campaign-economy-audit.json`、`.tools/r22-campaign-edicts-supplement.json`、`.tools/r22-route-audit.json`。工具记录了对应源文件 SHA-256；旧 r17–r21 审计记录保留。'
);
fs.copyFileSync(path.join(root,'.tools/r22-campaign-economy-audit.csv'),path.join(root,'reference/r22-campaign-configurations.csv'));
fs.writeFileSync(path.join(root,'reference/战役全关卡实力核查-r22-20261009.md'),lines.join('\n')+'\n');
fs.writeFileSync(path.join(root,'.tools/r22-source-check.json'),JSON.stringify({version:'r22-audit',date:'2026-10-09',build:before.build,entries:64,scenario:'Initial two edicts plus bounded legal Snow Academy supplement',scope:'Audit only; runtime sources retain r21 hashes. Zero battle time; no AI decision, browser play or win-rate assertion.',sourceHashes:{...economy.sourceHashes,...routes.sourceHashes},auditHashes:Object.fromEntries(['.tools/r22-campaign-economy-audit.json','.tools/r22-campaign-edicts-supplement.json','.tools/r22-route-audit.json'].map(name=>[name,hash(name)])),priorRecordHash:hash('.tools/r21-source-check.json'),riskClassification: 'Baseline red counts are not impossibility counts; Snow tower starts depend on legal Academy allocation.',edictsSupplementPresent:!!edicts},null,2)+'\n');
console.log({entries:64,build:before.build,sourceProtection:'r21 hashes match',report:'reference/战役全关卡实力核查-r22-20261009.md'});
