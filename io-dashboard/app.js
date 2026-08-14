/* ==========================================================================
   Mazak VQC-20/40 I/O Navigator — application logic
   Vanilla ES5+/ES2017, no modules, no CDN. Runs from file:// or any static
   server. All session state is in memory only (no localStorage/cookies).
   ========================================================================== */
(function () {
  'use strict';

  var D = window.MAZAK_DATA;
  if (!D) { document.body.innerHTML = '<p style="padding:40px">data.js failed to load.</p>'; return; }

  var SIGNALS = D.signals;
  var STATUS = D.statuses;
  var BOARDS = D.boards;
  var CONFLICTS = D.conflicts;
  var CONFLICT_BY_ID = {};
  CONFLICTS.forEach(function (c) { CONFLICT_BY_ID[c.id] = c; });

  var SIG_BY_ID = {};
  SIGNALS.forEach(function (s) { SIG_BY_ID[s.id] = s; });

  /* ---------------------------------------------------------------- state */

  var state = {
    view: 'ALL',                 // ALL | 7i80HDT | 7i44 | 7i49 | 7i84U-A | 7i84U-B | CONFLICTS
    q: '',
    board: '', conn: '', dir: '', sub: '', status: '',
    selected: null,              // signal id
    sim: Object.create(null),    // id -> { value: '0'|'1'|null, note: string }
    live: { on: false, ok: false, error: '', values: Object.create(null), timer: null, ts: '' }
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  function esc(s) { return String(s == null ? '' : s); }

  /* ---------------------------------------------------------- search index */

  SIGNALS.forEach(function (s) {
    s._hay = [
      s.id, s.name, s.hal_net, s.board, s.connector, s.channel, s.direction,
      s.subsystem, s.machine_subsystem, s.field_point, s.location, s.location_note,
      s.cleanup_notes, (s.designations || []).join(' '),
      (s.mesa_pins || []).join(' '), (s.producers || []).join(' '),
      (s.consumers || []).join(' '), (STATUS[s.status] || {}).label,
      (s.conflicts || []).join(' ')
    ].join(' ').toLowerCase();
  });

  /* --------------------------------------------------------------- filters */

  function inView(s) {
    if (state.view === 'ALL') return true;
    if (state.view === 'CONFLICTS') {
      return (s.conflicts && s.conflicts.length > 0) ||
        (STATUS[s.status] || {}).tone === 'conflict';
    }
    return s.board === state.view;
  }

  function matches(s) {
    if (!inView(s)) return false;
    if (state.board && s.board !== state.board) return false;
    if (state.conn && s.connector !== state.conn) return false;
    if (state.dir && s.direction !== state.dir) return false;
    if (state.sub && s.subsystem !== state.sub) return false;
    if (state.status && s.status !== state.status) return false;
    if (state.q) {
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) {
        if (s._hay.indexOf(terms[i]) === -1) return false;
      }
    }
    return true;
  }

  function filtered() { return SIGNALS.filter(matches); }

  function statusOrder(s) { return (STATUS[s.status] || {}).order || 9; }
  function sortSignals(list) {
    return list.slice().sort(function (a, b) {
      if (a.board !== b.board) {
        var order = ['7i80HDT', '7i44', '7i49', '7i84U-A', '7i84U-B', 'none'];
        return order.indexOf(a.board) - order.indexOf(b.board);
      }
      if (a.connector !== b.connector) return a.connector < b.connector ? -1 : 1;
      var na = parseInt(String(a.channel).replace(/\D+/g, ''), 10);
      var nb = parseInt(String(b.channel).replace(/\D+/g, ''), 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return a.channel < b.channel ? -1 : a.channel > b.channel ? 1 : 0;
    });
  }

  /* -------------------------------------------------------------- observed */

  function observed(s) {
    var sim = state.sim[s.id];
    if (sim && sim.value != null) return { src: 'sim', value: sim.value, label: 'MAN ' + sim.value };
    if (state.live.on && state.live.ok && s.hal_net) {
      var v = state.live.values[s.hal_net];
      if (v !== undefined) return { src: 'live', value: v, label: String(v) };
    }
    return { src: 'none', value: null, label: '—' };
  }

  /* ------------------------------------------------------------ chrome fill */

  function fillMeta() {
    var m = D.meta;
    document.querySelector('[data-bind="arch"]').textContent =
      'Mesa 7i80HDT + 7i44 + 7i49 + 7i84U-A + 7i84U-B';
    document.querySelector('[data-bind="serial"]').textContent = m.serial;
    document.querySelector('[data-bind="generated"]').textContent = m.generated;
    document.querySelector('[data-bind="generated2"]').textContent = m.generated;
    document.querySelector('[data-bind="authfile"]').textContent = m.authority_file;

    var rules = $('rules-list');
    m.rules.forEach(function (r) { rules.appendChild(el('li', null, r)); });
  }

  var VIEWS = [
    { id: 'ALL', name: 'All signals', sub: 'authority + config' },
    { id: '7i80HDT', name: '7i80HDT', sub: 'Ethernet FPGA host' },
    { id: '7i44',    name: '7i44',    sub: 'RS-422 sserial on P3' },
    { id: '7i84U-A', name: '7i84U-A', sub: 'sserial field I/O on channel 0' },
    { id: '7i84U-B', name: '7i84U-B', sub: 'limit/home and relay I/O on channel 1' },
    { id: '7i49', name: '7i49', sub: 'resolver interface' },
    { id: 'none', name: 'Unassigned', sub: 'no hardware allocated' },
    { id: 'CONFLICTS', name: 'Conflicts / unverified', sub: 'hold before wiring', tone: 'conflict' }
  ];

  function countForView(v) {
    var save = state.view; state.view = v;
    var n = SIGNALS.filter(inView).length;
    state.view = save; return n;
  }

  function buildNav() {
    var ul = $('board-nav');
    ul.innerHTML = '';
    VIEWS.forEach(function (v) {
      var li = el('li');
      var b = el('button', 'nav-btn');
      b.type = 'button';
      if (v.tone) b.dataset.tone = v.tone;
      b.setAttribute('aria-current', state.view === v.id ? 'true' : 'false');
      var main = el('span', 'nb-main');
      main.appendChild(el('span', 'nb-name', v.name));
      main.appendChild(el('span', 'nb-sub', v.sub));
      b.appendChild(main);
      b.appendChild(el('span', 'nb-count', String(countForView(v.id))));
      b.addEventListener('click', function () {
        state.view = v.id;
        state.selected = null;
        closeDrawer();
        render();
        $('scroll-region').scrollTop = 0;
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  function opt(sel, value, label) {
    var o = document.createElement('option');
    o.value = value; o.textContent = label;
    sel.appendChild(o);
  }

  function buildFilters() {
    var boards = ['7i80HDT', '7i44', '7i49', '7i84U-A', '7i84U-B', 'none'];
    var dirs = {};
    SIGNALS.forEach(function (s) { dirs[s.direction] = s.direction_label; });

    var fb = $('f-board'); opt(fb, '', 'All boards');
    boards.forEach(function (b) { opt(fb, b, (BOARDS[b] || {}).name || b); });

    var fc = $('f-conn'); opt(fc, '', 'All connectors');
    D.connectors.forEach(function (c) { opt(fc, c, c); });

    var fd = $('f-dir'); opt(fd, '', 'All directions');
    Object.keys(dirs).sort().forEach(function (k) { opt(fd, k, dirs[k]); });

    var fs = $('f-sub'); opt(fs, '', 'All subsystems');
    D.subsystems.forEach(function (s) { opt(fs, s, s); });

    var ft = $('f-status'); opt(ft, '', 'All statuses');
    Object.keys(STATUS).sort(function (a, b) { return STATUS[a].order - STATUS[b].order; })
      .forEach(function (k) {
        if (SIGNALS.some(function (s) { return s.status === k; })) opt(ft, k, STATUS[k].label);
      });

    fb.addEventListener('change', function () { state.board = fb.value; render(); });
    fc.addEventListener('change', function () { state.conn = fc.value; render(); });
    fd.addEventListener('change', function () { state.dir = fd.value; render(); });
    fs.addEventListener('change', function () { state.sub = fs.value; render(); });
    ft.addEventListener('change', function () { state.status = ft.value; render(); });

    $('q').addEventListener('input', function () { state.q = this.value.trim(); render(); });
    $('btn-reset').addEventListener('click', resetFilters);
  }

  function resetFilters() {
    state.q = ''; state.board = ''; state.conn = ''; state.dir = ''; state.sub = ''; state.status = '';
    $('q').value = '';
    ['f-board', 'f-conn', 'f-dir', 'f-sub', 'f-status'].forEach(function (i) { $(i).value = ''; });
    render();
  }

  /* ---------------------------------------------------------------- chips */

  function renderChips(rows) {
    var wrap = $('chips'); wrap.innerHTML = '';
    var active = [];
    if (state.q) active.push({ k: 'search', v: state.q, clear: function () { state.q = ''; $('q').value = ''; } });
    if (state.board) active.push({ k: 'board', v: state.board, clear: function () { state.board = ''; $('f-board').value = ''; } });
    if (state.conn) active.push({ k: 'conn', v: state.conn, clear: function () { state.conn = ''; $('f-conn').value = ''; } });
    if (state.dir) active.push({ k: 'dir', v: state.dir, clear: function () { state.dir = ''; $('f-dir').value = ''; } });
    if (state.sub) active.push({ k: 'subsystem', v: state.sub, clear: function () { state.sub = ''; $('f-sub').value = ''; } });
    if (state.status) active.push({ k: 'status', v: (STATUS[state.status] || {}).label || state.status, clear: function () { state.status = ''; $('f-status').value = ''; } });

    active.forEach(function (a) {
      var c = el('button', 'chip');
      c.type = 'button';
      c.setAttribute('aria-label', 'Remove filter ' + a.k + ' ' + a.v);
      c.appendChild(el('span', 'chip-k', a.k + ':'));
      c.appendChild(el('span', null, a.v));
      c.appendChild(el('span', 'chip-x', '\u00d7'));
      c.addEventListener('click', function () { a.clear(); render(); });
      wrap.appendChild(c);
    });

    if (active.length) {
      var cl = el('button', 'chip-clear', 'Clear all');
      cl.type = 'button';
      cl.addEventListener('click', resetFilters);
      wrap.appendChild(cl);
    }

    var nSim = Object.keys(state.sim).filter(function (k) { return state.sim[k].value != null; }).length;
    if (active.length || nSim) {
      var cnt = el('span', 'chip-count',
        rows.length + ' of ' + SIGNALS.length + ' signals' + (nSim ? ' \u00b7 ' + nSim + ' manual override' + (nSim > 1 ? 's' : '') : ''));
      wrap.appendChild(cnt);
    }
  }

  /* ------------------------------------------------------- status sidebar */

  function renderStatusCounts(rows) {
    var ul = $('status-counts'); ul.innerHTML = '';
    var counts = {};
    rows.forEach(function (s) { counts[s.status] = (counts[s.status] || 0) + 1; });
    Object.keys(STATUS)
      .sort(function (a, b) { return STATUS[a].order - STATUS[b].order; })
      .forEach(function (k) {
        var n = counts[k] || 0;
        if (!n && state.status !== k) return;
        var li = el('li');
        var b = el('button', 'sc-row');
        b.type = 'button';
        b.setAttribute('aria-pressed', state.status === k ? 'true' : 'false');
        var d = el('span', 'dot'); d.dataset.tone = STATUS[k].tone;
        b.appendChild(d);
        b.appendChild(el('span', 'sc-label', STATUS[k].label));
        b.appendChild(el('span', 'sc-n', String(n)));
        b.addEventListener('click', function () {
          state.status = state.status === k ? '' : k;
          $('f-status').value = state.status;
          render();
        });
        li.appendChild(b);
        ul.appendChild(li);
      });
  }

  /* ------------------------------------------------------------ view intro */

  function renderIntro(rows) {
    var box = $('view-intro'); box.innerHTML = '';
    var h, p, meta = el('div', 'vi-meta');

    if (state.view === 'CONFLICTS') {
      h = 'Conflicts and unverified allocations';
      p = 'Every item below is a hold. Do not land wire or energize against these channels until the ' +
        'contradiction is resolved against the OEM schematic set 41434WB.pdf and re-issued into ' +
        D.meta.authority_file + '.';
      meta.appendChild(el('span', null, CONFLICTS.length + ' register entries'));
      meta.appendChild(el('span', null, rows.length + ' affected signals'));
    } else if (state.view === 'ALL') {
      h = 'All signals';
      p = 'Merged from ' + D.meta.authority_file + ' (wiring authority) and the HAL configuration. ' +
        'Rows marked "in HAL only" have no authority row.';
      meta.appendChild(el('span', null, SIGNALS.length + ' rows total'));
      meta.appendChild(el('span', null, (SIGNALS.length - D.orphan_nets.length) +
        ' authority rows + ' + D.orphan_nets.length + ' HAL-only nets'));
      meta.appendChild(el('span', null, 'of those authority rows, ' + D.missing_from_hal.length +
        ' are not netted in HAL yet'));
    } else {
      var b = BOARDS[state.view] || {};
      h = b.name || state.view;
      p = b.detail || '';
      if (b.role) meta.appendChild(el('span', null, b.role));
      if (b.address) meta.appendChild(el('span', null, b.address));
      meta.appendChild(el('span', null, rows.length + ' signals in view'));
    }

    box.appendChild(el('h2', null, h));
    box.appendChild(el('p', null, p));
    box.appendChild(meta);
  }

  /* ---------------------------------------------------------------- table */

  function td(cls, label) {
    var c = el('td', cls);
    if (label) c.setAttribute('data-label', label);
    return c;
  }

  function renderTable(rows) {
    var tb = $('tbody');
    tb.innerHTML = '';
    var frag = document.createDocumentFragment();

    rows.forEach(function (s) {
      var st = STATUS[s.status] || { label: s.status, tone: 'spare' };
      var tr = el('tr');
      tr.tabIndex = 0;
      tr.dataset.id = s.id;
      tr.setAttribute('aria-selected', state.selected === s.id ? 'true' : 'false');

      // status
      var c1 = td('c-status', 'Status');
      var w = el('span', 'cell-status');
      var dot = el('span', 'dot'); dot.dataset.tone = st.tone;
      w.appendChild(dot);
      var lbl = el('span', 'st-label', st.label); lbl.dataset.tone = st.tone;
      w.appendChild(lbl);
      c1.appendChild(w);
      tr.appendChild(c1);

      // signal
      var c2 = td('c-sig', 'Signal');
      c2.appendChild(el('span', 'sig-name', s.name));
      var sub = el('span', 'sig-sub', s.id + ' \u00b7 ' + s.subsystem);
      c2.appendChild(sub);
      var flags = el('span', 'row-flags');
      if (s.conflicts && s.conflicts.length) {
        var f = el('span', 'flag', s.conflicts.join(' ')); f.dataset.f = 'conflict'; flags.appendChild(f);
      }
      if (s.hal_state === 'absent' && s.hal_net) {
        var f2 = el('span', 'flag', 'no HAL'); f2.dataset.f = 'nohal'; flags.appendChild(f2);
      }
      if (s.hal_state === 'commented') {
        var f3 = el('span', 'flag', 'commented'); f3.dataset.f = 'commented'; flags.appendChild(f3);
      }
      if (state.sim[s.id] && state.sim[s.id].value != null) {
        var f4 = el('span', 'flag', 'sim'); f4.dataset.f = 'sim'; flags.appendChild(f4);
      }
      if (flags.childNodes.length) c2.appendChild(flags);
      tr.appendChild(c2);

      // board
      var c3 = td('c-board', 'Board');
      c3.appendChild(el('span', 'mono-cell strong', s.board === 'none' ? '\u2014' : s.board));
      tr.appendChild(c3);

      // connector / channel
      var c4 = td('c-chan', 'Conn / ch');
      c4.appendChild(el('span', 'mono-cell strong',
        (s.connector === 'none' ? '\u2014' : s.connector) + (s.channel ? ' \u00b7 ' + s.channel : '')));
      tr.appendChild(c4);

      // hal net
      var c5 = td('c-net', 'HAL net');
      c5.appendChild(el('span', 'mono-cell' + (s.hal_net ? '' : ' none'), s.hal_net || 'no net'));
      tr.appendChild(c5);

      // direction
      var c6 = td('c-dir', 'Dir');
      var dt = el('span', 'dir-tag', shortDir(s.direction));
      dt.dataset.d = s.direction;
      dt.title = s.direction_label;
      c6.appendChild(dt);
      tr.appendChild(c6);

      // expected
      var c7 = td('c-exp', 'Expected idle');
      var ev = el('span', 'exp-val', s.expected.value);
      ev.dataset.kind = s.expected.kind;
      c7.appendChild(ev);
      c7.appendChild(el('span', 'exp-note', s.expected.label));
      tr.appendChild(c7);

      // observed
      var c8 = td('c-live', 'Observed');
      var o = observed(s);
      var ob = el('span', 'obs', o.label);
      ob.dataset.src = o.src;
      ob.title = o.src === 'sim' ? 'Manual simulation value (this session only)'
        : o.src === 'live' ? 'Read-only value from halcmd on the LinuxCNC host'
          : 'No observation. Open the row to set a manual checkout value.';
      c8.appendChild(ob);
      tr.appendChild(c8);

      // landing
      var c9 = td('c-land', 'Landing point');
      var ld = el('span', 'land');
      (s.designations || []).forEach(function (d) {
        ld.appendChild(el('span', 'land-tag', d));
      });
      ld.appendChild(document.createTextNode(s.field_point || '\u2014'));
      ld.appendChild(el('span', 'land-sub', s.location || ''));
      c9.appendChild(ld);
      tr.appendChild(c9);

      tr.addEventListener('click', function () { openDrawer(s.id); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(s.id); }
      });
      frag.appendChild(tr);
    });

    tb.appendChild(frag);
    $('empty-state').hidden = rows.length !== 0;
    document.querySelector('[data-bind="count"]').textContent = rows.length;
  }

  function shortDir(d) {
    return ({
      IN: 'IN', OUT: 'OUT', ANALOG_OUT: 'AOUT', RESOLVER_IN: 'RES',
      ENCODER_IN: 'ENC', LINK: 'LINK', POWER: 'PWR', REVIEW: '?'
    })[d] || d;
  }

  /* -------------------------------------------------------- conflict cards */

  function renderConflicts() {
    var box = $('conflict-view');
    box.hidden = state.view !== 'CONFLICTS';
    if (box.hidden) { box.innerHTML = ''; return; }
    // In the conflict view the register reads first, then the affected rows.
    var wrap = $('table-wrap');
    if (box.nextElementSibling !== wrap) wrap.parentNode.insertBefore(box, wrap);
    if (box.childNodes.length) return; // built once

    CONFLICTS.forEach(function (c) {
      var card = el('section', 'cf');
      card.dataset.sev = c.severity;

      var head = el('button', 'cf-head');
      head.type = 'button';
      head.setAttribute('aria-expanded', 'false');
      head.appendChild(el('span', 'cf-id', c.id));
      var t = el('span', 'cf-title', c.title);
      t.appendChild(el('span', null, c.summary));
      head.appendChild(t);
      var caret = el('span', 'cf-caret', '\u203a');
      head.appendChild(caret);

      var body = el('div', 'cf-body');
      body.hidden = true;

      var ul = el('ul');
      (c.detail || []).forEach(function (d) { ul.appendChild(el('li', null, d)); });
      body.appendChild(ul);

      if (c.action) {
        var a = el('div', 'cf-action');
        a.appendChild(el('strong', null, 'Required before wiring'));
        a.appendChild(document.createTextNode(c.action));
        body.appendChild(a);
      }

      var links = el('div', 'cf-links');
      (c.signals || []).forEach(function (sid) {
        if (!SIG_BY_ID[sid]) return;
        var p = el('button', 'pill', SIG_BY_ID[sid].name);
        p.type = 'button';
        p.addEventListener('click', function () { openDrawer(sid); });
        links.appendChild(p);
      });
      (c.sources || []).forEach(function (src) {
        var p = el('span', 'pill pill-static', src);
        links.appendChild(p);
      });
      body.appendChild(links);

      head.addEventListener('click', function () {
        var open = head.getAttribute('aria-expanded') === 'true';
        head.setAttribute('aria-expanded', open ? 'false' : 'true');
        body.hidden = open;
      });

      card.appendChild(head);
      card.appendChild(body);
      box.appendChild(card);
    });
  }

  /* --------------------------------------------------------------- drawer */

  var lastFocus = null;

  function pathStep(stage, value, note, unknown) {
    var li = el('li');
    if (unknown) li.dataset.unknown = '1';
    li.appendChild(el('span', 'p-stage', stage));
    var v = el('span', 'p-val');
    v.textContent = value;
    li.appendChild(v);
    if (note) li.appendChild(el('span', 'p-note', note));
    return li;
  }

  function section(title) {
    var s = el('section', 'd-sec');
    s.appendChild(el('h3', 'd-h', title));
    return s;
  }

  function kvRow(dl, k, v, mono) {
    dl.appendChild(el('dt', null, k));
    dl.appendChild(el('dd', mono ? 'mono' : null, v || '\u2014'));
  }

  function openDrawer(id) {
    var s = SIG_BY_ID[id];
    if (!s) return;
    state.selected = id;
    lastFocus = document.activeElement;

    var st = STATUS[s.status] || {};
    $('drawer-title').textContent = s.name;
    $('drawer-eyebrow').textContent =
      s.id + '  \u00b7  ' + (s.board === 'none' ? 'unassigned' : s.board) +
      '  \u00b7  ' + s.connector + (s.channel ? ' ' + s.channel : '');

    var body = $('drawer-body');
    body.innerHTML = '';

    /* status banner */
    var ban = el('div', 'd-banner');
    ban.dataset.tone = st.tone || 'spare';
    var bt = el('div');
    bt.appendChild(el('strong', null, st.label || s.status));
    bt.appendChild(document.createTextNode(st.blurb || ''));
    var se = el('p');
    se.style.margin = '6px 0 0';
    se.style.fontFamily = 'var(--font-mono)';
    se.style.fontSize = '11.5px';
    se.textContent = 'Energize check: ' + (st.safe_to_energize || 'Unknown \u2014 verify.');
    bt.appendChild(se);
    ban.appendChild(bt);
    body.appendChild(ban);

    /* end-to-end path */
    var sp = section('End-to-end path');
    var ul = el('ul', 'path');

    var lcnc = (s.direction === 'IN' || s.direction === 'RESOLVER_IN' || s.direction === 'ENCODER_IN')
      ? (s.consumers && s.consumers.length ? s.consumers.join(', ') : null)
      : (s.producers && s.producers.length ? s.producers.join(', ') : null);
    var lcncStage = (s.direction === 'IN' || s.direction === 'RESOLVER_IN' || s.direction === 'ENCODER_IN')
      ? '1 \u00b7 LinuxCNC consumer' : '1 \u00b7 LinuxCNC producer';
    ul.appendChild(pathStep(lcncStage, lcnc || 'none in HAL yet',
      lcnc ? null : 'No LinuxCNC-side pin is connected to this net in the current HAL set.', !lcnc));

    ul.appendChild(pathStep('2 \u00b7 HAL net', s.hal_net || 'not defined',
      s.hal_state === 'active' ? 'Active in HAL.'
        : s.hal_state === 'commented' ? 'Present but commented out in HAL.'
          : 'Not present in any HAL file yet.',
      s.hal_state !== 'active'));

    var pins = (s.mesa_pins && s.mesa_pins.length) ? s.mesa_pins.join(', ') : 'not bound in HAL';
    ul.appendChild(pathStep('3 \u00b7 HostMot2 / Mesa pin', pins,
      'HostMot2 pin naming is an unverified placeholder across this config (conflict C6). ' +
      'Confirm against dmesg / halcmd show pin after the first hm2_eth load.', true));

    ul.appendChild(pathStep('4 \u00b7 Physical connector',
      (s.board === 'none' ? 'unassigned' : s.board) + ' \u00b7 ' + s.connector + (s.channel ? ' \u00b7 ' + s.channel : ''),
      'Per ' + D.meta.authority_file + (s.authority_line ? ':' + s.authority_line : '') + '.',
      s.status === 'CONFIG_ONLY'));

    ul.appendChild(pathStep('5 \u00b7 Field device',
      ((s.designations || []).length ? s.designations.join(' / ') + ' \u2014 ' : '') + (s.field_point || 'unassigned'),
      s.location_note || null,
      !s.field_point));

    ul.appendChild(pathStep('6 \u00b7 Machine location',
      s.location || 'Unknown \u2014 trace in cabinet',
      s.machine_subsystem ? 'Subsystem: ' + s.machine_subsystem : null,
      /unknown/i.test(s.location || 'unknown')));

    sp.appendChild(ul);
    body.appendChild(sp);

    /* expected state */
    var ex = section('Expected normal / idle state');
    var exv = el('p');
    exv.style.margin = '0 0 6px';
    var big = el('span', 'exp-val', s.expected.value);
    big.dataset.kind = s.expected.kind;
    big.style.fontSize = '18px';
    exv.appendChild(big);
    exv.appendChild(document.createTextNode('  ' + s.expected.label));
    ex.appendChild(exv);
    var bas = el('p', 'sim-hint', 'Basis: ' + s.expected.basis);
    ex.appendChild(bas);
    body.appendChild(ex);

    /* manual state */
    var ms = section('Manual state \u00b7 wiring checkout');
    var sim = state.sim[s.id] || { value: null, note: '' };
    var row = el('div', 'sim');
    ['0', '1'].forEach(function (v) {
      var b = el('button', 'sim-btn', v);
      b.type = 'button';
      b.setAttribute('aria-pressed', sim.value === v ? 'true' : 'false');
      b.setAttribute('aria-label', 'Mark observed state ' + v);
      b.addEventListener('click', function () {
        setSim(s.id, sim.value === v ? null : v);
        openDrawer(s.id);
      });
      row.appendChild(b);
    });
    var clr = el('button', 'sim-btn', 'clear');
    clr.type = 'button';
    clr.style.minWidth = '80px';
    clr.addEventListener('click', function () { setSim(s.id, null); openDrawer(s.id); });
    row.appendChild(clr);
    var obsNow = observed(s);
    var okBadge = el('span', 'obs', obsNow.src === 'none' ? 'no observation' : obsNow.label);
    okBadge.dataset.src = obsNow.src;
    row.appendChild(okBadge);
    ms.appendChild(row);

    var ta = el('textarea', 'sim-note');
    ta.placeholder = 'Checkout note (meter reading, terminal found, who verified)…';
    ta.value = sim.note || '';
    ta.setAttribute('aria-label', 'Checkout note for ' + s.name);
    ta.addEventListener('input', function () {
      var cur = state.sim[s.id] || { value: null, note: '' };
      cur.note = ta.value;
      state.sim[s.id] = cur;
    });
    ms.appendChild(ta);
    ms.appendChild(el('p', 'sim-hint',
      'Session-only scratch state. Nothing is written to disk, to HAL, or to the machine. ' +
      'Export CSV to keep it.'));
    body.appendChild(ms);

    /* conflicts */
    if (s.conflicts && s.conflicts.length) {
      var cs = section('Open conflicts');
      s.conflicts.forEach(function (cid) {
        var c = CONFLICT_BY_ID[cid];
        if (!c) return;
        var d = el('div', 'cf-action');
        d.style.marginBottom = '8px';
        d.appendChild(el('strong', null, c.id + ' \u2014 ' + c.severity));
        d.appendChild(document.createTextNode(c.title + '. ' + c.summary));
        cs.appendChild(d);
      });
      var goto = el('button', 'pill', 'Open the conflict register');
      goto.type = 'button';
      goto.addEventListener('click', function () {
        state.view = 'CONFLICTS'; closeDrawer(); render();
      });
      cs.appendChild(goto);
      body.appendChild(cs);
    }

    /* identity */
    var idsec = section('Assignment');
    var dl = el('dl', 'kv');
    kvRow(dl, 'Board', (BOARDS[s.board] || {}).name || s.board);
    kvRow(dl, 'Connector', s.connector, true);
    kvRow(dl, 'Channel', s.channel, true);
    kvRow(dl, 'Direction', s.direction_label);
    kvRow(dl, 'HAL net', s.hal_net || 'not defined', true);
    kvRow(dl, 'Subsystem', s.subsystem + (s.machine_subsystem && s.machine_subsystem !== s.subsystem ? ' \u2192 ' + s.machine_subsystem : ''));
    kvRow(dl, 'Designations', (s.designations || []).join(', ') || 'none', true);
    kvRow(dl, 'Field point', s.field_point);
    kvRow(dl, 'Location', s.location);
    kvRow(dl, 'Authority row', s.authority_line ? D.meta.authority_file + ':' + s.authority_line : 'none \u2014 config only', true);
    idsec.appendChild(dl);
    if (s.cleanup_notes) {
      var n = el('div', 'd-notes');
      n.style.marginTop = '10px';
      n.appendChild(el('p', null, 'Repo note: ' + s.cleanup_notes));
      idsec.appendChild(n);
    }
    body.appendChild(idsec);

    /* HAL references */
    var hs = section('HAL references');
    var hl = el('ul', 'src-list');
    var refs = (s.hal_refs || []).concat(s.setp_refs || []);
    if (!refs.length) {
      hl.appendChild(el('li', null, 'No HAL statement references this signal yet.'));
    }
    refs.forEach(function (r) {
      var li = el('li');
      li.appendChild(el('span', 'src-file', r.file + ':' + r.line + (r.commented ? '  (commented out)' : '')));
      li.appendChild(el('span', 'src-note', r.text));
      hl.appendChild(li);
    });
    hs.appendChild(hl);
    body.appendChild(hs);

    /* other sources */
    if (s.sources && s.sources.length) {
      var ss = section('Source records');
      var sl = el('ul', 'src-list');
      s.sources.forEach(function (src) {
        var li = el('li');
        li.appendChild(el('span', 'src-file', src.file + (src.lines ? ':' + src.lines : '')));
        if (src.note) li.appendChild(el('span', 'src-note', src.note));
        sl.appendChild(li);
      });
      ss.appendChild(sl);
      body.appendChild(ss);
    }

    $('scrim').hidden = false;
    var dr = $('drawer');
    dr.hidden = false;
    positionDrawer();
    dr.focus();
    render(true);
  }

  function positionDrawer() {
    // Keep the header actions (export, theme, live) reachable while the drawer is open.
    var banner = document.querySelector('.safety-banner');
    var top = banner ? Math.max(0, Math.round(banner.getBoundingClientRect().bottom)) : 0;
    if (window.innerWidth <= 760) top = 0;
    $('drawer').style.top = top + 'px';
    $('scrim').style.top = top + 'px';
  }
  window.addEventListener('resize', function () {
    if (!$('drawer').hidden) positionDrawer();
  });

  function closeDrawer() {
    $('drawer').hidden = true;
    $('scrim').hidden = true;
    if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function setSim(id, value) {
    var cur = state.sim[id] || { value: null, note: '' };
    cur.value = value;
    state.sim[id] = cur;
    render(true);
  }

  /* ----------------------------------------------------------- CSV export */

  function csvCell(v) {
    var s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCSV() {
    var rows = sortSignals(filtered());
    var head = ['signal_id', 'signal_name', 'board', 'connector', 'channel', 'hal_net',
      'direction', 'subsystem', 'machine_subsystem', 'expected_idle', 'expected_basis',
      'authority_status', 'status_label', 'hal_state', 'mesa_pins', 'linuxcnc_producers',
      'linuxcnc_consumers', 'designations', 'field_point', 'machine_location',
      'conflicts', 'authority_ref', 'manual_state', 'manual_note', 'live_value'];
    var lines = [head.join(',')];

    rows.forEach(function (s) {
      var sim = state.sim[s.id] || {};
      var lv = (state.live.on && state.live.ok && s.hal_net) ? state.live.values[s.hal_net] : '';
      lines.push([
        s.id, s.name, s.board, s.connector, s.channel, s.hal_net,
        s.direction_label, s.subsystem, s.machine_subsystem,
        s.expected.value + ' — ' + s.expected.label, s.expected.basis,
        s.status, (STATUS[s.status] || {}).label, s.hal_state,
        (s.mesa_pins || []).join(' | '), (s.producers || []).join(' | '),
        (s.consumers || []).join(' | '), (s.designations || []).join(' | '),
        s.field_point, s.location, (s.conflicts || []).join(' '),
        s.authority_line ? D.meta.authority_file + ':' + s.authority_line : '',
        sim.value == null ? '' : sim.value, sim.note || '',
        lv === undefined ? '' : lv
      ].map(csvCell).join(','));
    });

    var header = '# Mazak VQC-20/40 I/O Navigator export — CONFIGURATION SNAPSHOT, NOT A SAFETY RECORD\n' +
      '# machine=' + D.meta.machine + ' serial=' + D.meta.serial + '\n' +
      '# data generated=' + D.meta.generated + '  authority=' + D.meta.authority_file + '\n' +
      '# view=' + state.view + ' search="' + state.q + '" board=' + (state.board || '*') +
      ' conn=' + (state.conn || '*') + ' dir=' + (state.dir || '*') +
      ' subsystem=' + (state.sub || '*') + ' status=' + (state.status || '*') + '\n' +
      '# rows=' + rows.length + ' exported=' + new Date().toISOString() + '\n';

    var blob = new Blob([header + lines.join('\n') + '\n'], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mazak_io_' + state.view.toLowerCase() + '_' +
      new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast(rows.length + ' rows exported');
  }

  /* ------------------------------------------------------------ live bridge */

  function setLinkState(st, label) {
    var box = $('link-state');
    box.querySelector('.link-dot').dataset.state = st;
    box.querySelector('.link-label').textContent = label;
  }

  function pollLive() {
    var req = new XMLHttpRequest();
    req.open('GET', 'api/io', true);
    req.timeout = 4000;
    req.onload = function () {
      var res = null;
      try { res = JSON.parse(req.responseText); } catch (e) {}
      if (req.status === 200 && res && res.ok) {
        state.live.ok = true;
        state.live.error = '';
        state.live.values = res.signals || {};
        state.live.ts = res.timestamp || '';
        setLinkState('live', 'Live \u00b7 ' + Object.keys(state.live.values).length + ' nets');
      } else {
        state.live.ok = false;
        state.live.error = (res && res.error) || ('HTTP ' + req.status);
        setLinkState('error', 'Bridge offline');
      }
      render(true);
    };
    var fail = function () {
      state.live.ok = false;
      state.live.error = 'No bridge at ./api/io. Run python3 serve_live.py on the LinuxCNC host.';
      setLinkState('error', 'Bridge offline');
      render(true);
    };
    req.onerror = fail;
    req.ontimeout = fail;
    try { req.send(); } catch (e) { fail(); }
  }

  function toggleLive() {
    state.live.on = !state.live.on;
    var b = $('btn-live');
    b.setAttribute('aria-pressed', state.live.on ? 'true' : 'false');
    if (state.live.on) {
      setLinkState('error', 'Connecting\u2026');
      pollLive();
      state.live.timer = setInterval(pollLive, 2000);
      toast('Live poll on — read-only halcmd, 2 s interval');
    } else {
      clearInterval(state.live.timer);
      state.live.timer = null;
      state.live.ok = false;
      state.live.values = Object.create(null);
      setLinkState('offline', 'Planning mode');
      render(true);
      toast('Live poll off — planning mode');
    }
  }

  /* ---------------------------------------------------------------- theme */

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var b = $('btn-theme');
    b.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme');
    b.title = 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme';
  }

  /* ---------------------------------------------------------------- toast */

  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* --------------------------------------------------------------- render */

  var cachedRows = [];

  function render(skipChrome) {
    var rows = sortSignals(filtered());
    cachedRows = rows;
    renderTable(rows);
    if (!skipChrome) {
      buildNav();
      renderIntro(rows);
      renderConflicts();
    }
    renderChips(rows);
    renderStatusCounts(rows);
  }

  /* -------------------------------------------------------------- keyboard */

  function rowEls() { return Array.prototype.slice.call($('tbody').querySelectorAll('tr')); }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select';

    if (e.key === 'Escape') {
      if (!$('drawer').hidden) { closeDrawer(); return; }
      if (typing && tag === 'input') { e.target.blur(); return; }
    }
    if (typing) return;

    if (e.key === '/') { e.preventDefault(); $('q').focus(); $('q').select(); return; }
    if (e.key === 'e' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); exportCSV(); return; }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'j' || e.key === 'k') {
      var rs = rowEls();
      if (!rs.length) return;
      var i = rs.indexOf(document.activeElement);
      var next = (e.key === 'ArrowDown' || e.key === 'j') ? i + 1 : i - 1;
      if (i === -1) next = 0;
      if (next < 0) next = 0;
      if (next >= rs.length) next = rs.length - 1;
      e.preventDefault();
      rs[next].focus();
    }
  });

  /* ----------------------------------------------------------------- init */

  fillMeta();
  buildFilters();
  render();

  $('btn-theme').addEventListener('click', function () {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  $('btn-export').addEventListener('click', exportCSV);
  $('btn-live').addEventListener('click', toggleLive);
  $('drawer-close').addEventListener('click', closeDrawer);
  $('scrim').addEventListener('click', closeDrawer);

  setLinkState('offline', 'Planning mode');

  // Deep link: #signal=ID
  var h = location.hash.match(/signal=([A-Za-z0-9_]+)/);
  if (h && SIG_BY_ID[h[1]]) openDrawer(h[1]);

  window.MAZAK_APP = { state: state, render: render, openDrawer: openDrawer, exportCSV: exportCSV };
})();
