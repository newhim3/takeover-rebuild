/* ============================================================
 * 城邦争霸 · 手游诊断层（diag.js）
 * 目的：APK 是黑盒，本脚本让游戏自己"说出"运行环境与故障点。
 * 特性：
 *   - 只读探测，全部 try/catch，不改变游戏任何行为
 *   - 画面全黑时依然可用（诊断面板是 DOM，不依赖 canvas）
 *   - 自动跑一遍轻量自检并写入 localStorage，可用 adb/工具脚本取回
 * 打开面板：URL 加 ?diag=1 / 连点左上角 5 次 / PC 按 F9 / 控制台 __ccDiagShow()
 * 取报告  ：控制台 __ccDiagReport()，或 localStorage['cc_diag_last']
 * ============================================================ */
(function () {
  'use strict';
  if (window.__ccDiagInstalled) return;
  window.__ccDiagInstalled = true;

  var ATLASES = ['battle-data', 'screens', 'levels', 'title', 'congrats-scr', 'layout-test-scr', 'permanent', 'system'];
  var STORE_KEY = 'cc_diag_last';
  var MAXKEEP = 40;

  var R = {
    ts: new Date().toISOString(),
    url: location.href,
    env: {}, gl: {}, canvas: {}, fps: null,
    atlases: [], problems: [], errors: [], resFailures: [], xhrFailures: [],
    pieces: null, engine: {}, notes: []
  };

  function keep(a, v) { try { if (a.length < MAXKEEP) a.push(v); } catch (e) {} }
  function s(v) { return String(v == null ? '' : v); }
  function r2(v) { return (typeof v === 'number' && isFinite(v)) ? Math.round(v * 100) / 100 : v; }
  function tryf(fn, d) { try { return fn(); } catch (e) { return (d === undefined ? 'ERR: ' + e.message : d); } }

  /* ---------------- 1. 错误与失败捕获 ---------------- */
  window.addEventListener('error', function (e) {
    try {
      if (e && e.target && e.target.tagName && (e.target.src || e.target.href)) {
        keep(R.resFailures, e.target.tagName + ' ' + s(e.target.src || e.target.href));
      } else {
        keep(R.errors, s(e.message) + ' @ ' + s(e.filename) + ':' + s(e.lineno) + ':' + s(e.colno));
      }
    } catch (x) {}
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    try { keep(R.errors, 'promise: ' + s((e.reason && e.reason.message) || e.reason)); } catch (x) {}
  });
  try {
    var _open = XMLHttpRequest.prototype.open, _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { try { this.__ccU = u; } catch (e) {} return _open.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      var self = this;
      try {
        self.addEventListener('error', function () { keep(R.xhrFailures, 'ERR ' + s(self.__ccU)); });
        self.addEventListener('timeout', function () { keep(R.xhrFailures, 'TIMEOUT ' + s(self.__ccU)); });
        self.addEventListener('load', function () { if (self.status >= 400) keep(R.xhrFailures, self.status + ' ' + s(self.__ccU)); });
      } catch (e) {}
      return _send.apply(this, arguments);
    };
  } catch (e) {}
  try {
    if (window.fetch) {
      var _fetch = window.fetch;
      window.fetch = function (input) {
        var u = (typeof input === 'string') ? input : ((input && input.url) || '');
        return _fetch.apply(this, arguments).then(
          function (res) { if (!res.ok) keep(R.xhrFailures, res.status + ' ' + u); return res; },
          function (err) { keep(R.xhrFailures, 'FAIL ' + u + ' ' + s(err && err.message)); throw err; }
        );
      };
    }
  } catch (e) {}

  /* ---------------- 2. 环境 ---------------- */
  function probeEnv() {
    var nav = navigator || {};
    R.env = {
      ua: s(nav.userAgent),
      platform: s(nav.platform),
      android: (s(nav.userAgent).match(/Android\s+([\d.]+)/) || [])[1] || '(PC/未知)',
      model: (s(nav.userAgent).match(/Android[^;]*;\s*([^)]+)\)/) || [])[1] || '(未知)',
      dpr: window.devicePixelRatio,
      screen: window.screen ? (screen.width + 'x' + screen.height) : '?',
      inner: window.innerWidth + 'x' + window.innerHeight,
      visualViewport: window.visualViewport ? (r2(visualViewport.width) + 'x' + r2(visualViewport.height)) : '(无)',
      hardwareConcurrency: nav.hardwareConcurrency || '(未知)',
      deviceMemory: nav.deviceMemory || '(未知)',
      language: nav.language,
      isCapacitor: !!(window.Capacitor),
      origin: location.origin,
      protocol: location.protocol
    };
    try {
      if (performance && performance.memory) {
        R.env.jsHeapMB = r2(performance.memory.usedJSHeapSize / 1048576);
        R.env.jsHeapLimitMB = r2(performance.memory.jsHeapSizeLimit / 1048576);
      }
    } catch (e) {}
  }

  /* ---------------- 3. WebGL 能力 ---------------- */
  function probeGL() {
    R.gl = tryf(function () {
      var c = document.createElement('canvas');
      var g = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!g) return { ok: false, reason: 'WebGL 不可用（可能被系统禁用/软件渲染失败）' };
      var dbg = g.getExtension('WEBGL_debug_renderer_info');
      var out = {
        ok: true,
        version: g.getParameter(g.VERSION),
        vendor: g.getParameter(g.VENDOR),
        renderer: g.getParameter(g.RENDERER),
        unmaskedVendor: dbg ? g.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : '(无扩展)',
        unmaskedRenderer: dbg ? g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '(无扩展)',
        maxTextureSize: g.getParameter(g.MAX_TEXTURE_SIZE),
        maxCubeMapSize: g.getParameter(g.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxRenderbufferSize: g.getParameter(g.MAX_RENDERBUFFER_SIZE),
        maxViewportDims: (function () { var v = g.getParameter(g.MAX_VIEWPORT_DIMS); return v ? (v[0] + 'x' + v[1]) : '?'; })(),
        textureUnits: g.getParameter(g.MAX_TEXTURE_IMAGE_UNITS),
        contextLost: g.isContextLost()
      };
      return out;
    }, { ok: false, reason: '探测异常' });
    if (!R.gl || R.gl.ok !== true) {
      R.problems.push('【致命】WebGL 不可用 → 画面必然空白。' + (R.gl && R.gl.reason ? R.gl.reason : ''));
    }
  }

  /* ---------------- 4. 画布状态 ---------------- */
  function probeCanvas() {
    R.canvas = tryf(function () {
      var list = document.querySelectorAll('canvas');
      var biggest = null, area = -1;
      for (var i = 0; i < list.length; i++) {
        var c = list[i], a = c.width * c.height;
        if (a > area) { area = a; biggest = c; }
      }
      if (!biggest) return { count: 0, note: '没有 canvas（引擎没起来）' };
      var rect = biggest.getBoundingClientRect();
      return {
        count: list.length,
        w: biggest.width, h: biggest.height,
        clientW: biggest.clientWidth, clientH: biggest.clientHeight,
        rectW: r2(rect.width), rectH: r2(rect.height),
        visible: (rect.width > 0 && rect.height > 0),
        cssW: tryf(function () { return getComputedStyle(biggest).width; }),
        cssH: tryf(function () { return getComputedStyle(biggest).height; })
      };
    }, { count: -1 });
    if (R.canvas && R.canvas.count === 0) R.problems.push('【致命】页面上没有 canvas → 引擎未启动。');
  }

  /* ---------------- 5. FPS 采样 ---------------- */
  function probeFPS(cb) {
    var frames = 0, t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      frames++;
      if (ts - t0 < 2000) requestAnimationFrame(step);
      else {
        R.fps = r2(frames / ((ts - t0) / 1000));
        cb && cb();
      }
    }
    tryf(function () { requestAnimationFrame(step); });
  }

  /* ---------------- 6. 图集探针（黑屏元凶判定） ---------------- */
  /* 只读 PNG 文件头拿尺寸：不解码像素 → 不占显存/内存（手机安全） */
  function pngSize(bytes) {
    if (!bytes || bytes.length < 24) return null;
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) return null;
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { w: dv.getUint32(16, false), h: dv.getUint32(20, false) };
  }
  function probeAtlases(cb) {
    var maxTex = (R.gl && R.gl.maxTextureSize) || 0;
    var left = ATLASES.length;
    if (!left) { cb && cb(); return; }
    ATLASES.forEach(function (lib) {
      var item = { lib: lib, file: 'img/' + lib + '.png' };
      function finish() { R.atlases.push(item); if (--left === 0) { cb && cb(); } }
      fetch(item.file).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      }).then(function (buf) {
        item.bytes = buf.byteLength;
        var sz = pngSize(new Uint8Array(buf.slice(0, 32)));
        if (!sz || !sz.w || !sz.h) { item.verdict = '文件异常'; R.problems.push('【致命】图集 ' + lib + '.png 不是有效 PNG。'); return finish(); }
        item.w = sz.w; item.h = sz.h;
        item.withinGPULimit = maxTex ? (item.w <= maxTex && item.h <= maxTex) : null;
        if (item.withinGPULimit === false) {
          item.verdict = '超限';
          R.problems.push('【致命】图集 ' + lib + ' 尺寸 ' + item.w + 'x' + item.h +
            ' 超过本机 GPU 纹理上限 ' + maxTex + ' → 该图集无法上传，相关画面会黑/缺图。需要"缩放版"图集。');
        } else { item.verdict = 'OK'; }
        finish();
      }).catch(function (e) {
        item.verdict = '加载失败';
        R.problems.push('【致命】图集 ' + lib + '.png 读取失败：' + s(e.message));
        finish();
      });
    });
  }

  /* 深度：真实解码 PNG 并上传成纹理（这是黑屏的最终判据）。占显存，只在手动点按后跑。 */
  function deepTextureTest(cb) {
    var out = [];
    var queue = R.atlases.slice();
    function next() {
      if (!queue.length) { R.deepTexture = out; cb && cb(); return; }
      var item = queue.shift();
      var img = new Image();
      var done = false;
      function step() {
        if (done) return; done = true;
        try {
          var w = img.naturalWidth || item.w, hh = img.naturalHeight || item.h;
          var c = document.createElement('canvas');
          c.width = w; c.height = hh;
          var g = c.getContext('webgl');
          if (!g) { out.push({ lib: item.lib, err: 'no-webgl' }); }
          else {
            var tex = g.createTexture();
            g.bindTexture(g.TEXTURE_2D, tex);
            g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
            var err = g.getError();
            out.push({ lib: item.lib, decoded: w + 'x' + hh, glError: err ? glErrName(g, err) : 'NONE', lost: g.isContextLost() });
            g.deleteTexture(tex);
          }
          c.width = c.height = 1;
          img.src = '';
        } catch (e) { out.push({ lib: item.lib, err: s(e.message) }); }
        setTimeout(next, 80);
      }
      img.onload = step;
      img.onerror = function () { if (!done) { done = true; out.push({ lib: item.lib, err: '解码失败（文件损坏）' }); setTimeout(next, 80); } };
      setTimeout(function () { if (!done) { done = true; out.push({ lib: item.lib, err: '解码超时' }); next(); } }, 25000);
      img.src = item.file;
    }
    next();
  }
  function glErrName(g, e) {
    var m = { 1280: 'INVALID_ENUM', 1281: 'INVALID_VALUE', 1282: 'INVALID_OPERATION', 1285: 'OUT_OF_MEMORY', 1286: 'INVALID_FRAMEBUFFER_OPERATION' };
    return m[e] || ('0x' + e.toString(16));
  }

  /* ---------------- 7. 资产四件套自检（显示树 ↔ dat 类名表） ---------------- */
  /* dat 结构（实测确认）: int32 数量 + [int32 长度 + UTF16LE 字串] × 数量 + ... */
  function datNames(bytes) {
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var p = 0;
    var n = dv.getInt32(p, true); p += 4;
    var out = [];
    for (var i = 0; i < n; i++) {
      var L = dv.getInt32(p, true); p += 4;
      var str = '';
      for (var j = 0; j < L; j++) { str += String.fromCharCode(dv.getUint16(p, true)); p += 2; }
      out.push(str);
    }
    return out;
  }
  function collectClassNames(node, set) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.class_name === 'string' && node.class_name) set[node.class_name] = 1;
    var ch = node.childs;
    if (ch && ch.length) for (var i = 0; i < ch.length; i++) collectClassNames(ch[i], set);
  }
  function probePieces(cb) {
    var libs = ['battle-data', 'screens', 'title', 'congrats-scr', 'layout-test-scr', 'levels'];
    var res = [];
    var idx = 0;
    function next() {
      if (idx >= libs.length) { R.pieces = res; cb && cb(); return; }
      var lib = libs[idx++];
      Promise.all([
        fetch('ui/' + lib + '_data.json').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); }),
        fetch('img/' + lib + '_data.dat').then(function (r) { return r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status)); })
      ]).then(function (pair) {
        var set = {};
        collectClassNames(pair[0].root || pair[0], set);
        var names = datNames(new Uint8Array(pair[1]));
        var have = {};
        for (var i = 0; i < names.length; i++) have[names[i]] = 1;
        var miss = [];
        for (var k in set) if (!have[k]) miss.push(k);
        res.push({ lib: lib, classNames: Object.keys(set).length, datNames: names.length, missing: miss.length, missingSample: miss.slice(0, 8) });
      }).catch(function (e) {
        res.push({ lib: lib, error: s(e.message) });
      }).then(function () { setTimeout(next, 30); });
    }
    next();
  }

  /* ---------------- 8. 引擎/存档信息 ---------------- */
  function probeEngine() {
    R.engine = {
      ccActive: s(window.__ccActive) || '(无)',
      ldUID: s(window.__ldUID) || '(无)',
      skipTitle: s(window.__skipTitle),
      hasBridge: !!window.__ccBridge,
      hasTakeoverSave: typeof window.__takeoverSave === 'function',
      errorsFromIndex: (window.__errors && window.__errors.length) || 0,
      logTail: tryf(function () { return (window.__log || []).slice(-6).map(s); }, [])
    };
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length && keys.length < 20; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k) || '';
        keys.push(k + ' (' + v.length + 'B)');
      }
    } catch (e) { keys.push('localStorage 读取失败: ' + e.message); }
    R.engine.storageKeys = keys;
  }

  /* ---------------- 9. 汇总判定 ---------------- */
  function summarize() {
    var fatal = 0, warn = 0;
    for (var i = 0; i < R.problems.length; i++) {
      if (R.problems[i].indexOf('【致命】') === 0) fatal++; else warn++;
    }
    var bad404 = (R.xhrFailures || []).filter(function (x) { return /^4\d\d /.test(x); });
    if (bad404.length) R.problems.push('【警告】有 ' + bad404.length + ' 个资源请求返回 4xx：' + bad404.slice(0, 5).join(' | '));
    if ((R.errors || []).length) R.problems.push('【警告】捕获到 ' + R.errors.length + ' 条 JS 报错（详见面板）。');
    if ((R.resFailures || []).length) R.problems.push('【警告】有 ' + R.resFailures.length + ' 个静态资源加载失败。');
    R.summary = { fatal: fatal, warn: warn, verdict: fatal ? 'FAIL' : (warn ? 'WARN' : 'PASS') };
  }

  function runAll(cb) {
    probeEnv(); probeGL(); probeCanvas(); probeEngine();
    probeFPS(function () {
      probeAtlases(function () {
        summarize(); cb && cb();
      });
    });
  }

  /* ---------------- 10. 面板 UI ---------------- */
  var panel = null, body = null, banner = null;
  function esc(t) { return s(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function line(k, v, cls) { return '<div class="ccd-row ' + (cls || '') + '"><span class="ccd-k">' + esc(k) + '</span><span class="ccd-v">' + esc(v) + '</span></div>'; }
  function sec(t) { return '<div class="ccd-sec">' + esc(t) + '</div>'; }

  function render() {
    if (!body) return;
    var gl = R.gl || {}, cv = R.canvas || {};
    var h = '';
    h += sec('总判定');
    var v = (R.summary && R.summary.verdict) || '-';
    h += '<div class="ccd-verdict ccd-v-' + v + '">' + v + '</div>';
    if (R.problems && R.problems.length) {
      for (var i = 0; i < R.problems.length; i++) h += '<div class="ccd-problem">' + esc(R.problems[i]) + '</div>';
    } else { h += '<div class="ccd-ok">未发现异常</div>'; }

    h += sec('设备');
    h += line('机型', R.env.model);
    h += line('Android', R.env.android);
    h += line('屏幕', R.env.screen + '  dpr=' + R.env.dpr);
    h += line('视口', R.env.inner + '  可视区=' + R.env.visualViewport);
    h += line('CPU/内存', R.env.hardwareConcurrency + ' 核 / ' + R.env.deviceMemory + 'GB');
    h += line('JS 堆', R.env.jsHeapMB ? (R.env.jsHeapMB + ' / ' + R.env.jsHeapLimitMB + ' MB') : '(不可用)');
    h += line('容器', (R.env.isCapacitor ? 'Capacitor' : '浏览器') + '  ' + R.env.origin);

    h += sec('GPU / WebGL');
    if (gl.ok) {
      h += line('渲染器', gl.unmaskedRenderer);
      h += line('MAX_TEXTURE_SIZE', gl.maxTextureSize, 'ccd-hi');
      h += line('最大视口', gl.maxViewportDims);
      h += line('WebGL', gl.version);
    } else { h += line('状态', s(gl && gl.reason) || '不可用', 'ccd-bad'); }

    h += sec('画布');
    if (cv.count > 0) {
      h += line('canvas 数', cv.count);
      h += line('内部分辨率', cv.w + 'x' + cv.h);
      h += line('显示尺寸', cv.clientW + 'x' + cv.clientH + ' (css ' + cv.cssW + 'x' + cv.cssH + ')');
      h += line('可见', cv.visible ? '是' : '否', cv.visible ? '' : 'ccd-bad');
    } else { h += line('状态', s(cv.note) || '无 canvas', 'ccd-bad'); }

    h += sec('帧率');
    h += line('FPS（2 秒均值）', R.fps == null ? '(未测)' : R.fps);

    h += sec('图集（黑屏首要嫌疑）');
    if (R.atlases && R.atlases.length) {
      for (var a = 0; a < R.atlases.length; a++) {
        var it = R.atlases[a];
        var cls = it.verdict === 'OK' ? '' : 'ccd-bad';
        h += line(it.lib, (it.w ? it.w + 'x' + it.h : '?') + '  ' + it.verdict, cls);
      }
      if (R.deepTexture) h += '<div class="ccd-note">深度纹理检测：' + esc(JSON.stringify(R.deepTexture)) + '</div>';
    } else { h += line('状态', '(未扫描)'); }

    h += sec('四件套自检（显示树 ↔ dat）');
    if (R.pieces) {
      for (var p2 = 0; p2 < R.pieces.length; p2++) {
        var pe = R.pieces[p2];
        if (pe.error) h += line(pe.lib, '读取失败: ' + pe.error, 'ccd-bad');
        else h += line(pe.lib, pe.classNames + ' 类名 / 缺失 ' + pe.missing + (pe.missing ? ' → ' + pe.missingSample.join(',') : ''), pe.missing ? 'ccd-warn' : '');
      }
    } else { h += line('状态', '(未扫描，点「深度检测」)'); }

    h += sec('报错 / 失败请求');
    h += line('JS 报错', (R.errors || []).length);
    h += line('资源加载失败', (R.resFailures || []).length);
    h += line('XHR 失败', (R.xhrFailures || []).length);
    var detail = (R.errors || []).concat(R.resFailures || []).concat(R.xhrFailures || []);
    if (detail.length) h += '<pre class="ccd-pre">' + esc(detail.slice(0, 20).join('\n')) + '</pre>';

    h += sec('引擎 / 存档');
    h += line('__ccActive', R.engine.ccActive);
    h += line('__ldUID', R.engine.ldUID);
    h += line('__ccBridge', R.engine.hasBridge ? '有' : '无');
    h += line('本地存储键', (R.engine.storageKeys || []).join('  ,  '));

    h += '<div class="ccd-btns">' +
      '<button id="ccdBt1">重新检测</button>' +
      '<button id="ccdBt2">深度检测</button>' +
      '<button id="ccdBt3">复制报告</button>' +
      '<button id="ccdBt4">关闭</button></div>';
    body.innerHTML = h;
    document.getElementById('ccdBt1').onclick = function () { location.reload(); };
    document.getElementById('ccdBt2').onclick = function () {
      if (!confirm('深度检测会真实解码每张图集并上传纹理（占显存，低内存机型可能闪退）。继续？')) return;
      body.innerHTML = '<div class="ccd-note">深度检测中，请稍候…</div>';
      probePieces(function () { deepTextureTest(function () { render(); }); });
    };
    document.getElementById('ccdBt3').onclick = function () {
      var t = JSON.stringify(R, null, 1);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(R)); } catch (e) {}
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(t);
      } catch (e) {}
      alert('报告已复制到剪贴板，并已写入 localStorage["' + STORE_KEY + '"]。\n长度 ' + t.length + ' 字符。');
    };
    document.getElementById('ccdBt4').onclick = hidePanel;
  }

  function injectCSS() {
    if (document.getElementById('ccd-style')) return;
    var st = document.createElement('style');
    st.id = 'ccd-style';
    st.textContent = [
      '#ccd-panel{position:fixed;left:0;top:0;width:min(560px,96vw);max-height:100vh;overflow:auto;z-index:2147483600;',
      'background:rgba(8,10,16,.94);color:#d8e0ea;font:12px/1.55 Consolas,Menlo,monospace;padding:10px 12px 14px;',
      'border-right:1px solid #2b3342;border-bottom:1px solid #2b3342;box-sizing:border-box;-webkit-overflow-scrolling:touch}',
      '#ccd-panel *{box-sizing:border-box}',
      '.ccd-hd{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2b3342;padding-bottom:6px;margin-bottom:8px}',
      '.ccd-hd b{color:#d8b963;font-size:13px;letter-spacing:1px}',
      '.ccd-sec{margin:10px 0 4px;color:#7fc3ff;border-bottom:1px dashed #22303f;padding-bottom:2px;font-weight:bold}',
      '.ccd-row{display:flex;gap:8px;padding:1px 0}',
      '.ccd-k{flex:0 0 42%;color:#8b95a3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ccd-v{flex:1;color:#dfe6ee;word-break:break-all}',
      '.ccd-hi .ccd-v{color:#ffd54f;font-weight:bold}',
      '.ccd-bad .ccd-v{color:#ff8a8a;font-weight:bold}',
      '.ccd-warn .ccd-v{color:#ffc46b}',
      '.ccd-verdict{font-size:20px;font-weight:bold;letter-spacing:3px;text-align:center;padding:6px 0;margin:4px 0 6px;border-radius:6px}',
      '.ccd-v-PASS{color:#8be08b;background:rgba(80,160,80,.13);border:1px solid rgba(120,200,120,.35)}',
      '.ccd-v-WARN{color:#ffc46b;background:rgba(180,140,40,.13);border:1px solid rgba(220,180,80,.35)}',
      '.ccd-v-FAIL{color:#ff8a8a;background:rgba(160,50,50,.16);border:1px solid rgba(220,90,90,.4)}',
      '.ccd-problem{color:#ffb3b3;padding:2px 0}',
      '.ccd-ok{color:#8be08b}',
      '.ccd-note{color:#9aa4b2;margin-top:4px;word-break:break-all}',
      '.ccd-pre{background:#0d1117;border:1px solid #22303f;padding:6px;margin:6px 0 0;max-height:170px;overflow:auto;color:#ffb3b3;font-size:11px}',
      '.ccd-btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '.ccd-btns button{flex:1 1 44%;padding:8px 6px;border:1px solid rgba(201,168,76,.5);border-radius:6px;',
      'background:rgba(201,168,76,.12);color:#d8b963;font:13px/1 Consolas,monospace;cursor:pointer}',
      '.ccd-btns button:active{background:rgba(201,168,76,.3)}',
      '#ccd-banner{position:fixed;left:0;right:0;top:0;z-index:2147483599;background:rgba(150,30,30,.92);color:#fff;',
      'font:13px/1.6 Consolas,monospace;padding:6px 10px;text-align:center}'
    ].join('');
    document.head.appendChild(st);
  }

  function showPanel() {
    injectCSS();
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'ccd-panel';
      panel.innerHTML = '<div class="ccd-hd"><b>城邦争霸 · 诊断</b><span id="ccd-close" style="cursor:pointer;color:#8b95a3">✕</span></div><div id="ccd-body">正在检测…</div>';
      document.body.appendChild(panel);
      body = document.getElementById('ccd-body');
      document.getElementById('ccd-close').onclick = hidePanel;
    } else { panel.style.display = 'block'; }
    render();
  }
  function hidePanel() { if (panel) panel.style.display = 'none'; }
  window.__ccDiagShow = showPanel;
  window.__ccDiagHide = hidePanel;
  window.__ccDiagReport = function () { return R; };
  window.__ccDiagRun = runAll;

  function showBanner(msg) {
    injectCSS();
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'ccd-banner';
      document.body.appendChild(banner);
    }
    banner.textContent = msg;
    banner.style.display = 'block';
  }

  /* ---------------- 11. 入口与自动运行 ---------------- */
  function autoRun() {
    runAll(function () {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(R)); } catch (e) {}
      try { if (panel && panel.style.display !== 'none') render(); } catch (e) {}
      if (R.summary && R.summary.verdict === 'FAIL') {
        showBanner('⚠ 检测到致命问题：' + R.problems[0] + '（连点左上角 5 次可看诊断面板）');
      }
    });
  }

  // 打开方式 1：URL ?diag=1
  var openByUrl = /[?&]diag=(1|full)/.test(location.search || '');
  // 打开方式 2：连点左上角 5 次
  var taps = 0, tapT = 0;
  document.addEventListener('touchstart', function (e) {
    var t = e.touches && e.touches[0]; if (!t) return;
    if (t.clientX < 64 && t.clientY < 64) {
      var now = Date.now();
      taps = (now - tapT < 1500) ? taps + 1 : 1; tapT = now;
      if (taps >= 5) { taps = 0; showPanel(); }
    }
  }, { passive: true });
  document.addEventListener('mousedown', function (e) {
    if (e.clientX < 64 && e.clientY < 64) {
      var now = Date.now();
      taps = (now - tapT < 1500) ? taps + 1 : 1; tapT = now;
      if (taps >= 5) { taps = 0; showPanel(); }
    }
  });
  // 打开方式 3：PC F9
  document.addEventListener('keydown', function (e) {
    if (e.key === 'F9') { e.preventDefault(); if (panel && panel.style.display !== 'none') hidePanel(); else showPanel(); }
  });

  function boot() {
    setTimeout(function () {
      autoRun();
      if (openByUrl) showPanel();
    }, 6000);
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else window.addEventListener('DOMContentLoaded', boot);
})();
