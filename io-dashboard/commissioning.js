/* ==========================================================================
   Commissioning wiring workspace
   A second view of the same MAZAK_DATA authority model used by app.js.
   Local records are browser-only evidence notes; they never alter authority.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.MAZAK_DATA;
  var APP = window.MAZAK_APP;
  if (!D || !APP) return;

  var $ = function (id) { return document.getElementById(id); };
  var STATUS = APP.statuses;
  var RECORD_KEY = 'mazak-vqc2040-commissioning-record-v1';
  var records = Object.create(null);
  var selected = null;

  var RECORD_FIELDS = [
    'wire_number', 'from_terminal', 'to_terminal', 'conductor', 'cable_id',
    'relay_terminal', 'fuse', 'return_path', 'shield_path', 'idle_voltage',
    'active_voltage', 'continuity', 'normal_state', 'verified_by',
    'verified_date', 'evidence_ref', 'note'
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function dayMonthYear(value) {
    var text = String(value || '').trim();
    var iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return iso[3] + '-' + iso[2] + '-' + iso[1];
    var dmy = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!dmy) return text;
    var day = Number(dmy[1]);
    var month = Number(dmy[2]);
    if (day < 1 || day > 31 || month < 1 || month > 12) return text;
    return String(day).padStart(2, '0') + '-' + String(month).padStart(2, '0') + '-' + dmy[3];
  }

  function currentDayMonthYear() {
    var now = new Date();
    var day = String(now.getDate()).padStart(2, '0');
    var month = String(now.getMonth() + 1).padStart(2, '0');
    return day + '-' + month + '-' + now.getFullYear();
  }

  function displayTimestamp(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return value || '';
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var time = [date.getHours(), date.getMinutes(), date.getSeconds()].map(function (part) {
      return String(part).padStart(2, '0');
    }).join(':');
    return day + '-' + month + '-' + date.getFullYear() + ' ' + time;
  }

  function normalizeRecord(record) {
    if (record && record.verified_date) record.verified_date = dayMonthYear(record.verified_date);
    return record;
  }

  function loadRecords() {
    try {
      var raw = localStorage.getItem(RECORD_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.schema_version === 1 && parsed.records) records = parsed.records;
      Object.keys(records).forEach(function (id) { normalizeRecord(records[id]); });
    } catch (e) {
      records = Object.create(null);
    }
    updateRecordState();
  }

  function recordEnvelope() {
    return {
      schema_version: 1,
      machine: D.meta.machine,
      machine_serial: D.meta.serial,
      authority_file: D.meta.authority_file,
      authority_generated: D.meta.generated,
      saved_at: new Date().toISOString(),
      note: 'Local checkout evidence only. This file does not alter wiring authority or permit energization.',
      records: records
    };
  }

  function saveRecords() {
    try {
      localStorage.setItem(RECORD_KEY, JSON.stringify(recordEnvelope()));
      updateRecordState();
      return true;
    } catch (e) {
      updateRecordState('Browser storage unavailable; export JSON before closing.');
      return false;
    }
  }

  function hasRecord(id) {
    var r = records[id];
    if (!r) return false;
    return RECORD_FIELDS.some(function (key) { return String(r[key] || '').trim() !== ''; });
  }

  function recordCount() {
    return Object.keys(records).filter(hasRecord).length;
  }

  function updateRecordState(override) {
    var n = recordCount();
    if ($('record-state')) $('record-state').textContent = override || (n + ' circuit' + (n === 1 ? '' : 's') + ' saved in this browser.');
  }

  function isInput(s) {
    return s.direction === 'IN' || s.direction === 'RESOLVER_IN' || s.direction === 'ENCODER_IN';
  }

  function isBlocked(s) {
    var tone = (STATUS[s.status] || {}).tone;
    return tone === 'conflict' || s.status === 'CONFIG_ONLY' || s.status === 'HOLD_NOT_ORDERED';
  }

  function isAuthorityVerified(s) {
    return ['FIELD_VERIFIED', 'TRACED', 'ELECTRICALLY_VERIFIED', 'HAL_VERIFIED', 'COMMISSIONED'].indexOf(s.status) !== -1;
  }

  function mesaTerminal(s) {
    if ((s.board === '7i84U-A' || s.board === '7i84U-B') && /^TB[23]$/.test(s.connector)) {
      var m = String(s.channel || '').match(/^(IN|OUT)(\d+)$/);
      if (m) {
        var n = Number(m[2]);
        var pin = null;
        if (s.connector === 'TB3' && m[1] === 'IN' && n >= 0 && n <= 15) pin = n + 1;
        if (s.connector === 'TB3' && m[1] === 'OUT' && n >= 0 && n <= 7) pin = n + 17;
        if (s.connector === 'TB2' && m[1] === 'IN' && n >= 16 && n <= 31) pin = n - 15;
        if (s.connector === 'TB2' && m[1] === 'OUT' && n >= 8 && n <= 15) pin = n + 9;
        if (pin != null) return s.board + ' ' + s.connector + ' pin ' + pin + ' · ' + s.channel;
      }
    }
    return (s.board === 'none' ? 'Unassigned board' : s.board) + ' · ' +
      (s.connector || 'connector unknown') + (s.channel ? ' · ' + s.channel : '');
  }

  // Structured far-end terminal from the authority CSV (dest_connector/dest_pin),
  // e.g. "7i84U-A RJ45 pin 2" or "TB3". Empty string when the destination is a
  // loose device/load with no numbered terminal recorded.
  function destTerminal(s) {
    var conn = (s.dest_connector || '').trim();
    if (!conn) return '';
    var pin = (s.dest_pin || '').trim();
    return pin ? conn + ' pin ' + pin : conn;
  }

  // Sub-line for the field-destination node: lead with the structured terminal
  // when the authority CSV records one, then the machine location; otherwise
  // fall back to the location alone.
  function destSub(s) {
    var term = destTerminal(s);
    var loc = s.location || '';
    if (term) return loc ? term + ' · ' + loc : term;
    return loc || 'Machine location not recorded';
  }

  function epsonFerruleText(s) {
    return (s.epson_ferrules || []).map(function (f) { return f.label_text; }).join(' / ');
  }

  function epsonFerruleRelease(s) {
    var states = [];
    (s.epson_ferrules || []).forEach(function (f) {
      if (states.indexOf(f.release_status) === -1) states.push(f.release_status);
    });
    return states.join(' / ');
  }

  function epsonFerruleSub(s) {
    var ferrules = s.epson_ferrules || [];
    if (!ferrules.length) return '';
    return ferrules.map(function (f) {
      return 'Epson ' + f.label_text + ' · OEM ' + f.wire + ' from ' + f.old_location + ' · ' + f.release_status;
    }).join(' / ');
  }

  function interfaceText(s) {
    var all = [s.field_point, s.cleanup_notes, s.location_note].join(' ');
    var relay = all.match(/RLY-\d+/i);
    if (relay) return { main: relay[0].toUpperCase() + ' interposing relay', sub: 'Socket/contact terminals not yet recorded', unknown: true };
    if (/interposing relay/i.test(all)) return { main: 'Interposing relay', sub: 'Designation and terminals not yet recorded', unknown: true };
    if (s.direction === 'RESOLVER_IN') return { main: '3 shielded twisted pairs', sub: 'RESDRV / RESSIN / RESCOS; cable ID not yet recorded', unknown: true };
    if (s.direction === 'ANALOG_OUT') return { main: 'Shielded analog command pair', sub: 'Conductor and drive-terminal IDs not yet recorded', unknown: true };
    if (s.direction === 'LINK') {
      if (s.status === 'FACTORY_LINK') {
        return { main: 'RS-422 smart-serial link — factory cable', sub: s.location_note ||
          'Factory-terminated point-to-point plug-in cable; no field wire number to record — verified by sserial enumeration at LinuxCNC startup.', unknown: false };
      }
      return { main: 'RS-422 smart-serial link', sub: 'Cable identity to be recorded during checkout', unknown: true };
    }
    if (s.direction === 'POWER') return { main: 'Protected power conductor', sub: 'Fuse and wire number not yet recorded', unknown: true };
    return { main: 'Field conductor / interface', sub: 'Wire number and intermediate terminals not yet recorded', unknown: true };
  }

  function signalNodes(s) {
    var control = isInput(s) ? (s.consumers || []).join(', ') : (s.producers || []).join(', ');
    var iface = interfaceText(s);
    var mesaSub = [(s.mesa_pins || []).join(', '), epsonFerruleSub(s)].filter(Boolean).join(' · ');
    return [
      { stage: isInput(s) ? 'LinuxCNC consumer' : 'LinuxCNC source', main: control || 'No active HAL endpoint', sub: s.hal_net ? 'HAL net · ' + s.hal_net : 'HAL net not defined', unknown: !control },
      { stage: 'Mesa terminal', main: mesaTerminal(s), sub: mesaSub || 'HostMot2 binding unverified', kind: 'mesa', unknown: s.board === 'none' },
      { stage: 'Interface / conductor', main: iface.main, sub: iface.sub, kind: 'interface', unknown: iface.unknown },
      { stage: 'Field destination', main: s.field_point || 'Field device not assigned', sub: destSub(s), unknown: !destTerminal(s) && (!s.field_point || /unknown|unassigned/i.test((s.field_point || '') + ' ' + (s.location || ''))) }
    ];
  }

  function bankFor(s) {
    if (s.board !== '7i84U-A' && s.board !== '7i84U-B') return null;
    if (s.connector === 'TB3') return { name: 'VFIELDA', pins: 'TB1 pins 3/4', bank: 'TB3 I/O bank' };
    if (s.connector === 'TB2') return { name: 'VFIELDB', pins: 'TB1 pins 1/2', bank: 'TB2 I/O bank' };
    return null;
  }

  function powerNodes(s) {
    var bank = bankFor(s);
    return [
      { stage: 'Supply source', main: '24 VDC source / protection', sub: 'Source terminal and upstream protection not yet recorded', unknown: true },
      { stage: 'Mesa power bank', main: bank ? s.board + ' ' + bank.name + ' · ' + bank.pins : 'Circuit-specific Mesa supply not established', sub: bank ? bank.bank + '; positive terminals are not returns' : 'Consult the applicable board/drive primary source', kind: 'mesa', unknown: !bank },
      { stage: 'Protection / conductor', main: 'Fuse and field conductor', sub: 'Rating, fuse ID, and wire number not yet recorded', kind: 'interface', unknown: true },
      { stage: 'Powered device', main: s.field_point || s.name, sub: 'Load voltage/current must be verified before selection', unknown: true }
    ];
  }

  function returnNodes(s) {
    var bank = bankFor(s);
    return [
      { stage: 'Control reference', main: s.hal_net || s.name, sub: 'Logical normal state · ' + (s.expected ? s.expected.value + ' ' + s.expected.label : 'not stated') },
      { stage: 'Mesa common', main: bank ? s.board + ' TB1 pins 6/7/8 · GND/common' : 'Circuit reference terminal not established', sub: bank ? 'VIN/VFIELD common; do not use TB1 pins 1–4 as returns' : 'Confirm board/drive reference from its primary source', kind: 'mesa', unknown: !bank },
      { stage: 'Return conductor', main: '0 V / common return path', sub: 'Wire number and intermediate landing not yet recorded', kind: 'interface', unknown: true },
      { stage: 'Field return', main: s.field_point || s.name, sub: 'Actual load/contact return terminal not yet recorded', unknown: true }
    ];
  }

  function shieldNodes(s) {
    var shielded = s.direction === 'RESOLVER_IN' || s.direction === 'ANALOG_OUT' || s.direction === 'LINK';
    var main = s.direction === 'RESOLVER_IN' ? 'Pair shields at 7i49 end only' :
      s.direction === 'ANALOG_OUT' ? 'Drive-specific analog shield treatment' :
        s.direction === 'LINK' ? 'Smart-serial cable shield treatment' : 'No circuit-specific shield record';
    return [
      { stage: 'Signal / cable class', main: s.hal_net || s.name, sub: shielded ? 'Noise-sensitive cable run' : 'Shield requirement not established', unknown: !shielded },
      { stage: 'Controller-end landing', main: main, sub: s.direction === 'RESOLVER_IN' ? 'Per grounding plan and 7i49 manual' : 'Verify against grounding plan and device manual', kind: 'mesa', unknown: s.direction !== 'RESOLVER_IN' },
      { stage: 'Cable / routing', main: shielded ? 'Shielded cable; separate from switching power' : 'Cable construction not established', sub: 'Cable ID, route, and segregation evidence not yet recorded', kind: 'interface', unknown: true },
      { stage: 'Field-end treatment', main: s.direction === 'RESOLVER_IN' ? 'Shield isolated at resolver/motor end' : 'Field-end shield landing not established', sub: 'Verify isolation/termination before power', unknown: true }
    ];
  }

  function nodesFor(s) {
    if (APP.state.layer === 'power') return powerNodes(s);
    if (APP.state.layer === 'return') return returnNodes(s);
    if (APP.state.layer === 'shield') return shieldNodes(s);
    return signalNodes(s);
  }

  function nodeHTML(n) {
    var kind = n.unknown ? 'unknown' : (n.kind || 'known');
    return '<span class="circuit-node" data-kind="' + kind + '">' +
      '<span class="node-stage">' + esc(n.stage) + '</span>' +
      '<span class="node-main">' + esc(n.main) + '</span>' +
      (n.sub ? '<span class="node-sub">' + esc(n.sub) + '</span>' : '') + '</span>';
  }

  function renderList(rows) {
    var box = $('circuit-list');
    box.innerHTML = '';
    rows.forEach(function (s) {
      var st = STATUS[s.status] || { label: s.status, tone: 'spare' };
      var nodes = nodesFor(s);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'circuit-row';
      b.dataset.id = s.id;
      b.dataset.tone = st.tone || 'spare';
      b.dataset.layer = APP.state.layer;
      b.dataset.flow = isInput(s) ? 'input' : 'output';
      b.setAttribute('aria-pressed', selected === s.id ? 'true' : 'false');
      b.setAttribute('aria-label', s.name + ', ' + st.label + '. Open circuit evidence.');
      b.innerHTML = nodeHTML(nodes[0]) + '<span class="circuit-wire" aria-hidden="true"></span>' +
        nodeHTML(nodes[1]) + '<span class="circuit-wire" aria-hidden="true"></span>' +
        nodeHTML(nodes[2]) + '<span class="circuit-wire" aria-hidden="true"></span>' +
        nodeHTML(nodes[3]) + '<span class="row-footer"><strong>' + esc(s.name) + '</strong>' +
        '<span class="row-status">' + esc(st.label) + '</span>' +
        (epsonFerruleText(s) ? '<span class="row-label" data-release="' + esc(epsonFerruleRelease(s)) + '">Epson ' +
          esc(epsonFerruleText(s)) + ' · ' + esc(epsonFerruleRelease(s)) + '</span>' : '') +
        (s.conflicts && s.conflicts.length ? '<span class="row-status row-conflict">' + esc(s.conflicts.join(' ')) + '</span>' : '') +
        (hasRecord(s.id) ? '<span class="row-record">local evidence</span>' : '') +
        '<span>' + esc(s.id) + '</span></span>';
      b.addEventListener('click', function () { selectSignal(s.id); });
      box.appendChild(b);
    });
    $('commissioning-empty').hidden = rows.length !== 0;
  }

  function sourceItem(file, lines, note) {
    var href = APP.sourceHref(file, lines);
    var label = file + (lines ? ':' + lines : '');
    return '<li>' + (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>' :
      '<span class="source-unlinked">' + esc(label) + '</span>') +
      (note ? '<small>' + esc(note) + '</small>' : '') + '</li>';
  }

  function sourcesHTML(s) {
    var seen = Object.create(null);
    var out = [];
    function add(file, lines, note) {
      var key = file + ':' + (lines || '');
      if (!file || seen[key]) return;
      seen[key] = true;
      out.push(sourceItem(file, lines, note));
    }
    if (s.authority_line) add(D.meta.authority_file, s.authority_line, 'Wiring authority row');
    (s.sources || []).forEach(function (x) { add(x.file, x.lines, x.note); });
    (s.hal_refs || []).concat(s.setp_refs || []).forEach(function (x) { add(x.file, x.line, x.text); });
    if (s.board === '7i84U-A' || s.board === '7i84U-B') {
      add('https://www.mesanet.com/pdf/parallel/7i84uman.pdf', '', 'Mesa 7i84U primary manual · connector and terminal tables');
    }
    if (s.board === '7i84U-B') add('wiring/labels/7i84u_b_terminal_legend_epson.md', '', 'Project terminal legend generated from the authority table');
    if (s.board === '7i49') add('https://www.mesanet.com/pdf/motion/7i49man.pdf', '', 'Mesa 7i49 primary manual · resolver and analog connector pinouts');
    if (s.board === '7i44') add('https://store.mesanet.com/index.php?product_id=44', '', 'Mesa 7i44 primary product information and port pinout');
    if (APP.state.layer === 'shield') add('docs/grounding_shielding_plan.md', '', 'Project grounding and shield treatment');
    return out.length ? out.join('') : '<li><span class="source-unlinked">No source record attached.</span></li>';
  }

  var FIELD_META = [
    ['wire_number', 'Wire number', 'e.g. W-214'],
    ['from_terminal', 'From terminal', 'Verified source landing'],
    ['to_terminal', 'To terminal', 'Verified destination landing'],
    ['conductor', 'Conductor / color', 'Gauge, color, pair'],
    ['cable_id', 'Cable ID', 'Cable or harness ID'],
    ['relay_terminal', 'Relay / interface terminals', 'e.g. RLY-5 A1/A2, 11/14'],
    ['fuse', 'Fuse / protection', 'ID and rating'],
    ['return_path', 'Return path', '0 V/common/load return'],
    ['shield_path', 'Shield treatment', 'Both end conditions'],
    ['idle_voltage', 'Idle voltage', 'Measured value + reference'],
    ['active_voltage', 'Active voltage', 'Measured value + reference'],
    ['normal_state', 'Normal / fault state', 'NO/NC, active-high/low'],
    ['verified_by', 'Verified by', 'Name or initials'],
    ['verified_date', 'Verified date', 'DD-MM-YYYY'],
    ['evidence_ref', 'Evidence reference', 'Photo/log/test record'],
    ['note', 'Checkout note', 'Conditions, meter, anomalies']
  ];

  function fieldHTML(r, item) {
    var key = item[0], label = item[1], placeholder = item[2];
    var full = ['relay_terminal', 'return_path', 'shield_path', 'evidence_ref', 'note'].indexOf(key) !== -1;
    if (key === 'note') {
      return '<label class="record-field full"><span>' + esc(label) + '</span><textarea data-field="' + key + '" placeholder="' + esc(placeholder) + '">' + esc(r[key] || '') + '</textarea></label>';
    }
    var dateAttrs = key === 'verified_date' ? ' inputmode="numeric" maxlength="10" pattern="[0-3][0-9]-[01][0-9]-[0-9]{4}" title="Use DD-MM-YYYY"' : '';
    return '<label class="record-field' + (full ? ' full' : '') + '"><span>' + esc(label) + '</span><input data-field="' + key + '" value="' + esc(r[key] || '') + '" placeholder="' + esc(placeholder) + '"' + dateAttrs + '></label>';
  }

  function renderEvidence(s) {
    if (!s) {
      $('evidence-empty').hidden = false;
      $('evidence-content').hidden = true;
      return;
    }
    $('evidence-empty').hidden = true;
    var box = $('evidence-content');
    box.hidden = false;
    var st = STATUS[s.status] || { label: s.status, tone: 'spare', blurb: '' };
    var nodes = nodesFor(s);
    var r = records[s.id] || {};
    var path = nodes.map(function (n) { return '<li><strong>' + esc(n.stage) + '</strong><span>' + esc(n.main) + (n.sub ? ' · ' + esc(n.sub) : '') + '</span></li>'; }).join('');
    var ferrules = s.epson_ferrules || [];
    var ferruleEvidence = ferrules.length ? '<section class="evidence-section"><h3>Epson Mesa-end ferrule</h3><ul class="ferrule-evidence">' +
      ferrules.map(function (f) {
        return '<li><strong>' + esc(f.label_text) + '</strong><span>OEM wire ' + esc(f.wire) + ' · ' + esc(f.old_location) + ' · ' + esc(f.physical_pin) + '</span>' +
          '<small data-release="' + esc(f.release_status) + '">' + esc(f.release_status) + ' · continuity trace required before termination</small></li>';
      }).join('') + '</ul></section>' : '';
    box.innerHTML = '<div class="evidence-head"><div><h2>' + esc(s.name) + '</h2><p>' + esc(s.id + ' · ' + s.board + ' · ' + s.connector + ' ' + s.channel) + '</p></div>' +
      '<button type="button" class="btn" id="open-authority-detail">Table detail</button></div>' +
      '<section class="evidence-section"><div class="evidence-banner" data-tone="' + esc(st.tone || 'spare') + '"><strong>' + esc(st.label) + '</strong>' + esc(st.blurb || '') + '</div></section>' +
      '<section class="evidence-section"><h3>' + esc(APP.state.layer) + ' path in this view</h3><ul class="path-summary">' + path + '</ul></section>' +
      ferruleEvidence +
      '<section class="evidence-section"><h3>Source evidence</h3><ul class="source-links">' + sourcesHTML(s) + '</ul></section>' +
      '<section class="evidence-section"><h3>Local checkout record</h3><div class="record-grid">' +
      FIELD_META.map(function (item) { return fieldHTML(r, item); }).join('') +
      '<label class="record-field"><span>Continuity</span><select data-field="continuity"><option value="">Untested</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label></div>' +
      '<p class="record-note">Saved only in this browser. Recording evidence does not promote the authority status.</p>' +
      '<div class="record-controls"><button type="button" class="btn" id="save-record">Save now</button><button type="button" class="btn btn-danger" id="clear-record">Clear this record</button></div>' +
      '<span class="record-stamp" id="record-stamp">' + (r.updated_at ? 'Last saved ' + esc(displayTimestamp(r.updated_at)) : 'Not yet recorded') + '</span></section>';
    var sel = box.querySelector('[data-field="continuity"]');
    if (sel) sel.value = r.continuity || '';
    box.querySelectorAll('[data-field]').forEach(function (input) {
      input.addEventListener('input', function () { updateField(s.id, input.dataset.field, input.value); });
      input.addEventListener('change', function () {
        if (input.dataset.field === 'verified_date') input.value = dayMonthYear(input.value);
        updateField(s.id, input.dataset.field, input.value);
      });
    });
    $('open-authority-detail').addEventListener('click', function () { APP.openDrawer(s.id); });
    $('save-record').addEventListener('click', function () { saveRecords(); APP.toast('Local checkout record saved'); renderList(APP.sortedFiltered()); updateStats(APP.sortedFiltered()); });
    $('clear-record').addEventListener('click', function () {
      if (!window.confirm('Clear the local checkout record for ' + s.name + '?')) return;
      delete records[s.id]; saveRecords(); renderList(APP.sortedFiltered()); renderEvidence(s); updateStats(APP.sortedFiltered());
    });
  }

  function updateField(id, key, value) {
    if (!records[id]) records[id] = {};
    records[id][key] = value;
    records[id].updated_at = new Date().toISOString();
    saveRecords();
    var stamp = $('record-stamp');
    if (stamp) stamp.textContent = 'Saved ' + displayTimestamp(records[id].updated_at);
    var lane = $('circuit-list').querySelector('[data-id="' + id + '"] .row-footer');
    if (lane && hasRecord(id) && !lane.querySelector('.row-record')) lane.insertAdjacentHTML('beforeend', '<span class="row-record">local evidence</span>');
    updateStats(APP.sortedFiltered());
  }

  function updateStats(rows) {
    $('sum-visible').textContent = rows.length;
    $('sum-recorded').textContent = rows.filter(function (s) { return hasRecord(s.id); }).length;
    $('sum-blocked').textContent = rows.filter(isBlocked).length;
    $('sum-verified').textContent = rows.filter(isAuthorityVerified).length;
  }

  function selectSignal(id) {
    selected = id;
    var rows = APP.sortedFiltered();
    renderList(rows);
    renderEvidence(APP.signalsById[id]);
    try { history.replaceState(null, '', '#wiring=' + encodeURIComponent(id)); } catch (e) {}
    if (window.innerWidth <= 1050) $('evidence-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setMode(mode) {
    APP.state.mode = mode;
    document.body.dataset.workspace = mode;
    $('btn-workspace-io').setAttribute('aria-pressed', mode === 'io' ? 'true' : 'false');
    $('btn-workspace-wiring').setAttribute('aria-pressed', mode === 'wiring' ? 'true' : 'false');
    var projBtn = $('btn-workspace-project');
    if (projBtn) projBtn.setAttribute('aria-pressed', mode === 'project' ? 'true' : 'false');
    $('commissioning-view').hidden = mode !== 'wiring';
    $('commissioning-actions').hidden = mode !== 'wiring';
    $('fl-layer').hidden = mode !== 'wiring';
    $('table-wrap').hidden = mode !== 'io';
    $('btn-export').hidden = mode !== 'io';
    var projView = $('project-view');
    if (projView) projView.hidden = mode !== 'project';
    $('workspace-title').textContent = 'Mazak VQC-20/40 · ' +
      (mode === 'wiring' ? 'Commissioning Wiring' : mode === 'project' ? 'Project Status & Hardware' : 'I/O Navigator');
    APP.closeDrawer();
    APP.render();
    if (mode !== 'wiring' && /^#wiring=/.test(location.hash)) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
    if (mode === 'project') {
      try { history.replaceState(null, '', '#project'); } catch (e) {}
    } else if (location.hash === '#project') {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
  }

  function render(rows) {
    var mode = APP.state.mode;
    var wiring = mode === 'wiring';
    $('commissioning-view').hidden = !wiring;
    $('commissioning-actions').hidden = !wiring;
    $('fl-layer').hidden = !wiring;
    $('table-wrap').hidden = mode !== 'io';
    $('btn-export').hidden = mode !== 'io';
    var projView = $('project-view');
    if (projView) projView.hidden = mode !== 'project';
    if (mode !== 'io') $('conflict-view').hidden = true;
    if (mode === 'project' && window.MAZAK_PROJECT_VIEW) window.MAZAK_PROJECT_VIEW.render();
    if (!wiring) return;
    $('f-layer').value = APP.state.layer;
    renderList(rows);
    updateStats(rows);
    if (selected && rows.some(function (s) { return s.id === selected; })) renderEvidence(APP.signalsById[selected]);
    else if (rows.length) { selected = rows[0].id; renderEvidence(rows[0]); renderList(rows); }
    else renderEvidence(null);
  }

  function download(name, content, type) {
    var url = URL.createObjectURL(new Blob([content], { type: type }));
    var a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function csvCell(value) {
    var s = String(value == null ? '' : value);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCSV() {
    var rows = APP.sortedFiltered();
    var keys = ['signal_id', 'signal_name', 'authority_status', 'board', 'connector', 'channel', 'hal_net',
      'epson_label', 'epson_oem_wire', 'epson_oem_source', 'epson_physical_pin', 'epson_release_status'].concat(RECORD_FIELDS, ['record_updated_at']);
    var lines = [keys.join(',')];
    rows.forEach(function (s) {
      var r = records[s.id] || {};
      var ferrules = s.epson_ferrules || [];
      var vals = [s.id, s.name, s.status, s.board, s.connector, s.channel, s.hal_net,
        ferrules.map(function (f) { return f.label_text; }).join(' | '),
        ferrules.map(function (f) { return f.wire; }).join(' | '),
        ferrules.map(function (f) { return f.old_location; }).join(' | '),
        ferrules.map(function (f) { return f.physical_pin; }).join(' | '),
        ferrules.map(function (f) { return f.release_status; }).join(' | ')];
      RECORD_FIELDS.forEach(function (key) { vals.push(r[key] || ''); });
      vals.push(r.updated_at || '');
      lines.push(vals.map(csvCell).join(','));
    });
    download('mazak_commissioning_' + currentDayMonthYear() + '.csv', lines.join('\n') + '\n', 'text/csv;charset=utf-8');
    APP.toast(rows.length + ' commissioning rows exported');
  }

  function importRecords(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        if (!parsed || parsed.schema_version !== 1 || !parsed.records) throw new Error('Unsupported record format.');
        if (parsed.machine_serial && parsed.machine_serial !== D.meta.serial) throw new Error('Machine serial does not match ' + D.meta.serial + '.');
        if (!window.confirm('Merge ' + Object.keys(parsed.records).length + ' imported circuit records into this browser? Existing matching records will be replaced.')) return;
        Object.keys(parsed.records).forEach(function (id) {
          if (APP.signalsById[id]) records[id] = normalizeRecord(parsed.records[id]);
        });
        saveRecords(); APP.render(); APP.toast('Commissioning records imported');
      } catch (e) { APP.toast('Import refused: ' + e.message); }
    };
    reader.readAsText(file);
  }

  $('btn-workspace-io').addEventListener('click', function () { setMode('io'); });
  $('btn-workspace-wiring').addEventListener('click', function () { setMode('wiring'); });
  if ($('btn-workspace-project')) $('btn-workspace-project').addEventListener('click', function () { setMode('project'); });
  $('f-layer').addEventListener('change', function () {
    APP.state.layer = this.value;
    var explanations = {
      signal: 'Signal view follows LinuxCNC/HAL, the Mesa terminal, any known interface, and the field destination.',
      power: 'Power view shows only known Mesa field-bank relationships; supply source, protection, and load details remain unresolved until recorded.',
      return: 'Return view distinguishes documented Mesa common terminals from the still-untraced field return path.',
      shield: 'Shield view applies the project grounding plan where it is specific and flags every unrecorded cable-end treatment.'
    };
    $('layer-explanation').textContent = explanations[APP.state.layer];
    APP.render();
  });
  $('btn-record-export').addEventListener('click', function () {
    download('mazak_commissioning_records_' + currentDayMonthYear() + '.json', JSON.stringify(recordEnvelope(), null, 2) + '\n', 'application/json');
    APP.toast(recordCount() + ' local records exported');
  });
  $('btn-record-import').addEventListener('click', function () { $('record-import-file').click(); });
  $('record-import-file').addEventListener('change', function () { if (this.files && this.files[0]) importRecords(this.files[0]); this.value = ''; });
  $('btn-record-csv').addEventListener('click', exportCSV);
  $('btn-record-print').addEventListener('click', function () { window.print(); });

  loadRecords();
  window.MAZAK_COMMISSIONING = { render: render, setMode: setMode, exportCSV: exportCSV, records: records };

  var deep = location.hash.match(/wiring=([A-Za-z0-9_]+)/);
  if (deep && APP.signalsById[deep[1]]) { selected = deep[1]; setMode('wiring'); }
  else if (location.hash === '#project') setMode('project');
  else render(APP.sortedFiltered());
})();
