# 原战役入口悬停素材 r19

本批先导出可用原素材供接入，再替换旧反馈。没有删减现有入口效果；实际 CSS 与入口预载由主线程完成。没有用其他国家的图替代黑暗帝国。

运行素材：`assets/takeover/ui/native-campaign-hover-Green.webp`、`native-campaign-hover-Blue.webp`、`native-campaign-hover-Red.webp`。自动注册表 `native-campaign-hover-assets.js` 记录各文件实际内容哈希、尺寸与帧数，不能手写旧哈希。

## 原来源

本地已拆解 `../takeover拆解/scratch/surgery/inner.swf` 的三个原入口父符号：绿国 6674、冰国 6690、红国 6706，`_up` 为第 1 帧、`_over` 为第 11 帧、`_down` 为第 21 帧；冰、红的 `_disabled` 为第 31 帧。当前已有 `native-campaign-flag-*.svg` 来自 `scrChooseCampaignClass` 6708 第 1 帧中的对应入口子组，因此是常态素材。

本次用 FFDec 26.3.0 的 `-selectid 6674,6690,6706 -select 6674:11,6690:11,6706:11 -sublength 10 -format sprite:svg` 导出原悬停父级，不单独把一个发光形状放大冒充原动画。

父级保留本国旗布、人物、徽章、原悬停 RGB 变换、阴影及逐帧变形。三国的十帧子时间轴分别为 6672、6685、6702；内部原形变段分别为 6669→6670→6671、6682→6683→6684、6699→6700→6701。源 SWF 为 30 fps，子时间轴没有停止帧脚本绑定或动作，因此按原默认循环编码。英文说明、`mcRankBlock`、`mcNewGameMessage`、文字字段和透明 `_hitArea` 仅从显示引用移除，供现有中文与真实交互覆盖；原图形及其滤镜保留，完整未清理源帧仍在 `parent-svg` 可对照。

## 画幅与检查

全部帧与现有原旗帜采用相同注册视口 `-150 -245 300 490`，运行位图为 450×735，即原画幅的 1.5 倍。每国 10 帧；delay 采用 33/33/34 毫秒的累计整数近似，一轮 333 毫秒；WebP 原生无限循环，无需引入运行库。三国全部解码成 RGBA 的帧数据合计约 37.9 MiB。

`normal-over-1-5-10.png` 列顺序为绿、冰、红；四行依次为当前常态、原悬停第 1、5、10 帧。已目视检查人物、徽章、旗布和轮廓仍存在，原亮边随帧变化。此图属于离线原帧对照，不代表浏览器入口或所有界面已实测。

`audit.json` 记录 30 帧的尺寸、可见范围、帧哈希及编码检查。冰国下尖角有 7 个抗锯齿像素接触原画幅最后一行；另用扩大至 `-170 -265 340 530` 的画幅检查全部帧，原画幅之外非透明像素均为 0，确认不是尖角或阴影被裁掉。编码后重新解码的可见像素及 alpha 与原帧逐一一致。原滤镜带来的暗化和亮边不由 CSS 自行拟造。

## 可复现导出

使用现有 Python 运行 `tools/restore-native-campaign-hover.py`，它调用原 FFDec、按原注册点清理动态英文占位，再调用 `tools/pack-native-campaign-hover.cjs` 的 Sharp 无损编码、外圈检查及哈希输出。`--skip-export` 可复用已保留 FFDec 源帧；不清理或删除参考文件。不同机器可用 `TAKEOVER_SOURCE_SWF`、`FFDEC_CLI`、`TAKEOVER_NODE`、`TAKEOVER_SHARP` 指定现有本地工具路径。

接入时按 `NativeCampaignHoverAssets` 预载实际哈希 URL，完成解码后才切换现有旗帜 `<img>` 的原悬停动画并停止旧的 CSS 缩放；退出悬停恢复原常态。未加载或加载失败时保留当前反馈，不能提前删掉旧反馈。黑暗帝国继续其原布与真实帝国徽章适配，保留现有反馈；本资料没有独立第四国原悬停动画。
