/* ==========================================================================
   Project status & hardware workspace
   Auto counts computed from MAZAK_DATA (data.js snapshot);
   milestones, pending items and hardware inventory curated in project_data.js.
   Read-only. Nothing here is a permission to energize.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.MAZAK_DATA;
  var APP = window.MAZAK_APP;
  var P = window.MAZAK_PROJECT;
  if (!D || !APP || !P) return;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var VERIFIED = /VERIFIED|COMMISSIONED|TRACED/;

  function statusCounts() {
    var counts = {};
    (D.signals || []).forEach(function (s) {
      var st = s.status || s.authority_status || 'UNKNOWN';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }

  function statusClass(st) {
    if (VERIFIED.test(st)) return 'pv-chip pv-good';
    if (/HOLD|CONFLICT/.test(st)) return 'pv-chip pv-bad';
    if (/PROPOSED/.test(st)) return 'pv-chip pv-steel';
    return 'pv-chip pv-amber';
  }

  function hwClass(st) {
    if (st === 'CONFIRMED') return 'pv-chip pv-accent';
    if (st === 'PLACEHOLDER') return 'pv-chip pv-bad';
    return 'pv-chip pv-amber'; // PENDING_BENCH, TENTATIVE
  }

  function tile(value, label, cls) {
    var t = el('div', 'pv-tile' + (cls ? ' ' + cls : ''));
    t.appendChild(el('span', 'pv-tile-value', String(value)));
    t.appendChild(el('span', 'pv-tile-label', label));
    return t;
  }

  function renderStatus(root) {
    root.innerHTML = '';
    var counts = statusCounts();
    var total = (D.signals || []).length;
    var conflicts = (D.conflicts || []).length;
    var verified = 0;
    Object.keys(counts).forEach(function (st) { if (VERIFIED.test(st)) verified += counts[st]; });

    var head = el('div', 'pv-head');
    head.appendChild(el('h2', null, 'Project status'));
    var meta = el('p', 'pv-meta');
    meta.textContent = 'Authority snapshot generated ' + (D.meta.generated || '—') +
      ' · curated entries updated ' + P.updated + ' · ' + P.status_note;
    head.appendChild(meta);
    root.appendChild(head);

    var tiles = el('div', 'pv-tiles');
    tiles.appendChild(tile(total, 'authority rows'));
    tiles.appendChild(tile(conflicts, 'registered conflicts', conflicts ? 'pv-tile-bad' : ''));
    tiles.appendChild(tile(verified, 'physically verified', verified ? 'pv-tile-good' : ''));
    tiles.appendChild(tile((D.meta.halfiles || []).length, 'HAL files'));
    root.appendChild(tiles);

    var bd = el('div', 'pv-breakdown');
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (st) {
      var row = el('div', 'pv-bd-row');
      row.appendChild(el('span', statusClass(st), st));
      row.appendChild(el('span', 'pv-bd-count', String(counts[st])));
      var bar = el('span', 'pv-bd-bar');
      var fill = el('span', 'pv-bd-fill');
      fill.style.width = Math.max(2, Math.round(100 * counts[st] / total)) + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      bd.appendChild(row);
    });
    root.appendChild(bd);

    var cols = el('div', 'pv-cols');
    var mCol = el('section', 'pv-col');
    mCol.appendChild(el('h3', null, 'Milestones'));
    var mList = el('ul', 'pv-list');
    (P.milestones || []).forEach(function (m) {
      var li = el('li', 'pv-item');
      li.appendChild(el('span', 'pv-date', m.date));
      li.appendChild(el('span', 'pv-text', m.text));
      if (m.ref) li.appendChild(el('span', 'pv-ref', m.ref));
      mList.appendChild(li);
    });
    mCol.appendChild(mList);
    cols.appendChild(mCol);

    var pCol = el('section', 'pv-col');
    pCol.appendChild(el('h3', null, 'Open / pending'));
    var pList = el('ul', 'pv-list');
    (P.pending || []).forEach(function (p) {
      var li = el('li', 'pv-item pv-item-open');
      li.appendChild(el('span', 'pv-text', p.text));
      if (p.ref) li.appendChild(el('span', 'pv-ref', p.ref));
      pList.appendChild(li);
    });
    pCol.appendChild(pList);
    cols.appendChild(pCol);
    root.appendChild(cols);
  }

  function renderHardware(root) {
    root.innerHTML = '';
    var head = el('div', 'pv-head');
    head.appendChild(el('h2', null, 'Hardware list'));
    head.appendChild(el('p', 'pv-meta',
      'Physical inventory with identity status. CONFIRMED = physically read or documented; ' +
      'PENDING_BENCH / TENTATIVE identities must not be treated as wiring authority.'));
    root.appendChild(head);

    var table = el('table', 'pv-table');
    var thead = el('thead');
    var hr = el('tr');
    ['Group', 'Item', 'Detail', 'Status', 'Source'].forEach(function (h) {
      hr.appendChild(el('th', null, h));
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    var lastGroup = null;
    (P.hardware || []).forEach(function (h) {
      var tr = el('tr');
      var g = el('td', 'pv-group');
      if (h.group !== lastGroup) { g.textContent = h.group; lastGroup = h.group; }
      tr.appendChild(g);
      tr.appendChild(el('td', 'pv-item-name', h.item));
      tr.appendChild(el('td', 'pv-detail', h.detail));
      var stCell = el('td');
      stCell.appendChild(el('span', hwClass(h.status), h.status));
      tr.appendChild(stCell);
      tr.appendChild(el('td', 'pv-ref', h.source));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    var wrap = el('div', 'pv-table-wrap');
    wrap.appendChild(table);
    root.appendChild(wrap);
  }

  var built = false;
  function render() {
    if (built) return;
    renderStatus($('project-status'));
    renderHardware($('project-hardware'));
    built = true;
  }

  window.MAZAK_PROJECT_VIEW = { render: render };

  // commissioning.js handles the '#project' deep link before this file loads;
  // if it already switched the mode, fill the (then-empty) view now.
  if (APP.state.mode === 'project') render();
})();
