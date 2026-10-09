// 自动生成 by tools/mod/regen_cc_data.js —— 独立战役静态数据(条令选牌池/兵种等级上限)
// 兵种等级上限来源: battle-data 图标花名册 IconT{n}_{线}_{兵种} (游戏真实购买体系)
// 条令来源: src_mod/_glue/1853_bd.js EdictContent 权威提取(6 参数双加成已拆平, 负值条目保留, 中文已解码)
// 运行时消费: assets/index.html 加载 assets/ui/cc_data.js(游戏侧 applyPerk) + campaign.html(选牌池编辑器)
window.__ccData = {
  TECH_MAX: {"Blue":{"Archers":3,"Cavalry":2,"Infantry":2,"Magic":2,"Siege":1},"Purple":{"Archers":2,"Cavalry":2,"Infantry":2,"Magic":2,"Siege":2},"Red":{"Archers":2,"Cavalry":3,"Infantry":2,"Magic":1,"Siege":2},"None":{"Magic":1},"Green":{"Archers":2,"Cavalry":2,"Infantry":3,"Magic":2,"Siege":1}},
  UNIT_CN: {"Infantry":"步兵","Cavalry":"骑兵","Archers":"弓手","Siege":"攻城","Magic":"法师"},
  EDICTS: [
 {
  "line": "W_THE_LORDS_CHURCH",
  "name": "主之教会-解锁圣化之旗",
  "contents": [
   {
    "bonus": 5,
    "val": 1,
    "desc": "解锁圣化之旗"
   },
   {
    "bonus": 6,
    "val": 25,
    "desc": "旗帜持续时间 +25%"
   },
   {
    "bonus": 6,
    "val": 50,
    "desc": "旗帜持续时间 +50%"
   }
  ]
 },
 {
  "line": "W_DUCAL_SOVEREIGNITY",
  "name": "公爵主权-解锁基础部队",
  "contents": [
   {
    "bonus": 0,
    "val": 0,
    "desc": "解锁基础部队"
   },
   {
    "bonus": 8,
    "val": 75,
    "desc": "开局金币 +75"
   },
   {
    "bonus": 8,
    "val": 150,
    "desc": "开局金币 +150"
   }
  ]
 },
 {
  "line": "W_CALL_FOR_THE_CRUSADE",
  "name": "圣战号召-解锁主之审判",
  "contents": [
   {
    "bonus": 9,
    "val": 1,
    "desc": "解锁主之审判"
   },
   {
    "bonus": 10,
    "val": 15,
    "desc": "主之审判伤害 +15%"
   },
   {
    "bonus": 10,
    "val": 30,
    "desc": "主之审判伤害 +30%"
   }
  ]
 },
 {
  "line": "W_TOWN_GUILDS",
  "name": "城镇行会-卫兵升级为骑士",
  "contents": [
   {
    "bonus": 0,
    "val": 1,
    "desc": "将卫兵升级为骑士"
   },
   {
    "bonus": 11,
    "val": 15,
    "desc": "要塞生命 +15%"
   },
   {
    "bonus": 11,
    "val": 30,
    "desc": "要塞生命 +30%"
   }
  ]
 },
 {
  "line": "W_THE_ZEALOTS_ORDER",
  "name": "狂热者教团-僧侣升级为狂热者",
  "contents": [
   {
    "bonus": 4,
    "val": 1,
    "desc": "将僧侣升级为狂热者"
   },
   {
    "bonus": 12,
    "val": -10,
    "desc": "终极技能冷却 -10%"
   },
   {
    "bonus": 12,
    "val": -20,
    "desc": "终极技能冷却 -20%"
   }
  ]
 },
 {
  "line": "W_MECHANICS_RESEARCH",
  "name": "机械研究-弓手升级为弩手",
  "contents": [
   {
    "bonus": 2,
    "val": 1,
    "desc": "将弓手升级为弩手"
   },
   {
    "bonus": 13,
    "val": 10,
    "desc": "弓箭 / 攻城武器伤害 +10%"
   },
   {
    "bonus": 13,
    "val": 20,
    "desc": "弓箭 / 攻城武器伤害 +20%"
   }
  ]
 },
 {
  "line": "W_HEROIC_EPOS",
  "name": "英雄史诗-解锁英雄之旗",
  "contents": [
   {
    "bonus": 14,
    "val": 1,
    "desc": "解锁英雄之旗"
   },
   {
    "bonus": 15,
    "val": 7,
    "desc": "基础士气 +7%"
   },
   {
    "bonus": 15,
    "val": 15,
    "desc": "基础士气 +15%"
   }
  ]
 },
 {
  "line": "W_REGULAR_TOURNAMENTS",
  "name": "常设比武-骑兵升级为冠军圣骑",
  "contents": [
   {
    "bonus": 1,
    "val": 1,
    "desc": "将骑兵升级为冠军圣骑"
   },
   {
    "bonus": 7,
    "val": 50,
    "desc": "骑兵冲锋伤害 +50%"
   },
   {
    "bonus": 7,
    "val": 100,
    "desc": "骑兵冲锋伤害 +100%"
   }
  ]
 },
 {
  "line": "W_LEGION",
  "name": "军团-步兵升级为神圣卫队",
  "contents": [
   {
    "bonus": 0,
    "val": 2,
    "desc": "将步兵升级为神圣卫队"
   },
   {
    "bonus": 16,
    "val": 15,
    "desc": "步兵生命 +15%"
   },
   {
    "bonus": 16,
    "val": 30,
    "desc": "步兵生命 +30%"
   }
  ]
 },
 {
  "line": "E_THE_LORDS_CHURCH",
  "name": "冥主暗堂",
  "contents": [
   {
    "bonus": 43,
    "val": 1,
    "desc": "解锁亵渎之旗"
   },
   {
    "bonus": 31,
    "val": 10,
    "desc": "坟地/矿场/方尖碑建造费用+10%"
   },
   {
    "bonus": 6,
    "val": 25,
    "desc": "旗帜持续时间+25%"
   },
   {
    "bonus": 49,
    "val": 1,
    "desc": "亵渎之旗腐蚀范围内敌军（0.5点/秒）并加强我方士气"
   },
   {
    "bonus": 38,
    "val": 1,
    "desc": "法术塔/城镇/城堡 金币/法力+1"
   }
  ]
 },
 {
  "line": "E_DUCAL_SOVEREIGNITY",
  "name": "冥权统御",
  "contents": [
   {
    "bonus": 46,
    "val": 10,
    "desc": "基础亡灵招募成本-10%"
   },
   {
    "bonus": 66,
    "val": 10,
    "desc": "亡灵部队移动速度+10%"
   },
   {
    "bonus": 45,
    "val": 15,
    "desc": "亡灵单位伤害+15%"
   },
   {
    "bonus": 52,
    "val": -12,
    "desc": "亡灵单位生命-12%（以血换伤）"
   }
  ]
 },
 {
  "line": "E_CALL_FOR_THE_CRUSADE",
  "name": "暗影号令",
  "contents": [
   {
    "bonus": 41,
    "val": 1,
    "desc": "解锁恐惧"
   },
   {
    "bonus": 35,
    "val": -10,
    "desc": "所有法术消耗-10%"
   },
   {
    "bonus": 68,
    "val": 20,
    "desc": "恐惧对命中的敌方单位造成20%伤害"
   }
  ]
 },
 {
  "line": "E_TOWN_GUILDS",
  "name": "死亡馈能",
  "contents": [
   {
    "bonus": 0,
    "val": 1,
    "desc": "步兵堕化为僵尸战士"
   },
   {
    "bonus": 50,
    "val": 40,
    "desc": "亡灵军队击杀敌军小队时 +40 金币"
   },
   {
    "bonus": 47,
    "val": 20,
    "desc": "亡灵军队击杀敌军小队时 +20 法力"
   }
  ]
 },
 {
  "line": "E_THE_ZEALOTS_ORDER",
  "name": "影魂法则",
  "contents": [
   {
    "bonus": 4,
    "val": 1,
    "desc": "刺客堕化为阴魂"
   },
   {
    "bonus": 79,
    "val": 1,
    "desc": "阴魂击杀敌方单位后瞬身攻击范围内最近的目标"
   },
   {
    "bonus": 77,
    "val": 20,
    "desc": "亡灵军队阵亡时回收 +20 金币"
   }
  ]
 },
 {
  "line": "E_MECHANICS_RESEARCH",
  "name": "亡械工坊",
  "contents": [
   {
    "bonus": 2,
    "val": 1,
    "desc": "弓手堕化为堕化射手"
   },
   {
    "bonus": 3,
    "val": 1,
    "desc": "投石车堕化为毒性投石机"
   },
   {
    "bonus": 69,
    "val": 1,
    "desc": "法术塔/城镇/城堡 补给+1"
   },
   {
    "bonus": 70,
    "val": 15,
    "desc": "远程单位对城伤害+15%"
   }
  ]
 },
 {
  "line": "E_HEROIC_EPOS",
  "name": "亡者集结",
  "contents": [
   {
    "bonus": 14,
    "val": 1,
    "desc": "解锁死者复起（法术消耗175）"
   },
   {
    "bonus": 12,
    "val": -15,
    "desc": "终极法术冷却-15%"
   },
   {
    "bonus": 71,
    "val": 1,
    "desc": "召唤的亡灵部队获得【骁锐】：生命+15%"
   },
   {
    "bonus": 55,
    "val": 3,
    "desc": "一阶兵种增员：不死战士/不死射手+3、不死骑兵/不死刺客+2"
   }
  ]
 },
 {
  "line": "E_REGULAR_TOURNAMENTS",
  "name": "暗影试炼",
  "contents": [
   {
    "bonus": 1,
    "val": 1,
    "desc": "骑士堕化为地狱战骑"
   },
   {
    "bonus": 73,
    "val": 5,
    "desc": "亡灵单位素质提升：生命+5%"
   },
   {
    "bonus": 74,
    "val": 5,
    "desc": "亡灵单位攻击速度+5%"
   },
   {
    "bonus": 26,
    "val": 6,
    "desc": "我方小队阵亡时终极技能充能+6%"
   }
  ]
 },
 {
  "line": "E_LEGION",
  "name": "帝国之怒",
  "contents": [
   {
    "bonus": 75,
    "val": 15,
    "desc": "所有亡灵单位生命值+15%"
   },
   {
    "bonus": 78,
    "val": 1,
    "desc": "法术加强：魂祭之旗回复+10%；亡灵审判100%转化范围内总血量最高的部队；亡灵召唤的军队阵亡后原地复活"
   },
   {
    "bonus": 76,
    "val": 30,
    "desc": "所有亡灵单位生命值+30%"
   }
  ]
 },
 {
  "line": "H_BLOODLUST",
  "name": "嗜血-解锁嗜血之旗",
  "contents": [
   {
    "bonus": 17,
    "val": 1,
    "desc": "解锁嗜血之旗"
   },
   {
    "bonus": 18,
    "val": 25,
    "desc": "对要塞伤害 +25%"
   },
   {
    "bonus": 18,
    "val": 50,
    "desc": "对要塞伤害 +50%"
   }
  ]
 },
 {
  "line": "H_DECLARATION_OF_WAR",
  "name": "宣战令-解锁基础部队",
  "contents": [
   {
    "bonus": 0,
    "val": 0,
    "desc": "解锁基础部队"
   },
   {
    "bonus": 19,
    "val": 10,
    "desc": "部队移动速度 +10%"
   },
   {
    "bonus": 19,
    "val": 20,
    "desc": "部队移动速度 +20%"
   }
  ]
 },
 {
  "line": "H_SPEEKING_WHIT_ANIMALS",
  "name": "与兽沟通-解锁巨人雇佣兵和石蠕虫法术",
  "contents": [
   {
    "bonus": 20,
    "val": 1,
    "desc": "解锁巨人雇佣兵和石蠕虫法术"
   },
   {
    "bonus": 21,
    "val": 2,
    "desc": "+2 条蠕虫（延长诱捕石蠕虫）"
   },
   {
    "bonus": 80,
    "val": 40,
    "desc": "野蛮人战士生命值 +40%"
   }
  ]
 },
 {
  "line": "H_3_DAYS_TO_PLUNDER",
  "name": "三日劫掠-游牧者升级为骑射者",
  "contents": [
   {
    "bonus": 1,
    "val": 1,
    "desc": "将游牧者升级为骑射者"
   },
   {
    "bonus": 22,
    "val": 75,
    "desc": "占领要塞 +75 金币"
   },
   {
    "bonus": 22,
    "val": 150,
    "desc": "占领要塞 +150 金币"
   }
  ]
 },
 {
  "line": "H_RAID_THE_TOMBS",
  "name": "掠夺古墓-战士升级为不朽者",
  "contents": [
   {
    "bonus": 0,
    "val": 1,
    "desc": "将战士升级为不朽者"
   },
   {
    "bonus": 23,
    "val": 1,
    "desc": "不朽者小队 +1 单位"
   },
   {
    "bonus": 23,
    "val": 2,
    "desc": "不朽者小队 +2 单位"
   }
  ]
 },
 {
  "line": "H_POISONS_RESEARCH",
  "name": "毒素研究-猎人升级为蛇毒弓手",
  "contents": [
   {
    "bonus": 2,
    "val": 1,
    "desc": "将猎人升级为蛇毒弓手"
   },
   {
    "bonus": 24,
    "val": 1,
    "desc": "毒伤害 +1"
   },
   {
    "bonus": 24,
    "val": 2,
    "desc": "毒伤害 +2"
   }
  ]
 },
 {
  "line": "H_DARK_TEACHING",
  "name": "黑暗教义-解锁亡魂出土",
  "contents": [
   {
    "bonus": 25,
    "val": 1,
    "desc": "解锁亡魂出土"
   },
   {
    "bonus": 26,
    "val": 3,
    "desc": "小队阵亡时终极技能充能 +3%"
   },
   {
    "bonus": 26,
    "val": 6,
    "desc": "小队阵亡时终极技能充能 +6%"
   }
  ]
 },
 {
  "line": "H_DREADFUL_MACHINERY",
  "name": "恐怖机械-投石车升级为毒性投石机",
  "contents": [
   {
    "bonus": 3,
    "val": 1,
    "desc": "将投石车升级为毒性投石机"
   },
   {
    "bonus": 27,
    "val": 50,
    "desc": "攻城武器移动速度 +50%"
   },
   {
    "bonus": 27,
    "val": 100,
    "desc": "攻城武器移动速度 +100%"
   }
  ]
 },
 {
  "line": "I_ARCANE_FROST",
  "name": "奥术寒霜-解锁冰冻",
  "contents": [
   {
    "bonus": 29,
    "val": 1,
    "desc": "解锁寒冰冲击"
   },
   {
    "bonus": 30,
    "val": 1,
    "desc": "冻结时长 +1 秒"
   },
   {
    "bonus": 30,
    "val": 2,
    "desc": "冻结时长 +2 秒"
   }
  ]
 },
 {
  "line": "I_ARTISIANS_GUILD",
  "name": "工匠行会-枪匠升级为机械枪兵",
  "contents": [
   {
    "bonus": 2,
    "val": 1,
    "desc": "将枪械师升级为机械枪兵"
   },
   {
    "bonus": 32,
    "val": 5,
    "desc": "机械单位暴击率 +5%"
   },
   {
    "bonus": 32,
    "val": 10,
    "desc": "机械单位暴击率 +10%"
   }
  ]
 },
 {
  "line": "I_REBEL_ARMY",
  "name": "反叛军-反叛者升级为冰霜战士",
  "contents": [
   {
    "bonus": 0,
    "val": 1,
    "desc": "将反叛者升级为重装战士"
   },
   {
    "bonus": 33,
    "val": 7,
    "desc": "步兵冻结概率 +7%"
   },
   {
    "bonus": 33,
    "val": 15,
    "desc": "步兵冻结概率 +15%"
   }
  ]
 },
 {
  "line": "I_MAGIC_LIBRARY",
  "name": "魔法图书馆,-解锁霜附魔",
  "contents": [
   {
    "bonus": 34,
    "val": 1,
    "desc": "解锁霜附魔"
   },
   {
    "bonus": 35,
    "val": -10,
    "desc": "法术消耗 -10%"
   },
   {
    "bonus": 35,
    "val": -20,
    "desc": "法术消耗 -20%"
   }
  ]
 },
 {
  "line": "I_LIBERATION_ARMY",
  "name": "解放军魂-解锁解放之旗",
  "contents": [
   {
    "bonus": 36,
    "val": 1,
    "desc": "解锁解放之旗"
   },
   {
    "bonus": 37,
    "val": 15,
    "desc": "小队获得经验速度 +15%"
   },
   {
    "bonus": 37,
    "val": 30,
    "desc": "小队获得经验速度 +30%"
   }
  ]
 },
 {
  "line": "I_MAGIC_ACADEMY",
  "name": "魔法学院-侍祭升级为巫师",
  "contents": [
   {
    "bonus": 4,
    "val": 1,
    "desc": "将侍祭升级为巫师"
   },
   {
    "bonus": 38,
    "val": 1,
    "desc": "魔塔提供 +1 金币/补给/法力"
   },
   {
    "bonus": 38,
    "val": 2,
    "desc": "魔塔提供 +2 金币/补给/法力"
   }
  ]
 },
 {
  "line": "I_GIANT_CONSTRUCTION",
  "name": "巨像建造-射手升级为巨型机甲",
  "contents": [
   {
    "bonus": 2,
    "val": 2,
    "desc": "将射手升级为巨型机甲"
   },
   {
    "bonus": 40,
    "val": 2,
    "desc": "巨型机甲每秒恢复 2% 生命"
   },
   {
    "bonus": 40,
    "val": 4,
    "desc": "巨型机甲每秒恢复 4% 生命"
   }
  ]
 }
]
};
