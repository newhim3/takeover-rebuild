# r19 原动作核对

2026-10-08，按本地原 SWF 动作、导出的 AS 显示调用、当前精灵表和原注册点核对。没有接入外部游戏源码，没有改变 AI、射程、数值、攻击间隔或命中时点。

| 显示项目 | 原依据 | 本次显示 helper |
| --- | --- | --- |
| 待命 | `§_-qG§/§_-xJ§.as:348–353` 的 `changeAnimTo_Stand` 切到 PHASE_ID_DIE，设置帧 0 并停止动画 | 本兵种、本朝向 `_Die` 帧 0；不为成员叠加走路相位 |
| 距离攻击 | 同文件 326–329 的 `changeAnimTo_DistanceAttack` 固定 PHASE_ID_ATTACK1 | `_Attack` |
| 远程兵近身攻击 | 同文件 310–324，若有第二动作且单位具备距离攻击，固定 PHASE_ID_ATTACK2 | 仅存在原 SpecialA 和确证注册点时使用；由服务端记录开始攻击的距离阶段 |
| 纯近战双动作 | 同文件 313–324，原两种动作各约一半 | ID 与单次攻击显示序号交替选动作，避免逐帧随机和消耗战斗随机序列 |
| 完全冻结 | 现行逻辑已经停止冻结单位，但显示会重选 idle 动作 | Battle 身份加 unit.id 缓存最后显示动作和帧；支持网络快照重新建立单位对象 |

`UnitAnimNameModifier.as:8–18` 明确 `_Attack` 是 phase 2，`SpecialA` 是 phase 3，`SpecialB` 才是 phase 4。本次不随机播放全部 Special 系列，也不因文件名带 Special 就套到法术。

76 张 SpecialA 的原注册点从现有 `takeover拆解/scratch/surgery/nohit.swf` 相同兵种符号的首帧 SVG 外层 origin 矩阵取得；与此前 `tools/restore-unit-pivots.py` 的方法相同。记录见 `registration.json`，对应原 SVG 也保留。FFDec 导出额外完整动作帧仅存在参考目录，未加入游戏资源包。`native-poses.png` 是原位图离线取帧与注册点组合，不是生成图，也不是浏览器实玩证明。

接口：`attackPhase(u,ranged)` 返回 2 或 3；`pose(battle,u,time,sprites)` 返回 action、facing、frame、walking；`keys(u,sprites)` 只包含当前兵种科技级对应四方向 Go、Attack、Die 和确证的 SpecialA。注册点在 `pivots`。显示使用现有 `attackDuration`，不会修改攻击的命中时间。

## 死亡和命中来源补充

此前未核清的尸体显示时限，本次找到了完整调用：`§_-eB§.as:295–298` 死亡状态进入时重置计时；108–116 累积到大于 3 秒后发 16384；396–400 在死亡状态收此信号执行 `changeAnimTo_CorpseToGrave`；`§_-xJ§.as:381–384` 将成员显示标记关闭。因此原尸体总显示约从死亡开始算 3 秒，不是倒下结束再额外 3 秒。

`FSquad.as:511–514` 在倒下动画完成时转尸体层；`RasterGraphicLayer.as:8–14` 顺序是地面、尸体、路径、单位。倒下阶段仍属于单位层，完整倒下后应处于活兵和路径之下。现网页一轮倒下结束直接删、整队只表现一次，还未等同逐成员原死亡显示；根任务会按这个明确依据决定本轮接入范围。

普通近战的 `§_-eB§.as:235–259` 和距离命中 262–286 只调伤害或溅射事件；`Level.as:172–180` 仅为 Siege 溅射增加 `ExplosionClass`。未找到现网页通用五条金线命中星的原调用，因此可以去掉该自绘覆盖；不能改为随机套用其他法术爆炸。

普通箭仍应保留原代码绘制。`§_-xJ§.as` 原绘制路径用黑色当前段及绿色前一段，原版没有应当强行寻找的普通箭独立贴图。冰国子弹、攻城投射物和对应修士弹使用其已有原符号；本次不修改这些兵种规则。

## 必要检查

`tools/check-r19-animation.cjs` 12 项短显示夹具与语法核对通过：76 项原注册点、四国四方向站立、距离/近身分派、近战单次稳定选择、无战斗 RNG、保留现有时长、行走相位、冻结跨快照保持、新局缓存隔离、局部预热、缺素材回退。未跑战役、没有浏览器游玩，没有宣称全部动画或实际手感已验证。
