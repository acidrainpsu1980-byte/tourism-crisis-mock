/* =====================================================================
 * หน้าจอระดับผู้บริหาร (Strategic) ตามไฟล์นำเสนอหน้า 4–21
 * ===================================================================== */
(() => {
  const T = TRI, D = DASH, { esc, icon, sev, stp, chip, icT, table, callout, card, kpiRow, airow, actionBar, hbars, riskColor, lineChart, legend, donut, dlegend, heatGrid, riskMatrix, phuketMap, hhmm, dateTH, techI } = T;
  const agencyShort = id => { const a = T.ST.agencies.find(x => x.agency_id === id); return a ? a.short : id; };
  const agencyName = id => { const a = T.ST.agencies.find(x => x.agency_id === id); return a ? a.name : id; };
  const SEVTONE = { crit: 'red', high: 'orange', med: 'yellow', low: 'green' };

  /* ---------- filter bar (shared) ---------- */
  T.filterbar = (keys = ['province', 'area', 'scenario', 'period', 'level', 'lang'], { compare = true, exp = true, needs = true } = {}) => {
    const S = T.S;
    const sel = (k, ic, label, opts, val) => `<div class="fsel">${icon(ic, 19)}<label><span>${label}</span><select data-filter="${k}" aria-label="${label}">${opts.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(val) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label></div>`;
    const F = {
      province: () => sel('province', 'building', 'จังหวัด', [['phuket', 'ภูเก็ต (นำร่อง)'], ['all', 'ทั้งประเทศ (ยังไม่เชื่อมต่อ)']], 'phuket'),
      area: () => sel('area', 'pin', 'พื้นที่', [['', 'ทั้งหมด'], ...D.map.places.filter(p => D.riskmap.areas[p.id]).map(p => [p.id, p.name])], S.mapPlace === 'patong' && !S.areaChosen ? '' : S.mapPlace),
      scenario: () => sel('scenario', 'alert', 'เหตุการณ์ที่ติดตาม', T.ST.scenarios.map(s => [s.id, s.name]), S.scenario),
      type: () => sel('type', 'shield', 'ประเภทความเสี่ยง', [['', 'ทั้งหมด'], ...T.ST.hazard_types.map(h => [h.hazard_code, h.name])], S.fType || ''),
      period: () => sel('period', 'clock', 'ช่วงเวลา', [['today', 'วันนี้'], ['7d', '7 วันล่าสุด'], ['30d', '30 วันล่าสุด']], S.fPeriod || '7d'),
      level: () => sel('level', 'alert', 'ระดับความรุนแรง', [['', 'ทั้งหมด'], ['crit', 'วิกฤติ'], ['high', 'สูง'], ['med', 'ปานกลาง']], S.fLevel || ''),
      lang: () => sel('lang', 'globe', 'ภาษา', [['TH', 'ไทย'], ['EN', 'English'], ['ZH', '中文']], S.fLang || 'TH'),
      platform: () => sel('platform', 'chat', 'แพลตฟอร์ม', [['', 'ทั้งหมด'], ...D.social.platforms.map(p => [p.name, p.name])], S.fPlatform || ''),
      agency: () => sel('agency', 'building', 'หน่วยงาน', [['', 'ทั้งหมด'], ...T.ST.agencies.filter(a => a.tier === 'core').map(a => [a.agency_id, a.short])], S.fAgency || ''),
      model: () => sel('model', 'ai', 'รูปแบบการคาดการณ์', [['ens', 'AI Ensemble (แนะนำ)'], ['rule', 'กฎ rule-v1.2']], 'ens'),
    };
    return `<div class="filterbar">${keys.map(k => F[k] ? F[k]() : '').join('')}<span class="spacer"></span>
      ${needs ? `<button class="btn ghost" data-action="needs" title="ข้อมูลที่ต้องใช้ขับเคลื่อนหน้านี้">${icon('db', 17)} ข้อมูลที่ต้องใช้</button>` : ''}
      ${compare ? `<button class="btn outline" data-action="compare">${icon('compare', 17)} เปรียบเทียบ</button>` : ''}
      ${exp ? `<button class="btn" data-action="export-report">${icon('download', 17)} ส่งออกรายงาน</button>` : ''}</div>`;
  };

  /* ================================================================ 1. ภาพรวมสถานการณ์ */
  T.screens.overview = async () => {
    const S = T.S, O = D.overview;
    const [alerts, tasks, sos, majors] = await Promise.all([API.getAlerts(), API.getTasks(), API.getSOS(), Promise.all(T.ST.scenarios.map(s => API.getMajorIncident(s.id)))]);
    const review = alerts.filter(a => a.status === 'review').length, hard = tasks.filter(t => t.hard_priority && ['pending', 'offered'].includes(t.status)).length, waitS = sos.filter(s => s.status === 'received').length;
    const soc = O.social[S.socLang || 'TH'];
    const socSeg = [{ name: 'เชิงลบ', value: soc.neg, color: '#e03a3e' }, { name: 'เป็นกลาง', value: soc.neu, color: '#f4b400' }, { name: 'เชิงบวก', value: soc.pos, color: '#22b45f' }];
    const fc = O.forecast;
    const decide = `<section class="card" style="padding:12px 16px"><div class="row between"><div class="row" style="gap:8px">${icT('bell', 'red', 17)}<b>รอการตัดสินใจจากระบบปฏิบัติการ</b><span class="tiny">ข้อมูลสดจากการกดในเดโม</span></div>
      <div class="row">${[[review, 'ประกาศรออนุมัติ', 'comms', 'warn'], [hard, 'ภารกิจอันตรายถึงชีวิตรอผู้รับ', 'toc', 'crit'], [waitS, 'คำขอ SOS รอคัดกรอง', 'toc', 'info']].map(([n, t, go, tone]) => `<button class="btn sm ${n ? '' : 'ghost'}" data-go="${go}" ${go === 'toc' ? `data-tab="${t.includes('SOS') ? 'sos' : 'task'}"` : ''} style="${n && tone === 'crit' ? 'background:var(--crit);border-color:var(--crit)' : ''}">${t} <b class="tnum">${n}</b></button>`).join('')}</div></div></section>`;
    const mapCard = `<section class="card"><div class="card-head"><h2>แผนที่ความเสี่ยงการท่องเที่ยว (Tourism Risk Map)</h2><button class="link-btn" data-go="riskmap">ดูรายละเอียดแผนที่</button></div>
      <div class="mapbox" style="max-height:420px">${phuketMap({ layers: D.map.layers.map(l => ({ ...l, on: !['evac', 'cctv', 'siren', 'help', 'pier', 'airport'].includes(l.id) })), selected: null, incidents: D.alerts.feed.slice(0, 4), small: true })}
      <div class="map-legend"><b>ระดับความเสี่ยง</b><span><i class="dotsw" style="background:#22b45f"></i>ต่ำ</span><span><i class="dotsw" style="background:#f4b400"></i>ปานกลาง</span><span><i class="dotsw" style="background:#f07a12"></i>สูง</span><span><i class="dotsw" style="background:#e03a3e"></i>วิกฤติ</span><span>📍 เหตุการณ์ปัจจุบัน</span></div></div></section>`;
    const alertCard = card('ศูนย์แจ้งเตือน (Alert Center)', `<div class="alist">${D.alerts.feed.slice(0, 5).map(a => `<button class="arow" data-go="alertcenter" data-alertsel="${a.id}">${icT(a.icon, SEVTONE[a.sev], 17)}<div><b>${esc(a.name)}</b><span>${esc(a.area)}</span></div><div class="right">${a.time} น.${sev(a.sev)}</div></button>`).join('')}</div>`, { right: '<button class="link-btn" data-go="alertcenter">ดูทั้งหมด</button>', more: 'ดูการแจ้งเตือนทั้งหมด', moreAct: 'data-go="alertcenter"' });
    const aiCard = card('คำแนะนำเพื่อการตัดสินใจ (AI)', `<div class="alist">${O.ai.map((a, i) => airow(a, i)).join('')}</div>`, { right: chip('AI', 'info', true), more: 'ดูคำแนะนำทั้งหมด', moreAct: 'data-go="risk"' });
    const quick = `<section class="card qpanel"><div class="card-head"><h2>การดำเนินการด่วน</h2></div><div class="qcol">
      <button class="qbtn red" data-action="q-alert">${icon('megaphone', 20)} ประกาศเตือนภัย</button><button class="qbtn blue" data-action="cmd">${icon('users', 20)} สั่งการหน่วยงาน</button>
      <button class="qbtn purple" data-action="q-multilang">${icon('chat', 20)} ส่งข้อความหลายภาษา</button><button class="qbtn orange" data-action="meeting">${icon('video', 20)} เปิดประชุมด่วน</button>
      <button class="qbtn ghost" data-action="report" data-type="exec">${icon('doc', 20)} ดูรายงานสรุป</button></div></section>`;
    const fcCard = card('Risk Forecasting', `<div class="tabs-mini" role="group" style="margin-bottom:8px">${fc.tabs.map((t, i) => `<button data-fctab="${i}" aria-pressed="${(S.fcTab || 0) === i}">${t}</button>`).join('')}</div>
      ${lineChart({ labels: fc.labels, series: [{ name: 'คาดการณ์', color: '#e03a3e', values: fc.values.map(v => Math.round(v * (1 - (S.fcTab || 0) * .06))) }], bands: [{ lo: fc.lo, hi: fc.hi, color: '#e03a3e', opacity: .12 }], height: 170, yMax: 100, endLabels: false })}
      ${legend([{ name: 'คาดการณ์', color: '#e03a3e' }, { name: 'ช่วงคาดการณ์ (ความเชื่อมั่น 80%)', color: '#f6b3b4' }])}`, { info: true });
    const socCard = card('Social Listening & Sentiment', `<div class="tabs-mini" style="margin-bottom:8px">${[['TH', 'ไทย'], ['EN', 'English'], ['ZH', '中文']].map(([k, n]) => `<button data-soclang="${k}" aria-pressed="${(S.socLang || 'TH') === k}">${n}</button>`).join('')}</div>
      <div class="donut-wrap">${donut(socSeg, soc.score.toFixed(2), 'Sentiment', 130)}${dlegend(socSeg.map((s, i) => ({ ...s, n: soc.n[i] })), s => `${s.value}%`)}</div>`, { more: 'ดูรายละเอียด', moreAct: 'data-go="social"' });
    const crowdCard = card('Crowd & Mobility Analytics', `<div class="row" style="flex-wrap:nowrap;align-items:start;gap:10px"><div class="mapbox" style="flex:0 0 42%">${phuketMap({ layers: [{ id: 'crowd', on: true }], showLabels: false, small: true })}</div>
      <div style="flex:1;min-width:0"><div class="tiny" style="margin-bottom:6px">ความหนาแน่นปัจจุบัน (% ความจุ)</div>${O.crowd.map(c => `<div class="row between" style="padding:4px 0;font-size:13px;flex-wrap:nowrap"><span><i class="dotsw" style="background:${riskColor(c.pct)}"></i>${esc(c.name)}</span><b class="tnum">${c.pct}%</b></div>`).join('')}</div></div>`, { more: 'ดูรายละเอียด', moreAct: 'data-go="crowd"' });
    const agCard = card('สถานะหน่วยงาน', `<table class="mtable"><thead><tr><th>หน่วยงาน</th><th>สถานะ</th><th>ภารกิจสำคัญ</th></tr></thead><tbody>${O.agencies.map(a => `<tr><td><span class="agency-pill" data-agency="${a.id}">${esc(agencyShort(a.id))}</span></td><td>${stp(a.status, a.tone)}</td><td class="small">${esc(a.task)}</td></tr>`).join('')}</tbody></table>`, { more: 'ดูสถานะทั้งหมด', moreAct: 'data-go="agencies"' });
    const scCard = card('Scenario Simulation', `<table class="mtable"><thead><tr><th></th><th class="c" style="color:var(--good)">Best case</th><th class="c" style="color:var(--high)">Base case</th><th class="c" style="color:var(--crit)">Worst case</th></tr></thead><tbody>${O.scenario.rows.map(r => `<tr><td class="small">${esc(r[0])}</td>${r.slice(1).map(v => `<td class="c tnum"><b>${esc(v)}</b></td>`).join('')}</tr>`).join('')}</tbody></table>`, { more: 'จำลองสถานการณ์เพิ่มเติม', moreAct: 'data-go="forecast"' });
    const shortcuts = `<section class="card"><div class="card-head"><h2>ทางลัดผู้บริหาร</h2></div><div class="shortcuts">${O.shortcuts.map(([ic, n, go]) => `<button class="shortcut" ${go === 'meeting' ? 'data-action="meeting"' : `data-go="${go}"`}>${icon(ic, 19)}${esc(n)}</button>`).join('')}</div></section>`;
    return `${T.filterbar(['province', 'scenario', 'period', 'lang'])}${kpiRow(O.kpis)}${decide}
      <div class="g-ov">${mapCard}${alertCard}${aiCard}${quick}</div>
      <div class="g-ov2">${fcCard}${socCard}${crowdCard}${agCard}${scCard}</div>${shortcuts}`;
  };

  /* ================================================================ 2. สถานการณ์ความเสี่ยง */
  T.screens.risk = async () => {
    const S = T.S, R = D.risk;
    const colors = ['#2a78d6', '#e03a3e', '#f07a12', '#f4b400', '#22b45f'];
    let ev = R.events; if (S.fLevel) ev = ev.filter(e => e.sev === S.fLevel);
    const scale = S.trendTab === 'week' ? .97 : S.trendTab === 'month' ? .92 : 1;
    return `${T.filterbar(['province', 'type', 'period', 'level', 'lang'])}${kpiRow(R.kpis)}
      <div class="g-wide">
        ${card('Risk Matrix', riskMatrix(R.matrix) + `<p class="tiny" style="margin-top:8px">โอกาสเกิดจากสถิติย้อนหลัง 5 ปี · ผลกระทบจากผู้บาดเจ็บ/เสียชีวิตและรายได้ (ค่าจำลอง)</p>`)}
        ${card('รายการเหตุการณ์ความเสี่ยงสำคัญ', table(['#', 'เหตุการณ์', 'ระดับ', 'เวลา', 'พื้นที่', 'หน่วยงานรับผิดชอบ', ''], ev.map((e, i) => ({ cells: [i + 1, `<div class="row" style="flex-wrap:nowrap;gap:8px">${icT(e.icon, SEVTONE[e.sev], 15)}<span>${esc(e.name)}</span></div>`, sev(e.sev), `<span class="small">${esc(e.time)}</span>`, esc(e.area), `<span class="agency-pill tag" data-agency="${e.agency}">${esc(agencyShort(e.agency))}</span>`, `<button class="btn sm outline" data-action="event-detail" data-i="${R.events.indexOf(e)}">ดูรายละเอียด</button>`] })), 'ไม่มีเหตุการณ์ในระดับที่เลือก'), { more: `ดูทั้งหมด ${D.alerts.feed.length + 17} รายการ →`, moreAct: 'data-go="alertcenter"' })}
      </div>
      <div class="g3">
        ${card('แนวโน้มความเสี่ยง', `<div class="tabs-mini" style="margin-bottom:8px">${[['day', 'รายวัน'], ['week', 'รายสัปดาห์'], ['month', 'รายเดือน']].map(([k, n]) => `<button data-trendtab="${k}" aria-pressed="${(S.trendTab || 'day') === k}">${n}</button>`).join('')}</div>${lineChart({ labels: R.trend.labels, series: R.trend.series.map((s, i) => ({ ...s, color: colors[i], values: s.values.map(v => Math.round(v * scale)), dots: 'small' })), height: 210, yMax: 100, endLabels: false })}${legend(R.trend.series.map((s, i) => ({ name: s.name, color: colors[i] })))}`)}
        ${card('Top พื้นที่เสี่ยง', hbars(R.top, { color: riskColor }) + '<p class="tiny" style="margin-top:8px">คะแนนความเสี่ยง (0–100) · 7 วันล่าสุด</p>', { right: '<span class="tchip">7 วันล่าสุด</span>' })}
        ${card('AI Recommendation', `<div class="alist">${R.ai.map((a, i) => airow(a, i)).join('')}</div>`)}
      </div>
      ${actionBar([{ tone: 'blue', icon: 'eye', title: 'ดูรายละเอียด', sub: 'วิเคราะห์เชิงลึกรายเหตุการณ์', action: 'go', extra: 'data-go="alertcenter"' }, { tone: 'red', icon: 'megaphone', title: 'แจ้งหน่วยงาน', sub: 'ส่งคำสั่งถึงหน่วยงานที่รับผิดชอบ', action: 'cmd' }, { tone: 'orange', icon: 'shieldcheck', title: 'เปิดแผนรับมือ', sub: 'เลื่อนขั้นตอนการตอบสนอง', action: 'open-plan' }, { tone: 'green', icon: 'doc', title: 'สร้างรายงาน', sub: 'รายงานสถานการณ์ความเสี่ยง', action: 'report', extra: 'data-type="risk"' }])}`;
  };

  /* ================================================================ 3. แผนที่ความเสี่ยง */
  T.screens.riskmap = async () => {
    const S = T.S, R = D.riskmap;
    S.layers = S.layers || D.map.layers.map(l => ({ id: l.id, on: l.on }));
    const layers = D.map.layers.map(l => ({ ...l, on: (S.layers.find(x => x.id === l.id) || {}).on }));
    const place = S.mapPlace || 'patong', A = R.areas[place];
    const poiTone = { hospital: 'green', police: 'blue', airport: 'blue', pier: 'teal', help: 'red', evac: 'purple', cctv: 'blue', siren: 'orange' };
    return `${T.filterbar(['province', 'area', 'type', 'period', 'level'])}${kpiRow(R.kpis, 'five')}
      <div class="g-map">
        <section class="card" style="padding:0;overflow:hidden"><div class="mapbox" style="border:0;border-radius:0">${phuketMap({ layers, selected: place, incidents: D.alerts.feed.slice(0, 5) })}
          <div class="map-overlay"><div class="row between"><h4>ชั้นข้อมูลแผนที่</h4><span class="tiny">${layers.filter(l => l.on).length}/${layers.length}</span></div>
            ${layers.map(l => `<label class="layer">${icT(l.icon, l.poi ? poiTone[l.id] : 'red', 12)}<span>${esc(l.name)}</span><input type="checkbox" class="toggle" style="transform:scale(.8)" data-layer="${l.id}" ${l.on ? 'checked' : ''}></label>`).join('')}
            <div class="divider" style="margin:8px 0"></div><b style="font-size:12px">ระดับความเสี่ยง</b><div class="row" style="gap:8px;font-size:11.5px;margin-top:4px"><span><i class="dotsw" style="background:#22b45f"></i>ต่ำ</span><span><i class="dotsw" style="background:#f4b400"></i>ปานกลาง</span><span><i class="dotsw" style="background:#f07a12"></i>สูง</span><span><i class="dotsw" style="background:#e03a3e"></i>วิกฤติ</span></div></div>
          <div class="map-ctl"><button title="ซูมเข้า" data-action="noop">${icon('plus', 16)}</button><button title="ตำแหน่งปัจจุบัน" data-action="noop">${icon('locate', 16)}</button><button title="ชั้นข้อมูล" data-action="noop">${icon('layers', 16)}</button></div>
          <span class="map-scale">แผนที่เชิงสัญลักษณ์ · ไม่ใช่พิกัดจริง</span></div></section>
        <section class="card"><div class="card-head"><h2>รายละเอียดพื้นที่ที่เลือก</h2></div>
          <div class="stack"><span class="sev ${A.tone}" style="justify-self:start">พื้นที่เสี่ยง${esc(A.level)}</span><h3>${icon('pin', 16)} ${esc(A.name)}</h3>
          <dl class="kv" style="grid-template-columns:130px minmax(0,1fr);font-size:13.5px"><dt>ระดับความเสี่ยง</dt><dd>${sev(A.tone, A.level)}</dd><dt>ประเภทความเสี่ยงหลัก</dt><dd>${esc(A.type)}</dd><dt>นักท่องเที่ยวที่ได้รับผลกระทบ</dt><dd><b class="tnum">${esc(A.tourists)}</b> คน</dd><dt>โรงพยาบาลใกล้สุด</dt><dd>${esc(A.hospital[0])} <b>${esc(A.hospital[1])}</b></dd><dt>ตำรวจ/ตชด. ใกล้สุด</dt><dd>${esc(A.police[0])} <b>${esc(A.police[1])}</b></dd></dl>
          <div class="callout warn">${icon('alert', 16)}<div><b>แนวทางการดำเนินการแนะนำ</b><br>${esc(A.advice)}</div></div>
          <button class="btn outline" data-action="cmd" data-area="${place}">แจ้งหน่วยงานในพื้นที่นี้</button></div></section>
      </div>
      <div class="g3">
        ${card('จุดเสี่ยงสำคัญ', `<div class="alist">${R.hotspots.map((h, i) => `<button class="arow" data-place="${h.place}" style="grid-template-columns:26px minmax(0,1fr) auto"><span class="lvl" style="background:${h.tone === 'crit' ? 'var(--crit)' : h.tone === 'high' ? 'var(--high)' : 'var(--med-fill)'}">${i + 1}</span><div><b>${esc(h.name)}</b><span>${esc(h.dist)}</span></div><div class="row" style="gap:4px;flex-wrap:nowrap">${sev(h.tone)}${h.icons.map(ic => icT(ic, 'blue', 13)).join('')}</div></button>`).join('')}</div>`, { right: '<button class="link-btn" data-action="noop">ดูทั้งหมด</button>' })}
        ${card('AI Insight', `<div class="alist">${R.insight.map((a, i) => airow(a, i + 1)).join('')}</div>`, { right: '<span class="tiny">อัปเดตล่าสุด 14:00 น.</span>' })}
        ${card('Top พื้นที่เสี่ยง', hbars(R.top, { color: riskColor }) + '<p class="tiny" style="margin-top:8px">ระดับความเสี่ยง (คะแนน 0–100)</p>', { right: '<span class="tchip">7 วันล่าสุด</span>' })}
      </div>`;
  };

  /* ================================================================ 4. การแจ้งเตือนและเหตุการณ์ */
  T.screens.alertcenter = async () => {
    const S = T.S, A = D.alerts;
    let feed = A.feed; if (S.fLevel) feed = feed.filter(f => f.sev === S.fLevel);
    const sel = A.feed.find(f => f.id === S.alertSel) || feed[0] || A.feed[0];
    const typeColors = ['#2a78d6', '#e03a3e', '#22b45f', '#7a4ad8', '#f4b400', '#f07a12'];
    const segs = A.types.map((t, i) => ({ name: t.name, value: t.n, color: typeColors[i] }));
    const tot = segs.reduce((s, x) => s + x.value, 0);
    return `${T.filterbar(['province', 'type', 'level', 'period', 'scenario'])}${kpiRow(A.kpis)}
      <div class="g-ov" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)">
        ${card('ศูนย์แจ้งเตือนล่าสุด', table(['ชื่อเหตุการณ์', 'ประเภท', 'ระดับ', 'เวลา', 'สถานะ', ''], feed.map(f => ({ attrs: ` class="clickable ${f.id === sel.id ? 'selected' : ''}" data-alertsel="${f.id}"`, cells: [`<div class="row" style="flex-wrap:nowrap;gap:8px">${icT(f.icon, SEVTONE[f.sev], 14)}<b style="font-size:13px">${esc(f.name)}</b></div>`, `<span class="small">${esc(f.type)}</span>`, sev(f.sev), `<span class="tnum">${f.time}</span>`, stp(f.status, f.status === 'กำลังดำเนินการ' ? 'crit' : f.status === 'ติดตามสถานการณ์' ? 'warn' : f.status === 'ข้อมูลใหม่' ? 'good' : 'info'), `<button class="btn sm outline" data-alertsel="${f.id}">ดูรายละเอียด</button>`] }))), { more: 'ดูทั้งหมด →', moreAct: 'data-action="noop"' })}
        <section class="card" style="padding:0;overflow:hidden"><div class="card-head" style="padding:14px 16px 0"><h2>แผนที่เหตุการณ์</h2></div><div class="mapbox" style="border:0;border-radius:0;margin-top:8px">${phuketMap({ layers: D.map.layers.map(l => ({ ...l, on: ['nature', 'sea', 'crowd', 'accident', 'crime', 'hospital', 'pier'].includes(l.id) })), selected: sel.place, incidents: feed })}<span class="map-scale">แผนที่เชิงสัญลักษณ์</span></div></section>
        <section class="card"><div class="card-head"><h2>รายละเอียดเหตุการณ์ที่เลือก</h2>${sev(sel.sev)}</div>
          <div class="stack"><h3>${icT(sel.icon, SEVTONE[sel.sev], 16)} ${esc(sel.name)}</h3>
          <dl class="kv" style="grid-template-columns:120px minmax(0,1fr);font-size:13px"><dt>${icon('pin', 14)} พื้นที่</dt><dd>${esc(sel.area)}</dd><dt>${icon('clock', 14)} เวลา</dt><dd>13 ต.ค. 2569 ${sel.time} น.</dd><dt>${icon('alert', 14)} ระดับ</dt><dd>${sev(sel.sev)}</dd><dt>${icon('users', 14)} ผู้ได้รับผลกระทบ</dt><dd>${esc(sel.affected)} คน</dd><dt>${icon('building', 14)} หน่วยงาน</dt><dd><span class="agency-pill tag" data-agency="${sel.agency}">${esc(agencyName(sel.agency))}</span></dd><dt>${icon('radio', 14)} ช่องทางแจ้ง</dt><dd>${['SMS', 'LINE', 'Social', 'Website'].map(c => `<span class="tag">${c}</span>`).join('')}</dd><dt>${icon('check', 14)} สถานะ</dt><dd>${stp(sel.status, 'crit')}</dd></dl>
          <div><b style="font-size:13px">ข้อแนะนำการดำเนินการ</b><ul class="small" style="margin:4px 0 0;padding-left:18px">${sel.advice.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
          <div class="row" style="gap:6px"><button class="btn sm" data-action="cmd" data-agency="${sel.agency}">${icon('megaphone', 15)} แจ้งหน่วยงาน</button><button class="btn sm outline" data-action="q-multilang">${icon('globe', 15)} ส่งประกาศหลายภาษา</button>${sel.scenario ? `<button class="btn sm outline" data-go="toc" data-tab="task" data-scenario-go="${sel.scenario}">${icon('radio', 15)} เปิดศูนย์บัญชาการ</button>` : ''}</div></div></section>
      </div>
      <div class="g3">
        ${card('แนวโน้มการแจ้งเตือน', lineChart({ labels: A.hourly.labels.map(h => h + ':00'), series: [{ name: 'วันนี้', color: '#1d5bd8', values: A.hourly.today, area: true }, { name: 'เมื่อวาน', color: '#9aa7bd', values: A.hourly.yesterday, dash: true, dots: false }], height: 200, endLabels: false }) + legend([{ name: 'วันนี้', color: '#1d5bd8' }, { name: 'เมื่อวาน', color: '#9aa7bd' }]), { right: '<span class="tchip">รายชั่วโมง</span>' })}
        ${card('ประเภทเหตุการณ์', `<div class="donut-wrap">${donut(segs, String(tot), 'เหตุการณ์', 140)}${dlegend(segs, s => `${s.value} (${Math.round(s.value / tot * 100)}%)`)}</div>`, { right: '<span class="tchip">วันนี้</span>' })}
        ${card('Top พื้นที่ที่ได้รับแจ้งเตือน', hbars(A.top, { max: 15, color: (v, i) => ['#e03a3e', '#f07a12', '#f07a12', '#f4b400', '#f4b400'][i] }) + '<p class="tiny" style="margin-top:8px">จำนวนเหตุการณ์ (รายการ)</p>', { right: '<span class="tchip">วันนี้</span>' })}
      </div>
      ${actionBar([{ tone: 'red', icon: 'megaphone', title: 'ประกาศเตือนภัย', sub: 'ส่งประกาศเตือนภัยไปยังนักท่องเที่ยว', action: 'q-alert' }, { tone: 'blue', icon: 'chat', title: 'ส่งข้อความถึงนักท่องเที่ยว', sub: 'ส่งข้อความผ่าน SMS / LINE / App', action: 'q-multilang' }, { tone: 'green', icon: 'users', title: 'ประสานหน่วยงาน', sub: 'ติดต่อและประสานงานหน่วยงานที่เกี่ยวข้อง', action: 'cmd' }, { tone: 'purple', icon: 'clipboard', title: 'เปิดแผนรับมือ', sub: 'เริ่มแผนรับมือสถานการณ์วิกฤติ', action: 'open-plan' }])}`;
  };

  /* ================================================================ 5. การวิเคราะห์และคาดการณ์ */
  T.screens.forecast = async () => {
    const S = T.S, F = D.forecast, range = S.fcRange || 30;
    const nh = F.series.hist.length, nf = Math.min(range === 7 ? 4 : F.series.fc.length, F.series.labels.length - nh);
    const fcv = F.series.fc.slice(0, nf).map(v => range === 90 ? v + 4 : v);
    const labels = F.series.labels.slice(0, nh + nf);
    const hist = [...F.series.hist, ...Array(nf).fill(null)];
    const fcLine = [...Array(nh - 1).fill(null), F.series.hist.at(-1), ...fcv];
    const band = (w) => ({ lo: [...Array(nh - 1).fill(null), F.series.hist.at(-1), ...fcv.map((v, i) => v - w * (1 + i * .12))], hi: [...Array(nh - 1).fill(null), F.series.hist.at(-1), ...fcv.map((v, i) => v + w * (1 + i * .12))] });
    const b95 = band(8), b80 = band(4.5);
    const scSel = S.scSel || 'base';
    const heatC = v => ['#eef1f6', '#ffe9a8', '#ffc56b', '#f7864f', '#e03a3e'][v - 1] || '#eef1f6';
    return `${T.filterbar(['province', 'type', 'period', 'level', 'model'])}${kpiRow(F.kpis)}
      <div class="g-wide">
        ${card('Forecast แนวโน้มความเสี่ยง', `<div class="row between" style="margin-bottom:6px"><span class="tchip">ดัชนีความเสี่ยง (Risk Index)</span><div class="tabs-mini">${[7, 30, 90].map(r => `<button data-fcrange="${r}" aria-pressed="${range === r}">${r} วัน</button>`).join('')}</div></div>
          ${lineChart({ labels, series: [{ name: 'ข้อมูลจริง', color: '#1d5bd8', values: hist, dots: 'small' }, { name: 'คาดการณ์', color: '#1d5bd8', values: fcLine, dash: true, dots: false }], bands: [{ ...b95, color: '#7aa6f2', opacity: .16 }, { ...b80, color: '#4d86ec', opacity: .2 }], height: 230, yMax: 80, endLabels: false, markIdx: nh - 1, labelEvery: 3 })}
          ${legend([{ name: 'ข้อมูลจริง (ย้อนหลัง)', color: '#1d5bd8' }, { name: 'คาดการณ์ (เส้นประ)', color: '#1d5bd8' }, { name: 'ช่วงความเชื่อมั่น 95%', color: '#b9d0f7' }, { name: 'ช่วงความเชื่อมั่น 80%', color: '#7aa6f2' }])}`)}
        ${card('Scenario Forecast', `<table class="mtable"><thead><tr><th></th>${F.scenarios.map(s => `<th class="c"><button class="btn sm ${scSel === s.id ? '' : 'ghost'}" data-scsel="${s.id}" style="${scSel === s.id ? '' : `color:var(--${s.tone === 'good' ? 'good' : s.tone === 'crit' ? 'crit' : 'info'})`}">${esc(s.name)}</button><div class="tiny">โอกาสเกิด ${s.p}%</div></th>`).join('')}</tr></thead><tbody>
          ${[['นักท่องเที่ยวที่ได้รับผลกระทบ', 'tourists', ' คน'], ['ผลกระทบรายได้ท่องเที่ยว', 'revenue', ' ลบ.'], ['ระดับความเสี่ยงเฉลี่ย', 'level', ''], ['ระยะเวลาฟื้นตัว', 'recovery', '']].map(([n, k, u]) => `<tr><td class="small">${n}</td>${F.scenarios.map(s => `<td class="c tnum" style="${scSel === s.id ? 'background:var(--primary-soft)' : ''}"><b>${esc(s[k])}</b>${u}</td>`).join('')}</tr>`).join('')}</tbody></table>
          <div class="callout" style="margin-top:10px">${icon('info', 16)}<div><b>ปัจจัยของ ${esc(F.scenarios.find(s => s.id === scSel).name)}:</b> ${esc(F.scenarios.find(s => s.id === scSel).drivers)}</div></div>`)}
      </div>
      <div class="g-ov2">
        ${card('ปัจจัยขับเคลื่อนความเสี่ยง', hbars(F.drivers.map(d => ({ name: d.name, v: d.v })), { max: .35, colors: ['#e03a3e', '#f07a12', '#f07a12', '#f4b400', '#22b45f', '#2a78d6'], fmt: v => v.toFixed(2) }) + '<p class="tiny" style="margin-top:8px">ค่าความสำคัญของปัจจัย (0–1) จากโมเดลล่าสุด</p>')}
        ${card('การคาดการณ์รายพื้นที่', hbars(F.areas, { colors: ['#e03a3e', '#f07a12', '#f4b400', '#f4b400', '#22b45f'] }) + '<p class="tiny" style="margin-top:8px">ดัชนีความเสี่ยง (คะแนน)</p>')}
        ${card('ช่วงเวลาที่มีความเสี่ยงสูง', heatGrid(F.heat.cols, F.heat.rows, heatC) + `<div class="legend">${['ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'].map((n, i) => `<span><i class="swatch" style="background:${heatC(i + 2)}"></i>${n}</span>`).join('')}</div>`, { right: '<span class="tchip">รายสัปดาห์</span>' })}
        ${card('AI Recommendation', `<div class="alist">${F.ai.map((a, i) => airow(a, i)).join('')}</div>`)}
        ${card('Model Performance', `<div class="stack" style="gap:6px">${F.model.map(([n, v]) => `<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="small">${esc(n)}</span><b class="tnum" style="font-size:17px">${v}</b></div>`).join('')}<div class="tiny">อัปเดตล่าสุด 13 ต.ค. 2569 09:45 น.</div>${callout('ค่าจำลองเพื่อสาธิต โมเดลจริงจะฝึกเมื่อได้ข้อมูลย้อนหลัง 3–5 ปี (ตามแผนระยะ 3)', 'warn', 'alert')}</div>`)}
      </div>
      ${actionBar([{ tone: 'blue', icon: 'doc', title: 'ดูรายละเอียด', sub: 'ดูรายละเอียดการคาดการณ์และปัจจัยเชิงลึก', action: 'needs' }, { tone: 'green', icon: 'chart', title: 'สร้างรายงานคาดการณ์', sub: 'สร้างรายงานวิเคราะห์และคาดการณ์', action: 'report', extra: 'data-type="forecast"' }, { tone: 'purple', icon: 'clipboard', title: 'เปิดแผนรับมือ', sub: 'เชื่อมโยงกับแผนรับมือและมาตรการ', action: 'open-plan' }, { tone: 'orange', icon: 'bell', title: 'แจ้งหน่วยงาน', sub: 'แจ้งเตือนและสื่อสารกับหน่วยงานที่เกี่ยวข้อง', action: 'cmd' }], '', '')}`;
  };

  /* ================================================================ 6. Social Listening */
  T.screens.social = async () => {
    const S = T.S, SL = D.social;
    const signals = await API.getSignals();
    const pcol = ['#1d5bd8', '#1d2433', '#e1306c', '#e03a3e', '#22b45f', '#f07a12'];
    const psegs = SL.platforms.map((p, i) => ({ name: p.name, value: p.pct, color: pcol[i], n: p.n }));
    const platIcon = { Facebook: 'chat', 'X (Twitter)': 'chat', Instagram: 'camera', YouTube: 'video', TikTok: 'video' };
    const latest = [...signals.map(s => ({ platform: s.language === 'zh' ? 'Weibo' : s.language === 'en' ? 'X (Twitter)' : 'Facebook', text: s.text, sent: s.sentiment, time: hhmm(s.published_at), area: (T.ST.areas.find(a => a.area_id === s.area_id) || {}).name || 'ภูเก็ต', status: s.verification_status, id: s.signal_id }))].slice(0, 7);
    const sentTag = v => v <= -0.3 ? '<span style="color:var(--crit)">● เชิงลบ</span>' : v >= 0.2 ? '<span style="color:var(--good)">● เชิงบวก</span>' : '<span style="color:var(--warn)">● เป็นกลาง</span>';
    return `${T.filterbar(['province', 'platform', 'lang', 'period', 'type', 'level'])}${kpiRow(SL.kpis)}
      <div class="g3" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.1fr)">
        ${card('แนวโน้ม Sentiment', lineChart({ labels: SL.trend.labels, series: [{ name: 'เชิงบวก', color: '#22b45f', values: SL.trend.pos }, { name: 'เป็นกลาง', color: '#f4b400', values: SL.trend.neu }, { name: 'เชิงลบ', color: '#e03a3e', values: SL.trend.neg }], height: 220, yMax: 100, unit: '%' }), { right: legend([{ name: 'เชิงบวก', color: '#22b45f' }, { name: 'เป็นกลาง', color: '#f4b400' }, { name: 'เชิงลบ', color: '#e03a3e' }]).replace('margin-top:8px', '') })}
        ${card('การกระจายตามแพลตฟอร์ม', `<div class="donut-wrap">${donut(psegs, '128,450', 'ข้อความ', 140)}${dlegend(psegs, s => `${s.value}% <span class="tiny">(${s.n})</span>`)}</div>`)}
        ${card('ประเด็นร้อนและสัญญาณวิกฤต', `<div class="alist">${SL.issues.map((x, i) => `<div class="arow" style="cursor:default;grid-template-columns:26px 30px minmax(0,1fr) auto"><span class="lvl" style="background:${x.sev === 'crit' ? 'var(--crit)' : x.sev === 'high' ? 'var(--high)' : 'var(--med-fill)'}">${i + 1}</span>${icT(x.icon, SEVTONE[x.sev], 14)}<div><b>${esc(x.name)}</b><span>${x.n} ข้อความ</span></div>${sev(x.sev)}</div>`).join('')}</div>`, { right: '<button class="link-btn" data-action="noop">ดูทั้งหมด</button>' })}
      </div>
      ${card('คำสำคัญและหัวข้อสนทนา', `<div class="row" style="gap:8px">${SL.keywords.map(([k, n], i) => `<span class="hash c${(i % 5) + 1}"><b># ${esc(k)}</b><span>${n} ข้อความ</span></span>`).join('')}</div>`)}
      <div class="g3" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)">
        ${card('แหล่งที่มาของข้อความล่าสุด', table(['แพลตฟอร์ม', 'ข้อความ', 'Sentiment', 'เวลา', 'พื้นที่', 'ตรวจสอบ'], latest.map(l => ({ cells: [`<span class="row" style="gap:6px;flex-wrap:nowrap">${icon(platIcon[l.platform] || 'globe', 15)}<span class="small">${esc(l.platform)}</span></span>`, `<span class="small msgcell">${esc(l.text)}</span>`, sentTag(l.sent), l.time, esc(l.area), l.status === 'unverified' && T.can('screen_sos') ? `<button class="btn sm ghost" data-action="sig" data-id="${l.id}" data-status="verified">ยืนยัน</button>` : stp(l.status === 'verified' ? 'ยืนยันแล้ว' : l.status === 'rejected' ? 'ข่าวปลอม' : 'รอตรวจ', l.status === 'verified' ? 'good' : l.status === 'rejected' ? 'crit' : 'warn')] }))), { more: 'ดูเพิ่มเติม →', moreAct: 'data-go="comms"' })}
        ${card('พื้นที่ที่ถูกพูดถึงมากที่สุด', hbars(SL.places.map(p => ({ name: p.name, v: p.v })), { max: 40000, color: '#1d5bd8', fmt: (v, r) => `${(v / 1000).toFixed(1)}K` }) + '<p class="tiny" style="margin-top:8px">จำนวนข้อความ</p>')}
        ${card('AI Insight / Recommendation', `<div class="alist">${SL.ai.map((a, i) => airow(a, i + 1)).join('')}</div>`)}
      </div>
      ${actionBar([{ tone: 'blue', icon: 'list', title: 'ดูรายละเอียด', sub: 'ดูข้อความและการวิเคราะห์เชิงลึก', action: 'go', extra: 'data-go="comms"' }, { tone: 'green', icon: 'chart', title: 'สร้างรายงาน', sub: 'สร้างรายงาน Social Listening', action: 'report', extra: 'data-type="social"' }, { tone: 'orange', icon: 'bell', title: 'แจ้งหน่วยงาน', sub: 'ส่งต่อข้อมูลให้หน่วยงานที่เกี่ยวข้อง', action: 'cmd' }, { tone: 'purple', icon: 'megaphone', title: 'ส่งข้อความชี้แจง', sub: 'ส่งข้อความชี้แจงผ่านช่องทางต่างๆ', action: 'q-alert' }], '', '')}`;
  };

  /* ================================================================ 7. นักท่องเที่ยวและเศรษฐกิจ */
  T.screens.economy = async () => {
    const E = D.economy, pct = Math.round(E.revenue.ytd / E.revenue.target * 1000) / 10;
    return `${T.filterbar(['province', 'period', 'lang'], { compare: true })}${kpiRow(E.kpis, 'five')}
      <div class="g-wide">
        ${card('จำนวนนักท่องเที่ยวต่างชาติ รายเดือน (หน่วย: ล้านคน)', lineChart({ labels: E.monthly.labels, series: [{ name: 'ปี 2569', color: '#1d5bd8', values: E.monthly.y69, area: true }, { name: 'ปี 2568', color: '#9aa7bd', values: E.monthly.y68, dash: true, dots: 'small' }], height: 240, yMax: 1.6, endLabels: false }) + legend([{ name: 'ปี 2569', color: '#1d5bd8' }, { name: 'ปี 2568', color: '#9aa7bd' }]))}
        <div class="stack">
          ${card('รายได้จากการท่องเที่ยว (YTD)', `<div class="row" style="align-items:baseline"><b class="tnum" style="font-size:30px">${E.revenue.ytd.toLocaleString()}</b><span class="small">ล้านบาท</span><span class="k-note bad" style="color:var(--crit)">▼ 4.8% จากปีก่อน</span></div><div class="row between small" style="margin-top:8px"><span>เป้าหมายทั้งปี</span><b class="tnum">${E.revenue.target.toLocaleString()} ล้านบาท</b></div><div class="track" style="height:10px;margin-top:6px"><div class="fill" style="width:${pct}%;background:var(--good)"></div></div><div class="tiny" style="text-align:right">${pct}%</div>`, { more: 'ดูรายละเอียด', moreAct: 'data-action="noop"' })}
          ${card('นักท่องเที่ยวตามตลาดหลัก (สะสมปี · ล้านคน)', `<div class="stack" style="gap:8px">${E.markets.map(m => `<div class="hbar norank" style="grid-template-columns:130px minmax(0,1fr) 50px 64px"><span>${m.flag} ${esc(m.name)}</span><div class="tr"><div class="fl" style="width:${m.v / 1.5 * 100}%;background:#1d5bd8"></div></div><b class="tnum" style="text-align:right">${m.v.toFixed(2)}</b><span class="tnum" style="text-align:right;font-size:12.5px;color:${m.d < 0 ? 'var(--crit)' : 'var(--good)'}">${m.d < 0 ? '▼' : '▲'} ${Math.abs(m.d)}%</span></div>`).join('')}</div>`, { more: 'ดูตลาดทั้งหมด', moreAct: 'data-action="noop"' })}
        </div>
      </div>
      <div class="g2">
        ${card('อัตราการเข้าพักรายโซน (%)', hbars(E.occupancy, { rank: false, color: v => v >= 75 ? 'var(--good)' : v >= 65 ? '#1d5bd8' : 'var(--high)', fmt: v => v + '%' }) + '<p class="tiny" style="margin-top:8px">แหล่งข้อมูล: สมาคมโรงแรม / กรมการท่องเที่ยว · รายสัปดาห์ (ค่าจำลอง)</p>')}
        ${card('ผลกระทบจากสถานการณ์ปัจจุบัน', `<table class="mtable"><thead><tr><th></th>${D.forecast.scenarios.map(s => `<th class="c">${esc(s.name)}</th>`).join('')}</tr></thead><tbody><tr><td class="small">นักท่องเที่ยวที่ได้รับผลกระทบ</td>${D.forecast.scenarios.map(s => `<td class="c tnum"><b>${s.tourists}</b></td>`).join('')}</tr><tr><td class="small">ผลกระทบรายได้ (ลบ.)</td>${D.forecast.scenarios.map(s => `<td class="c tnum"><b>${s.revenue}</b></td>`).join('')}</tr><tr><td class="small">ระยะฟื้นตัว</td>${D.forecast.scenarios.map(s => `<td class="c">${s.recovery}</td>`).join('')}</tr></tbody></table>`, { more: 'ไปที่การวิเคราะห์และคาดการณ์', moreAct: 'data-go="forecast"' })}
      </div>
      <section class="card"><div class="card-head"><h2>ทางลัดผู้บริหาร</h2></div><div class="shortcuts">${D.overview.shortcuts.map(([ic, n, go]) => `<button class="shortcut" ${go === 'meeting' ? 'data-action="meeting"' : `data-go="${go}"`}>${icon(ic, 19)}${esc(n)}</button>`).join('')}</div></section>`;
  };

  /* ================================================================ 8. การตอบสนองและการดำเนินงาน */
  T.screens.response = async () => {
    const S = T.S, R = D.response;
    const [tasks, majors, cmds, agencies] = await Promise.all([API.getTasks(), Promise.all(T.ST.scenarios.map(s => API.getMajorIncident(s.id))), API.getCommands(), API.getAgencies()]);
    const m = majors.find(x => x.scenario === S.scenario);
    const stages = T.ST.protocol_stages, si = stages.findIndex(s => s[0] === m.status);
    const wfColors = ['#1d5bd8', '#22b45f', '#f07a12', '#7a4ad8', '#1d5bd8', '#22b45f'], wfIcons = ['target', 'gauge', 'megaphone', 'chat', 'clipboard', 'shieldcheck'];
    const OPEN = ['pending', 'offered', 'accepted', 'en_route', 'on_scene'];
    const tl = { pending: ['รอมอบหมาย', 'crit'], offered: ['รอตอบรับ', 'warn'], accepted: ['รับงานแล้ว', 'info'], en_route: ['กำลังเดินทาง', 'info'], on_scene: ['ถึงที่เกิดเหตุ', 'info'], completed: ['เสร็จสิ้น', 'good'], cancelled: ['ยกเลิก', 'plain'] };
    const board = tasks.filter(t => OPEN.includes(t.status)).sort((a, b) => b.priority.score - a.priority.score).slice(0, 7);
    const agList = agencies.agencies.filter(a => ['AG03', 'AG13', 'AG02', 'SP25', 'AG01', 'SP32', 'AG12'].includes(a.agency_id));
    const agStatus = a => a.tasks_open ? ['ปฏิบัติงาน', 'warn'] : a.coord_status === 'planned' ? ['รอข้อมูล', 'plain'] : ['พร้อม', 'good'];
    const cmdTone = { sent: ['ส่งแล้ว รอรับทราบ', 'warn'], ack: ['รับทราบแล้ว', 'info'], done: ['เสร็จสิ้น', 'good'] };
    const ab = actionBar([{ tone: 'solid-blue', icon: 'megaphone', title: 'สั่งการหน่วยงาน', sub: 'ส่งคำสั่งและมอบหมายภารกิจ', action: 'cmd' }, { tone: 'green', icon: 'chat', title: 'ส่งข้อความเตือน', sub: 'แจ้งเตือนนักท่องเที่ยวหลายภาษา', action: 'q-multilang' }, { tone: 'purple', icon: 'shieldcheck', title: 'เปิดแผนรับมือ', sub: 'เลื่อนขั้นตอนตามแผนรับมือ', action: 'open-plan' }, { tone: 'orange', icon: 'ambulance', title: 'จัดสรรทรัพยากร', sub: 'จัดสรรกำลังคนและอุปกรณ์', action: 'allocate' }, { tone: 'red', icon: 'x', title: 'ปิดเหตุการณ์', sub: 'ยุติภารกิจและสรุปรายงาน AAR', action: 'close-incident' }], '', '').replace('class="actionbar"', 'class="actionbar" style="grid-template-columns:repeat(5,minmax(0,1fr))"');
    return `${T.filterbar(['province', 'scenario', 'agency', 'period', 'level'])}${kpiRow(R.kpis)}
      <div class="g-wide">
        ${card('กระดานปฏิบัติการ / Response Task Board', table(['ภารกิจ', 'พื้นที่', 'หน่วยงานรับผิดชอบ', 'ลำดับ', 'สถานะ', 'กำหนดเวลา', ''], board.map(t => ({ cells: [`<div class="row" style="flex-wrap:nowrap;gap:8px">${icT(t.hard_priority ? 'alert' : 'clipboard', t.hard_priority ? 'red' : 'blue', 14)}<b style="font-size:13px">${esc(t.title)}</b></div>`, esc((T.ST.areas.find(a => a.area_id === t.area_id) || {}).name), `<span class="agency-pill tag" data-agency="${t.assigned_agency_id}">${esc(agencyShort(t.assigned_agency_id))}</span>`, t.hard_priority ? sev('crit', 'เร่งด่วน') : t.priority.score >= 60 ? sev('high') : sev('med'), stp(tl[t.status][0], tl[t.status][1]), `<span class="tnum small">วันนี้ ${hhmm(t.due_at)}</span>`, `<button class="btn sm outline" data-go="toc" data-tab="task" data-task="${t.task_id}" data-scenario-go="${t.scenario}">ดูรายละเอียด</button>`] }))), { more: 'ดูทั้งหมด →', moreAct: 'data-go="toc" data-tab="task"' })}
        <section class="card"><div class="card-head"><h2>ศูนย์บัญชาการและการประสานงาน</h2></div><div class="row" style="flex-wrap:nowrap;align-items:start;gap:12px"><div class="mapbox" style="flex:0 0 52%">${phuketMap({ layers: D.map.layers.map(l => ({ ...l, on: ['nature', 'sea', 'crowd', 'hospital', 'police', 'help'].includes(l.id) })), incidents: D.alerts.feed.filter(f => f.sev === 'crit'), small: true })}</div>
          <div style="flex:1;min-width:0"><div class="row between"><b style="font-size:13.5px">หน่วยงานที่เกี่ยวข้อง</b><span class="tiny">สถานะ</span></div>${agList.map(a => { const [t, tone] = agStatus(a); return `<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap;gap:6px"><span class="agency-pill small" data-agency="${a.agency_id}" style="min-width:0">${esc(a.short)}</span>${stp(t, tone)}</div>`; }).join('')}<button class="link-btn" data-go="agencies" style="margin-top:6px">ดูหน่วยงานทั้งหมด →</button></div></div></section>
      </div>
      <div class="g3">
        ${card('แผนการตอบสนอง / Crisis Response Workflow', `<div class="wflow">${R.workflow.map((w, i) => `${i ? `<span class="wf-arrow">${icon('chev', 16)}</span>` : ''}<div class="wf ${i < si ? 'done' : i === si ? 'cur' : 'todo'}"><span class="wi" style="background:${wfColors[i]}">${icon(wfIcons[i], 20)}</span><b>${i + 1}. ${esc(w)}</b></div>`).join('')}</div>
          <div class="row between small" style="margin-top:12px"><span>ขั้นตอนที่ ${si + 1}: ${esc(R.workflow[si])} · ${esc(m.title)}</span><span>ความคืบหน้า ${Math.round((si + 1) / 6 * 100)}%</span></div><div class="progress-line"><div style="width:${(si + 1) / 6 * 100}%"></div></div>
          ${T.can('protocol') && si < 5 ? `<button class="btn sm outline" data-action="open-plan" style="margin-top:10px">เลื่อนไปขั้น "${esc(R.workflow[si + 1])}"</button>` : ''}`)}
        ${card('สถานะทรัพยากรและกำลังคน', `<table class="mtable"><thead><tr><th>ทรัพยากร</th><th class="c" style="color:var(--good)">● พร้อมใช้งาน</th><th class="c" style="color:var(--info)">● กำลังปฏิบัติการ</th><th class="c">รวม</th><th>ความพร้อม</th></tr></thead><tbody>${R.resources.map(r => `<tr><td><span class="row" style="gap:6px;flex-wrap:nowrap">${icon(r.icon, 15)}${esc(r.name)}</span></td><td class="c tnum">${r.ready}</td><td class="c tnum">${r.busy}</td><td class="c tnum">${r.total}</td><td><div class="row" style="gap:6px;flex-wrap:nowrap"><div class="track" style="width:60px"><div class="fill" style="width:${r.ready / r.total * 100}%;background:var(--good)"></div></div><span class="tnum small">${Math.round(r.ready / r.total * 100)}%</span></div></td></tr>`).join('')}</tbody></table>`, { more: 'ดูทรัพยากรทั้งหมด →', moreAct: 'data-action="allocate"' })}
        ${card('AI Recommendation / ข้อเสนอแนะเชิงปฏิบัติ', `<div class="alist">${R.ai.map((a, i) => airow(a, i)).join('')}</div>`)}
      </div>
      ${card('บันทึกการสั่งการ (Single Command Log)', table(['คำสั่ง', 'ผู้รับ', 'ผู้สั่ง', 'ส่ง', 'รับทราบ', 'เสร็จสิ้น', 'สถานะ', ''], cmds.map(c => ({ cells: [`<span class="small">${esc(c.text)}</span>`, `<span class="agency-pill tag" data-agency="${c.agency_id}">${esc(agencyShort(c.agency_id))}</span>`, `<span class="small">${esc(T.userName(c.by))}</span>`, `<span class="tnum">${hhmm(c.sent_at)}</span>`, `<span class="tnum">${hhmm(c.ack_at)}</span>`, `<span class="tnum">${hhmm(c.done_at)}</span>`, stp(cmdTone[c.status][0], cmdTone[c.status][1]), c.status !== 'done' ? `<button class="btn sm ghost" data-action="cmd-step" data-id="${c.cmd_id}">${c.status === 'sent' ? 'จำลองรับทราบ' : 'จำลองเสร็จสิ้น'}</button>` : ''] }))), { right: '<span class="tiny">คำสั่ง ผู้รับ เวลาส่ง–รับทราบ–เสร็จสิ้น เพื่อประเมิน SLA</span>' })}
      ${ab}`;
  };

  /* ================================================================ 9. รายงานและเอกสาร */
  T.screens.reports = async () => {
    const reports = await API.getReports();
    const tpls = [['exec', 'doc', 'รายงานผู้บริหารรายวัน', 'สรุป KPI ความเสี่ยง เหตุการณ์ และข้อเสนอการตัดสินใจ', 'blue'], ['daily', 'calendar', 'รายงานสถานการณ์ประจำวัน', 'เหตุการณ์ การแจ้งเตือน และการดำเนินการของทุกหน่วย', 'green'], ['aar', 'clipboard', 'รายงานหลังเหตุการณ์ (AAR)', 'ไทม์ไลน์ การสั่งการ เวลาตอบสนอง และบทเรียน', 'purple'], ['social', 'chat', 'รายงาน Social Listening', 'Sentiment ประเด็นร้อน ข่าวลือ และการชี้แจง', 'orange'], ['forecast', 'trend', 'รายงานวิเคราะห์และคาดการณ์', 'แนวโน้ม 7/30/90 วัน และ Scenario', 'teal'], ['risk', 'shield', 'รายงานสถานการณ์ความเสี่ยง', 'Risk Matrix พื้นที่เสี่ยง และคำแนะนำ', 'red']];
    const policies = [['ยกระดับระบบเตือนภัยหลายภาษาในแหล่งท่องเที่ยวชายฝั่ง', 'ปภ. / ททท.', 'เสนอ'], ['กำหนดมาตรฐานความปลอดภัยเรือท่องเที่ยวช่วงมรสุม', 'เจ้าท่า / ตำรวจน้ำ', 'ร่าง'], ['คำสั่งคณะทำงานข้อมูลระดับจังหวัดและ DPA กลาง', 'สนจ.ภูเก็ต', 'อยู่ระหว่างพิจารณา'], ['จัดตั้งเครือข่ายล่ามอาสาสมัครรับแจ้งเหตุนักท่องเที่ยว', 'ททท. / สพฉ.', 'เสนอ']];
    const typeName = Object.fromEntries(tpls.map(t => [t[0], t[2]]));
    return `<section class="card"><div class="card-head"><h2>แม่แบบรายงาน</h2><span class="tiny">กดเพื่อสร้างรายงานจาก Snapshot ล่าสุด</span></div><div class="g3">${tpls.map(([k, ic, n, d, tone]) => `<button class="abtn ${tone}" data-action="report" data-type="${k}"><span class="ai">${icon(ic, 22)}</span><span><b>${n}</b><span>${d}</span></span>${icon('download', 18)}</button>`).join('')}</div></section>
      ${card('รายงานที่สร้างแล้ว', table(['รายงาน', 'ประเภท', 'ผู้สร้าง', 'เวลา', ''], reports.map(r => ({ cells: [`<b>${esc(r.name)}</b>${T.techI(r.rep_id)}`, `<span class="small">${esc(typeName[r.type] || r.type)}</span>`, esc(T.userName(r.by)), T.dateTH(r.at), `<button class="btn sm ghost" data-action="report-view" data-id="${r.rep_id}">เปิดดู</button>`] })), 'ยังไม่มีรายงาน'))}
      ${card('ข้อเสนอเชิงนโยบาย', table(['ข้อเสนอ', 'หน่วยงานหลัก', 'สถานะ'], policies.map(p => ({ cells: [esc(p[0]), esc(p[1]), stp(p[2], p[2] === 'เสนอ' ? 'info' : p[2] === 'ร่าง' ? 'plain' : 'warn')] }))))}`;
  };

  /* ================================================================ 10. ตั้งค่าระบบ */
  T.screens.settings = async () => {
    const S = T.S, st = await API.getSettings();
    const tab = S.setTab || 'general';
    const tabs = [['general', 'settings', 'ทั่วไป', 'การตั้งค่าทั่วไปของระบบ'], ['notify', 'bell', 'การแจ้งเตือน', 'ตั้งค่าการแจ้งเตือน'], ['security', 'shield', 'ความปลอดภัย', 'จัดการความปลอดภัย'], ['sources', 'db', 'แหล่งข้อมูล', 'จัดการแหล่งข้อมูล'], ['display', 'palette', 'การแสดงผล', 'ตั้งค่าการแสดงผล'], ['backup', 'cloud', 'สำรองข้อมูล', 'สำรองและกู้คืนข้อมูล'], ['history', 'history', 'ประวัติการทำงาน', 'ตรวจสอบประวัติ']];
    const tog = (k, ic, n, d, tone = 'blue') => `<div class="setrow">${icT(ic, tone, 16)}<div><b>${n}</b><span>${d}</span></div><input type="checkbox" class="toggle" data-setting="${k}" ${st[k] ? 'checked' : ''} aria-label="${n}" ${T.can('admin') ? '' : 'disabled'}></div>`;
    const selr = (k, ic, n, d, opts) => `<div class="setrow">${icT(ic, 'blue', 16)}<div><b>${n}</b><span>${d}</span></div><select data-setting-sel="${k}" ${T.can('admin') ? '' : 'disabled'}>${opts.map(o => `<option ${o === st[k] ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
    const general = card('ข้อมูลทั่วไป', `<div class="form"><div class="field"><label>ชื่อระบบ</label><input class="input" value="Tourism Risk Intelligence (TRI)" readonly></div><div class="field"><label>องค์กร</label><input class="input" value="พื้นที่นำร่องจังหวัดภูเก็ต (Phuket Sandbox)" readonly></div><div class="grid2" style="gap:10px">${[['lang', 'ภาษา', ['ไทย', 'English', '中文']], ['tz', 'เขตเวลา', ['(GMT+07:00) Bangkok']]].map(([k, n, o]) => `<div class="field"><label>${n}</label><select class="input" data-setting-sel="${k}" ${T.can('admin') ? '' : 'disabled'}>${o.map(x => `<option ${x === st[k] ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`).join('')}</div></div>`, { info: false });
    const notify = card('การตั้งค่าการแจ้งเตือนหลัก', `<p class="tiny" style="margin-bottom:6px">จัดการช่องทางและประเภทการแจ้งเตือน</p>${tog('email', 'doc', 'อีเมล', 'รับการแจ้งเตือนผ่านอีเมล')}${tog('sms', 'chat', 'SMS', 'รับการแจ้งเตือนผ่าน SMS')}${tog('line', 'chat', 'LINE OA', 'รับการแจ้งเตือนผ่าน LINE', 'green')}${tog('push', 'bell', 'แอปพลิเคชัน', 'รับการแจ้งเตือนในระบบ')}${tog('sound', 'megaphone', 'เสียงแจ้งเตือน', 'เปิดเสียงเมื่อมีการแจ้งเตือน')}${selr('minlevel', 'alert', 'ระดับขั้นต่ำที่ต้องแจ้ง', 'เกณฑ์ความรุนแรงที่ส่งแจ้งเตือนอัตโนมัติ', ['ปานกลาง', 'สูง', 'วิกฤติ'])}`, { info: false });
    const security = card('ความปลอดภัยของระบบ', `${tog('twofa', 'lock', 'การยืนยันตัวตนแบบ 2 ขั้นตอน (2FA)', 'เพิ่มความปลอดภัยในการเข้าสู่ระบบ')}${tog('strongpw', 'lock', 'บังคับใช้รหัสผ่านที่รัดกุม', 'ผู้ใช้ต้องตั้งรหัสผ่านที่ปลอดภัย')}${selr('pwexpire', 'calendar', 'หมดอายุรหัสผ่าน', 'เปลี่ยนรหัสผ่านทุก 90 วัน', ['30 วัน', '60 วัน', '90 วัน'])}${tog('autologout', 'logout', 'ล็อกอินอัตโนมัติ', 'จำการเข้าสู่ระบบบนอุปกรณ์นี้')}${selr('maxdev', 'users', 'จำกัดการเข้าสู่ระบบ', 'จำกัดการเข้าสู่ระบบพร้อมกัน', ['1 อุปกรณ์', '3 อุปกรณ์', '5 อุปกรณ์'])}`, { info: false });
    const display = card('การตั้งค่าการแสดงผล', `<div class="setrow">${icT('palette', 'blue', 16)}<div><b>ธีมสี</b><span>เลือกธีมการแสดงผล</span></div><span class="row" style="gap:5px">${['#0b1c43', '#1d5bd8', '#0e9384', '#e2e8f1'].map((c, i) => `<i class="dotsw" style="width:16px;height:16px;background:${c};${i === 0 ? 'outline:2px solid var(--primary);outline-offset:2px' : ''}"></i>`).join('')}</span></div>${selr('density', 'grid', 'ความหนาแน่นของข้อมูล', 'ความหนาแน่นการแสดงข้อมูล', ['กระชับ', 'ปานกลาง', 'กว้าง'])}${selr('refresh', 'clock', 'รีเฟรชข้อมูลอัตโนมัติ', 'ความถี่ดึงข้อมูลใหม่', ['1 นาที', '5 นาที', '15 นาที'])}<div class="setrow">${icT('map', 'blue', 16)}<div><b>การแสดงผลแผนที่</b><span>ตั้งค่าการแสดงผลแผนที่</span></div><button class="btn sm ghost" data-go="riskmap">ตั้งค่าแผนที่</button></div>`, { info: false });
    const backup = card('การสำรองข้อมูลและกู้คืน', `<div class="setrow" style="grid-template-columns:minmax(0,1fr) auto"><div><b>สำรองข้อมูลล่าสุด</b><span>13 ต.ค. 2569 02:30</span></div>${stp('สำเร็จ', 'good')}</div>${selr('backup', 'cloud', 'ความถี่ในการสำรองข้อมูล', 'สำรองอัตโนมัติ', ['รายชั่วโมง', 'รายวัน', 'รายสัปดาห์'])}${selr('keep', 'history', 'เก็บข้อมูลสำรองไว้', 'ระยะเก็บรักษา', ['14 วัน', '30 วัน', '35 วัน'])}<div class="row" style="margin-top:10px"><button class="btn ghost" data-action="backup-now">${icon('cloud', 16)} สำรองข้อมูลทันที</button><button class="btn ghost" data-action="noop">${icon('history', 16)} กู้คืนข้อมูล</button></div>`, { info: false });
    const manage = card('การจัดการระบบ', `${[['settings', 'จัดการแคชระบบ', 'ล้างข้อมูลแคชเพื่อเพิ่มประสิทธิภาพ', 'noop'], ['list', 'จัดการ Log ระบบ', 'ดูและจัดการบันทึกการทำงาน', 'go-audit'], ['db', 'ตั้งค่าการเชื่อมต่อ API', 'จัดการการเชื่อมต่อระบบภายนอก', 'go-data'], ['download', 'นำเข้า/ส่งออกข้อมูล', 'จัดการข้อมูลระบบ', 'go-data'], ['alert', 'รีเซ็ตเดโม', 'คืนค่าข้อมูลจำลองทั้งหมด', 'reset']].map(([ic, n, d, a]) => `<button class="setrow" style="width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;text-align:left;cursor:pointer" data-action="${a}">${icT(ic, a === 'reset' ? 'red' : 'blue', 16)}<div><b style="${a === 'reset' ? 'color:var(--crit)' : ''}">${n}</b><span>${d}</span></div>${icon('chev', 16)}</button>`).join('')}`, { info: false });
    const panels = { general: [general, notify, security, display, backup, manage], notify: [notify], security: [security, card('ผู้ใช้และสิทธิ์', '<p class="small">จัดการบัญชีผู้ใช้ บทบาท 3 ระดับ และพื้นที่รับผิดชอบ</p>', { more: 'ไปที่หน่วยงานและผู้ใช้งาน', moreAct: 'data-go="agencies" data-agtab="users"', info: false })], display: [display], backup: [backup] };
    let body;
    if (tab === 'sources') { const srcs = await API.getDataSources(); body = card('สถานะการเชื่อมต่อแหล่งข้อมูล', table(['แหล่งข้อมูล', 'ประเภท', 'รอบดึงข้อมูล', 'สถานะ'], srcs.map(s => ({ cells: [esc(s.name), s.source_type, s.refresh_seconds >= 86400 ? `ทุก ${Math.round(s.refresh_seconds / 86400)} วัน` : `ทุก ${Math.round(s.refresh_seconds / 60)} นาที`, !s.enabled ? stp('รอข้อตกลง', 'plain') : s.stale ? stp('ล่าช้า', 'warn') : stp('เชื่อมต่อแล้ว', 'good')] }))), { more: 'ไปที่แหล่งข้อมูล', moreAct: 'data-go="data"' }); }
    else if (tab === 'history') { const log = await API.getAudit(); body = card('ประวัติการทำงาน', table(['เวลา', 'ผู้ทำ', 'การกระทำ', 'รายการ'], log.slice(0, 15).map(l => ({ cells: [T.dateTH(l.occurred_at), esc(T.userName(l.actor_id)), esc(l.action), `<span class="small">${esc(l.entity_id)}</span>`] }))), { more: 'ดูบันทึกทั้งหมด', moreAct: 'data-go="audit"' }); }
    else body = `<div class="g3">${panels[tab].join('')}</div>`;
    return `<div class="bigtabs">${tabs.map(([k, ic, n, d]) => `<button class="bigtab" data-settab="${k}" aria-selected="${tab === k}">${icon(ic, 22)}<span><b>${n}</b><span>${d}</span></span></button>`).join('')}</div>${T.can('admin') ? '' : T.callout('มุมมองนี้ดูการตั้งค่าได้อย่างเดียว เปลี่ยนเป็นมุมมอง "ผู้ดูแลระบบ" เพื่อแก้ไข', 'warn', 'lock')}${body}
      <section class="card" style="padding:12px 16px"><div class="row" style="gap:22px">${icT('info', 'blue', 16)}<b>ข้อมูลระบบ</b>${[['เวอร์ชันระบบ', '2.1.0 (เดโม)'], ['ฐานข้อมูล', 'PostgreSQL 17 + PostGIS (แผน)'], ['เซิร์ฟเวอร์', 'Mock API ในเบราว์เซอร์'], ['อัปเดตล่าสุด', '13 ต.ค. 2569']].map(([k, v]) => `<span class="small">${k} <b style="color:var(--ink)">${v}</b></span>`).join('')}<span class="small">สถานะระบบ <b style="color:var(--good)">● ปกติ</b></span></div></section>`;
  };
})();
