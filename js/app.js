/* =====================================================================
 * APP — router + 12 หน้าจอ (ตามเอกสารออกแบบข้อ 6) · อ่าน/เขียนผ่าน window.API เท่านั้น
 * ===================================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = Charts.esc;
  const content = $('#content'), statusBar = $('#status');
  let ST = null; // static data

  const SCREENS = {
    exec:      { code: 'FR06', name: 'Executive Dashboard', sub: 'เหตุที่ยืนยันแล้ว ระดับความเสี่ยง พื้นที่กระทบ SOS ค้าง แนวโน้ม และประกาศที่รออนุมัติ', group: 'ปฏิบัติงาน' },
    command:   { code: 'FR10–14', name: 'Command Center', sub: 'รายการเหตุ คิว SOS แผนที่สถานะ ภารกิจ และกำลังพร้อมใช้งาน', group: 'ปฏิบัติงาน' },
    alerts:    { code: 'FR08–09', name: 'ประกาศหลายภาษา', sub: 'ร่าง → ทบทวน → อนุมัติ → เผยแพร่ · ติดตามการส่งแยกจากการตอบรับ', group: 'ปฏิบัติงาน' },
    mytasks:   { code: 'FR13–14', name: 'Volunteer · My Tasks', sub: 'รับหรือปฏิเสธงาน รายละเอียดที่จำเป็น อัปเดตสถานะและขอสนับสนุน', group: 'ภาคสนาม' },
    sos:       { code: 'FR10', name: 'SOS Form & Tracking', sub: 'ขอความช่วยเหลือ ตำแหน่ง เลขติดตาม และความคืบหน้า', group: 'สาธารณะ' },
    analytics: { code: 'FR05–06', name: 'Analytical Dashboard', sub: 'KPI เปรียบเทียบพื้นที่และเวลา Drill down และส่งออกรายงาน', group: 'วิเคราะห์' },
    risk:      { code: 'FR07', name: 'Tourism Risk Map', sub: 'ชั้นพื้นที่เสี่ยง คะแนน 0–100 ที่มา วิธีประเมิน เวอร์ชัน และความเชื่อมั่น', group: 'วิเคราะห์' },
    heatmap:   { code: 'FR15', name: 'Mobility Heatmap', sub: 'ช่วงเวลา ประเภทจำนวน แหล่งข้อมูล ความครอบคลุมและความเชื่อมั่น', group: 'วิเคราะห์' },
    agencies:  { code: 'แผน 16/10', name: 'หน่วยงานภาคี (20 หน่วย)', sub: 'หน่วยงานหลัก 20 หน่วย + สนับสนุน 12 หน่วย ตามแผนนัดหมายประสานข้อมูลจังหวัดภูเก็ต · เชื่อมกับแหล่งข้อมูล ผู้ใช้ ภารกิจ และประกาศในระบบ', group: 'ข้อมูลและระบบ' },
    data:      { code: 'FR02–04', name: 'Data Management', sub: 'Source Batch Quality Metadata และประวัติการนำเข้า', group: 'ข้อมูลและระบบ' },
    admin:     { code: 'FR01', name: 'Administration', sub: 'ผู้ใช้ Role Area Scope KPI และกฎแจ้งเตือน', group: 'ข้อมูลและระบบ' },
    qa:        { code: '§12', name: 'ทดสอบ & QA', sub: 'ชุดทดสอบความถูกต้อง เกณฑ์ Load test และ SLO', group: 'ข้อมูลและระบบ' },
    audit:     { code: 'FR18', name: 'Audit Log', sub: 'ประวัติการกระทำ (append-only) ระบุผู้กระทำ รายการ และ request id', group: 'ข้อมูลและระบบ' },
  };
  const ROLE_USER = { commander: 'U01', dispatcher: 'U02', agency: 'U04', steward: 'U05', admin: 'U06' };
  const AG_USERS = ['U04', 'U09', 'U10', 'U11', 'U12'];

  const S = { agencyUser: 'U04', agencySel: 'AG01', agTier: 'core', agFunc: '', agRound: '', screen: 'exec', scenario: 'flood', role: 'dispatcher', persona: 'V01', task: null, sos: null, alert: null, cell: null, riskArea: 'A1', filterArea: '', publicView: false, biTable: false, tracking: [], tests: null, accessResult: null };
  try { Object.assign(S, JSON.parse(localStorage.getItem('tci-ui-v2') || '{}')); } catch (e) {}
  { const q = new URLSearchParams(location.search); ['screen', 'scenario', 'role', 'persona', 'agencyUser'].forEach(k => { if (q.has(k)) S[k] = q.get(k); }); }
  const persistUI = () => { try { localStorage.setItem('tci-ui-v2', JSON.stringify({ screen: S.screen, scenario: S.scenario, role: S.role, persona: S.persona, agencyUser: S.agencyUser, tracking: S.tracking })); } catch (e) {} };

  /* ---------- labels ---------- */
  const L = {
    task: { pending: 'Pending · รอมอบหมาย', offered: 'Offered · รอตอบรับ', accepted: 'Accepted · รับงานแล้ว', en_route: 'En route · กำลังเดินทาง', on_scene: 'On scene · ถึงจุดเกิดเหตุ', completed: 'Completed · เสร็จสิ้น', cancelled: 'Cancelled · ยกเลิก' },
    taskShort: { pending: 'รอมอบหมาย', offered: 'รอตอบรับ', accepted: 'รับงานแล้ว', en_route: 'กำลังเดินทาง', on_scene: 'ถึงจุดเกิดเหตุ', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' },
    taskCls: { pending: 'crit', offered: 'warn', accepted: 'info', en_route: 'warn', on_scene: 'warn', completed: 'good', cancelled: '' },
    sos: { received: 'รอคัดกรอง', screened: 'คัดกรองแล้ว', closed: 'ปิดแล้ว', cancelled: 'ยกเลิก' }, sosCls: { received: 'crit', screened: 'info', closed: 'good', cancelled: '' },
    inc: { reported: 'รายงาน (ยังไม่ตรวจสอบ)', verified: 'ตรวจสอบแล้ว', escalated: 'ยกระดับ', notified: 'แจ้งผู้รับผิดชอบ', tracking: 'ติดตาม', closed: 'ปิดเหตุ' }, incCls: { reported: 'warn', verified: 'good', escalated: 'serious', notified: 'info', tracking: 'info', closed: '' },
    alert: { draft: 'ร่าง', review: 'รอทบทวน', approved: 'อนุมัติแล้ว', rejected: 'ส่งกลับแก้ไข', published: 'เผยแพร่แล้ว', expired: 'หมดอายุ' }, alertCls: { draft: '', review: 'warn', approved: 'good', rejected: 'crit', published: 'info', expired: '' },
    vol: { available: 'พร้อมงาน', busy: 'ติดงาน', off: 'ไม่ปฏิบัติงาน' }, volCls: { available: 'good', busy: 'warn', off: '' },
    verif: { verified: 'ผ่านการตรวจสอบ', pending: 'รอตรวจสอบ', suspended: 'ถูกระงับ' }, verifCls: { verified: 'good', pending: 'warn', suspended: 'crit' },
    sig: { verified: 'ยืนยันแล้ว', unverified: 'ยังไม่ยืนยัน', rejected: 'ปฏิเสธ (ข่าวลวง)' }, sigCls: { verified: 'good', unverified: 'warn', rejected: 'crit' },
    srcCls: { Public: '', Internal: 'info', Restricted: 'crit' },
    ico: { good: '✓', warn: '!', serious: '!', crit: '✕', info: '•', '': '•' },
    vuln: { elderly: 'ผู้สูงอายุ', child: 'เด็ก', injured: 'บาดเจ็บ', chronic: 'โรคประจำตัว', language: 'อุปสรรคภาษา', disabled: 'ผู้พิการ', pregnant: 'ตั้งครรภ์' },
    reqType: { trapped: 'ติดค้าง', stranded: 'ตกค้าง/เดินทางไม่ได้', shelter: 'ที่พักพิง', medical: 'เจ็บป่วย', evacuate: 'อพยพ', marine: 'เหตุทางทะเล', missing: 'คนหาย', crowd: 'เบียดเสียด', support: 'สนับสนุน', other: 'อื่นๆ' },
  };
  const tag = (t, c = '') => `<span class="tag ${c}"><span class="ico">${L.ico[c] ?? '•'}</span>${esc(t)}</span>`;
  const metric = (l, v, n, cls = '', unit = '') => `<div class="metric ${cls}"><div class="metric-label">${esc(l)}</div><div class="metric-value num">${v == null ? '<span class="muted" style="font-size:18px">ไม่มีข้อมูล</span>' : v}${unit && v != null ? `<small>${esc(unit)}</small>` : ''}</div><div class="metric-note">${esc(n)}</div></div>`;
  const table = (headers, rows, opts = {}) => `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th${/^#/.test(h) ? ' class="num"' : ''}>${esc(h.replace(/^#/, ''))}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr${r.attrs || ''}>${r.cells.map((c, i) => `<td${/^#/.test(headers[i]) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="small">${esc(opts.empty || 'ไม่มีข้อมูล')}</td></tr>`}</tbody></table></div>`;
  const hhmm = iso => iso ? new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '—';
  const dateTH = iso => iso ? new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  const areaName = id => (ST.areas.find(a => a.area_id === id) || {}).name || id || '—';
  const agencyName = id => (ST.agencies.find(a => a.agency_id === id) || {}).name || id || '—';
  const agencyShort = id => { const a = ST.agencies.find(x => x.agency_id === id); return a ? `${a.no ? a.no + '. ' : ''}${a.short}` : (id || '—'); };
  const agencyPill = (id, extra = '') => `<span class="list-pill agency-pill" data-agency="${id}" title="${esc(agencyName(id))}">${esc(agencyShort(id))}${extra}</span>`;
  const COORD = { planned: ['วางแผนนัด', ''], invited: ['ส่งหนังสือเชิญ', 'info'], met: ['ประชุมแล้ว', 'warn'], sample: ['ได้ข้อมูลตัวอย่าง', 'serious'], agreement: ['ตกลงเชื่อมข้อมูล', 'good'] };
  const hazardName = c => (ST.hazard_types.find(h => h.hazard_code === c) || {}).name || c;
  const skillName = c => ST.skill_names[c] || c;
  const role = () => ST.roles.find(r => r.role_code === S.role);
  const can = p => role().can.includes(p);
  const actor = () => S.role === 'volunteer' ? S.persona : S.role === 'agency' ? S.agencyUser : S.role === 'tourist' ? 'นักท่องเที่ยว (บัญชี)' : ROLE_USER[S.role];
  const lockNote = p => can(p) ? '' : `<p class="role-note">บทบาท "${esc(role().name)}" ไม่มีสิทธิ์ดำเนินการนี้ (RBAC) · เปลี่ยนบทบาทที่มุมขวาบน</p>`;
  const scoreCls = s => s >= 70 ? 'hi' : s >= 40 ? 'mid' : 'lo';
  const scorePill = (p) => `<span class="score ${scoreCls(p.score)}" title="กฎ ${p.rule_version}">${p.score}</span>${p.hard_priority ? ' ' + tag('Hard Priority', 'crit') : ''}${p.override ? ' ' + tag('ปรับโดยเจ้าหน้าที่', 'warn') : ''}`;
  const lvlColor = l => ['', 'var(--good)', 'var(--s3)', 'var(--warn)', 'var(--serious)', 'var(--crit)'][l] || 'var(--muted)';
  const banner = (m) => `<div class="event ${m.severity >= 5 ? '' : 'high'}"><div><strong>${esc(m.title)}</strong><small>${m.code} · ${esc(hazardName(m.hazard_code))} · ${esc(areaName(m.area_id))} · ${esc(SEED.meta.snapshot_label)}</small></div><div>${tag('ความรุนแรง ' + m.severity + '/5', m.severity >= 5 ? 'crit' : 'serious')} ${tag('Protocol: ' + L.inc[m.status], L.incCls[m.status])} <span class="small">v${m.version}</span></div></div>`;
  const timeline = (events) => `<div class="timeline">${events.map(e => `<p><b>${hhmm(e.occurred_at || e.ts)}</b>${esc(e.actor_id || e.actor || '')} · ${esc(e.event_type === 'status' ? `${L.taskShort[e.new_status] || e.new_status}` : (e.event_type || e.action))}${e.note ? ` <span class="small">— ${esc(e.note)}</span>` : ''}</p>`).join('')}</div>`;

  let toastTimer;
  function toast(msg, isError) { statusBar.textContent = msg; statusBar.classList.add('show'); statusBar.style.background = isError ? 'var(--crit)' : ''; clearTimeout(toastTimer); toastTimer = setTimeout(() => statusBar.classList.remove('show'), 3600); }
  async function act(promise, okMsg) { const r = await promise; if (r.ok === false) { toast(r.error, true); return false; } toast(okMsg); await draw(); return true; }

  /* ================================================================ SCREENS */
  async function screenExec() {
    const [m, k, alerts, tasks, srcs, risk] = await Promise.all([API.getMajorIncident(S.scenario), API.getKPIs(S.scenario), API.getAlerts(S.scenario), API.getTasks(S.scenario), API.getDataSources(), API.getRisk()]);
    const review = alerts.filter(a => a.status === 'review');
    const hard = tasks.filter(t => t.hard_priority && ['pending', 'offered'].includes(t.status));
    const stages = ST.protocol_stages; const si = stages.findIndex(s => s[0] === m.status);
    const barHtml = Charts.bar(m.trend.map((v, i) => ({ label: `${10 + i}:00`, value: v, hl: i === 4 })), { height: 150, ariaLabel: 'เหตุสะสม 10–14 นาฬิกา' });
    const areaRisk = risk.assessments.filter(r => r.area_id === m.area_id).sort((a, b) => b.risk_score - a.risk_score)[0];
    return `${banner(m)}
    <div class="metrics">
      ${metric('เหตุที่ยืนยันแล้ว', k.incidents_confirmed, `รายงานรอตรวจสอบ ${k.incidents_reported_unverified} · ไม่รวมในตัวเลข`, '', 'เหตุ')}
      ${metric('SOS ใหม่ / ค้าง', `${k.sos_new} / ${k.sos_open}`, `ภารกิจรอมอบหมาย ${k.tasks_pending} · Hard Priority ${k.tasks_hard_pending}`, k.tasks_hard_pending ? 'crit' : k.sos_open ? 'warn' : 'good')}
      ${metric('เวลาเริ่มตอบสนอง P50 / P95', k.resp_start_p50 == null ? null : `${k.resp_start_p50} / ${k.resp_start_p95}`, `นาที · SOS บันทึก → เจ้าหน้าที่คัดกรอง (n=${k.resp_n}) · ไม่ใช่เวลาถึงที่เกิดเหตุ`, '', '')}
      ${metric('อัตรางานเสร็จตาม SLA', k.sla_rate, `งานที่เข้าเกณฑ์ ${k.sla_n} · ไม่รวมยกเลิก`, k.sla_rate != null && k.sla_rate < 60 ? 'warn' : 'good', '%')}
      ${metric('อาสาสมัครพร้อมปฏิบัติงาน', k.volunteers_ready, `จาก ${k.volunteers_total} คน · ตรวจสอบแล้ว + ว่าง + ไม่เกินเพดานงาน`, '', 'คน')}
      ${metric('สัดส่วนข้อมูลตรงเวลา', k.data_on_time, k.stale_sources.length ? `ล่าช้า: ${k.stale_sources.join(', ')}` : 'ทุกแหล่งอยู่ใน SLA', k.stale_sources.length ? 'warn' : 'good', '%')}
    </div>
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>Crisis Response Protocol</h3>${can('protocol') && si < stages.length - 1 ? `<button class="btn sm" data-action="stage">เลื่อนไปขั้น "${stages[si + 1][1]}"</button>` : ''}</div>
        <div class="stepper">${stages.map((s, i) => `<div class="step ${i < si ? 'done' : i === si ? 'current' : ''}"><div class="n">${i + 1}</div><strong>${s[1]}</strong><div class="small">${s[2]}</div></div>`).join('')}</div>
        <div class="rule"><span class="kicker">สัญญาณที่ใช้ตัดสินใจ</span><p>${esc(m.signal)}</p><p class="small">แหล่ง: ${esc(m.source)} · ตรวจสอบโดยเจ้าหน้าที่ · observed 13:45 / ingested 13:58</p></div>
        <div class="rule"><span class="kicker">ข้อเสนอการตอบสนอง (ระบบเสนอ · ผู้มีอำนาจตัดสินใจ)</span><p>${esc(m.decision)}</p></div>
        ${lockNote('protocol')}</section>
      <section class="panel"><h3>เรื่องที่ต้องตัดสินใจ</h3>
        <div class="rule"><div class="row"><span class="kicker">ประกาศรออนุมัติ</span>${tag(review.length + ' รายการ', review.length ? 'warn' : 'good')}</div>
          ${review.map(a => `<div class="row" style="margin-top:6px"><span>${a.alert_id} · ${esc(a.translations.th.title)} <span class="lvl" style="background:${lvlColor(a.level)}">${a.level}</span></span>${can('approve_alert') ? `<button class="btn sm" data-go="alerts" data-alert="${a.alert_id}">เปิดทบทวน</button>` : ''}</div>`).join('') || '<p class="small">ไม่มี</p>'}</div>
        <div class="rule"><div class="row"><span class="kicker">Hard Priority ยังไม่มีผู้รับงาน</span>${tag(hard.length + ' รายการ', hard.length ? 'crit' : 'good')}</div>${hard.map(t => `<p class="small">${t.task_id} · ${esc(t.title)} · ${L.taskShort[t.status]} · รอ ${t.priority.components.wait.minutes} นาที</p>`).join('')}</div>
        <div class="rule"><span class="kicker">ความเสี่ยงสูงสุดในพื้นที่</span><p>${esc(hazardName(areaRisk.hazard_code))} · คะแนน ${areaRisk.risk_score}/100 · ความเชื่อมั่น ${Math.round(areaRisk.confidence * 100)}% · ${areaRisk.method}</p></div>
        <div class="toolbar"><button class="btn" data-go="command">เปิด Command Center</button><button class="btn secondary" data-go="analytics">Analytical Dashboard</button><button class="btn secondary" data-go="risk">Risk Map</button></div>
        <p class="small" style="margin-top:8px">ขอบเขตอำนาจ: ระบบเสนอข้อมูลและติดตามงาน · การประกาศเตือนสาธารณะ การอพยพ และการสั่งกู้ภัยอยู่กับผู้มีอำนาจของหน่วยงาน</p></section>
    </div>
    <section class="panel"><div class="row"><h3>หน่วยงานที่เกี่ยวข้องกับเหตุการณ์นี้</h3><button class="btn sm secondary" data-go="agencies">ทะเบียนหน่วยงานภาคี</button></div>
      <dl class="kv"><dt>หน่วยงานหลัก (Lead)</dt><dd>${agencyPill(m.agencies.lead)}</dd><dt>หน่วยสนับสนุน</dt><dd>${m.agencies.support.map(id => agencyPill(id)).join('')}</dd><dt>หน่วยรับทราบ/ประกาศ</dt><dd>${m.agencies.inform.map(id => agencyPill(id)).join('')}</dd></dl>
      <p class="small" style="margin-top:6px">อ้างอิงหน่วยงานตามแผนนัดหมายประสานข้อมูลจังหวัดภูเก็ต 16 ต.ค. 2569 · บทบาท Lead/Support เป็นข้อเสนอเพื่อยืนยันใน SOP ของจังหวัด</p></section>
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>เหตุสะสมตามเวลา</h3><span class="small">เฉพาะเหตุที่ยืนยัน · ${esc(areaName(m.area_id))}</span></div>${barHtml}</section>
      <section class="panel"><h3>ความสดของแหล่งข้อมูลหลัก</h3>${table(['แหล่ง', 'รับล่าสุด', 'SLA', 'สถานะ'], srcs.filter(s => s.enabled).map(s => ({ cells: [esc(s.name), s.last_received_at ? `${hhmm(s.last_received_at)} <span class="small">(${s.age_min} นาที)</span>` : '—', s.refresh_seconds >= 86400 ? `${Math.round(s.refresh_seconds / 86400)} วัน` : `${Math.round(s.refresh_seconds / 60)} นาที`, s.stale ? tag('Stale', 'warn') : tag('ตรงเวลา', 'good')] })))}<p class="small" style="margin-top:6px">Snapshot KPI: ${dateTH(k.snapshot_at)} · เวอร์ชันสูตร: ${Object.entries(k.kpi_versions).slice(0, 4).map(([c, v]) => `${c} v${v}`).join(', ')} …</p></section>
    </div>`;
  }

  async function screenCommand() {
    const [m, incs, sos, tasks, vols, alerts] = await Promise.all([API.getMajorIncident(S.scenario), API.getIncidents(S.scenario), API.getSOS(S.scenario), API.getTasks(S.scenario), API.getVolunteers(), API.getAlerts(S.scenario)]);
    const cols = ['pending', 'offered', 'accepted', 'en_route', 'on_scene'];
    const byCol = c => tasks.filter(t => t.status === c).sort((a, b) => (b.hard_priority - a.hard_priority) || b.priority.score - a.priority.score);
    const t = tasks.find(x => x.task_id === S.task) || byCol('pending')[0] || tasks[0];
    const queue = sos.filter(s => s.status === 'received');
    const sel = sos.find(s => s.sos_id === S.sos) || queue[0];
    const rec = t ? await API.recommendVolunteers(t.task_id) : [];
    const asg = t ? (t.assignments || []).find(a => ['offered', 'accepted'].includes(a.status)) : null;
    const vol = asg ? vols.find(v => v.volunteer_id === asg.volunteer_id) : null;
    const now = new Date(await API.now());
    const markers = ST.areas.filter(a => a.level !== 'province').map(a => { const n = tasks.filter(x => x.area_id === a.area_id && !['completed', 'cancelled'].includes(x.status)).length; return { id: a.area_id, name: a.name, x: a.x, y: a.y, r: 3 + n * 0.8, color: n ? (a.area_id === m.area_id ? 'var(--crit)' : 'var(--warn)') : 'var(--s3)', label: String(n), sel: a.area_id === m.area_id }; });
    const sosRow = s => ({ attrs: ` class="clickable ${sel && s.sos_id === sel.sos_id ? 'selected' : ''}" data-sos="${s.sos_id}"`, cells: [`<strong>${s.tracking_no}</strong><br><span class="small">${esc(s.request_detail)}</span>`, esc(L.reqType[s.request_type] || s.request_type), `${s.people_count} คน`, `±${s.location_accuracy_m} ม.`, hhmm(s.created_at), tag(L.sos[s.status], L.sosCls[s.status])] });
    const nextStatus = { accepted: 'en_route', en_route: 'on_scene', on_scene: 'completed' };
    return `${banner(m)}
    <div class="metrics">
      ${metric('SOS รอคัดกรอง', queue.length, 'ต้องยืนยันข้อมูล เชื่อมเหตุ และกำหนดความเร่งด่วน', queue.length ? 'crit' : 'good', 'รายการ')}
      ${metric('ภารกิจรอมอบหมาย', byCol('pending').length, `Hard Priority ${byCol('pending').filter(x => x.hard_priority).length}`, byCol('pending').length ? 'warn' : 'good', 'งาน')}
      ${metric('รอตอบรับ (Offered)', byCol('offered').length, `หมดเวลาใน ${SEED.meta.offer_timeout_min} นาที แล้วคืนคิวอัตโนมัติ`, '', 'งาน')}
      ${metric('กำลังพร้อมใช้งาน', vols.filter(v => v.verification_status === 'verified' && v.availability === 'available' && v.active_tasks < v.max_active_tasks).length, `ติดงาน ${vols.filter(v => v.active_tasks > 0).length} · รอตรวจ/ระงับ ${vols.filter(v => v.verification_status !== 'verified').length}`, '', 'คน')}
    </div>
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>คิว SOS รอคัดกรอง</h3>${tag('FR10 · เลขติดตามออกแล้วก่อนคัดกรอง', 'info')}</div>
        ${table(['คำขอ', 'ประเภท', '#คน', 'ความแม่นยำ', 'รับเมื่อ', 'สถานะ'], queue.map(sosRow), { empty: 'ไม่มีคำขอรอคัดกรอง' })}
        ${sel && sel.status === 'received' ? `<div class="rule" style="margin-top:10px"><strong>คัดกรอง ${sel.tracking_no}</strong><p class="small">${esc(sel.request_detail)} · ผู้แจ้ง: ${esc(sel.requester)} · ช่องทาง ${sel.channel} · ติดต่อ ${can('view_contact') ? esc(sel.contact_masked) : '<i>ซ่อน</i>'} · ภาษา ${sel.languages.join('/')}</p>
          <div class="form" style="margin-top:8px">
            <div class="grid cols-3"><label>ความเร่งด่วน (1–5)<select id="sc-urg">${[1, 2, 3, 4, 5].map(u => `<option ${u === sel.urgency ? 'selected' : ''}>${u}</option>`).join('')}</select></label>
            <label>เชื่อมเหตุการณ์<select id="sc-inc"><option value="">— ไม่เชื่อม —</option><option value="${m.incident_id}" selected>${m.code} · ${esc(m.title)}</option></select></label>
            <label>หน่วยงานรับผิดชอบ<select id="sc-ag">${ST.agencies.map(a => `<option value="${a.agency_id}">${esc(a.name)}</option>`).join('')}</select></label></div>
            <label>ชื่อภารกิจ<input id="sc-title" value="${esc(sel.request_detail)}"></label>
            <div class="grid cols-2"><label>ทักษะที่ต้องการ<select id="sc-skills" multiple size="4">${Object.entries(ST.skill_names).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join('')}</select></label>
            <div><span class="small">ความเปราะบาง</span><div class="pill-row" style="margin-top:4px">${Object.entries(L.vuln).map(([c, n]) => `<label class="check"><input type="checkbox" class="sc-vuln" value="${c}" ${sel.vulnerability_flags.includes(c) ? 'checked' : ''}>${n}</label>`).join('')}</div>
            <label class="check" style="margin-top:8px"><input type="checkbox" id="sc-hard"> Hard Priority (อันตรายเร่งด่วน เข้าคิวก่อนคะแนน)</label></div></div>
            <div class="toolbar"><button class="btn" data-action="screen" data-id="${sel.sos_id}" ${can('screen_sos') ? '' : 'disabled'}>ยืนยันคัดกรองและสร้างภารกิจ</button></div>${lockNote('screen_sos')}</div></div>` : ''}
      </section>
      <section class="panel"><div class="row"><h3>แผนที่สถานะ</h3><span class="small">ภารกิจที่ยังเปิด รายพื้นที่</span></div><div class="map-wrap">${Charts.statusMap(markers)}</div>
        <h3 style="margin-top:8px">รายการเหตุในเหตุการณ์นี้</h3>
        ${table(['เหตุ', 'ประเภท', '#รุนแรง', 'เวลา', 'สถานะ', ''], incs.slice(0, 6).map(i => ({ cells: [i.incident_id, esc(i.title), i.severity, hhmm(i.occurred_at), tag(L.inc[i.status], L.incCls[i.status]), i.status === 'reported' ? `<button class="btn sm secondary" data-action="verify-inc" data-id="${i.incident_id}" ${can('screen_sos') ? '' : 'disabled'}>ตรวจสอบ</button>` : ''] })))}
        <p class="small" style="margin-top:6px">แสดง 6 จาก ${incs.length} เหตุ · เหตุที่เป็น "รายงาน" ไม่นับใน KPI และไม่กลายเป็นประกาศอัตโนมัติ (FR08)</p></section>
    </div>
    <section class="panel"><div class="row"><h3>กระดานภารกิจ</h3><span class="small">เรียงตาม Hard Priority แล้วคะแนน 0–100 (กฎ ${SEED.meta.priority_rule_version})</span></div>
      <div class="board">${cols.map(c => `<div class="col"><h4>${L.taskShort[c]}<span>${byCol(c).length}</span></h4>${byCol(c).map(x => `<div class="card ${x.hard_priority ? 'hard' : ''} ${t && x.task_id === t.task_id ? 'sel' : ''}" data-task="${x.task_id}"><span class="t">${esc(x.title)}</span>${scorePill(x.priority)} <span class="small">${x.task_id}</span>${x.support_requested ? '<br>' + tag('ขอสนับสนุน', 'crit') : ''}</div>`).join('') || '<p class="small">—</p>'}</div>`).join('')}</div>
      <p class="small" style="margin-top:8px">เสร็จสิ้น ${tasks.filter(x => x.status === 'completed').length} · ยกเลิก ${tasks.filter(x => x.status === 'cancelled').length}</p></section>
    ${t ? `<div class="grid cols-2">
      <section class="panel"><div class="row"><h3>${t.task_id} <span class="small">v${t.version}</span></h3>${tag(L.task[t.status], L.taskCls[t.status])}</div>
        <p><strong>${esc(t.title)}</strong></p><p class="small">${esc(areaName(t.area_id))} · ${esc(agencyName(t.assigned_agency_id))} · SLA ถึง ${hhmm(t.due_at)} · SOS ${t.sos_id}</p>
        <div class="rule"><div class="row"><span class="kicker">คะแนนจัดลำดับ ${t.priority.score}/100 ${t.priority.override ? `(คำนวณ ${t.priority.computed_score})` : ''}</span>${scorePill(t.priority)}</div>
          ${[['ความเร่งด่วน', t.priority.components.urgency, `ระดับ ${t.priority.components.urgency.value}/5`], ['ความเปราะบาง', t.priority.components.vulnerability, t.priority.components.vulnerability.flags.map(f => L.vuln[f] || f).join(', ') || 'ไม่มี'], ['ความรุนแรงพื้นที่', t.priority.components.area_severity, `เหตุหลักระดับ ${t.priority.components.area_severity.severity ?? '—'}`], ['เวลารอ', t.priority.components.wait, `${t.priority.components.wait.minutes} นาที`]].map(([n, c, d]) => `<div class="bar-row"><span>${n} <span class="small">×${c.weight}</span></span><div class="track"><div class="fill" style="width:${c.norm * 100}%"></div></div><span class="num">${c.points}</span></div><p class="small" style="margin:-2px 0 4px 0">${esc(d)}</p>`).join('')}
          ${t.priority.override ? `<p class="small">ปรับโดย ${t.priority.override.by}: ${esc(t.priority.override.reason)}</p>` : ''}
          ${can('assign') && !['completed', 'cancelled'].includes(t.status) ? `<div class="toolbar"><input id="ov-score" type="number" min="0" max="100" placeholder="คะแนนใหม่" style="width:110px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"><input id="ov-reason" placeholder="เหตุผล (บังคับ)" style="flex:1;min-width:160px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"><button class="btn sm secondary" data-action="override" data-id="${t.task_id}">ปรับลำดับ</button></div>` : ''}</div>
        <div class="rule"><span class="kicker">ทักษะที่ต้องการ</span><p>${t.required_skills.map(s => `<span class="list-pill">${esc(skillName(s))}</span>`).join('') || '—'}</p></div>
        ${asg ? `<div class="rule"><span class="kicker">หัวหน้าภารกิจ (Active)</span><p><strong>${esc(vol.display_name)}</strong> · ${esc(agencyName(vol.agency_id))} · ${tag(asg.status === 'offered' ? 'รอตอบรับ' : 'ตอบรับแล้ว', asg.status === 'offered' ? 'warn' : 'good')} ${asg.status === 'offered' ? `<span class="small">หมดเวลา ${hhmm(asg.expires_at)} (<span class="countdown">${Math.max(0, Math.round((new Date(asg.expires_at) - now) / 60000))} นาที</span>)</span>` : ''}</p>${asg.status === 'offered' && can('assign') ? `<button class="btn sm secondary" data-action="expire" data-id="${t.task_id}">จำลองหมดเวลาตอบรับ</button>` : ''}</div>` : ''}
        ${timeline(t.events)}
        <div class="toolbar">${can('task_update') && nextStatus[t.status] ? `<button class="btn" data-action="task-status" data-id="${t.task_id}" data-status="${nextStatus[t.status]}" data-version="${t.version}">อัปเดตแทนอาสา → ${L.taskShort[nextStatus[t.status]]}</button>` : ''}${can('task_update') && !['completed', 'cancelled'].includes(t.status) ? `<button class="btn danger sm" data-action="task-cancel" data-id="${t.task_id}" data-version="${t.version}">ยกเลิกภารกิจ</button>` : ''}</div>
        ${can('task_update') ? '<p class="small">อัปเดตส่ง Expected Version ทุกครั้ง · ถ้า version ล้าสมัยระบบปฏิเสธ (ลองทดสอบในหน้า QA)</p>' : lockNote('task_update')}
      </section>
      <section class="panel"><h3>อาสาสมัครที่ระบบเสนอสำหรับ ${t.task_id}</h3><p class="small">เงื่อนไข: ผ่านการตรวจสอบ · ทักษะ/ใบรับรองยังใช้ได้ · ภาระงานไม่เกิน max_active_tasks · ระยะทางโดยประมาณ (ไม่มีข้อมูลเส้นทาง) · เจ้าหน้าที่รับรองก่อนส่ง</p>
        ${table(['อาสาสมัคร', 'ทักษะที่ต้องการ', 'ระยะ / ETA', 'งาน', 'สถานะ', '#คะแนน'], rec.slice(0, 8).map(r => ({ attrs: r.eligible ? '' : ' class="lock"', cells: [`<strong>${esc(r.volunteer.display_name)}</strong><br><span class="small">${esc(agencyName(r.volunteer.agency_id))} · ${esc(areaName(r.volunteer.area_id))}${r.same_area ? ' ✓' : ''}</span>`, r.skills.map(s => `<span class="list-pill" style="${s.has && s.valid ? 'background:var(--good-bg)' : s.has ? 'background:var(--crit-bg)' : ''}">${esc(s.name)}${s.has && !s.valid ? ' (หมดอายุ)' : ''}</span>`).join(''), `${r.distance_km} กม. · ~${r.eta_min} นาที<br><span class="small">${r.eta_note}</span>`, `${r.active_tasks}/${r.volunteer.max_active_tasks}`, r.eligible ? tag(L.vol[r.volunteer.availability], L.volCls[r.volunteer.availability]) + (r.warn.length ? ' ' + tag(r.warn[0], 'warn') : '') : tag(r.reasons[0], 'crit'), r.eligible ? r.score : '—'] })))}
        ${t.status === 'pending' ? `<div class="toolbar"><select id="offer-vol" style="flex:1;min-width:200px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">${rec.filter(r => r.eligible).map(r => `<option value="${r.volunteer.volunteer_id}">${esc(r.volunteer.display_name)} · คะแนน ${r.score}</option>`).join('')}</select><button class="btn" data-action="offer" data-id="${t.task_id}" ${can('assign') ? '' : 'disabled'}>รับรองและเสนอภารกิจ</button></div><p class="small">POST /v1/tasks/{id}/assign · Transaction Lock · Partial Unique Index กันหัวหน้าภารกิจซ้ำ · ความสำเร็จของการส่งข้อความ ≠ การตอบรับ</p>${lockNote('assign')}` : `<p class="small" style="margin-top:8px">ภารกิจอยู่ในสถานะ ${L.taskShort[t.status]} — เสนอเพิ่มไม่ได้จนกว่าจะคืนคิว</p>`}
      </section></div>` : ''}
    <section class="panel"><div class="row"><h3>ประกาศในเหตุการณ์นี้</h3><button class="btn sm secondary" data-go="alerts">จัดการประกาศ</button></div>${table(['ประกาศ', 'ระดับ', 'กลุ่มเป้าหมาย', 'สถานะ', 'ส่ง/ถึง/ตอบรับ'], alerts.map(a => ({ attrs: ` class="clickable" data-go="alerts" data-alert="${a.alert_id}"`, cells: [`<strong>${a.alert_id}</strong> ${esc(a.translations.th.title)}`, `<span class="lvl" style="background:${lvlColor(a.level)}">${a.level}</span>`, esc(a.audience), tag(L.alert[a.status], L.alertCls[a.status]), a.deliveries.length ? `${a.deliveries.reduce((s, d) => s + d.sent, 0)} / ${a.deliveries.reduce((s, d) => s + d.delivered, 0)} / ${a.deliveries.reduce((s, d) => s + d.acknowledged, 0)}` : '—'] })))}</section>`;
  }

  async function screenAlerts() {
    const [m, alerts, signals] = await Promise.all([API.getMajorIncident(S.scenario), API.getAlerts(S.scenario), API.getSignals(S.scenario)]);
    const a = alerts.find(x => x.alert_id === S.alert) || alerts[0];
    const langs = [['th', 'TH · ต้นฉบับ'], ['en', 'EN'], ['zh', 'ZH']];
    const actions = [];
    if (a) {
      if (['draft', 'rejected'].includes(a.status)) actions.push(`<button class="btn" data-action="alert" data-op="submit" data-id="${a.alert_id}" ${can('draft_alert') ? '' : 'disabled'}>ส่งทบทวน</button>`);
      if (a.status === 'review') { actions.push(`<button class="btn" data-action="alert" data-op="approve" data-id="${a.alert_id}" ${can('approve_alert') ? '' : 'disabled'}>อนุมัติ (ผู้บัญชาการ)</button>`); actions.push(`<button class="btn danger" data-action="alert" data-op="reject" data-id="${a.alert_id}" ${can('approve_alert') ? '' : 'disabled'}>ส่งกลับแก้ไข</button>`); }
      if (a.status === 'approved') actions.push(`<button class="btn" data-action="alert" data-op="publish" data-id="${a.alert_id}" ${can('publish_alert') ? '' : 'disabled'}>เผยแพร่ (POST /v1/alerts/{id}/publish)</button>`);
      if (a.status === 'published' && can('ack_alert') && !(a.acks || []).some(k => k.actor === actor())) actions.push(`<button class="btn secondary" data-action="ack" data-id="${a.alert_id}">ตอบรับประกาศในนามหน่วยงาน</button>`);
    }
    return `${banner(m)}
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>ประกาศในเหตุการณ์นี้</h3>${can('draft_alert') ? `<button class="btn sm secondary" data-action="toggle-new-alert">+ ร่างประกาศ</button>` : ''}</div>
        ${table(['ประกาศ', 'ระดับ', 'กลุ่มเป้าหมาย', 'สถานะ'], alerts.map(x => ({ attrs: ` class="clickable ${a && x.alert_id === a.alert_id ? 'selected' : ''}" data-alert="${x.alert_id}"`, cells: [`<strong>${x.alert_id}</strong><br><span class="small">${esc(x.translations.th.title)}</span>`, `<span class="lvl" style="background:${lvlColor(x.level)}">${x.level}</span>`, esc(x.audience), tag(L.alert[x.status], L.alertCls[x.status])] })))}
        <div id="new-alert" hidden class="rule" style="margin-top:10px"><strong>ร่างประกาศใหม่</strong><div class="form" style="margin-top:6px">
          <div class="grid cols-2"><label>กลุ่มเป้าหมาย<input id="na-aud" placeholder="เช่น นักท่องเที่ยวในพื้นที่"></label><label>ระดับ (1–5)<select id="na-lvl">${[1, 2, 3, 4, 5].map(l => `<option ${l === 3 ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
          <label>หัวข้อ (TH)<input id="na-title"></label><label>ข้อความ (TH)<textarea id="na-msg" rows="3"></textarea></label>
          <div class="toolbar"><button class="btn" data-action="create-alert">บันทึกร่าง</button></div></div></div>
        <div class="rule"><strong>โฟลว์อนุมัติ (FR09)</strong><p class="small">ร่าง (ศูนย์สั่งการ) → รอทบทวน → อนุมัติ/ส่งกลับ (ผู้บัญชาการเหตุการณ์) → เผยแพร่ตามช่องทางผ่าน Outbox · เงื่อนไข: ทุกภาษาต้องมีข้อความและผู้ตรวจภาษา และเหตุที่อ้างอิงต้องผ่านการตรวจสอบแล้ว</p></div>
        <h3 style="margin-top:12px">สัญญาณออนไลน์ (Social Listening)</h3><p class="small">สัญญาณที่ยังไม่ยืนยันไม่กลายเป็นประกาศอัตโนมัติ (FR08) · เจ้าหน้าที่ต้องตรวจสอบก่อน</p>
        ${table(['ข้อความ', 'ภาษา', '#ความเชื่อมั่น', 'สถานะ', ''], signals.map(s => ({ cells: [`<span class="small">${esc(s.text)}</span>`, s.language.toUpperCase(), Math.round(s.confidence * 100) + '%', tag(L.sig[s.verification_status], L.sigCls[s.verification_status]), s.verification_status === 'unverified' && can('screen_sos') ? `<button class="btn sm secondary" data-action="sig" data-id="${s.signal_id}" data-status="verified">ยืนยัน</button> <button class="btn sm secondary" data-action="sig" data-id="${s.signal_id}" data-status="rejected">ปฏิเสธ</button>` : ''] })))}
      </section>
      ${a ? `<section class="panel"><div class="row"><h3>${a.alert_id} · ${esc(a.audience)}</h3>${tag(L.alert[a.status], L.alertCls[a.status])}</div>
        <p class="small">ระดับ <span class="lvl" style="background:${lvlColor(a.level)}">${a.level}</span> · อ้างอิง ${a.incident_id} (${L.inc[m.status]}) · ช่องทาง ${a.channels.map(c => `<span class="list-pill">${esc(c)}</span>`).join('')}</p>
        ${langs.map(([l, n]) => { const tr = a.translations[l]; const ok = tr.message && tr.reviewed_by; return `<div class="quote"><div class="lang"><span>${n}${tr.title ? ' · ' + esc(tr.title) : ''}</span>${ok ? tag(`ตรวจแล้วโดย ${tr.reviewed_by}`, 'good') : (tr.message ? (can('draft_alert') || can('approve_alert') ? `<button class="btn sm secondary" data-action="review-tr" data-id="${a.alert_id}" data-lang="${l}">ยืนยันคำแปล ${l.toUpperCase()}</button>` : tag('รอตรวจ', 'warn')) : tag('ยังไม่มีข้อความ', 'crit'))}</div>${tr.message ? esc(tr.message) : (can('draft_alert') && !['published', 'approved'].includes(a.status) ? `<div class="form"><input id="tr-${l}-title" placeholder="หัวข้อ ${l.toUpperCase()}"><textarea id="tr-${l}-msg" rows="2" placeholder="ข้อความ ${l.toUpperCase()}"></textarea><button class="btn sm secondary" data-action="set-tr" data-id="${a.alert_id}" data-lang="${l}">บันทึก ${l.toUpperCase()}</button></div>` : '<span class="muted">—</span>')}</div>`; }).join('')}
        <div class="toolbar">${actions.join('')}${a.status === 'review' && can('approve_alert') ? `<input id="rej-note" placeholder="เหตุผลส่งกลับ (ถ้ามี)" style="flex:1;min-width:160px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">` : ''}</div>
        ${a.status === 'review' ? lockNote('approve_alert') : a.status === 'approved' ? lockNote('publish_alert') : ['draft', 'rejected'].includes(a.status) ? lockNote('draft_alert') : ''}
        <div class="rule"><span class="kicker">หน่วยงานผู้รับประกาศ (ต้องตอบรับ)</span><p>${(a.target_agencies || []).map(id => { const k = (a.acks || []).find(x => x.agency_id === id); return agencyPill(id, k ? ` ✓ ${hhmm(k.at)}` : a.status === 'published' ? ' · รอ' : ''); }).join('') || '—'}</p>${a.status === 'published' ? `<p class="small">ตอบรับแล้ว ${(a.acks || []).length}/${(a.target_agencies || []).length} หน่วยงาน · ส่งถึง ≠ ตอบรับ</p>` : ''}</div>
        ${a.deliveries.length ? `<div class="rule"><span class="kicker">การส่งตามช่องทาง (notification_delivery)</span>${table(['ช่องทาง', '#ส่ง', '#ถึงผู้รับ', '#ตอบรับ', '#ล้มเหลว', '#ครั้งที่ส่ง'], a.deliveries.map(d => ({ cells: [esc(d.channel), d.sent, d.delivered, d.acknowledged, d.failed, d.attempt_count] })))}<p class="small">ส่งสำเร็จ (delivered) ≠ ผู้ใช้ตอบรับ (acknowledged) · ล้มเหลวจะ retry ตาม next_attempt_at</p></div>` : ''}
        ${a.status === 'published' ? '<div class="message">บันทึกการเผยแพร่ในเดโม · เขียน Outbox แล้ว · ไม่มีการส่งข้อความออกนอกหน้าจอ</div>' : ''}
        ${timeline(a.history)}
      </section>` : '<section class="panel"><p class="small">ยังไม่มีประกาศ</p></section>'}
    </div>`;
  }

  async function screenMyTasks() {
    const [tasks, vols] = await Promise.all([API.getTasks(), API.getVolunteers()]);
    const me = vols.find(v => v.volunteer_id === S.persona) || vols[0];
    const mine = tasks.filter(t => (t.assignments || []).some(a => a.volunteer_id === me.volunteer_id));
    const offered = mine.filter(t => t.status === 'offered' && t.assignments.find(a => a.status === 'offered' && a.volunteer_id === me.volunteer_id));
    const active = mine.filter(t => ['accepted', 'en_route', 'on_scene'].includes(t.status) && t.assignments.find(a => a.status === 'accepted' && a.volunteer_id === me.volunteer_id));
    const history = mine.filter(t => !offered.includes(t) && !active.includes(t));
    const now = new Date(await API.now());
    const nextStatus = { accepted: 'en_route', en_route: 'on_scene', on_scene: 'completed' };
    const need = (t) => `<p class="small">ต้องการ: ${t.required_skills.map(skillName).join(', ') || '—'} · พื้นที่ ${esc(areaName(t.area_id))} · SLA ${hhmm(t.due_at)} · หน่วยงาน ${esc(agencyName(t.assigned_agency_id))}</p>`;
    return `<section class="panel"><div class="row"><h3>${esc(me.display_name)} · ${agencyPill(me.agency_id)}</h3>${tag(L.verif[me.verification_status], L.verifCls[me.verification_status])} ${tag(L.vol[me.availability], L.volCls[me.availability])}</div>
      <p class="small">ทักษะ: ${me.skills.map(s => `<span class="list-pill" style="${s.valid ? '' : 'background:var(--crit-bg)'}">${esc(s.name)}${s.valid_until ? ` (ถึง ${s.valid_until}${s.valid ? '' : ' · หมดอายุ'})` : ''}</span>`).join('')} · งานที่กำลังทำ ${me.active_tasks}/${me.max_active_tasks} · ตำแหน่งล่าสุด ${hhmm(me.location_updated_at)}</p>
      <p class="small">เห็นเฉพาะภารกิจของตนและข้อมูลช่วยเหลือที่จำเป็น · ไม่เห็นข้อมูลติดต่อผู้ขอความช่วยเหลือจนกว่าจะตอบรับ</p></section>
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>ข้อเสนอภารกิจ</h3>${tag(offered.length + ' รายการ', offered.length ? 'warn' : '')}</div>
        ${offered.map(t => { const a = t.assignments.find(x => x.status === 'offered'); const left = Math.max(0, Math.round((new Date(a.expires_at) - now) / 60000)); return `<div class="rule"><div class="row"><strong>${esc(t.title)}</strong>${scorePill(t.priority)}</div>${need(t)}<p class="small">เสนอเมื่อ ${hhmm(a.offered_at)} · เหลือเวลาตอบรับ <span class="countdown">${left} นาที</span> (หมดเวลาจะคืนงานเข้าคิวอัตโนมัติ)</p>
          <div class="toolbar"><button class="btn" data-action="respond" data-id="${t.task_id}" data-resp="accept">รับงาน</button><button class="btn secondary" data-action="respond" data-id="${t.task_id}" data-resp="decline">ปฏิเสธ</button></div></div>`; }).join('') || '<p class="small">ไม่มีข้อเสนอรอตอบรับ</p>'}
      </section>
      <section class="panel"><div class="row"><h3>งานที่กำลังทำ</h3>${tag(active.length + ' รายการ', active.length ? 'info' : '')}</div>
        ${active.map(t => `<div class="rule"><div class="row"><strong>${esc(t.title)}</strong>${tag(L.taskShort[t.status], L.taskCls[t.status])}</div>${need(t)}<p class="small">SOS ${t.sos_id} · ผู้ต้องการช่วยเหลือ: ดูในรายละเอียด · version ${t.version}</p>
          <div class="toolbar">${nextStatus[t.status] ? `<button class="btn" data-action="task-status" data-id="${t.task_id}" data-status="${nextStatus[t.status]}" data-version="${t.version}">อัปเดต → ${L.taskShort[nextStatus[t.status]]}</button>` : ''}<button class="btn secondary" data-action="support" data-id="${t.task_id}">ขอกำลังสนับสนุน</button></div>
          ${t.support_requested ? `<div class="notice">ขอสนับสนุนแล้ว ${hhmm(t.support_requested.at)}: ${esc(t.support_requested.note)}</div>` : ''}${timeline(t.events.slice(-4))}</div>`).join('') || '<p class="small">ไม่มีงานที่กำลังทำ</p>'}
      </section>
    </div>
    <section class="panel"><h3>ประวัติ</h3>${table(['ภารกิจ', 'ผลการตอบ', 'สถานะงาน', 'เวลา'], history.map(t => { const a = [...t.assignments].reverse().find(x => x.volunteer_id === me.volunteer_id); return { cells: [esc(t.title), a ? ({ accepted: 'รับงาน', declined: 'ปฏิเสธ', expired: 'หมดเวลา', released: 'ปล่อยงาน' }[a.status] || a.status) : '—', tag(L.taskShort[t.status], L.taskCls[t.status]), hhmm(a ? (a.responded_at || a.offered_at) : t.created_at)] }; }), { empty: 'ยังไม่มีประวัติ' })}</section>`;
  }

  async function screenSOS() {
    const area = S.sosArea || 'A1';
    const alerts = await API.getPublicAlerts(area);
    const tracks = []; for (const no of S.tracking) { const r = await API.trackSOS(no); if (!r.ok === false || r.tracking_no) tracks.push(r); }
    const stages = ['รับคำขอแล้ว', 'เจ้าหน้าที่คัดกรอง', 'มีผู้รับงาน', 'กำลังเดินทาง', 'ถึงจุดเกิดเหตุ', 'เสร็จสิ้น'];
    return `<div class="grid cols-2">
      <section class="panel"><h3>ขอความช่วยเหลือ (SOS)</h3><p class="small">POST /v1/sos · ระบบบันทึกคำขอและ Outbox ก่อนคืนเลขติดตาม · ส่งซ้ำด้วย Idempotency Key เดิมได้เลขเดิม · จำกัด 3 ครั้ง/นาที · ไม่ต้องมีบัญชี (แจ้งแทนผ่านเจ้าหน้าที่ได้)</p>
        <div class="form">
          <div class="grid cols-2"><label>ประเภทปัญหา<select id="sos-type">${Object.entries(L.reqType).map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}</select></label>
          <label>พื้นที่ (จากตำแหน่ง)<select id="sos-area">${ST.areas.filter(a => a.level !== 'province').map(a => `<option value="${a.area_id}" ${a.area_id === area ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div>
          <div class="grid cols-3"><label>ความแม่นยำตำแหน่ง (ม.)<input id="sos-acc" type="number" value="25"></label><label>จำนวนผู้ต้องการช่วยเหลือ<input id="sos-people" type="number" value="1" min="0"></label><label>ความเร่งด่วน (1–5)<select id="sos-urg">${[1, 2, 3, 4, 5].map(u => `<option ${u === 3 ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div>
          <label>รายละเอียด (หลีกเลี่ยงข้อมูลอ่อนไหวเกินจำเป็น)<textarea id="sos-detail" rows="3" placeholder="เช่น ติดอยู่ชั้น 1 โรงแรม น้ำสูงถึงเอว มีเด็ก 1 คน"></textarea></label>
          <label>ช่องทางติดต่อ (เข้ารหัสฝั่งแอป · แสดงแบบปิดบัง)<input id="sos-contact" placeholder="0812345678"></label>
          <div class="pill-row">${Object.entries(L.vuln).map(([c, n]) => `<label class="check"><input type="checkbox" class="sos-vuln" value="${c}">${n}</label>`).join('')}</div>
          <div class="toolbar"><button class="btn" data-action="sos-submit">ส่งคำขอ</button><button class="btn secondary" data-action="sos-resend">ส่งซ้ำ (Key เดิม)</button><span class="small">Idempotency Key: <span class="mono" id="sos-key">${S.sosKey || '—'}</span></span></div>
        </div></section>
      <section class="panel"><h3>ติดตามคำขอของฉัน</h3>
        ${tracks.map(r => `<div class="rule"><div class="row"><strong>${r.tracking_no}</strong>${tag(r.stage >= 6 ? 'เสร็จสิ้น' : stages[r.stage - 1] || 'รับคำขอแล้ว', r.stage >= 6 ? 'good' : 'info')}</div>
          <div class="progress">${stages.map((s, i) => `<div class="p ${i + 1 < r.stage ? 'done' : i + 1 === r.stage ? 'cur' : ''}">${s}</div>`).join('')}</div>
          <div class="timeline">${r.events.map(e => `<p><b>${hhmm(e.ts)}</b>${esc(e.text)}</p>`).join('')}</div>${r.eta_note ? `<p class="small">${r.eta_note}</p>` : ''}</div>`).join('') || '<p class="small">ยังไม่มีคำขอ · ส่งคำขอแล้วเลขติดตามจะแสดงที่นี่ (ลองใช้เลข TRK-2569-1001 ได้)</p>'}
        <div class="toolbar"><input id="track-no" placeholder="ใส่เลขติดตาม เช่น TRK-2569-1001" style="flex:1;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"><button class="btn secondary" data-action="track-add">ติดตาม</button></div>
        <p class="small">ผู้แจ้งเห็นเฉพาะคำขอของตน · ไม่แสดงชื่อ/ตำแหน่งของอาสาสมัคร</p></section>
    </div>
    <section class="panel"><div class="row"><h3>ประกาศสาธารณะ · ${esc(areaName(area))}</h3><span class="small">แสดงเฉพาะประกาศที่อนุมัติและเผยแพร่แล้ว</span></div>
      ${alerts.map(a => `<div class="rule"><div class="row"><strong><span class="lvl" style="background:${lvlColor(a.level)}">${a.level}</span> ${esc(a.translations.th.title)}</strong><span class="small">${dateTH(a.published_at)}</span></div><p>${esc(a.translations.th.message)}</p><p class="small" style="margin-top:4px">EN: ${esc(a.translations.en.message)}</p><p class="small">ZH: ${esc(a.translations.zh.message)}</p></div>`).join('') || '<p class="small">ไม่มีประกาศที่เผยแพร่ในพื้นที่นี้</p>'}</section>`;
  }

  async function screenAnalytics() {
    const [m, k, byArea, defs, incs, hm] = await Promise.all([API.getMajorIncident(S.scenario), API.getKPIs(S.scenario, S.filterArea || null), API.getKPIByArea(S.scenario), API.getKPIDefs(), API.getIncidents(S.scenario), API.getHeatmap(S.scenario)]);
    const hours = [10, 11, 12, 13, 14];
    const cum = hours.map((h, i) => incs.filter(x => x.status !== 'reported' && new Date(x.occurred_at).getHours() <= h).length);
    const barHtml = Charts.bar(hours.map((h, i) => ({ label: `${h}:00`, value: cum[i], hl: i === 4 })), { height: 170, ariaLabel: 'เหตุที่ยืนยันสะสม' });
    const colors = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
    const labels = ['11:00', '12:00', '13:00', '14:00'];
    const series = ST.areas.filter(a => a.level !== 'province').map((a, i) => ({ name: a.name, color: colors[i], values: labels.map((_, ti) => { const rows = hm.windows.filter(w => new Date(w.window_start).getHours() === 11 + ti && (hm.cells.find(c => c.cell_id === w.cell_id) || {}).area_id === a.area_id); if (rows.some(r => r.estimated_count == null)) return null; return rows.reduce((s, r) => s + r.estimated_count, 0); }) }));
    const lineHtml = Charts.lines(series, labels, { height: 200, ariaLabel: 'จำนวนคนรวมรายพื้นที่' });
    return `${banner(m)}
    <div class="filters"><label class="small">พื้นที่ <select id="f-area"><option value="">ทุกพื้นที่</option>${ST.areas.filter(a => a.level !== 'province').map(a => `<option value="${a.area_id}" ${S.filterArea === a.area_id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      <label class="small">ภัย <select disabled><option>${esc(hazardName(m.hazard_code))}</option></select></label><label class="small">ช่วงเวลา <select disabled><option>วันนี้ 10:00–14:00</option></select></label>
      <span class="small">กรองได้ตามสิทธิ์ Area Scope · Snapshot ${dateTH(k.snapshot_at)}</span>
      <button class="btn sm secondary" data-action="export" ${can('export') ? '' : 'disabled'}>ส่งออกรายงาน (FR16)</button></div>
    <div class="metrics">
      ${metric('เหตุที่ยืนยันแล้ว', k.incidents_confirmed, `KPI INC_CONFIRMED v${k.kpi_versions.INC_CONFIRMED}`, '', 'เหตุ')}
      ${metric('SOS ใหม่ / ค้าง', `${k.sos_new} / ${k.sos_open}`, `SOS_OPEN v${k.kpi_versions.SOS_OPEN}`, '')}
      ${metric('ตอบสนอง P50 / P95', k.resp_start_p50 == null ? null : `${k.resp_start_p50} / ${k.resp_start_p95}`, `นาที · RESP_START v${k.kpi_versions.RESP_START_P50} · n=${k.resp_n}`, '')}
      ${metric('อัตราตอบรับงาน', k.accept_rate, `จากข้อเสนอ ${k.offers_n} ครั้ง · ACCEPT_RATE v${k.kpi_versions.ACCEPT_RATE}`, '', '%')}
      ${metric('งานเสร็จตาม SLA', k.sla_rate, `TASK_SLA_RATE v${k.kpi_versions.TASK_SLA_RATE} · n=${k.sla_n}`, '', '%')}
      ${metric('ความหนาแน่นสูงสุดในพื้นที่เสี่ยง', k.density_risk_max, 'คน/ตร.กม. · DENSITY_RISK v1 · ค่าประมาณ', '', '')}
    </div>
    <div class="grid cols-2">
      <section class="panel"><div class="row"><h3>เหตุที่ยืนยันสะสมตามเวลา</h3><span class="small">หน่วย: เหตุ</span></div>${barHtml}</section>
      <section class="panel"><div class="row"><h3>จำนวนคนรวมรายพื้นที่ (Occupancy)</h3><button class="btn sm secondary" data-action="bi-table">${S.biTable ? 'ดูกราฟ' : 'ดูตาราง'}</button></div>${S.biTable ? table(['พื้นที่', ...labels.map(l => '#' + l)], series.map(s => ({ cells: [esc(s.name), ...s.values.map(v => v == null ? '<span class="muted">ไม่มีข้อมูล</span>' : v)] }))) : lineHtml}<p class="small" style="margin-top:6px">ช่วงที่ cell ใดไม่มีข้อมูลจะไม่รวมยอดพื้นที่ (แสดงเป็นไม่มีข้อมูล ไม่ใช่ศูนย์)</p></section>
    </div>
    <section class="panel"><h3>เปรียบเทียบรายพื้นที่ (Drill down)</h3>${table(['พื้นที่', '#เหตุยืนยัน', '#SOS ค้าง', '#รอมอบหมาย', '#P50 นาที', '#อาสาพร้อม', '#ข้อมูลตรงเวลา %'], byArea.map(r => ({ attrs: ` class="clickable" data-filter-area="${r.area.area_id}"`, cells: [`<strong>${esc(r.area.name)}</strong>`, r.kpi.incidents_confirmed, r.kpi.sos_open, r.kpi.tasks_pending, r.kpi.resp_start_p50 ?? '—', r.kpi.volunteers_ready, r.kpi.data_on_time ?? '—'] })))}<p class="small" style="margin-top:6px">คลิกแถวเพื่อกรอง · ค่าคนละช่วงเวลาหรือคนละเวอร์ชันสูตรต้องไม่เปรียบเทียบกันโดยไม่แจ้ง</p></section>
    <section class="panel"><h3>นิยาม KPI (analytics.kpi_definition)</h3>${table(['รหัส', 'ชื่อ', 'หน่วย', 'เวอร์ชัน', 'สูตร', 'Grain', 'ข้อจำกัดการตีความ', 'Owner'], defs.map(d => ({ cells: [`<span class="mono">${d.kpi_code}</span>`, esc(d.name), esc(d.unit), `v${d.version}`, `<span class="small mono">${esc(d.formula)}</span>`, esc(d.grain), `<span class="small">${esc(d.limitation)}</span>`, esc(agencyName(d.owner_agency_id))] })))}</section>`;
  }

  async function screenRisk() {
    const r = await API.getRisk();
    const areas = ST.areas.filter(a => a.level !== 'province');
    const sel = areas.find(a => a.area_id === S.riskArea) || areas[0];
    const maxOf = aid => r.assessments.filter(x => x.area_id === aid).sort((a, b) => b.risk_score - a.risk_score)[0];
    const map = Charts.statusMap(areas.map(a => { const m = maxOf(a.area_id); return { id: a.area_id, name: a.name, x: a.x, y: a.y, r: 3.5 + m.risk_score / 25, color: Charts.seqColor(m.risk_score, 100), ink: Charts.seqInk(m.risk_score, 100), label: String(m.risk_score), sel: a.area_id === sel.area_id }; }), 'แผนที่เชิงสัญลักษณ์ · คะแนนสูงสุดรายพื้นที่ · ไม่ใช่พิกัดจริง');
    const rows = r.assessments.filter(x => x.area_id === sel.area_id).sort((a, b) => b.risk_score - a.risk_score);
    const zones = r.zones.filter(z => z.area_id === sel.area_id);
    const monthly = Charts.bar(r.monthly.map((m, i) => ({ label: m.month.slice(2).replace('-', '/'), value: m.count, hl: i === r.monthly.length - 1 })), { height: 160, ariaLabel: 'เหตุย้อนหลังรายเดือน' });
    return `<div class="grid cols-2">
      <section class="panel"><div class="row"><h3>Pilot Tourism Risk Map · ภูเก็ต</h3>${tag('risk_assessment · rule-v1.2', 'info')}</div><div class="map-wrap">${map}</div>
        <div class="legend"><span>0</span>${[10, 30, 50, 70, 90].map(v => `<i class="swatch" style="background:${Charts.seqColor(v, 100)}"></i>`).join('')}<span>100</span><span class="muted">· คลิกพื้นที่</span></div>
        <div class="rule" style="margin-top:8px"><span class="kicker">ชั้นพื้นที่เสี่ยง (risk_zone) ของ ${esc(sel.name)}</span>${zones.map(z => `<p class="small"><strong>${esc(hazardName(z.hazard_code))}</strong> ระดับ ${z.level} · ใช้ตั้งแต่ ${dateTH(z.valid_from)} · หลักฐาน: ${esc(z.evidence_reference)}</p>`).join('') || '<p class="small">ไม่มีชั้นพื้นที่เสี่ยงที่ประกาศ</p>'}</div></section>
      <section class="panel"><h3>${esc(sel.name)} · คะแนนความเสี่ยงรายภัย</h3>
        ${table(['ภัย', '#คะแนน', '#ความน่าจะเป็น', '#ผลกระทบ', '#ความเชื่อมั่น', 'วิธี / เวอร์ชัน', 'ประเมินเมื่อ'], rows.map(x => ({ cells: [esc(hazardName(x.hazard_code)), `<span class="score ${scoreCls(x.risk_score)}">${x.risk_score}</span>`, x.probability, x.impact + '/5', Math.round(x.confidence * 100) + '%', `${x.method}${x.model_id ? ' · ' + x.model_id : ' · ไม่มี model_id (กฎ)'}`, hhmm(x.assessed_at)] })))}
        <div class="rule" style="margin-top:8px"><span class="kicker">คำอธิบาย (explanation) · ${esc(hazardName(rows[0].hazard_code))}</span><p class="small">ปัจจัย: ${rows[0].explanation.inputs.join(' · ')}<br>น้ำหนัก: ${rows[0].explanation.weights}<br>${rows[0].explanation.note} · ระยะพยากรณ์ ${rows[0].horizon_days} วัน</p></div>
        <p class="small">FR07: แสดงที่มา เวลา วิธีประเมิน เวอร์ชัน และความเชื่อมั่นทุกคะแนน · การพยากรณ์ 1/4/8/12 เดือนต้องประเมินความพร้อมข้อมูลก่อน ไม่ถือว่าแม่นยำเพราะสร้างหน้าจอได้</p></section>
    </div>
    <section class="panel"><h3>ทะเบียนความเสี่ยงทุกพื้นที่ (คะแนน 0–100)</h3>${table(['พื้นที่', ...ST.hazard_types.map(h => '#' + h.name.split(' /')[0]), 'สูงสุด'], areas.map(a => ({ attrs: ` class="clickable ${a.area_id === sel.area_id ? 'selected' : ''}" data-risk="${a.area_id}"`, cells: [`<strong>${esc(a.name)}</strong>`, ...ST.hazard_types.map(h => { const x = r.assessments.find(y => y.area_id === a.area_id && y.hazard_code === h.hazard_code); return `<span class="score" style="background:${Charts.seqColor(x.risk_score, 100)};color:${Charts.seqInk(x.risk_score, 100)}">${x.risk_score}</span>`; }), esc(hazardName(maxOf(a.area_id).hazard_code))] })))}</section>
    <section class="panel"><div class="row"><h3>เหตุย้อนหลังรายเดือน (ทุกพื้นที่)</h3><span class="small">หน่วย: เหตุ · ค่าจำลอง</span></div>${monthly}</section>`;
  }

  async function screenHeatmap() {
    const [m, hm] = await Promise.all([API.getMajorIncident(S.scenario), API.getHeatmap(S.scenario, { publicView: S.publicView })]);
    const hours = [11, 12, 13, 14];
    const get = (cid, h) => hm.windows.find(w => w.cell_id === cid && new Date(w.window_start).getHours() === h);
    const max = Math.max(...hm.windows.map(w => w.estimated_count || 0));
    const selC = S.cell ? get(S.cell[0], S.cell[1]) : get(m.area_id === 'A1' ? 'C-PTG-1' : m.area_id === 'A4' ? 'C-CHL-1' : 'C-OLD-1', 14);
    const cell = hm.cells.find(c => c.cell_id === (selC ? selC.cell_id : 'C-PTG-1'));
    const rows = hm.cells.map(c => `<span><strong>${esc(c.name)}</strong><br><span class="small">${(c.area_m2 / 1e6).toFixed(2)} ตร.กม. · ${c.grid_version}</span></span>` + hours.map(h => { const w = get(c.cell_id, h); const sel = selC && selC.cell_id === c.cell_id && new Date(selC.window_start).getHours() === h; if (!w || w.estimated_count == null) return `<button class="cell missing" data-cell="${c.cell_id}:${h}" aria-pressed="${sel}">${w && w.suppressed_public ? 'ปิดบัง (<10)' : 'No data'}</button>`; return `<button class="cell" data-cell="${c.cell_id}:${h}" aria-pressed="${sel}" style="background:${Charts.seqColor(w.estimated_count, max)};color:${Charts.seqInk(w.estimated_count, max)}">${w.estimated_count}<br><span style="font-size:10px;font-weight:400">${w.density_per_km2}/กม²</span></button>`; }).join('')).join('');
    return `<div class="heading"><div><span class="small">จำนวนโดยประมาณต่อ cell (Occupancy · กลุ่ม All) · ไม่ใช่จำนวนนักท่องเที่ยวไม่ซ้ำ และไม่ใช่จำนวนผู้ประสบภัย</span></div><div class="toggle-row"><label class="check"><input type="checkbox" id="pub-view" ${S.publicView ? 'checked' : ''}> มุมมองสาธารณะ (ปิดบังค่า < 10)</label>${tag('fusion-v1 · window 3600 s', 'info')}</div></div>
    <section class="panel"><div class="row"><h3>Heatmap ความหนาแน่นตาม cell และช่วงเวลา</h3><span class="small">สี = จำนวนโดยประมาณ · ตัวเลขเล็ก = คน/ตร.กม. จากพื้นที่ที่สังเกตได้จริง</span></div>
      <div class="matrix cells"><span class="hdr" style="text-align:left">cell / window</span>${hours.map(h => `<span class="hdr">${h}:00–${h + 1}:00</span>`).join('')}${rows}</div>
      <div class="legend"><span>น้อย</span>${['--seq-100', '--seq-300', '--seq-500', '--seq-700'].map(v => `<i class="swatch" style="background:var(${v})"></i>`).join('')}<span>มาก</span><span><i class="swatch" style="background:repeating-linear-gradient(45deg,var(--surface-2) 0 3px,var(--line) 3px 5px)"></i>No data (ไม่แสดงสีปลอดภัย)</span></div></section>
    <div class="grid cols-2">
      <section class="panel"><h3>${selC ? esc(cell.name) + ' · ' + hhmm(selC.window_start) : 'เลือก cell'}</h3>
        ${selC ? `<div class="metric-value num">${selC.estimated_count == null ? '<span class="muted" style="font-size:18px">No data</span>' : selC.estimated_count + ' <small>คนโดยประมาณ</small>'}</div>
        <dl class="kv"><dt>count_method</dt><dd>${selC.count_method} (คนในพื้นที่ ณ เวลาหนึ่ง)</dd><dt>population_group</dt><dd>${selC.population_group} · กลุ่ม Tourist/Affected ยังไม่มีวิธีจำแนกที่ผ่านการประเมิน</dd><dt>coverage_fraction</dt><dd>${selC.coverage_fraction ?? '—'} ของพื้นที่ cell</dd><dt>ความหนาแน่น</dt><dd>${selC.density_per_km2 ?? '—'} คน/ตร.กม. = count ÷ (area_m2 × coverage)</dd><dt>confidence</dt><dd>${selC.confidence ?? '—'}</dd><dt>source_count</dt><dd>${selC.source_count} แหล่ง (ไม่รวมหลายแหล่งโดยตรง · fusion เลือกแหล่งหลัก)</dd><dt>is_suppressed</dt><dd>${selC.is_suppressed ? 'ใช่ (ค่า < 10)' : 'ไม่'}</dd><dt>updated_at</dt><dd>${hhmm(selC.updated_at)}</dd></dl>` : ''}
        ${hm.flow.filter(f => selC && f.cell_id === selC.cell_id).map(f => `<div class="notice"><strong>Flow count (คนละตัวชี้วัด):</strong> ${f.count_value} คนผ่านจุด/ชม. ณ ${hhmm(f.window_start)} — ${esc(f.note)}</div>`).join('')}</section>
      <section class="panel"><h3>ข้อกำหนด FR15 ที่หน้าจอนี้แสดง</h3><p class="small">หน่วยนับ · วิธีนับ (Flow vs Occupancy) · เวลา (window) · ความครอบคลุม · พื้นที่ไม่มีข้อมูล · Fusion Version · Confidence<br>ความหนาแน่นใช้พื้นที่ที่สังเกตได้จริง ไม่ใช้ทั้ง cell เมื่อกล้องครอบคลุมบางส่วน<br>การเผยแพร่สาธารณะใช้พื้นที่รวมและกฎปิดบังค่าน้อย ต้องอนุมัติร่วมกับผู้กำกับดูแลข้อมูล<br>ไม่มีการติดตามรายบุคคลในแบบฐานข้อมูลเริ่มต้น</p>
        <div class="rule"><span class="kicker">ข้อเสนอสำหรับศูนย์สั่งการ</span><p>${esc(m.decision)}</p></div><div class="toolbar"><button class="btn secondary" data-go="command">ดูภารกิจใน Command Center</button></div></section>
    </div>`;
  }

  async function screenData() {
    const [srcs, batches, issues, signals] = await Promise.all([API.getDataSources(), API.getBatches(), API.getQualityIssues(), API.getSignals()]);
    const open = issues.filter(q => !q.resolved_at);
    const b = batches[0];
    return `<div class="metrics">
      ${metric('แหล่งข้อมูลเปิดใช้', srcs.filter(s => s.enabled).length, `ทั้งหมด ${srcs.length} · รอข้อตกลง ${srcs.filter(s => !s.enabled).length}`, '')}
      ${metric('แหล่งล่าช้า (Stale)', srcs.filter(s => s.stale).length, 'เกิน 2 × รอบอัปเดต · ติดป้ายบน Dashboard', srcs.filter(s => s.stale).length ? 'warn' : 'good')}
      ${metric('ชุดล่าสุดรับเข้า', b.accepted_rows.toLocaleString(), `${b.batch_id} · ปฏิเสธ ${b.rejected_rows} แถว`, '', 'แถว')}
      ${metric('ปัญหาคุณภาพเปิดอยู่', open.length, `critical ${open.filter(q => q.severity === 'critical').length}`, open.some(q => q.severity === 'critical') ? 'crit' : open.length ? 'warn' : 'good', 'รายการ')}
    </div>
    <section class="panel"><div class="row"><h3>ทะเบียนแหล่งข้อมูลและข้อตกลง (FR02)</h3>${tag('อ้างอิงคำขอข้อมูล R01–R20', 'info')}</div>
      ${table(['แหล่ง', 'ประเภท', 'ข้อมูล', 'เจ้าของ', 'ระดับชั้น', 'รอบอัปเดต', 'รับล่าสุด', 'สถานะ', 'ข้อตกลง'], srcs.map(s => ({ cells: [`<strong>${esc(s.name)}</strong><br><span class="small">${s.source_id} · ${esc(s.request)}</span>`, s.source_type, esc(s.dataset), agencyPill(s.agency_id), tag(s.data_classification, L.srcCls[s.data_classification]), `${s.refresh_seconds >= 86400 ? Math.round(s.refresh_seconds / 86400) + ' วัน' : Math.round(s.refresh_seconds / 60) + ' นาที'}`, s.last_received_at ? `${dateTH(s.last_received_at)}` : '<span class="muted">ยังไม่ได้รับ</span>', !s.enabled ? tag('รอข้อตกลง', 'serious') : s.stale ? tag('Stale', 'warn') : tag('ตรงเวลา', 'good'), `<span class="small">${esc(s.agreement_reference)}</span>`] })))}
      <div class="toolbar"><select id="imp-src" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">${srcs.filter(s => s.enabled).map(s => `<option value="${s.source_id}">${esc(s.name)}</option>`).join('')}</select><input id="imp-key" placeholder="external_batch_key เช่น smartcity-20261013-1400" style="flex:1;min-width:220px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"><button class="btn sm" data-action="import" ${can('quality') || can('admin') ? '' : 'disabled'}>จำลองนำเข้า (POST /v1/imports)</button><button class="btn sm secondary" data-action="import-dup">ลองส่งชุดเดิมซ้ำ</button></div>
      <p class="small">ส่งชุดเดิมซ้ำต้องไม่เพิ่มข้อมูล (FR03) · Service identity + Schema version + Checksum · คืน HTTP 202 เมื่อเข้าคิวอย่างทนทาน</p></section>
    <div class="grid cols-2">
      <section class="panel"><h3>ชุดข้อมูลรับเข้า (import_batch)</h3>${table(['Batch', 'แหล่ง', 'observed', 'ingested', '#ผ่าน', '#ปฏิเสธ', 'Object key'], batches.map(x => ({ cells: [`<span class="mono">${x.batch_id}</span><br><span class="small mono">${x.external_batch_key}</span>`, x.source_id, hhmm(x.observed_at), hhmm(x.finished_at), x.accepted_rows.toLocaleString(), x.rejected_rows, `<span class="small mono">${esc(x.raw_object_key)}</span>`] })))}<p class="small" style="margin-top:6px">แสดง observed time และ ingestion time แยกกัน · ไฟล์ต้นฉบับอยู่ใน Object Storage เก็บเพียง key ใน PostgreSQL</p></section>
      <section class="panel"><h3>คิวแก้ไขคุณภาพข้อมูล (FR04)</h3>
        ${issues.map(q => `<div class="rule"><div class="row"><div><strong class="mono">${q.rule_code}</strong> · ${esc(q.message)}<br><span class="small">${q.batch_id} · ${esc((srcs.find(s => s.source_id === q.source_id) || {}).name || q.source_id)} · แนวทาง: ${esc(q.fix)}</span></div><div>${tag(q.rows + ' แถว', q.resolved_at ? 'good' : q.severity === 'critical' ? 'crit' : 'warn')} ${q.resolved_at ? tag('แก้แล้ว ' + hhmm(q.resolved_at), 'good') : `<button class="btn sm" data-action="resolve" data-id="${q.issue_id}" ${can('quality') ? '' : 'disabled'}>แก้ไขและตรวจซ้ำ</button>`}</div></div></div>`).join('')}
        ${lockNote('quality')}<p class="small">กฎตัวอย่าง: พิกัดนอกพื้นที่ · Timestamp อนาคต · Count ติดลบ · Source ล้าสมัย · ข้อมูลที่ผิดพิกัดหรือ Count Method ไม่ชัดไม่ถูกนำไปสร้าง Heatmap</p></section>
    </div>
    <section class="panel"><h3>เส้นทางข้อมูล (Lineage) และสัญญาณออนไลน์</h3>
      <div class="stepper" style="grid-template-columns:repeat(6,1fr)">${['Connector รับข้อมูล + Batch', 'เก็บไฟล์ต้นฉบับ (Object Storage)', 'ตรวจโครงสร้าง/เวลา/พิกัด/ซ้ำ', 'Quality Issue / Quarantine', 'โหลดเข้า PostgreSQL', 'Worker สร้าง KPI · Risk · Heatmap → Analytics/Cache'].map((s, i) => `<div class="step ${i < 5 ? 'done' : 'current'}"><div class="n">0${i + 1}</div>${s}</div>`).join('')}</div>
      ${table(['สัญญาณ', 'ภาษา', 'ประเด็น', '#sentiment', '#confidence', 'สถานะตรวจสอบ'], signals.map(s => ({ cells: [`<span class="small">${esc(s.text)}</span>`, s.language.toUpperCase(), esc(s.topic), s.sentiment, s.confidence, tag(L.sig[s.verification_status], L.sigCls[s.verification_status])] })))}
      <p class="small" style="margin-top:6px">social_signal เก็บ external_id กันซ้ำ · ไม่เก็บหลักฐานเกินที่อนุญาต · schema อ้างอิง <span class="mono">db/schema.sql</span></p></section>`;
  }

  async function screenAdmin() {
    const [users, defs, rules] = await Promise.all([API.getUsers(), API.getKPIDefs(), API.getAlertRules()]);
    const areas = ST.areas;
    return `<div class="grid cols-2">
      <section class="panel"><div class="row"><h3>ผู้ใช้ บทบาท หน่วยงาน และ Area Scope (FR01)</h3>${tag('Tenant: ' + SEED.tenant.tenant_id, 'info')}</div>
        ${table(['ผู้ใช้', 'บทบาท', 'หน่วยงาน', 'Area Scope', 'สถานะ', ''], users.map(u => ({ cells: [`<strong>${esc(u.display_name)}</strong><br><span class="small mono">${u.user_id} · ${u.auth_subject}</span>`, esc((ST.roles.find(r => r.role_code === u.role_code) || {}).name || u.role_code), esc(agencyName(u.agency_id)), u.tenant_id && u.tenant_id !== SEED.tenant.tenant_id ? tag('คนละ Tenant: ' + u.tenant_id, 'crit') : u.area_scope.map(a => `<span class="list-pill">${esc(areaName(a))}</span>`).join('') || '<span class="muted">—</span>', u.active ? tag('ใช้งาน', 'good') : tag('ปิดใช้งาน', ''), can('admin') ? `<button class="btn sm secondary" data-action="user-active" data-id="${u.user_id}" data-active="${u.active ? 0 : 1}">${u.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button>` : ''] })))}
        <div class="rule" style="margin-top:10px"><strong>ทดสอบการตรวจสิทธิ์ (API ตรวจก่อน Query และก่อน Export)</strong><div class="toolbar"><select id="acc-user" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">${users.map(u => `<option value="${u.user_id}">${esc(u.display_name)}</option>`).join('')}</select><select id="acc-area" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">${areas.filter(a => a.level !== 'province').map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select><select id="acc-action" style="padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"><option value="read">อ่าน</option><option value="export">Export</option></select><button class="btn sm" data-action="check-access">ตรวจสิทธิ์</button></div>${S.accessResult ? `<div class="${S.accessResult.allowed ? 'message' : 'alert'}">${esc(S.accessResult.reason)}</div>` : ''}<p class="small">RLS บังคับ Tenant Isolation ที่ฐานข้อมูล · สิทธิ์รายพื้นที่และภารกิจของอาสาสมัครตรวจที่ API · ผู้ดูแลระบบไม่ได้รับสิทธิ์ดูข้อมูลอ่อนไหวโดยอัตโนมัติ</p></div></section>
      <section class="panel"><h3>กฎแจ้งเตือน (alert rules)</h3>${table(['กฎ', 'เงื่อนไข', 'การกระทำ', 'สถานะ', ''], rules.map(r => ({ cells: [`<strong>${esc(r.name)}</strong><br><span class="small">${r.rule_id}</span>`, `<span class="mono small">${esc(r.condition)}</span>`, `<span class="small">${esc(r.action)}</span>`, r.enabled ? tag('เปิด', 'good') : tag('ปิด', ''), can('admin') ? `<button class="btn sm secondary" data-action="toggle-rule" data-id="${r.rule_id}">${r.enabled ? 'ปิด' : 'เปิด'}</button>` : ''] })))}
        <h3 style="margin-top:14px">บทบาทและขอบเขตข้อมูล</h3>${table(['บทบาท', 'หน้าที่หลัก', 'ขอบเขตข้อมูล'], ST.roles.map(r => ({ cells: [`<strong>${esc(r.name)}</strong>`, `<span class="small">${esc(r.duty)}</span>`, `<span class="small">${esc(r.scope)}</span>`] })))}</section>
    </div>
    <section class="panel"><h3>นิยาม KPI พร้อมสูตรและเวอร์ชัน (FR05)</h3>${table(['รหัส', 'ชื่อ', 'เวอร์ชัน', 'สูตร', 'Owner', ''], defs.map(d => ({ cells: [`<span class="mono">${d.kpi_code}</span>`, esc(d.name), `v${d.version}`, `<span class="small mono">${esc(d.formula)}</span>`, esc(agencyName(d.owner_agency_id)), can('admin') || can('kpi') ? `<button class="btn sm secondary" data-action="kpi-bump" data-id="${d.kpi_code}">ออกเวอร์ชันใหม่</button>` : ''] })))}<p class="small" style="margin-top:6px">ข้อมูลทดสอบอ้างอิงต้องคำนวณตรงกับสูตรที่อนุมัติ · kpi_value อ้างอิง kpi_version ทุกแถว</p></section>
    <section class="panel"><h3>สถาปัตยกรรมและสเปกเริ่มต้น (ระดับ A นำร่องภูเก็ต)</h3>
      <dl class="kv"><dt>รูปแบบ</dt><dd>Web Responsive + PWA (TH/EN/ZH) · API Modular Monolith · Worker แยก · Queue Priority สำหรับ SOS/ประกาศ</dd><dt>ผู้ใช้พร้อมกันเป้าหมาย</dt><dd>100–300 · API 10–30 RPS (Burst 150 RPS)</dd><dt>API / Worker</dt><dd>2–4 replica × 2 vCPU 4 GB · Worker 1–2</dd><dt>PostgreSQL Writer</dt><dd>4 vCPU 16 GB · SSD 200 GB · Standby HA เมื่อรับ SOS จริง · Read Replica เมื่อ BI แย่งทรัพยากร</dd><dt>Redis / Object Storage</dt><dd>2–4 GB · 500 GB</dd><dt>SLO</dt><dd>Availability 99.5% · SOS บันทึก P95 ≤ 2 s · Dashboard P95 ≤ 3 s · Heatmap ≤ 5 นาที · RPO ≤ 1 ชม. · RTO ≤ 4 ชม. · Backup รายวันเก็บ 14 วัน</dd></dl>
      <p class="small">สเปกเป็นกรอบสำหรับจัดเตรียมระบบและทดสอบโหลด ไม่ใช่ผลทดสอบที่ยืนยันแล้ว</p></section>`;
  }

  async function screenQA() {
    const r = S.tests;
    const tiers = [['A นำร่องภูเก็ต', '10,000', '100–300', '10–30 RPS / Burst 150'], ['B หลายหน่วยงาน', '100,000', '1,000–3,000', '100–300 RPS / Burst 1,500'], ['C หลายจังหวัด', '1,000,000', '10,000–30,000', '1,000–3,000 RPS / Burst 15,000']];
    return `<section class="panel"><div class="row"><h3>ชุดทดสอบความถูกต้อง (รันจริงกับ Mock API บนสำเนาข้อมูล)</h3><button class="btn" data-action="run-tests" ${can('test') ? '' : 'disabled'}>รันชุดทดสอบ</button></div>
      ${r ? `<p class="${r.pass === r.total ? 'pass' : 'failtxt'}">ผ่าน ${r.pass}/${r.total}</p>${table(['รหัส', 'กรณีทดสอบ', 'ผล', 'รายละเอียด'], r.results.map(x => ({ cells: [x.id, esc(x.name), x.pass ? tag('ผ่าน', 'good') : tag('ไม่ผ่าน', 'crit'), `<span class="small">${esc(x.detail)}</span>`] })))}` : '<p class="small">ยังไม่ได้รัน · ครอบคลุม: Batch ซ้ำ · SOS ซ้ำ (Idempotency) · Rate limit · Concurrent assignment · เพดานงาน · ใบรับรองหมดอายุ · State transition · Version ล้าสมัย · หมดเวลาตอบรับ · เงื่อนไขอนุมัติประกาศ · สิทธิ์ข้าม Tenant / Area Scope</p>'}
      ${lockNote('test')}</section>
    <div class="grid cols-2">
      <section class="panel"><h3>แผน Load test (ระดับ A และ B)</h3>${table(['ระดับ', 'บัญชีสมมติ', 'ผู้ใช้พร้อมกัน', 'API'], tiers.map(t => ({ cells: t.map(esc) })))}
        <p class="small" style="margin-top:8px">สัดส่วนตัวอย่าง: อ่าน Dashboard 65% · Map 20% · ติดตามงาน 10% · เขียน SOS 5%<br>เพิ่มผู้ใช้ทีละขั้น คงโหลด ≥ 60 นาที · Burst 5 เท่า 10 นาที · Soak 8 ชั่วโมง<br>เก็บ Cache Hit · DB CPU · IOPS · Connection · Queue Age · Error Rate · Latency P50/P95/P99</p></section>
      <section class="panel"><h3>เกณฑ์ผ่านและ SLO</h3>${table(['ตัวชี้วัด', 'เกณฑ์'], [['SOS บันทึกสำเร็จ P95', '≤ 2 วินาที'], ['Dashboard สรุป P95', '≤ 3 วินาที'], ['Error Rate', '< 1%'], ['SOS ที่ตอบรับแล้วสูญหาย', '0 รายการ'], ['ทดสอบ Failover', '1 API replica / 1 AZ ไม่พร้อม และงาน Heatmap ค้าง'], ['Restore Test', 'สุ่มตรวจ SOS Task Assignment KPI Spatial และสิทธิ์ · บันทึกเวลาเทียบ RPO/RTO'], ['Security Test', 'ข้าม Tenant/พื้นที่ · SQL Injection · Token หมดอายุ · Secret Leakage']].map(x => ({ cells: x.map(esc) })))}</section>
    </div>`;
  }

  async function screenAudit() {
    const [log, outbox] = await Promise.all([API.getAudit(), API.getOutbox()]);
    return `<section class="panel"><div class="row"><h3>audit.audit_log (append-only · partition รายเดือน)</h3><button class="btn sm danger" data-action="reset">รีเซ็ตข้อมูลจำลองทั้งหมด</button></div>
      ${table(['เวลา', 'ผู้กระทำ', 'การกระทำ', 'รายการ', 'request_id', 'สรุปการเปลี่ยนแปลง'], log.map(l => ({ cells: [dateTH(l.occurred_at), esc(l.actor_id), `<span class="mono small">${esc(l.action)}</span>`, `<span class="small">${esc(l.entity_type)} · ${esc(l.entity_id)}</span>`, `<span class="mono small">${esc(l.request_id)}</span>`, `<span class="small mono">${esc(JSON.stringify(l.change_summary))}</span>`] })), { empty: 'ยังไม่มีกิจกรรม' })}
      <p class="small" style="margin-top:8px">Runtime เพิ่มข้อมูลได้เท่านั้น ไม่แก้หรือลบ · change_summary ไม่เก็บข้อมูลส่วนบุคคลเต็ม · เสนอเก็บ 1 ปี</p></section>
    <section class="panel"><h3>ops.outbox_event (รอ Worker เผยแพร่)</h3>${table(['เวลา', 'event_type', 'aggregate_id', 'payload', 'published'], outbox.map(o => ({ cells: [dateTH(o.created_at), `<span class="mono small">${o.event_type}</span>`, o.aggregate_id, `<span class="mono small">${esc(JSON.stringify(o.payload))}</span>`, o.published_at ? hhmm(o.published_at) : tag('รอส่ง', 'warn')] })), { empty: 'ยังไม่มีเหตุการณ์ใน Outbox (ส่ง SOS หรือเผยแพร่ประกาศเพื่อดู)' })}</section>`;
  }


  async function screenAgencies() {
    const { agencies, functions, rounds } = await API.getAgencies();
    const core = agencies.filter(a => a.tier === 'core');
    let list = agencies.filter(a => (S.agTier === 'all' ? true : a.tier === S.agTier) && (!S.agFunc || a.func === S.agFunc) && (!S.agRound || String(a.round) === S.agRound));
    const sel = agencies.find(a => a.agency_id === S.agencySel) || core[0];
    const cnt = st => core.filter(a => a.coord_status === st).length;
    const order = ['planned', 'invited', 'met', 'sample', 'agreement'];
    const srcLive = core.reduce((n, a) => n + a.sources.filter(x => x.enabled).length, 0), srcAll = core.reduce((n, a) => n + a.sources.length, 0);
    const fn = Object.keys(functions).filter(k => agencies.some(a => a.func === k));
    const funcCounts = fn.map(k => ({ k, n: core.filter(a => a.func === k).length })).filter(x => x.n);
    const coordBar = order.map(st => `<div class="bar-row"><span>${tag(COORD[st][0], COORD[st][1])}</span><div class="track"><div class="fill" style="width:${cnt(st) / core.length * 100}%"></div></div><span class="num">${cnt(st)}</span></div>`).join('');
    return `<div class="metrics">
      ${metric('หน่วยงานหลัก', core.length, 'ตามข้อ 2 ของแผน · สนจ.ภูเก็ตเป็นหน่วยประสานหลัก', '', 'หน่วย')}
      ${metric('หน่วยงานสนับสนุน', agencies.filter(a => a.tier === 'support').length, `+ เพิ่มตามความเสี่ยง ${agencies.filter(a => a.tier === 'conditional').length} กลุ่ม`, '', 'หน่วย')}
      ${metric('ประชุมแล้วขึ้นไป', cnt('met') + cnt('sample') + cnt('agreement'), `ได้ข้อมูลตัวอย่าง ${cnt('sample')} · ตกลงเชื่อม ${cnt('agreement')} (ค่าจำลอง)`, '', 'หน่วย')}
      ${metric('แหล่งข้อมูลเชื่อมแล้ว', `${srcLive} / ${srcAll}`, 'ของหน่วยงานหลัก · ที่เหลือรอนัดกลุ่ม', srcLive < srcAll ? 'warn' : 'good')}
      ${metric('หน่วยงานรับภารกิจได้', agencies.filter(a => a.tasks_total || a.volunteers).length, 'มีภารกิจหรืออาสาสมัครสังกัดในระบบ', '', 'หน่วย')}
    </div>
    <div class="grid cols-2">
      <section class="panel"><h3>สถานะการประสาน 20 หน่วยงานหลัก</h3>${coordBar}<p class="small" style="margin-top:6px">ลำดับ: วางแผนนัด → ส่งหนังสือเชิญ → ประชุมแล้ว → ได้ข้อมูลตัวอย่าง → ตกลงเชื่อมข้อมูล · สถานะเป็นค่าจำลองเพื่อสาธิต ไม่ใช่ผลนัดจริง</p></section>
      <section class="panel"><h3>กำหนดการนัด 4 ช่วง (ข้อ 5)</h3>${rounds.map(r => `<div class="rule"><div class="row"><strong>ช่วง ${r.round} · ${esc(r.week)}</strong>${r.round === 4 ? tag('ทุกหน่วย + เพิ่มตามความเสี่ยง', 'info') : `<button class="btn sm secondary" data-ag-round="${r.round}">${agencies.filter(a => ['core', 'support'].includes(a.tier) && a.round === r.round).length} หน่วย</button>`}</div><p class="small">${esc(r.title)}<br>ผลที่ต้องได้: ${esc(r.output)}</p></div>`).join('')}</section>
    </div>
    <section class="panel"><div class="row"><h3>ทะเบียนหน่วยงาน</h3><span class="small">คลิกแถวเพื่อดูรายละเอียด</span></div>
      <div class="filters">
        <label class="small">กลุ่ม <select id="ag-tier"><option value="core" ${S.agTier === 'core' ? 'selected' : ''}>หน่วยงานหลัก (1–20)</option><option value="support" ${S.agTier === 'support' ? 'selected' : ''}>หน่วยงานสนับสนุน (21–32)</option><option value="conditional" ${S.agTier === 'conditional' ? 'selected' : ''}>เพิ่มตามความเสี่ยง</option><option value="all" ${S.agTier === 'all' ? 'selected' : ''}>ทั้งหมด</option></select></label>
        <label class="small">ด้าน <select id="ag-func"><option value="">ทุกด้าน</option>${fn.map(k => `<option value="${k}" ${S.agFunc === k ? 'selected' : ''}>${esc(functions[k])}</option>`).join('')}</select></label>
        <label class="small">ช่วงนัด <select id="ag-round"><option value="">ทุกช่วง</option>${rounds.map(r => `<option value="${r.round}" ${S.agRound === String(r.round) ? 'selected' : ''}>ช่วง ${r.round}</option>`).join('')}</select></label>
        <span class="small">แสดง ${list.length} หน่วย · ด้าน: ${funcCounts.map(x => `${esc(functions[x.k])} ${x.n}`).join(' · ')}</span>
      </div>
      ${table(['#ที่', 'หน่วยงาน', 'ตำแหน่งที่เชิญ', 'ด้าน', 'ช่วงนัด', 'แหล่งข้อมูลในระบบ', 'บทบาทในเหตุการณ์', 'ภารกิจ/อาสา', 'สถานะประสาน'], list.map(a => ({ attrs: ` class="clickable ${a.agency_id === sel.agency_id ? 'selected' : ''}" data-agency-row="${a.agency_id}"`, cells: [a.no ?? '—', `<strong>${esc(a.name)}</strong><br><span class="small">${esc(a.short)} · ${a.agency_id}</span>${a.note ? `<br><span class="small" style="color:var(--crit)">⚠ ${esc(a.note)}</span>` : ''}`, `<span class="small">${esc(a.invited || '—')}</span>`, esc(functions[a.func] || a.func), a.round ? `ช่วง ${a.round}` : '—', a.sources.length ? a.sources.map(x => `<span class="list-pill" style="${x.enabled ? (x.stale ? 'background:var(--warn-bg)' : 'background:var(--good-bg)') : ''}" title="${esc(x.name)}">${x.source_id}${x.enabled ? '' : ' ·รอ'}</span>`).join('') : '<span class="muted">—</span>', a.incident_roles.map(r => `<span class="list-pill">${r.code.split('-')[1]} ${r.role === 'lead' ? 'Lead' : r.role === 'support' ? 'สนับสนุน' : 'รับทราบ'}</span>`).join('') || '<span class="muted">—</span>', `${a.tasks_open}/${a.tasks_total} · ${a.volunteers} คน`, tag(COORD[a.coord_status][0], COORD[a.coord_status][1])] })))}
    </section>
    ${sel ? `<div class="grid cols-2">
      <section class="panel"><div class="row"><h3>${sel.no ? sel.no + '. ' : ''}${esc(sel.name)}</h3>${tag(COORD[sel.coord_status][0], COORD[sel.coord_status][1])}</div>
        <dl class="kv"><dt>ตำแหน่งที่เชิญ</dt><dd>${esc(sel.invited || '—')}</dd><dt>ข้อมูลและประเด็นหารือ</dt><dd>${esc(sel.topics)}</dd><dt>ลิงก์/รูปแบบเชื่อมโยง</dt><dd>${esc(sel.link)}<br><span class="small">${esc(sel.link_mode)}</span>${sel.urls.length ? '<br>' + sel.urls.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener" class="small">${esc(u)}</a>`).join('<br>') : ''}</dd><dt>ข้อมูลที่ขอ</dt><dd>${esc(sel.requested || '—')}</dd><dt>บทบาทในระบบ</dt><dd>${sel.system_roles.map(r => `<span class="list-pill">${esc(r)}</span>`).join('') || '—'}</dd><dt>ช่วงนัด</dt><dd>${sel.round ? `ช่วง ${sel.round} · ${esc(rounds.find(r => r.round === sel.round).title)}` : '—'}</dd></dl>
        ${can('admin') || can('kpi') || S.role === 'commander' ? `<div class="toolbar"><span class="small">อัปเดตสถานะประสาน:</span>${order.map(st => `<button class="btn sm ${st === sel.coord_status ? '' : 'secondary'}" data-action="ag-status" data-id="${sel.agency_id}" data-status="${st}">${COORD[st][0]}</button>`).join('')}</div>` : ''}
        ${sel.note ? `<div class="alert">${esc(sel.note)}</div>` : ''}</section>
      <section class="panel"><h3>ความเชื่อมโยงในระบบ</h3>
        <div class="rule"><span class="kicker">แหล่งข้อมูล (ingest.data_source)</span>${sel.sources.length ? table(['แหล่ง', 'สถานะ', 'รับล่าสุด'], sel.sources.map(x => ({ cells: [`${x.source_id} · ${esc(x.name)}`, !x.enabled ? tag('รอข้อตกลง', 'serious') : x.stale ? tag('Stale', 'warn') : tag('เชื่อมแล้ว', 'good'), x.last_received_at ? dateTH(x.last_received_at) : '—'] }))) : '<p class="small">ยังไม่มีแหล่งข้อมูลที่ลงทะเบียน</p>'}</div>
        <div class="rule"><span class="kicker">ผู้ใช้ในระบบ (core.user_agency)</span><p>${sel.users.map(u => `<span class="list-pill">${u.user_id} · ${esc(u.display_name)}${u.active ? '' : ' (ปิด)'}</span>`).join('') || '<span class="small">ยังไม่มีบัญชี</span>'}</p></div>
        <div class="rule"><span class="kicker">บทบาทในเหตุการณ์จำลอง</span><p>${sel.incident_roles.map(r => `<span class="list-pill">${r.code} · ${r.role === 'lead' ? 'หน่วยหลัก' : r.role === 'support' ? 'สนับสนุน' : 'รับทราบ'}</span>`).join('') || '<span class="small">ไม่มี</span>'}</p></div>
        <div class="rule"><span class="kicker">ประกาศที่ต้องตอบรับ</span><p>${sel.alerts.map(x => `<span class="list-pill">${x.alert_id} · ${L.alert[x.status]}${x.acked ? ' ✓' : ''}</span>`).join('') || '<span class="small">ไม่มี</span>'}</p></div>
        <div class="rule"><span class="kicker">ภารกิจและอาสาสมัคร</span><p class="small">ภารกิจที่รับผิดชอบ ${sel.tasks_open} เปิดอยู่ จาก ${sel.tasks_total} · อาสาสมัครสังกัด ${sel.volunteers} คน</p></div>
      </section></div>` : ''}
    <section class="panel"><h3>หน่วยงานที่เพิ่มตามความเสี่ยง (ข้อ 4)</h3>${table(['กลุ่ม', 'เงื่อนไขและข้อมูลที่ต้องหารือ', 'ลิงก์'], agencies.filter(a => a.tier === 'conditional').map(a => ({ cells: [esc(a.name), `<span class="small">${esc(a.topics)}</span>`, a.urls.map(u => `<a href="${esc(u)}" target="_blank" rel="noopener" class="small">${esc(u)}</a>`).join('') || '<span class="small">ประสานผ่านสำนักงานจังหวัด</span>'] })))}
      <p class="small" style="margin-top:6px">ข้อควรระวังจากแผน: ไม่ดึงข้อมูลจากระบบภายในหรือ CCTV โดยไม่มีสิทธิ์ · ขอข้อมูลรวมไม่ระบุตัวบุคคลพร้อม data dictionary · ไม่บันทึก token ในเอกสารหรือ source code · ตรวจชื่อหน่วยงานและผู้ประสานก่อนออกหนังสือนัด</p></section>`;
  }

  const RENDER = { agencies: screenAgencies, exec: screenExec, command: screenCommand, alerts: screenAlerts, mytasks: screenMyTasks, sos: screenSOS, analytics: screenAnalytics, risk: screenRisk, heatmap: screenHeatmap, data: screenData, admin: screenAdmin, qa: screenQA, audit: screenAudit };

  /* ================================================================ DRAW */
  async function draw() {
    const r = role();
    if (!r.screens.includes(S.screen)) S.screen = r.screens[0];
    const s = SCREENS[S.screen];
    const [tasks, alerts, sos] = await Promise.all([API.getTasks(S.scenario), API.getAlerts(S.scenario), API.getSOS(S.scenario)]);
    const badges = { command: sos.filter(x => x.status === 'received').length + tasks.filter(t => t.status === 'pending').length, alerts: alerts.filter(a => a.status === 'review').length, mytasks: S.role === 'volunteer' ? tasks.filter(t => t.status === 'offered' && t.assignments.some(a => a.status === 'offered' && a.volunteer_id === S.persona)).length : 0 };
    const groups = [...new Set(r.screens.map(k => SCREENS[k].group))];
    $('#nav').innerHTML = groups.map(g => `<div class="side-group">${g}</div>` + r.screens.filter(k => SCREENS[k].group === g).map(k => `<button class="nav-item" data-screen="${k}" ${k === S.screen ? 'aria-current="page"' : ''}><span class="nav-code">${SCREENS[k].code}</span><span>${esc(SCREENS[k].name)}</span>${badges[k] ? `<span class="nav-badge">${badges[k]}</span>` : ''}</button>`).join('')).join('') + `<div class="side-foot small" style="padding:12px 10px;color:var(--muted)">บทบาท: ${esc(r.name)}<br>ขอบเขต: ${esc(r.scope)}</div>`;
    content.innerHTML = `<div class="heading"><div><div class="kicker">${s.code} · ${s.group}</div><h2>${esc(s.name)}</h2><p class="small">${esc(s.sub)}</p></div><div class="small">ผู้ใช้: <strong>${esc(actor())}</strong> · ${esc(r.name)}</div></div>`;
    content.innerHTML += await RENDER[S.screen]();
    attachChartTooltips();
    $('#persona-wrap').hidden = !['volunteer', 'agency'].includes(S.role);
    if (S.role === 'agency') { const us = (await API.getUsers()).filter(u => AG_USERS.includes(u.user_id)); $('#persona').innerHTML = us.map(u => `<option value="${u.user_id}" ${u.user_id === S.agencyUser ? 'selected' : ''}>${esc(u.display_name)} · ${esc(agencyShort(u.agency_id))}</option>`).join(''); }
    else if (S.role === 'volunteer') { const vs = await API.getVolunteers(); $('#persona').innerHTML = vs.map(v => `<option value="${v.volunteer_id}" ${v.volunteer_id === S.persona ? 'selected' : ''}>${esc(v.display_name)} · ${esc(agencyShort(v.agency_id))}</option>`).join(''); }
    persistUI(); window.scrollTo({ top: 0 });
  }

  function attachChartTooltips() {
    content.querySelectorAll('.chart[data-kind="bar"]').forEach(ch => {
      const labels = JSON.parse(ch.dataset.labels), values = JSON.parse(ch.dataset.values), unit = ch.dataset.unit || ''; const tip = ch.querySelector('.tooltip');
      ch.querySelectorAll('.bar-g').forEach((g, i) => { g.addEventListener('mousemove', e => { const r = ch.getBoundingClientRect(); tip.textContent = `${labels[i]} · ${values[i]}${unit}`; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top - 6) + 'px'; tip.classList.add('show'); }); g.addEventListener('mouseleave', () => tip.classList.remove('show')); });
    });
    content.querySelectorAll('.chart[data-kind="lines"]').forEach(ch => {
      const labels = JSON.parse(ch.dataset.labels), series = JSON.parse(ch.dataset.series), xs = JSON.parse(ch.dataset.xs), vbw = Number(ch.dataset.vbw); const tip = ch.querySelector('.tooltip'), cross = ch.querySelector('.crosshair'), svg = ch.querySelector('svg');
      ch.querySelectorAll('.hit').forEach(h => { const i = Number(h.dataset.i); h.addEventListener('mousemove', e => { const r = ch.getBoundingClientRect(), sx = svg.getBoundingClientRect().width / vbw; tip.textContent = `${labels[i]} · ` + series.map(s => `${s.name}: ${s.values[i] == null ? 'ไม่มีข้อมูล' : s.values[i]}`).join(' · '); tip.style.left = (xs[i] * sx) + 'px'; tip.style.top = (e.clientY - r.top - 6) + 'px'; tip.classList.add('show'); cross.setAttribute('x1', xs[i]); cross.setAttribute('x2', xs[i]); cross.setAttribute('opacity', 1); }); h.addEventListener('mouseleave', () => { tip.classList.remove('show'); cross.setAttribute('opacity', 0); }); });
    });
  }

  /* ================================================================ EVENTS */
  const val = id => ($('#' + id) || {}).value || '';
  const checked = cls => [...content.querySelectorAll('.' + cls + ':checked')].map(x => x.value);
  document.addEventListener('change', e => {
    if (e.target.id === 'f-area') { S.filterArea = e.target.value; draw(); }
    if (e.target.id === 'ag-tier') { S.agTier = e.target.value; draw(); }
    if (e.target.id === 'ag-func') { S.agFunc = e.target.value; draw(); }
    if (e.target.id === 'ag-round') { S.agRound = e.target.value; draw(); }
    if (e.target.id === 'pub-view') { S.publicView = e.target.checked; draw(); }
    if (e.target.id === 'sos-area') { S.sosArea = e.target.value; draw(); }
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('button, .agency-pill, tr[data-agency-row], tr[data-sos], tr[data-alert], tr[data-risk], tr[data-filter-area], tr[data-go], .card[data-task], g.marker');
    if (!b) return;
    const me = actor();
    if (b.dataset.agencyRow) { S.agencySel = b.dataset.agencyRow; return draw(); }
    if (b.dataset.agency && b.classList.contains('agency-pill')) { S.agencySel = b.dataset.agency; const ag = ST.agencies.find(x => x.agency_id === b.dataset.agency); if (ag) S.agTier = ag.tier; S.agFunc = ''; S.agRound = ''; if (role().screens.includes('agencies')) { S.screen = 'agencies'; return draw(); } return; }
    if (b.dataset.agRound) { S.agRound = b.dataset.agRound; S.agTier = 'all'; return draw(); }
    if (b.dataset.screen) { S.screen = b.dataset.screen; return draw(); }
    if (b.dataset.go) { S.screen = b.dataset.go; if (b.dataset.alert) S.alert = b.dataset.alert; return draw(); }
    if (b.dataset.task) { S.task = b.dataset.task; return draw(); }
    if (b.dataset.sos) { S.sos = b.dataset.sos; return draw(); }
    if (b.dataset.alert) { S.alert = b.dataset.alert; return draw(); }
    if (b.dataset.risk) { S.riskArea = b.dataset.risk; return draw(); }
    if (b.dataset.area && S.screen === 'risk') { S.riskArea = b.dataset.area; return draw(); }
    if (b.dataset.filterArea) { S.filterArea = b.dataset.filterArea; return draw(); }
    if (b.dataset.cell) { const [c, h] = b.dataset.cell.split(':'); S.cell = [c, Number(h)]; return draw(); }
    const a = b.dataset.action; if (!a) return;
    switch (a) {
      case 'ag-status': return act(API.setAgencyStatus(b.dataset.id, b.dataset.status, me), 'อัปเดตสถานะการประสานแล้ว');
      case 'stage': return act(API.advanceProtocol(S.scenario, me), 'เลื่อนขั้นตอน Protocol แล้ว');
      case 'verify-inc': return act(API.verifyIncident(b.dataset.id, me), 'ตรวจสอบเหตุแล้ว');
      case 'screen': { const skills = [...($('#sc-skills').selectedOptions || [])].map(o => o.value); return act(API.screenSOS(b.dataset.id, { urgency: val('sc-urg'), incident_id: val('sc-inc'), agency_id: val('sc-ag'), title: val('sc-title'), required_skills: skills, vulnerability_flags: checked('sc-vuln'), hard_priority: $('#sc-hard').checked, task_type: 'other' }, me).then(r => { if (r.ok) { S.task = r.task.task_id; S.sos = null; } return r; }), 'คัดกรองแล้ว สร้างภารกิจและคำนวณคะแนนลำดับ'); }
      case 'override': return act(API.overridePriority(b.dataset.id, val('ov-score') || 0, val('ov-reason'), me), 'ปรับลำดับแล้ว บันทึกเหตุผลและผู้ปรับ');
      case 'offer': return act(API.offerTask(b.dataset.id, val('offer-vol'), me), 'เสนอภารกิจแล้ว · รอตอบรับ (ส่งข้อความสำเร็จ ≠ ตอบรับ)');
      case 'expire': return act(API.forceExpire(b.dataset.id, me), 'หมดเวลาตอบรับ · คืนงานเข้าคิวแล้ว');
      case 'respond': return act(API.respondOffer(b.dataset.id, b.dataset.resp, S.persona, ''), b.dataset.resp === 'accept' ? 'รับงานแล้ว' : 'ปฏิเสธแล้ว · งานคืนเข้าคิว');
      case 'task-status': return act(API.taskEvent(b.dataset.id, b.dataset.status, b.dataset.version, me, ''), 'อัปเดตสถานะแล้ว (version +1)');
      case 'task-cancel': { const note = prompt('เหตุผลการยกเลิก (บังคับ)'); if (note === null) return; return act(API.taskEvent(b.dataset.id, 'cancelled', b.dataset.version, me, note), 'ยกเลิกภารกิจแล้ว'); }
      case 'support': { const note = prompt('รายละเอียดที่ต้องการสนับสนุน'); if (!note) return; return act(API.requestSupport(b.dataset.id, S.persona, note), 'ส่งคำขอสนับสนุนไปศูนย์สั่งการแล้ว'); }
      case 'toggle-new-alert': { const f = $('#new-alert'); f.hidden = !f.hidden; return; }
      case 'create-alert': return act(API.createAlert(S.scenario, { audience: val('na-aud'), level: val('na-lvl'), title: val('na-title'), message: val('na-msg') }, me).then(r => { if (r.ok) S.alert = r.alert.alert_id; return r; }), 'บันทึกร่างประกาศแล้ว');
      case 'set-tr': return act(API.setTranslation(b.dataset.id, b.dataset.lang, val(`tr-${b.dataset.lang}-title`), val(`tr-${b.dataset.lang}-msg`), me), 'บันทึกข้อความแล้ว');
      case 'review-tr': return act(API.reviewTranslation(b.dataset.id, b.dataset.lang, me), `บันทึกผู้ตรวจภาษา ${b.dataset.lang.toUpperCase()} แล้ว`);
      case 'alert': return act(API.alertAction(b.dataset.id, b.dataset.op, me, val('rej-note')), { submit: 'ส่งทบทวนแล้ว', approve: 'อนุมัติแล้ว · พร้อมเผยแพร่', reject: 'ส่งกลับแก้ไขแล้ว', publish: 'เผยแพร่แล้ว · สร้าง delivery และ Outbox' }[b.dataset.op]);
      case 'ack': { const u = (await API.getUsers()).find(x => x.user_id === me); return act(API.acknowledgeAlert(b.dataset.id, me, u ? u.agency_id : 'AG09'), `ตอบรับประกาศในนาม ${u ? agencyShort(u.agency_id) : ''} แล้ว`); }
      case 'sig': return act(API.verifySignal(b.dataset.id, b.dataset.status, me), 'บันทึกผลตรวจสอบสัญญาณแล้ว');
      case 'sos-submit': case 'sos-resend': {
        if (a === 'sos-submit' || !S.sosKey) S.sosKey = 'idem-' + Math.random().toString(36).slice(2, 10);
        const r = await API.submitSOS({ area_id: val('sos-area'), request_type: val('sos-type'), request_detail: val('sos-detail'), people_count: val('sos-people'), urgency: val('sos-urg'), location_accuracy_m: val('sos-acc'), contact: val('sos-contact'), vulnerability_flags: checked('sos-vuln') }, S.sosKey);
        if (r.ok === false) return toast(r.error, true);
        if (!S.tracking.includes(r.tracking_no)) S.tracking.unshift(r.tracking_no);
        toast(r.idempotent_replay ? `ส่งซ้ำด้วย Key เดิม → ได้เลขเดิม ${r.tracking_no} (ไม่สร้างคำขอใหม่)` : `บันทึกคำขอแล้ว เลขติดตาม ${r.tracking_no}`); return draw();
      }
      case 'track-add': { const no = val('track-no').trim(); if (!no) return; const r = await API.trackSOS(no); if (r.ok === false) return toast(r.error, true); if (!S.tracking.includes(no)) S.tracking.unshift(no); return draw(); }
      case 'bi-table': S.biTable = !S.biTable; return draw();
      case 'export': { const r = await API.exportReport(S.scenario, me); toast(`ส่งออกรายงานแล้ว · Snapshot ${r.snapshot_id} · บันทึก Audit ระบุผู้ส่งออก`); return draw(); }
      case 'import': return act(API.importBatch(val('imp-src'), val('imp-key').trim() || `manual-${Date.now()}`, me), 'นำเข้าชุดข้อมูลแล้ว (202 Accepted → loaded)');
      case 'import-dup': return act(API.importBatch('DS03', 'smartcity-20261013-1345', me), 'นำเข้าแล้ว?');
      case 'resolve': return act(API.resolveIssue(b.dataset.id, me), 'แก้ไขและตรวจคุณภาพซ้ำแล้ว');
      case 'user-active': return act(API.setUserActive(b.dataset.id, b.dataset.active === '1', me), 'อัปเดตสถานะผู้ใช้แล้ว');
      case 'check-access': { S.accessResult = await API.checkAccess(val('acc-user'), val('acc-area'), val('acc-action')); return draw(); }
      case 'toggle-rule': return act(API.toggleRule(b.dataset.id, me), 'อัปเดตกฎแจ้งเตือนแล้ว');
      case 'kpi-bump': { const f = prompt('สูตรใหม่ (เว้นว่างเพื่อคงเดิม)'); if (f === null) return; return act(API.bumpKPIVersion(b.dataset.id, f, me), 'ออกเวอร์ชัน KPI ใหม่แล้ว'); }
      case 'run-tests': { toast('กำลังรันชุดทดสอบ…'); S.tests = await API.runTests(); toast(`ผ่าน ${S.tests.pass}/${S.tests.total}`); return draw(); }
      case 'reset': if (confirm('รีเซ็ตข้อมูลจำลองทั้งหมดกลับค่าเริ่มต้น?')) { await API.reset(); Object.assign(S, { task: null, sos: null, alert: null, cell: null, tracking: [], tests: null, accessResult: null }); toast('รีเซ็ตข้อมูลจำลองแล้ว'); return draw(); } return;
    }
  });
  $('#scenario').addEventListener('change', e => { S.scenario = e.target.value; Object.assign(S, { task: null, sos: null, alert: null, cell: null }); toast('เปลี่ยนเหตุการณ์หลักเป็น ' + e.target.selectedOptions[0].textContent); draw(); });
  $('#role').addEventListener('change', e => { S.role = e.target.value; S.screen = role().screens[0]; toast('เปลี่ยนบทบาทเป็น ' + role().name); draw(); });
  $('#persona').addEventListener('change', e => { if (S.role === 'agency') S.agencyUser = e.target.value; else S.persona = e.target.value; draw(); });
  $('#theme').addEventListener('click', () => { const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = cur === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tci-theme', document.documentElement.dataset.theme); } catch (e) {} });

  /* ================================================================ INIT */
  (async () => {
    try { const th = localStorage.getItem('tci-theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
    ST = await API.getStatic();
    const vols = await API.getVolunteers();
    $('#scenario').innerHTML = ST.scenarios.map(s => `<option value="${s.id}" ${s.id === S.scenario ? 'selected' : ''}>${s.code} · ${esc(s.name.length > 30 ? s.name.slice(0, 30) + '…' : s.name)}</option>`).join('');
    $('#role').innerHTML = ST.roles.map(r => `<option value="${r.role_code}" ${r.role_code === S.role ? 'selected' : ''}>${esc(r.name)}</option>`).join('');
    $('#persona').innerHTML = vols.map(v => `<option value="${v.volunteer_id}" ${v.volunteer_id === S.persona ? 'selected' : ''}>${esc(v.display_name)} (${L.verif[v.verification_status]})</option>`).join('');
    $('#tenant').textContent = ST.tenant.name; $('#snapshot').textContent = SEED.meta.snapshot_label;
    await draw();
  })();
})();
