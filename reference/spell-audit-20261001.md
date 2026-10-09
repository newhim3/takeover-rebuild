# 原版 16 法术核查（2026-10-01）

依据：`../takeover拆解/extracted/swf2/scripts_clean/scripts/` 内反编译源代码、`assets/takeover/data/spells.json`、原版导出动画。本文是修改前的差异审计；不得把当前网页参数说成全部原版一致。具体屏幕动画以源时间轴和素材为准，未假称观看了未读取的视频。

## 通用规则

- 法术表：`§_-QU§/§_-Wi§.as:17–47`；普通法术、旗帜均消耗法力。`level/§_-HJ§.as:1430–1443` 调 `battle/§_-Wy§.as:593–610` 仅扣法力，没有普通法术时间冷却。`hud/GamePanel.as:478–484` 普通按钮可用性只检查法力，只有终极按钮使用充能遮罩。黑幕应表达真实充能/法力不足/锁定，不应凭空增加普通法术冷却。
- 原终极基准 200 秒，`battle/§_-Wy§.as:653`；每秒按有效魔法塔终极充能贡献累加 `§_-FI§`，失去贡献且没有强制启用时清零（:343–345, :665–671）。网页既有用户要求 120 秒应保留并说明为用户调整。阵营共享相同机制。
- 法术半径是世界坐标，`level/LevelVisual.as:53,127,168,175`：Y_KOEFF=2，屏幕 y 要乘 2 再算距离。半径 75 对应屏幕椭圆 75×37.5。当前 `dist` 普通圆使纵向作用范围加倍。
- `§_-QU§/§_-dp§.as:41–59`：旗帜持续时间乘条令6；裁决威力乘条令10；冰爆持续时间加条令30；所有普通法术成本乘条令35。沙虫额外时长单独加条令21；条令23增加不朽军团人数。
- 所有终极先播放阵营原版全屏宣告 MovieClip，在结束后才执行法术（`level/Level.as:241–300`）。对应 Green=UltimateMessage1Class, Red=2, Purple=3, Blue=4。当前全部缺失。

## 每个法术

| ID/国家 | 原表 法力/半径/威力/持续 | 原行为与源码 | 修改前主要差异 |
|---|---|---|---|
|0 Green 裁决|150 /75 /60 /30|`Level:672–677`→`§_-HJ§:1148–1179`：对范围内敌方每名成员造成随机 30–60% **单兵最大生命** 的远程伤害；条令10改变上界。SpellThunderClass。|网页 flat 60×队人数，低血兵团必死，高血单位失真；没有原伤害类型减伤|
|1 Green 治疗旗帜|50 /75 /10 /12|`Level:613–628`; BannerHeal 每 .5 秒 (:51–60) 调 FSquad→`§_-Eg§:255–275`：每队共 10 HP，先治疗受伤成员，再复活死亡成员；排除 Mechanism (:76)。地面 BannerAuraHealClass+旗杆 BannerHealClass。|网页每秒10×队人数，通常更强；复活依赖总HP模型仅在尚存队伍有效；缺旗杆|
|2 Green 英雄旗帜|70 /75 /2 /12|`Level:597–609`; BannerHeroism:50–70→`§_-Eg§:673–679`进入英雄士气（伤害1.5×）；机械/亡灵士气锁有效。地面 BannerAuraHeroismClass+BannerHeroismClass。|网页仅停留区内瞬时buff，离开 .5s 消失；忽略机械/亡灵士气锁|
|3 Green 降临|1 /0 /0 /0|`Level:395–419`：在自方据点附近生成 Avatar，不由鼠标任意选点；SignOfAdventEffectClass+AvatarBackLightEffectClass在单位后+AvatarFrontLightEffectClass在前。Avatar 原部队资料 `battle/§_-DM§:93`。|当前鼠标任意点召唤、只后光且错误大小；任意40秒寿命没有从表证明|
|4 Red 沙虫|100 /75 /8 /10|`Level:510–549`; `§_-bz§/§_-1q§:28–38`在动画repeatCounter变化时攻击，非连续每秒攻击；每次魔法伤害随机4–8/单兵，并 `§_-HJ§:1125–1146`伤敌方建筑相同数值，建筑范围还包含建筑碰撞半径；StoneWormsEffectClass+StonewormsExplosionEffect。|当前连续8×members每秒且不伤建筑，无爆炸和击退，攻击节奏错误|
|5 Red 出土不朽军团|250 /75 /3 /0|`Level:552–563`→`battle/§_-DM§.§_-1T§`固定不朽军团，RaiseDeadSpellEffectClass。玩家选点，AI在本方据点附近。|当前固定Red Infantry tech2需核对 §_-1T§ 是否确为同记录；不能让条令tech覆盖固定召唤|
|6 Red 嗜血旗帜|50 /75 /4 /12|`Level:565–579`; BannerBloodlust→`§_-Eg§:681–703`每 .5 秒更新范围内单兵伤害加4，地面 BannerEffectBloodlustClass+BannerBloodlustClass。|效果近似正确，但缺旗杆且区内周期应固定 .5s|
|7 Red 天灾|1 /150 /8 /0|`Level:454–507`：30轮×每轮3发=90枚陨石，延迟 i*.2+k*.05，范围随机可通行地形。FireballEffectClass播完后命中，随机4–8魔法伤害/单兵，**所有阵营**被伤。建筑两次半伤调用：所有建筑先dmg/2，敌方再dmg/2，所以敌方dmg、己方dmg/2；爆炸FireBallExplosionClass+地面CraterFromExplosionClass留7秒并抖屏。|网页全地图立即420敌伤/60己伤、建筑380/60，完全不同；没有陨石、落点、弹道和时序|
|8 Blue 冰爆|100 /75 /6 /5|`Level:702–733`：IceBlastEffectClass降落弹体结束后施加冰冻，再IceBlastExplosionClass；源码局部dmg=6未加入伤害集合，**不应额外加伤害**。|当前立即冻结，缺弹体；冰爆保护判定需同原负面效果碰撞|
|9 Blue 冰霜附魔|150 /75 /25 /10|`Level:680–699`→`§_-Eg§:591–612`：范围内自军成员造成最大随机伤害，少受25%；FrostEncahntmentEffectClass（原拼写）。|网页用IceBlastEffectClass，特效错；总队简单buff跨范围成员失真|
|10 Blue 解放旗帜|50 /75 /3 /12|`Level:581–594`; BannerOfLiberation→`§_-Eg§:651–670`→`§_-eB§:569–572` setSpellDefence，`§implements§/§_-vg§:148–151`保护状态默认2个逻辑update，旗帜 .5s 重施；BannerLiberationEffectClass+BannerLiberationClass。|当前部分保护逻辑且没有完整清除负面效果，不能把“治疗”mode误解成加HP；缺旗杆|
|11 Blue 大转化|1 /0 /20 /0|`Level:357–393`：排除Bandits，遍历敌方所有部队的**单兵**，交替杀一名留一名，每名被杀者随机给金币20 **或** 法力20；每支受影响队伍播GrandTransformationEffectClass。|网页杀随机半数整队，每队同时金币+20法力+20，伤害和经济都错；把食人魔列入敌人也错|
|12 Purple 恐惧|100 /75 /1 /0|`Level:735–756`→`§_-Eg§:629–648`：受保护或士气锁不受影响；英雄→正常，正常→恐惧；Discipline阻止恐惧。三层：TerrorSpellEffectClass、TerrorFlyingBatEffectClass单位层，TerrorSplashEffectClass地面层。|网页英雄清零同时10秒固定削弱，未遵守二选一及免疫；缺蝙蝠和地面|
|13 Purple 亡者复生|250 /75 /1 /0|`Level:435–452`随机§_-FM§/§_-pZ§原亡灵步兵/射手，RaiseDeadSpellEffectClass。|应核对生成原固定亡灵记录，而非取玩家条令升级的普通兵种；AI同原在本方据点|
|14 Purple 亵渎旗帜|75 /75 /10 /12|`Level:630–644`同BannerHeal。地面BannerAuraDesecrationClass+BannerDesecrationClass。|同治疗旗帜过量治疗/缺旗杆问题|
|15 Purple 墓穴召唤|1 /0 /2 /0|`Level:304–355`随机选择 **2** 个可影响非机械敌方活部队，杀旧队，按原兵种生成本方对应亡灵队；TerrorSpellEffectClass。原提示1–3与当前SWF的 power2/runtime2存在文案差异，落实代码2。|网页取前3队、保留残血和等级、可转机械、RaiseDead特效，全错|

## 机制注意

- 机械、亡灵都锁士气（`§implements§/§_-LJ§:48–51`, `§_-u3§:39–43`）；Discipline只锁恐惧（`§_-iR§:27–30`）。不要给它们英雄/恐惧状态。机械不被治疗、墓穴召唤，亡灵可以治疗。
- 沙虫每次 `§_-br§`还击退敌成员 (`§_-HJ§:1270–1290`)；天灾把 param3=true 禁用击退。
- 沙虫/天灾建筑伤害的进一步追踪：`level/§_-oJ§.as:385–387`把传入威力作为最大生命百分比，调用 `§implements§/§_-§.as:29–31` = int(maxHP*power/100+.5)。沙虫每次4–8是建筑4–8%最大HP，不是4–8HP：1000HP城堡40–80，500HP城镇20–40。表格上文的“相同数值”只指传入参数，不能按绝对HP实现。天灾两次半伤也都是该百分比转换。建筑碰撞半径固定50世界单位（`§_-oJ§:270–273`），原命中条件 distance²−50²≤spellRadius²。
- 原建筑基准HP确实Castle1000、Town/Camp/MageTower500（`§_-oJ§:217–258`）；建筑升级实际maxHP=base*(1+levelIndex*.5)，当前每级+180是适配值。
- 原沙虫动画40帧。`ResourceManager.as:39–42`固定30fps，默认transition计算(:45–65)无标签则起帧1/终帧39/时间(39−1)/30≈1.2667秒；沙虫继承BannerHeal的 .5秒检查，所以命中不是每帧、也不是简单8HP/s。应按原transition循环触发，.5秒探测最多引入检查量化。
- 当前渲染所有法术都任意 y+60、缩放至230px宽、40/48fps，这是最直接的错误来源。使用 `spell-pivots.js`原坐标和scale1；原帧率30，非循环短特效播放完即移除；旗帜与沙虫用原循环；长的弹体不要按宽度拉至统一大小。
- 原终极宣告时长：Message1=35/30秒、Message2=50/30、Message3=52/30、Message4=52/30。战场effect正常无标签transition源码取(N−2)/30，例如Fireball15帧≈.433秒、冰爆13帧≈.367秒；接近30fps真实播放时可取(N−1)/30，但必须明确源头。

## 素材清单

当前 `assets/takeover/anim/`（GAME_DATA manifest sheet根）已经有全部上述命名动画。
特效注册点详见 `reference/spell-pivots/audit.json`；包含宣告、旗杆、光环、沙虫、陨石、冰爆、恐惧三层、Avatar前后光。原PNG额外filter padding需要计入pivot，不可直接凭宽高猜底中心。
