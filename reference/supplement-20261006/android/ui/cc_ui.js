// cc_ui.js —— 独立战役运行时 UI/进度库(补丁 026 消费; 由 assets/index.html 加载)
// 进度存 localStorage['cc_save_v1'][campaignId], 与官方存档完全隔离。
/* [CC] 诊断日志(真机定位用; 全链路观察后可移除) */
function ccLog() { try { var p = ['[CC]']; for (var i = 0; i < arguments.length; i++) p.push(arguments[i]); console.log.apply(console, p); } catch (e) { } }
/* 引擎闭包符号桥(由补丁 026 三处冗余设置): 外部脚本看不见引擎 var 声明, 必须经桥访问 */
function ccBridge() { return window.__ccBridge || null; }
/* 卡池条件: 玩家是否拥有某项前置强化(id 或名称匹配) */
function ccHasPerk(st, id) { return !!id && st.perks.some(function (p) { return p.id === id || p.bn === id; }); }
/* 选项解析: 带 req 前置条件不满足 → 用 alt 替代(可链式) */
function ccResolveItem(it, st) { while (it && it.req && !ccHasPerk(st, it.req)) it = it.alt || null; return it; }
/* 选项 → 存档 perk 的归一化: 多重加成(bonuses)与单加成(bonus/val)统一成 pairs */
function ccPairsOf(p) { return p.pairs || (p.bonuses ? p.bonuses.slice() : (p.bonus != null ? [[p.bonus, p.val || 0]] : [])); }
/* 无中生有(ult_wild): 从本战役 rewardTable 收集所有未选过的卡, 随机补发 2 张(不再弹窗, 直接进档) */
function ccWildGrant(camp, st) {
  try {
    var seen = {}, pool = [];
    st.perks.forEach(function (p) { if (p.id) seen[p.id] = 1; });
    var tb = (camp && camp.rewardTable) || {};
    var walk = function (it) { if (!it) return; if (it.id && !seen[it.id] && it.id !== 'ult_wild') pool.push(it); if (it.alt) walk(it.alt); };
    Object.keys(tb).forEach(function (k) {
      if (k[0] === '_') return;
      var v = tb[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') { (v.then || []).forEach(walk); (v.else || []).forEach(walk); }
    });
    if (!pool.length) { ccLog('wild: 无未选卡可补'); return []; }
    var got = [];
    for (var i = 0; i < 2 && pool.length; i++) {
      var j = Math.floor(Math.random() * pool.length);
      var c = pool.splice(j, 1)[0];
      st.perks.push({ id: c.id || null, bn: c.bn || c.id, edict: c.key || c.edict || null, pairs: ccPairsOf(c), gold: c.gold || 0, mana: c.mana || 0 });
      got.push(c.bn || c.id);
    }
    ccLog('wild: 无中生有补发 ' + got.join('、'));
    return got;
  } catch (e) { ccLog('wild ERROR: ' + (e && e.message)); return []; }
}
function applyPerk(bn, p) {
  try {
    if (p.edict || p.key) {
      var line = p.edict || p.key;
      var ed = null;
      (window.__ccData.EDICTS || []).forEach(function (e) { if (e.line === line) ed = e; });
      if (ed) {
        var maxBy = {};
        ed.contents.forEach(function (ct) { maxBy[ct.bonus] = Math.max(maxBy[ct.bonus] || 0, ct.val); });
        for (var b in maxBy) bn.setBonus(+b, maxBy[b]);
      }
      return;
    }
    if (p.bonus != null) bn.setBonus(p.bonus, p.val || 0);
  } catch (e) { }
}
window.__ccUI = {
  _onTop: false, /* 覆盖层互斥锁: 结算信号可能重复触发, 已开覆盖层时吞掉后续事件(防无限弹窗) */
  /* 战役内容指纹: 关卡表/奖励表/终局奖 任一改动 → 旧档 perks 作废(地图进度保留); 两处实现(ccFingerprint)必须一致 */
  fp: function (camp) {
    var s = '';
    try { s = JSON.stringify({ lv: camp.lv || {}, rt: camp.rewardTable || null, fr: camp.finalReward || null }); } catch (e) { }
    var h = 5381;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff; }
    return h.toString(36);
  },
  st: function () {
    try {
      var id = window.__ccActive;
      if (!id) return { unlocked: 1, cleared: {}, perks: [] }; /* 非 cc 模式绝不落盘 */
      var all = {};
      try { var s0 = localStorage.getItem('cc_save_v1'); all = s0 ? JSON.parse(s0) : {}; } catch (e0) { all = {}; }
      /* reset=1: 手动清档(一次性, 由 index.html 从 URL 解析) */
      try {
        if (sessionStorage.getItem('__ccReset')) {
          delete all[id];
          sessionStorage.removeItem('__ccReset');
          ccLog('存档已重置(reset=1)');
        }
      } catch (e1) { }
      var fresh = { unlocked: 1, cleared: {}, perks: [] };
      var camp = this.camp();
      if (camp) fresh.fp = this.fp(camp);
      var cur = all[id];
      if (!cur || typeof cur.unlocked !== 'number') cur = fresh;
      /* 指纹不符 → 只清选牌(奖励内容变了, 旧选牌可能失效), 地图进度保留 */
      if (fresh.fp && cur.fp !== fresh.fp) {
        ccLog('奖励内容已变更 → 选牌清空, 地图进度保留');
        cur = { fp: fresh.fp, unlocked: cur.unlocked || 1, cleared: cur.cleared || {}, perks: [] };
      }
      if (!cur.fp && fresh.fp) cur.fp = fresh.fp;
      all[id] = cur;
      try { localStorage.setItem('cc_save_v1', JSON.stringify(all)); } catch (e2) { }
      return cur;
    } catch (e) { return { unlocked: 1, cleared: {}, perks: [] }; }
  },
  save: function (st) {
    try {
      if (!window.__ccActive) return;
      var s = localStorage.getItem('cc_save_v1');
      var all = s ? JSON.parse(s) : {};
      all[window.__ccActive] = st;
      localStorage.setItem('cc_save_v1', JSON.stringify(all));
    } catch (e) { }
  },
  camp: function () {
    try { return window.__mapLevels.__cc[window.__ccActive]; } catch (e) { return null; }
  },
  psum: function (st, k) { var v = 0; st.perks.forEach(function (p) { v += (p[k] || 0); }); return v; },
  avail: function (Zp) {
    try {
      if (!window.__ccActive) return Zp.getAvailableLevelCount();
      return Math.min(10, this.st().unlocked);
    } catch (e) { return 1; }
  },
  stars: function () {
    try {
      var st = this.st(); var a = [];
      for (var i = 1; i <= 10; i++) a[i] = st.cleared[i] ? st.cleared[i].status : 0;
      return a;
    } catch (e) { return []; }
  },
  terr: function (rows) {
    try {
      var st = this.st();
      var row = Math.max(0, Math.min(rows.length - 1, st.unlocked - (st.unlocked >= 10 ? 0 : 1)));
      return rows[row];
    } catch (e) { return rows[0]; }
  },
  hideMeta: function (scr) {
    try {
      var B = ccBridge(); if (!B) { ccLog('hideMeta: no bridge, skip'); return; }
      var a = B.Ew.Find(scr.scr_, 'button_edicts_'); a && a.set_visible(false);
      var b = B.Ew.Find(scr.main_l_, 'button_badges_'); b && b.set_visible(false);
    } catch (e) { }
  },
  player: function (Zb) {
    try {
      if (!window.__ccActive) return null;
      var B = ccBridge();
      var cp = this.camp(); if (!cp) return null;
      var st = this.st();
      var order = (Zb && Zb.m_levelNum != null) ? (Zb.m_levelNum + 1) : st.unlocked;
      var Lv = null;
      cp.levels.forEach(function (L) { if (L.order === order) Lv = L; });
      if (!Lv) Lv = cp.levels[0];
      if (!B || !B.CR || !B.CB || !B.CD || !B.CDe) { ccLog('player: bridge MISSING, 回落原生玩家'); return null; }
      var rc = B.CR[cp.playerRace]; if (rc == null) { ccLog('player: race miss: ' + cp.playerRace); return null; }
      var bn = new B.CB();
      var tm = { infantry: 0x0, cavalry: 0x1, archer: 0x2, siege: 0x3, magic: 0x4 };
      var pt = Lv.ptech || {};
      for (var k in tm) { if (pt[k]) bn.setBonus(tm[k], pt[k]); }
      /* perks 累计规则: 兵种等级槽(0-4)取最高阶(升级阶梯不相加); 其余槽(百分比/资源)叠加; 条令卡走 applyPerk 原路径 */
      var acc = {};
      st.perks.forEach(function (p) {
        if (p.edict || p.key) { applyPerk(bn, p); return; }
        ccPairsOf(p).forEach(function (pv) {
          var b = pv[0], v = pv[1] || 0;
          if (b <= 4) acc[b] = Math.max(acc[b] || 0, v);
          else acc[b] = (acc[b] || 0) + v;
        });
      });
      /* 测试增益(存档实验室开关): 全军升到该势力最高阶(严格按 TECH_MAX, 不超阶——超阶单位数据不存在会报错);
         哨兵槽0x7f → 补丁侧伤害×10; 资源 +1000金/+400法(法力上限500)。仅玩家, 敌人不吃 */
      var dev = false;
      try { dev = localStorage.getItem('cc_dev') === '1'; } catch (eD) { }
      window.__ccDev = dev;
      if (dev) {
        var tmax = (window.__ccData && window.__ccData.TECH_MAX) ? window.__ccData.TECH_MAX[{ Westaria: 'Green', TheKhaganate: 'Red', TheCult: 'Blue', TheEmpire: 'Purple' }[cp.playerRace] || 'Green'] : null;
        var unitMax = { infantry: 'Infantry', cavalry: 'Cavalry', archer: 'Archers', siege: 'Siege', magic: 'Magic' };
        for (var uk in unitMax) {
          var mv = tmax ? (tmax[unitMax[uk]] || 1) : 1;
          if (mv > 1) acc[tm[uk]] = Math.max(acc[tm[uk]] || 0, mv - 1);
        }
        acc[0x7f] = 1;
      }
      for (var b2 in acc) { if (acc[b2]) bn.setBonus(+b2, acc[b2]); }
      var pd = new B.CD(new B.CDe(), rc, bn);
      var gold = (Lv.pgold || 0) + this.psum(st, 'gold'), mana = (Lv.pmana || 0) + this.psum(st, 'mana');
      if (dev) { gold += 1000; mana = Math.min(500, mana + 400); }
      pd.addGold(gold);
      pd.addMana(mana);
      ccLog('player built: order=' + order + ' gold=' + gold + ' mana=' + mana + (dev ? ' [测试增益]' : ''));
      return pd;
    } catch (e) { ccLog('player ERROR: ' + (e && e.message)); return null; }
  },
  onOver: function (stats, scr) {
    try {
      if (this._onTop) { ccLog('onOver: 覆盖层已开, 吞掉重复结算信号'); return true; }
      var B = ccBridge();
      var cp = this.camp();
      ccLog('onOver: lvNum=' + (stats && stats.levelNum) + ' status=' + (stats && stats.missionOverStatus) + ' bridge=' + (B ? 'ok' : 'MISSING') + ' camp=' + (cp ? 'ok' : 'MISSING'));
      if (!cp) return false;
      var order = (stats.levelNum || 0) + 1;
      var win = stats.missionOverStatus == (B && B.MS ? B.MS.MISSION_COMPLETE : 1); /* 1=MISSION_COMPLETE(引擎常量区实证) */
      this._onTop = true; /* defeat/final/pick 任一覆盖层即将打开; 关闭路径统一在 toMap/OnRestart 里解锁 */
      if (!win) { this.defeat(scr); return true; }
      var st = this.st();
      st.cleared[order] = { status: 1, time: Math.round(stats.missionTime || 0) };
      st.unlocked = Math.max(st.unlocked, Math.min(10, order + 1));
      this.save(st);
      ccLog('progress saved: cleared=' + order + ' unlocked=' + st.unlocked);
      var last = 0;
      for (var k in (cp.lv || {})) { var nk = parseInt(k, 10) || 0; if (nk > last) last = nk; }
      if (last < 1) last = 10;
      if (order >= last) { this.final(cp, scr); return true; } /* 打完最后一关 → 直接终极大奖 */
      if (cp.features && cp.features.pick === true) { this.pick(cp, st, scr, order); return true; }
      /* 第1步: 无经验结算画面 —— 走原生 mission_over 界面, 但经验=0、且绝不走官方进度写入 */
      this._onTop = false; /* 结算是原生界面, 释放覆盖层锁 */
      try {
        stats.earnedXP = 0;
        stats.completeStatus = 1;
        scr['mission_over_scr_sg_']['emit'](stats);
        ccLog('settle: 经验0结算画面已发射, order=' + order);
        return true;
      } catch (eS) { ccLog('settle emit ERROR: ' + (eS && eS.message) + ' → 直接回地图'); this.toMap(scr); return true; }
    } catch (e) { this._onTop = false; ccLog('onOver ERROR: ' + (e && e.message)); return false; }
  },
  ovl: function (inner) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(6,8,12,.88);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Microsoft YaHei,sans-serif';
    ov.innerHTML = inner;
    document.body.appendChild(ov);
    return ov;
  },
  toast: function (msg) {
    try {
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;left:50%;bottom:60px;transform:translateX(-50%);background:#1d2a1f;border:1px solid #3c5a3f;color:#c8e6c9;padding:10px 22px;border-radius:10px;font-size:14px;z-index:99998;font-family:Microsoft YaHei,sans-serif;pointer-events:none';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 3000);
    } catch (e) { }
  },
  pick: function (camp, st, scr, order) {
    var picks = [];
    var tb = camp.rewardTable || {};
    var raw = tb[order] || tb[String(order)] || null;
    var list = null;
    if (Array.isArray(raw)) list = raw;
    else if (raw && (raw.then || raw.else)) list = ccHasPerk(st, raw.req) ? raw.then : raw.else; /* 关卡级分支 */
    if (list) list = list.map(function (it) { return ccResolveItem(it, st); }).filter(Boolean); /* 选项级条件 */
    if (list && list.length) {
      picks = list.slice(0, 3);
      ccLog('pick: order=' + order + ' 用 rewardTable 固定 ' + picks.length + ' 项');
    } else {
      var pool = (camp.perks && camp.perks.pool) || [];
      ccLog('pick: order=' + order + ' 无该关表格, 回落随机池 pool=' + pool.length);
      var n = Math.min((camp.perks && camp.perks.perPick) || 3, pool.length);
      if (!n) { this._onTop = false; this.toMap(scr); return; }
      var used = {};
      while (picks.length < n) { var i = Math.floor(Math.random() * pool.length); if (!used[i]) { used[i] = 1; picks.push(pool[i]); } }
    }
    var h = '<div style="color:#ffd54f;font-size:26px;margin-bottom:6px">战役 · 胜利</div>'
      + '<div style="color:#cfc9b8;font-size:14px;margin-bottom:22px">第 ' + order + ' 关完成 —— 选择一项强化</div>'
      + '<div style="display:flex;gap:18px">';
    picks.forEach(function (p, idx) {
      h += '<div data-i="' + idx + '" style="width:210px;padding:24px 16px;background:#1c212c;border:2px solid #3a4356;border-radius:12px;cursor:pointer;text-align:center">'
        + '<div style="color:#ffd54f;font-size:16px;margin-bottom:8px">' + (p.bn || p.id) + '</div>'
        + '<div style="color:#8d95a5;font-size:12px">' + (p.desc || '点击选择') + '</div></div>';
    });
    h += '</div>';
    var ov = this.ovl(h); var self = this;
    ov.querySelectorAll('[data-i]').forEach(function (card) {
      card.onclick = function () {
        var p = picks[+card.getAttribute('data-i')];
        st.perks.push({ id: p.id || null, bn: p.bn || p.id, edict: p.key || p.edict || null, pairs: ccPairsOf(p), gold: p.gold || 0, mana: p.mana || 0 });
        var wildGot = (p.id === 'ult_wild') ? ccWildGrant(camp, st) : null;
        self.save(st); ov.remove();
        if (wildGot && wildGot.length) self.toast('无中生有：额外获得「' + wildGot.join('」「') + '」');
        self.toMap(scr);
      };
    });
  },
  defeat: function (scr) {
    var h = '<div style="color:#ff8a80;font-size:30px;margin-bottom:18px">战 败</div>'
      + '<div style="color:#8d95a5;font-size:14px;margin-bottom:24px">重整旗鼓，再次进攻（无代价）</div>'
      + '<div style="display:flex;gap:14px">'
      + '<button id="ccr" style="padding:10px 26px;font-size:15px;background:#3d3320;border:2px solid #ffd54f;color:#ffd54f;border-radius:8px;cursor:pointer">再次进攻</button>'
      + '<button id="ccq" style="padding:10px 26px;font-size:15px;background:#262d3d;border:1px solid #3a4356;color:#e8e4d8;border-radius:8px;cursor:pointer">返回地图</button></div>';
    var ov = this.ovl(h); var self = this;
    ov.querySelector('#ccr').onclick = function () { ov.remove(); self._onTop = false; try { scr.gm_ctx_.OnRestart(); } catch (e) { window.location.reload(); } };
    ov.querySelector('#ccq').onclick = function () { ov.remove(); self.toMap(scr); };
  },
  final: function (camp, scr) {
    var st = this.st();
    var fr = camp.finalReward;
    if (fr) { st.perks.push({ id: fr.id || null, bn: fr.bn || fr.id, edict: fr.key || fr.edict || null, pairs: ccPairsOf(fr), gold: fr.gold || 0, mana: fr.mana || 0 }); this.save(st); }
    var h = '<div style="color:#ffd54f;font-size:40px;margin-bottom:14px">通 关 ！</div>'
      + '<div style="color:#cfc9b8;font-size:16px;margin-bottom:10px">' + (camp.name || '') + ' 全部完成</div>'
      + '<div style="color:#9fd0ff;font-size:15px;margin-bottom:26px">通关奖励：' + ((fr && (fr.bn || fr.id)) || '无') + ' —— 前往地图自由爽玩</div>'
      + '<button id="ccf" style="padding:12px 34px;font-size:16px;background:#3d3320;border:2px solid #ffd54f;color:#ffd54f;border-radius:8px;cursor:pointer">继续爽玩</button>';
    var ov = this.ovl(h); var self = this;
    ov.querySelector('#ccf').onclick = function () { ov.remove(); self.toMap(scr); };
  },
  toMap: function (scr) {
    this._onTop = false; /* 覆盖层已关, 解锁互斥 */
    try { scr.gm_ctx_.OnMapScr(); }
    catch (e) { try { scr.m_def.OnMapScr(); } catch (e2) { window.location.reload(); } }
  },
};
ccLog('cc_ui v3 loaded; ccActive(此刻尚未解析, 属正常)=' + (window.__ccActive || null));
/* 暴露纯函数给外部(campaign.html 预览解析/测试用) */
window.__ccUI._hasPerk = ccHasPerk;
window.__ccUI._resolveItem = ccResolveItem;
window.__ccUI._pairsOf = ccPairsOf;
window.__ccUI._wildGrant = ccWildGrant;
