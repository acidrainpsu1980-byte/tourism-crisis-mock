/* =====================================================================
 * APP v3 — UI ใหม่: เมนูไอคอน, สลับเหตุการณ์ปุ่มเดียว, ศูนย์สั่งการแบบรายการ+รายละเอียด,
 * ทัวร์สาธิต, modal ในหน้า (ไม่ใช้ prompt/confirm), ซ่อนรายละเอียดเทคนิคหลังสวิตช์
 * อ่าน/เขียนข้อมูลผ่าน window.API เท่านั้น
 * ===================================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = Charts.esc;
  const content = $('#content');
  let ST = null;

  /* ---------------- icons ---------------- */
  const IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6M19 6a7 7 0 0 1 0 12"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>',
    sos: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5 5l4.2 4.2M14.8 14.8L19 19M14.8 9.2L19 5M5 19l4.2-4.2"/>',
    chart: '<path d="M4 20V11M10 20V4M16 20v-7M2 20h20"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    check: '<path d="M20 6L9 17l-5-5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>', play: '<path d="M7 4l13 8-13 8z"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16"/>',
    boat: '<path d="M3 17l2 4h14l2-4H3zM12 3v11M12 4l6 8h-6"/>', med: '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', shield: '<path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  };
  const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.info}</svg>`;

  /* ---------------- screens ---------------- */
  const SCREENS = {
    exec:      { name: 'ภาพรวมสถานการณ์', icon: 'home', group: 'ปฏิบัติการ', fr: 'FR06', sub: 'สิ่งที่ต้องตัดสินใจตอนนี้ ตัวชี้วัดหลัก และหน่วยงานที่เกี่ยวข้อง' },
    command:   { name: 'ศูนย์สั่งการ', icon: 'radio', group: 'ปฏิบัติการ', fr: 'FR10–FR14', sub: 'คัดกรองคำขอ SOS มอบหมายภารกิจ และติดตามการช่วยเหลือ' },
    alerts:    { name: 'ประกาศเตือนภัย', icon: 'megaphone', group: 'ปฏิบัติการ', fr: 'FR08–FR09', sub: 'ร่าง ทบทวน อนุมัติ และเผยแพร่ประกาศ 3 ภาษา' },
    mytasks:   { name: 'งานของฉัน', icon: 'clipboard', group: 'ภาคสนาม', fr: 'FR13–FR14', sub: 'รับงาน รายงานความคืบหน้า และขอกำลังเสริม' },
    sos:       { name: 'ขอความช่วยเหลือ', icon: 'sos', group: 'สาธารณะ', fr: 'FR10', sub: 'แจ้งเหตุ รับเลขติดตาม และดูประกาศในพื้นที่' },
    analytics: { name: 'วิเคราะห์ตัวชี้วัด', icon: 'chart', group: 'วิเคราะห์', fr: 'FR05–FR06', sub: 'เปรียบเทียบพื้นที่และเวลา พร้อมนิยามตัวชี้วัด' },
    risk:      { name: 'แผนที่ความเสี่ยง', icon: 'map', group: 'วิเคราะห์', fr: 'FR07', sub: 'คะแนนความเสี่ยง 0–100 รายพื้นที่และรายภัย พร้อมที่มาและความเชื่อมั่น' },
    heatmap:   { name: 'ความหนาแน่นคน', icon: 'grid', group: 'วิเคราะห์', fr: 'FR15', sub: 'จำนวนคนโดยประมาณรายพื้นที่ย่อยและช่วงเวลา' },
    agencies:  { name: 'หน่วยงานภาคี', icon: 'building', group: 'ข้อมูลและระบบ', fr: 'แผน 16 ต.ค. 69', sub: 'หน่วยงานหลัก 20 หน่วยและหน่วยสนับสนุน ตามแผนนัดหมายประสานข้อมูลจังหวัดภูเก็ต' },
    data:      { name: 'แหล่งข้อมูล', icon: 'db', group: 'ข้อมูลและระบบ', fr: 'FR02–FR04', sub: 'ความสดของข้อมูล ชุดนำเข้า และปัญหาคุณภาพที่ต้องแก้' },
    admin:     { name: 'ผู้ใช้และสิทธิ์', icon: 'users', group: 'ข้อมูลและระบบ', fr: 'FR01', sub: 'บัญชีผู้ใช้ พื้นที่รับผิดชอบ กฎแจ้งเตือน และตัวชี้วัด' },
    qa:        { name: 'ทดสอบระบบ', icon: 'flask', group: 'ข้อมูลและระบบ', fr: '§12', sub: 'รันชุดทดสอบกฎสำคัญกับข้อมูลจำลอง' },
    audit:     { name: 'บันทึกกิจกรรม', icon: 'list', group: 'ข้อมูลและระบบ', fr: 'FR18', sub: 'ทุกการกระทำในเดโมถูกบันทึกที่นี่' },
  };
  const ROLE_USER = { commander: 'U01', dispatcher: 'U02', agency: 'U04', steward: 'U05', admin: 'U06' };
  const AG_USERS = ['U04', 'U09', 'U10', 'U11', 'U12'];
  const ROLE_INIT = { commander: 'บก', dispatcher: 'ศส', agency: 'นง', steward: 'ขม', volunteer: 'อส', tourist: 'นท', admin: 'ผร' };
  const INC_SHORT = { flood: 'น้ำท่วมป่าตอง', boat: 'เรือเหตุอ่าวฉลอง', crowd: 'คนแน่นเมืองเก่า' };

  const TOUR = [
    { role: 'tourist', screen: 'sos', scenario: 'flood', title: 'นักท่องเที่ยวแจ้งขอความช่วยเหลือ', text: 'เลือกประเภทปัญหา พิมพ์รายละเอียด แล้วกด "ส่งคำขอ" ระบบให้เลขติดตามทันที ลองกด "ส่งซ้ำ" จะได้เลขเดิม ไม่เกิดคำขอซ้ำ' },
    { role: 'dispatcher', screen: 'command', tab: 'sos', title: 'ศูนย์สั่งการคัดกรองคำขอ', text: 'คำขอใหม่อยู่ในแท็บ "รอคัดกรอง" เลือกคำขอ กำหนดความเร่งด่วนและทักษะที่ต้องใช้ แล้วกด "ยืนยันและสร้างภารกิจ"' },
    { role: 'dispatcher', screen: 'command', tab: 'task', title: 'เสนองานให้อาสาสมัคร', text: 'ในแท็บ "ภารกิจ" เลือกงานที่รอมอบหมาย ระบบจัดอาสาที่เหมาะที่สุดไว้แรก กด "เสนองาน" บนการ์ดได้เลย' },
    { role: 'volunteer', persona: 'V01', screen: 'mytasks', title: 'อาสาสมัครรับงาน', text: 'อาสาสมัคร 01 มีข้อเสนองานรออยู่ กด "รับงาน" แล้วกดปุ่มสถานะถัดไปจนงานเสร็จ ถ้าไม่ตอบใน 10 นาที งานจะกลับเข้าคิว' },
    { role: 'commander', screen: 'alerts', title: 'ผู้บัญชาการอนุมัติประกาศ', text: 'เปิดประกาศที่ "รอทบทวน" ดูรายการตรวจความพร้อม ถ้าภาษาจีนยังไม่มีผู้ตรวจ ให้กด "ยืนยันคำแปล" ในแท็บ 中文 ก่อน แล้วจึงกด "อนุมัติ"' },
    { role: 'commander', screen: 'exec', title: 'ติดตามภาพรวม', text: 'หน้าภาพรวมสรุปสิ่งที่ต้องตัดสินใจ ตัวชี้วัดหลัก และหน่วยงานที่เกี่ยวข้อง สลับเหตุการณ์ได้ที่แถบด้านบน' },
  ];

  /* ---------------- state ---------------- */
  const S = { screen: 'exec', scenario: 'flood', role: 'commander', persona: 'V01', agencyUser: 'U04', cmdTab: 'sos', taskFilter: 'open', task: null, sos: null, alert: null, lang: 'th', cell: null, riskArea: 'A1', filterArea: '', publicView: false, chartTable: false, tracking: [], tests: null, access: null, accAction: 'read', agencySel: 'AG01', agTier: 'core', agFunc: '', sosType: 'trapped', sosUrg: 3, sosArea: 'A1', sosKey: null, rolePop: false, nav: false, tech: false, tour: true, tourStep: 0 };
  try { Object.assign(S, JSON.parse(localStorage.getItem('tci-ui-v3') || '{}')); } catch (e) {}
  { const q = new URLSearchParams(location.search); ['screen', 'scenario', 'role', 'persona', 'agencyUser'].forEach(k => { if (q.has(k)) { S[k] = q.get(k); S.tour = false; } }); const h = location.hash.slice(1); if (h && SCREENS[h]) S.screen = h; }
  S.rolePop = false; S.nav = false;
  const persist = () => { try { localStorage.setItem('tci-ui-v3', JSON.stringify({ screen: S.screen, scenario: S.scenario, role: S.role, persona: S.persona, agencyUser: S.agencyUser, tracking: S.tracking, tech: S.tech, tour: S.tour, tourStep: S.tourStep, cmdTab: S.cmdTab, sosKey: S.sosKey })); } catch (e) {} };

  /* ---------------- labels ---------------- */
  const L = {
    task: { pending: 'รอมอบหมาย', offered: 'รออาสาตอบรับ', accepted: 'รับงานแล้ว', en_route: 'กำลังเดินทาง', on_scene: 'ถึงที่เกิดเหตุ', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก' },
    taskTone: { pending: 'crit', offered: 'warn', accepted: 'info', en_route: 'info', on_scene: 'info', completed: 'good', cancelled: '' },
    taskNext: { accepted: ['en_route', 'ออกเดินทาง'], en_route: ['on_scene', 'ถึงที่เกิดเหตุแล้ว'], on_scene: ['completed', 'ช่วยเหลือเสร็จสิ้น'] },
    inc: { reported: 'ยังไม่ยืนยัน', verified: 'ยืนยันแล้ว', escalated: 'ยกระดับ', notified: 'แจ้งผู้รับผิดชอบ', tracking: 'ติดตาม', closed: 'ปิดเหตุ' }, incTone: { reported: 'warn', verified: 'good', escalated: 'crit', notified: 'info', tracking: 'info', closed: '' },
    alert: { draft: 'ร่าง', review: 'รอทบทวน', approved: 'อนุมัติแล้ว', rejected: 'ส่งกลับแก้ไข', published: 'เผยแพร่แล้ว', expired: 'หมดอายุ' }, alertTone: { draft: '', review: 'warn', approved: 'good', rejected: 'crit', published: 'info', expired: '' },
    vol: { available: 'พร้อมงาน', busy: 'ติดงาน', off: 'พัก' }, volTone: { available: 'good', busy: 'warn', off: '' },
    verif: { verified: 'ผ่านการตรวจสอบ', pending: 'รอตรวจสอบ', suspended: 'ถูกระงับ' }, verifTone: { verified: 'good', pending: 'warn', suspended: 'crit' },
    sig: { verified: 'ยืนยันแล้ว', unverified: 'ยังไม่ยืนยัน', rejected: 'ข่าวไม่จริง' }, sigTone: { verified: 'good', unverified: 'warn', rejected: 'crit' },
    vuln: { elderly: 'ผู้สูงอายุ', child: 'เด็ก', injured: 'บาดเจ็บ', chronic: 'โรคประจำตัว', language: 'สื่อสารภาษาไทยไม่ได้', disabled: 'ผู้พิการ', pregnant: 'ตั้งครรภ์' },
    reqType: { trapped: 'ติดค้าง', medical: 'เจ็บป่วย/บาดเจ็บ', marine: 'เหตุทางทะเล', missing: 'คนหาย/พลัดหลง', evacuate: 'ต้องการอพยพ', stranded: 'เดินทางต่อไม่ได้', shelter: 'ต้องการที่พัก', crowd: 'คนเบียดเสียด', support: 'งานสนับสนุน', other: 'อื่นๆ' },
    reqIcon: { trapped: 'home', medical: 'med', marine: 'boat', missing: 'search', evacuate: 'route', stranded: 'route', shelter: 'building', crowd: 'users', support: 'plus', other: 'info' },
    urg: ['', 'ไม่เร่งด่วน', 'ต่ำ', 'ปานกลาง', 'สูง', 'อันตรายถึงชีวิต'],
    coord: { planned: ['วางแผนนัด', ''], invited: ['ส่งหนังสือเชิญ', 'info'], met: ['ประชุมแล้ว', 'warn'], sample: ['ได้ข้อมูลตัวอย่าง', 'accent'], agreement: ['ตกลงเชื่อมข้อมูล', 'good'] },
  };
  const chip = (t, tone = '', plain = false) => `<span class="chip ${tone} ${plain ? 'plain' : ''}">${esc(t)}</span>`;
  const kpi = (label, val, unit, note, tone = '') => `<div class="kpi ${tone}"><span class="k-label">${esc(label)}</span><span class="k-val">${val == null ? '<span class="muted" style="font-size:18px">ไม่มีข้อมูล</span>' : val}${val != null && unit ? `<small>${esc(unit)}</small>` : ''}</span>${note ? `<span class="k-note">${note}</span>` : ''}</div>`;
  const table = (headers, rows, empty = 'ไม่มีข้อมูล') => `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th${/^#/.test(h) ? ' class="num"' : ''}>${esc(h.replace(/^#/, ''))}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr${r.attrs || ''}>${r.cells.map((c, i) => `<td${/^#/.test(headers[i]) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="muted">${esc(empty)}</td></tr>`}</tbody></table></div>`;
  const tech = (html) => `<div class="tech tech-note">${html}</div>`;
  const techI = (html) => `<span class="tech mono muted"> ${esc(html)}</span>`;
  const callout = (text, tone = '', ic = 'info') => `<div class="callout ${tone}">${icon(ic, 17)}<div>${text}</div></div>`;
  const hhmm = iso => iso ? new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '—';
  const dateTH = iso => iso ? new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  let NOW = new Date();
  const ago = iso => { if (!iso) return '—'; const m = Math.round((NOW - new Date(iso)) / 60000); if (m < 1) return 'เมื่อสักครู่'; if (m < 60) return `${m} นาทีที่แล้ว`; const h = Math.floor(m / 60); if (h < 24) return `${h} ชม. ที่แล้ว`; return dateTH(iso); };
  const areaName = id => (ST.areas.find(a => a.area_id === id) || {}).name || id || '—';
  const agencyName = id => (ST.agencies.find(a => a.agency_id === id) || {}).name || id || '—';
  const agencyShort = id => { const a = ST.agencies.find(x => x.agency_id === id); return a ? a.short : (id || '—'); };
  const agencyPill = (id, extra = '') => `<span class="tag agency-pill" data-agency="${id}" title="${esc(agencyName(id))}">${esc(agencyShort(id))}${extra}</span>`;
  const hazardName = c => (ST.hazard_types.find(h => h.hazard_code === c) || {}).name || c;
  const skillName = c => ST.skill_names[c] || c;
  const role = () => ST.roles.find(r => r.role_code === S.role) || ST.roles[0];
  const can = p => role().can.includes(p);
  const actor = () => S.role === 'volunteer' ? S.persona : S.role === 'agency' ? S.agencyUser : S.role === 'tourist' ? 'นักท่องเที่ยว (บัญชี)' : ROLE_USER[S.role];
  const userName = id => { const u = ST.users.find(x => x.user_id === id); return u ? u.display_name : id; };
  const lock = p => can(p) ? '' : `<p class="lock-note">${icon('shield', 14)} มุมมอง "${esc(role().name)}" ทำขั้นตอนนี้ไม่ได้ เปลี่ยนมุมมองที่มุมขวาบน</p>`;
  const scoreCls = s => s >= 70 ? 'hi' : s >= 40 ? 'mid' : 'lo';
  const lvlColor = l => ['', 'var(--good)', 'var(--s3)', 'var(--warn-fill)', 'var(--s2)', 'var(--crit)'][l] || 'var(--muted)';
  const lvl = l => `<span class="lvl" style="background:${lvlColor(l)}" title="ระดับ ${l}">${l}</span>`;
  const timeline = evs => `<div class="timeline">${evs.map(e => `<div class="tl"><time>${hhmm(e.ts)}</time><i></i><div>${esc(e.text)}${e.note ? `<br><span>${esc(e.note)}</span>` : ''}</div></div>`).join('')}</div>`;
  const taskEvText = e => ({ created: 'สร้างภารกิจหลังคัดกรอง', offered: 'เสนองานให้อาสาสมัคร', accepted: 'อาสาสมัครรับงาน', declined: 'อาสาสมัครปฏิเสธ งานกลับเข้าคิว', offer_expired: 'หมดเวลาตอบรับ งานกลับเข้าคิว', priority_override: 'เจ้าหน้าที่ปรับคะแนนลำดับ', support_requested: 'อาสาขอกำลังเสริม' })[e.event_type] || (e.event_type === 'status' ? L.task[e.new_status] : e.event_type);

  /* ---------------- toast & modal ---------------- */
  let tt;
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (err ? ' err' : ''); clearTimeout(tt); tt = setTimeout(() => { t.className = 'toast'; }, 3600); }
  async function act(p, ok) { const r = await p; if (r.ok === false) { toast(r.error, true); return false; } toast(ok); await draw(); return r; }
  function modal({ title, text = '', fields = [], ok = 'ยืนยัน', danger = false }) {
    return new Promise(res => {
      const ov = $('#overlay');
      const fieldHtml = f => {
        const ctl = f.type === 'textarea' ? `<textarea class="input" id="mf-${f.id}" rows="3" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>${esc(f.value || '')}</textarea>`
          : f.type === 'select' ? `<select class="input" id="mf-${f.id}">${f.options.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(f.value) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
          : `<input class="input" id="mf-${f.id}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>`;
        return `<div class="field"><label for="mf-${f.id}">${esc(f.label)}</label>${ctl}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</div>`;
      };
      ov.innerHTML = `<div class="modal-back"><form class="modal" id="mdl"><h2>${esc(title)}</h2>${text ? `<p class="sub">${esc(text)}</p>` : ''}${fields.map(fieldHtml).join('')}<div class="actions"><button type="button" class="btn ghost" id="mdl-cancel">ยกเลิก</button><button type="submit" class="btn ${danger ? 'danger' : ''}">${esc(ok)}</button></div></form></div>`;
      const close = v => { ov.innerHTML = ''; res(v); };
      $('#mdl-cancel').onclick = () => close(null);
      $('.modal-back').onclick = e => { if (e.target.classList.contains('modal-back')) close(null); };
      $('#mdl').onsubmit = e => { e.preventDefault(); e.stopPropagation(); close(Object.fromEntries(fields.map(f => [f.id, $('#mf-' + f.id).value.trim()]))); };
      const first = $('#mdl input, #mdl textarea, #mdl select') || $('#mdl button[type=submit]'); if (first) first.focus();
    });
  }

  /* ================================================================ EXEC */
  async function screenExec() {
    const [m, k, alerts, tasks, sos, srcs, risk] = await Promise.all([API.getMajorIncident(S.scenario), API.getKPIs(S.scenario), API.getAlerts(S.scenario), API.getTasks(S.scenario), API.getSOS(S.scenario), API.getDataSources(), API.getRisk()]);
    const review = alerts.filter(a => a.status === 'review');
    const hard = tasks.filter(t => t.hard_priority && ['pending', 'offered'].includes(t.status));
    const waitScreen = sos.filter(s => s.status === 'received');
    const stale = srcs.filter(s => s.stale);
    const stages = ST.protocol_stages; const si = stages.findIndex(s => s[0] === m.status);
    const topRisk = risk.assessments.filter(r => r.area_id === m.area_id).sort((a, b) => b.risk_score - a.risk_score)[0];
    const acts = [];
    review.forEach(a => acts.push({ tone: 'warn', ic: 'megaphone', t: `ประกาศรออนุมัติ: ${esc(a.translations.th.title)}`, d: `ระดับ ${a.level} · ${esc(a.audience)}`, btn: role().screens.includes('alerts') ? `<button class="btn sm" data-go="alerts" data-alert="${a.alert_id}">เปิดทบทวน</button>` : '' }));
    if (hard.length) acts.push({ tone: 'crit', ic: 'alert', t: `ภารกิจอันตรายถึงชีวิตยังไม่มีผู้รับ ${hard.length} งาน`, d: hard.map(t => esc(t.title)).join(' · '), btn: role().screens.includes('command') ? `<button class="btn sm" data-go="command" data-tab="task" data-task="${hard[0].task_id}">ไปมอบหมาย</button>` : '' });
    if (waitScreen.length) acts.push({ tone: 'info', ic: 'sos', t: `คำขอ SOS รอคัดกรอง ${waitScreen.length} รายการ`, d: `เก่าสุด ${ago(waitScreen.map(s => s.created_at).sort()[0])}`, btn: role().screens.includes('command') ? `<button class="btn sm ghost" data-go="command" data-tab="sos">ไปคัดกรอง</button>` : '' });
    if (stale.length) acts.push({ tone: 'warn', ic: 'db', t: `ข้อมูลล่าช้า ${stale.length} แหล่ง`, d: stale.map(s => esc(s.name)).join(' · '), btn: role().screens.includes('data') ? `<button class="btn sm ghost" data-go="data">ดูแหล่งข้อมูล</button>` : '' });
    if (!acts.length) acts.push({ tone: 'good', ic: 'check', t: 'ไม่มีเรื่องค้างที่ต้องตัดสินใจ', d: 'ระบบจะแจ้งเมื่อมีประกาศรออนุมัติหรือภารกิจเร่งด่วน', btn: '' });
    const bar = Charts.bar(m.trend.map((v, i) => ({ label: `${10 + i}:00`, value: v, hl: i === 4 })), { height: 170, ariaLabel: 'เหตุที่ยืนยันสะสม 10–14 นาฬิกา' });
    return `
    <section class="card hero ${m.severity >= 5 ? '' : 'high'}">
      <div class="stack" style="gap:12px">
        <div><span class="eyebrow">เหตุการณ์ที่ติดตาม · ${m.code}</span><h1>${esc(m.title)}</h1>
          <div class="facts"><span>${icon('map', 15)} ${esc(areaName(m.area_id))}</span><span>${icon('alert', 15)} ${esc(hazardName(m.hazard_code))}</span><span>${icon('clock', 15)} เริ่ม ${hhmm(m.occurred_at)} น.</span><span>${icon('building', 15)} หน่วยหลัก ${esc(agencyShort(m.agencies.lead))}</span></div></div>
        <div class="steps" aria-label="ขั้นตอนการตอบสนอง">${stages.map((s, i) => `<div class="st ${i < si ? 'done' : i === si ? 'cur' : ''}">${s[1]}<small>${s[2]}</small></div>`).join('')}</div>
        ${can('protocol') && si < stages.length - 1 ? `<div class="row"><button class="btn sm ghost" data-action="stage">เลื่อนไปขั้น "${stages[si + 1][1]}"</button></div>` : ''}
      </div>
      <div class="sev ${m.severity >= 5 ? '' : 'high'}"><b>${m.severity}/5</b><span>ความรุนแรง</span></div>
    </section>
    <div class="grid2">
      <section class="card"><div class="card-head"><h2>ต้องดำเนินการตอนนี้</h2>${acts[0].tone === 'good' ? chip('เรียบร้อย', 'good') : chip(`${acts.length} เรื่อง`, 'crit')}</div>
        <div class="action-list">${acts.map(a => `<div class="action ${a.tone}"><div class="ic">${icon(a.ic, 19)}</div><div style="min-width:0"><b>${a.t}</b><span>${a.d}</span></div>${a.btn}</div>`).join('')}</div></section>
      <section class="card"><div class="card-head"><h2>สถานการณ์ตอนนี้</h2><span class="tiny">อัปเดต ${hhmm(k.snapshot_at)} น.</span></div>
        <dl class="kv"><dt>สัญญาณที่ใช้ตัดสินใจ</dt><dd>${esc(m.signal)}</dd><dt>ข้อเสนอการตอบสนอง</dt><dd><b>${esc(m.decision)}</b><br><span class="tiny">ระบบเสนอ ผู้มีอำนาจของหน่วยงานเป็นผู้สั่งการ</span></dd><dt>ความเสี่ยงสูงสุด</dt><dd>${esc(hazardName(topRisk.hazard_code))} <span class="score ${scoreCls(topRisk.risk_score)}">${topRisk.risk_score}</span> <span class="tiny">ความเชื่อมั่น ${Math.round(topRisk.confidence * 100)}%</span></dd><dt>แหล่งข้อมูล</dt><dd class="small">${esc(m.source)}</dd></dl></section>
    </div>
    <div class="kpis six">
      ${kpi('เหตุที่ยืนยันแล้ว', k.incidents_confirmed, 'เหตุ', `ยังไม่ยืนยันอีก ${k.incidents_reported_unverified} เหตุ`)}
      ${kpi('คำขอ SOS ที่ยังเปิด', k.sos_open, 'รายการ', `ใหม่ ${k.sos_new} · รอมอบหมาย ${k.tasks_pending} งาน`, k.tasks_hard_pending ? 'crit' : k.sos_open ? 'warn' : 'good')}
      ${kpi('เวลาเริ่มตอบสนอง', k.resp_start_p50, 'นาที', `ค่ากลาง จากรับแจ้งถึงคัดกรอง · 95% ภายใน ${k.resp_start_p95} นาที`)}
      ${kpi('อาสาสมัครพร้อมออกงาน', k.volunteers_ready, 'คน', `จากทั้งหมด ${k.volunteers_total} คน`)}
      ${kpi('งานเสร็จตามเวลา', k.sla_rate, '%', `จาก ${k.sla_n} งานที่ถึงกำหนด`, k.sla_rate != null && k.sla_rate < 60 ? 'warn' : '')}
      ${kpi('ข้อมูลมาตรงเวลา', k.data_on_time, '%', k.stale_sources.length ? `ล่าช้า ${k.stale_sources.length} แหล่ง` : 'ทุกแหล่งตรงเวลา', k.stale_sources.length ? 'warn' : 'good')}
    </div>
    <div class="grid2">
      <section class="card"><div class="card-head"><h2>เหตุที่ยืนยันสะสม</h2><span class="tiny">วันนี้ · ${esc(areaName(m.area_id))}</span></div>${bar}</section>
      <section class="card"><div class="card-head"><h2>หน่วยงานที่เกี่ยวข้อง</h2>${role().screens.includes('agencies') ? '<button class="btn sm quiet" data-go="agencies">ดูทั้งหมด</button>' : ''}</div>
        <div class="stack"><div><div class="eyebrow">หน่วยหลัก</div>${agencyPill(m.agencies.lead)}</div><div><div class="eyebrow">หน่วยสนับสนุน</div>${m.agencies.support.map(id => agencyPill(id)).join('')}</div><div><div class="eyebrow">รับทราบและเผยแพร่</div>${m.agencies.inform.map(id => agencyPill(id)).join('')}</div>
        <p class="tiny">ตามแผนนัดหมายประสานข้อมูลจังหวัดภูเก็ต 16 ต.ค. 2569 · บทบาทต้องยืนยันใน SOP จังหวัด</p></div></section>
    </div>
    ${tech(`KPI snapshot ${k.snapshot_at} · ${Object.entries(k.kpi_versions).map(([c, v]) => `${c} v${v}`).join(' · ')} · GET /v1/dashboard/summary`)}`;
  }

  /* ================================================================ COMMAND */
  const OPEN = ['pending', 'offered', 'accepted', 'en_route', 'on_scene'];
  async function screenCommand() {
    const [m, incs, sos, tasks, vols] = await Promise.all([API.getMajorIncident(S.scenario), API.getIncidents(S.scenario), API.getSOS(S.scenario), API.getTasks(S.scenario), API.getVolunteers()]);
    const queue = sos.filter(s => s.status === 'received').sort((a, b) => b.urgency - a.urgency || a.created_at.localeCompare(b.created_at));
    const sortT = arr => [...arr].sort((a, b) => (b.hard_priority - a.hard_priority) || (OPEN.indexOf(a.status) - OPEN.indexOf(b.status)) || b.priority.score - a.priority.score);
    const filters = { open: ['เปิดอยู่', t => OPEN.includes(t.status)], pending: ['รอมอบหมาย', t => t.status === 'pending'], offered: ['รอตอบรับ', t => t.status === 'offered'], active: ['กำลังช่วย', t => ['accepted', 'en_route', 'on_scene'].includes(t.status)], done: ['ปิดแล้ว', t => ['completed', 'cancelled'].includes(t.status)] };
    const shownTasks = sortT(tasks.filter(filters[S.taskFilter][1]));
    const unverified = incs.filter(i => i.status === 'reported');
    if (S.cmdTab === 'sos' && !queue.length && !S.cmdTabPinned) S.cmdTab = 'task';
    const tabs = [['sos', 'รอคัดกรอง', queue.length], ['task', 'ภารกิจ', tasks.filter(t => OPEN.includes(t.status)).length], ['inc', 'เหตุและแผนที่', unverified.length]];
    let list = '', detail = '';
    if (S.cmdTab === 'sos') {
      const sel = queue.find(s => s.sos_id === S.sos) || queue[0];
      list = queue.length ? `<div class="list">${queue.map(s => `<button class="item" data-sos="${s.sos_id}" aria-current="${!!sel && s.sos_id === sel.sos_id}"><span class="t">${esc(s.request_detail)}</span><span class="meta">${chip(L.reqType[s.request_type] || s.request_type, '', true)}<span>${s.people_count} คน</span><span>${ago(s.created_at)}</span></span></button>`).join('')}</div>` : `<div class="empty">${icon('check', 28)}<p>ไม่มีคำขอรอคัดกรอง</p></div>`;
      detail = sel ? screenForm(sel, m) : `<section class="card"><div class="empty">${icon('sos', 28)}<p>เมื่อมีคำขอใหม่ จะแสดงรายละเอียดและแบบฟอร์มคัดกรองที่นี่<br>ลองแจ้ง SOS ในมุมมองนักท่องเที่ยว</p></div></section>`;
    } else if (S.cmdTab === 'task') {
      const t = tasks.find(x => x.task_id === S.task) || shownTasks[0];
      list = `<div class="seg" role="group" aria-label="กรองภารกิจ" style="margin-bottom:10px">${Object.entries(filters).map(([k, v]) => `<button data-tfilter="${k}" aria-pressed="${S.taskFilter === k}">${v[0]} ${tasks.filter(v[1]).length}</button>`).join('')}</div>
        ${shownTasks.length ? `<div class="list">${shownTasks.map(x => `<button class="item ${x.hard_priority && OPEN.includes(x.status) ? 'hard' : ''}" data-task="${x.task_id}" aria-current="${!!t && x.task_id === t.task_id}"><span class="row between" style="flex-wrap:nowrap;align-items:start"><span class="t">${esc(x.title)}</span><span class="score ${scoreCls(x.priority.score)}" title="คะแนนลำดับ">${x.priority.score}</span></span><span class="meta">${chip(L.task[x.status], L.taskTone[x.status])}${x.hard_priority && OPEN.includes(x.status) ? chip('อันตรายถึงชีวิต', 'crit', true) : ''}${x.support_requested ? chip('ขอกำลังเสริม', 'crit', true) : ''}</span></button>`).join('')}</div>` : `<div class="empty">${icon('check', 28)}<p>ไม่มีภารกิจในกลุ่มนี้</p></div>`}`;
      detail = t ? await taskDetail(t, vols) : '';
    } else {
      const markers = ST.areas.filter(a => a.level !== 'province').map(a => { const n = tasks.filter(x => x.area_id === a.area_id && OPEN.includes(x.status)).length; return { id: a.area_id, name: a.name, x: a.x, y: a.y, r: 3.4 + n * 0.8, color: n ? (a.area_id === m.area_id ? 'var(--crit)' : 'var(--warn-fill)') : 'var(--s3)', label: String(n), sel: a.area_id === m.area_id }; });
      const sortedInc = [...incs].sort((a, b) => ((b.status === 'reported') - (a.status === 'reported')) || b.occurred_at.localeCompare(a.occurred_at));
      list = `<div class="list">${sortedInc.map(i => `<div class="item" style="cursor:default"><span class="row between" style="flex-wrap:nowrap;align-items:start"><span class="t">${esc(i.title)}</span>${chip(L.inc[i.status], L.incTone[i.status])}</span><span class="meta"><span>ความรุนแรง ${i.severity}/5</span><span>${hhmm(i.occurred_at)} น.</span>${i.status === 'reported' && can('screen_sos') ? `<button class="btn sm ghost" data-action="verify-inc" data-id="${i.incident_id}" style="margin-left:auto">ยืนยันเหตุ</button>` : ''}</span></div>`).join('')}</div>`;
      detail = `<section class="card"><div class="card-head"><h2>ภารกิจที่ยังเปิดรายพื้นที่</h2><span class="tiny">ตัวเลขในวง = จำนวนภารกิจ</span></div><div style="max-width:380px;margin:auto">${Charts.statusMap(markers)}</div>
        ${callout('เหตุที่ "ยังไม่ยืนยัน" ไม่ถูกนับในตัวชี้วัดและใช้ออกประกาศไม่ได้ จนกว่าเจ้าหน้าที่จะยืนยัน')}</section>`;
    }
    const counts = { pending: tasks.filter(t => t.status === 'pending').length, offered: tasks.filter(t => t.status === 'offered').length, active: tasks.filter(t => ['accepted', 'en_route', 'on_scene'].includes(t.status)).length };
    const ready = vols.filter(v => v.verification_status === 'verified' && v.availability === 'available' && v.active_tasks < v.max_active_tasks).length;
    return `<div class="kpis">
        ${kpi('รอคัดกรอง', queue.length, 'คำขอ', '', queue.length ? 'crit' : 'good')}${kpi('รอมอบหมาย', counts.pending, 'งาน', `อันตรายถึงชีวิต ${tasks.filter(t => t.hard_priority && t.status === 'pending').length} งาน`, counts.pending ? 'warn' : 'good')}${kpi('กำลังช่วยเหลือ', counts.active, 'งาน', `รออาสาตอบรับ ${counts.offered} งาน`)}${kpi('อาสาพร้อมออกงาน', ready, 'คน', `ติดงาน ${vols.filter(v => v.active_tasks > 0).length} คน`)}
      </div>
      <div class="split">
        <section class="card"><div class="tabs" role="tablist">${tabs.map(([k, n, c]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${S.cmdTab === k}">${n}<span class="count">${c}</span></button>`).join('')}</div>${list}</section>
        <div class="stack">${detail}</div>
      </div>`;
  }

  function screenForm(sel, m) {
    return `<section class="card"><div class="card-head"><div><span class="eyebrow">คำขอใหม่ · ${sel.tracking_no}</span><h2>${esc(sel.request_detail)}</h2></div>${chip('รอคัดกรอง', 'crit')}</div>
      <dl class="kv"><dt>ประเภท</dt><dd>${esc(L.reqType[sel.request_type] || sel.request_type)}</dd><dt>ผู้ต้องการช่วยเหลือ</dt><dd>${sel.people_count} คน · ภาษา ${sel.languages.join(', ')}</dd><dt>ตำแหน่ง</dt><dd>${esc(areaName(sel.area_id))} · คลาดเคลื่อนไม่เกิน ${sel.location_accuracy_m} ม.</dd><dt>ผู้แจ้ง</dt><dd>${esc(sel.requester)} · ${can('view_contact') ? esc(sel.contact_masked) : 'ซ่อนข้อมูลติดต่อ'}</dd><dt>รับแจ้ง</dt><dd>${hhmm(sel.created_at)} น. (${ago(sel.created_at)})</dd></dl>
      <div class="divider" style="margin:16px 0"></div>
      <form class="form" id="screen-form" data-id="${sel.sos_id}">
        <div class="field"><span class="lbl">ความเร่งด่วน</span><div class="seg" id="sc-urg" role="group">${[1, 2, 3, 4, 5].map(u => `<button type="button" data-urg="${u}" aria-pressed="${u === sel.urgency}">${u} · ${L.urg[u]}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">กลุ่มเปราะบาง</span><div class="choices">${Object.entries(L.vuln).map(([c, n]) => `<label class="choice"><input type="checkbox" name="sc-vuln" value="${c}" ${sel.vulnerability_flags.includes(c) ? 'checked' : ''}>${n}</label>`).join('')}</div></div>
        <div class="field"><span class="lbl">ทักษะที่ต้องใช้</span><div class="choices">${Object.entries(ST.skill_names).map(([c, n]) => `<label class="choice"><input type="checkbox" name="sc-skill" value="${c}">${esc(n)}</label>`).join('')}</div></div>
        <div class="grid2" style="gap:12px"><div class="field"><label for="sc-ag">หน่วยงานรับผิดชอบ</label><select id="sc-ag">${ST.agencies.filter(a => ['core', 'support'].includes(a.tier)).map(a => `<option value="${a.agency_id}" ${a.agency_id === m.agencies.lead ? 'selected' : ''}>${esc(a.short)}</option>`).join('')}</select></div>
        <div class="field"><label for="sc-inc">เชื่อมกับเหตุการณ์</label><select id="sc-inc"><option value="${m.incident_id}">${esc(m.title)}</option><option value="">ไม่เชื่อม</option></select></div></div>
        <div class="field"><label for="sc-title">ชื่อภารกิจ</label><input id="sc-title" value="${esc(sel.request_detail)}"></div>
        <label class="choice" style="justify-self:start"><input type="checkbox" id="sc-hard">อันตรายถึงชีวิต จัดคิวก่อนงานอื่นทั้งหมด</label>
        <div class="row"><button class="btn lg" type="submit" ${can('screen_sos') ? '' : 'disabled'}>${icon('check', 18)} ยืนยันและสร้างภารกิจ</button></div>${lock('screen_sos')}
      </form>
      ${tech(`ops.sos_request ${sel.sos_id} · idempotency_key ${sel.idempotency_key} · channel ${sel.channel}`)}</section>`;
  }

  async function taskDetail(t, vols) {
    const rec = await API.recommendVolunteers(t.task_id);
    const asg = (t.assignments || []).find(a => ['offered', 'accepted'].includes(a.status) && !a.released_at);
    const vol = asg ? vols.find(v => v.volunteer_id === asg.volunteer_id) : null;
    const flow = ['pending', 'offered', 'accepted', 'en_route', 'on_scene', 'completed'];
    const fi = flow.indexOf(t.status);
    const elig = rec.filter(r => r.eligible), inelig = rec.filter(r => !r.eligible);
    const p = t.priority, c = p.components;
    const next = L.taskNext[t.status];
    const leftMin = asg && asg.status === 'offered' ? Math.max(0, Math.round((new Date(asg.expires_at) - NOW) / 60000)) : null;
    const volCard = (r, i) => `<div class="vol ${i === 0 ? 'best' : ''}"><div class="vh"><div>${i === 0 ? '<span class="badge-best">เหมาะที่สุด</span>' : ''}<b>${esc(r.volunteer.display_name)}</b>${agencyPill(r.volunteer.agency_id)}</div><span class="score lo" title="คะแนนความเหมาะสม">${r.score}</span></div>
      <div>${r.skills.map(s => `<span class="tag ${s.has && s.valid ? 'ok' : s.has ? 'bad' : ''}">${esc(s.name)}</span>`).join('')}</div>
      <div class="facts"><span>${icon('route', 14)} ${r.distance_km} กม. · ~${r.eta_min} นาที</span><span>งาน ${r.active_tasks}/${r.volunteer.max_active_tasks}</span>${r.warn.length ? `<span style="color:var(--warn)">${esc(r.warn[0])}</span>` : ''}</div>
      ${t.status === 'pending' ? `<button class="btn sm ${i === 0 ? '' : 'ghost'}" data-action="offer" data-id="${t.task_id}" data-vol="${r.volunteer.volunteer_id}" ${can('assign') ? '' : 'disabled'}>เสนองาน</button>` : ''}</div>`;
    return `<section class="card"><div class="card-head"><div><span class="eyebrow">ภารกิจ · ${esc(areaName(t.area_id))} · ${esc(agencyShort(t.assigned_agency_id))}</span><h2>${esc(t.title)}</h2></div><div class="row">${t.hard_priority ? chip('อันตรายถึงชีวิต', 'crit', true) : ''}${chip(L.task[t.status], L.taskTone[t.status])}</div></div>
      ${t.status !== 'cancelled' ? `<div class="steps" style="margin:6px 0 16px">${['รอมอบหมาย', 'เสนองาน', 'รับงาน', 'เดินทาง', 'ถึงที่เกิดเหตุ', 'เสร็จสิ้น'].map((s, i) => `<div class="st ${i < fi || t.status === 'completed' ? 'done' : i === fi ? 'cur' : ''}">${s}</div>`).join('')}</div>` : callout('ภารกิจนี้ถูกยกเลิก', 'crit', 'x')}
      <dl class="kv"><dt>ทักษะที่ต้องใช้</dt><dd>${t.required_skills.map(s => `<span class="tag">${esc(skillName(s))}</span>`).join('') || '—'}</dd><dt>ต้องเสร็จภายใน</dt><dd>${hhmm(t.due_at)} น.</dd>
      ${vol ? `<dt>ผู้รับผิดชอบ</dt><dd><b>${esc(vol.display_name)}</b> ${agencyPill(vol.agency_id)}${asg.status === 'offered' ? `<br><span class="small">รอตอบรับ เหลือเวลา <b class="tnum">${leftMin} นาที</b> ถ้าไม่ตอบงานจะกลับเข้าคิว</span>` : ''}</dd>` : ''}</dl>
      <div class="row" style="margin-top:14px">
        ${next && can('task_update') ? `<button class="btn" data-action="task-status" data-id="${t.task_id}" data-status="${next[0]}" data-version="${t.version}">${next[1]}</button>` : ''}
        ${asg && asg.status === 'offered' && can('assign') ? `<button class="btn ghost" data-action="expire" data-id="${t.task_id}">จำลองหมดเวลาตอบรับ</button>` : ''}
        ${!['completed', 'cancelled'].includes(t.status) && can('task_update') ? `<button class="btn quiet" data-action="task-cancel" data-id="${t.task_id}" data-version="${t.version}" style="color:var(--crit)">ยกเลิกภารกิจ</button>` : ''}
      </div>
      ${t.support_requested ? `<div style="margin-top:12px">${callout(`อาสาขอกำลังเสริม ${hhmm(t.support_requested.at)} น.: ${esc(t.support_requested.note)}`, 'crit', 'alert')}</div>` : ''}
    </section>
    ${t.status === 'pending' ? `<section class="card"><div class="card-head"><div><h2>อาสาสมัครที่เหมาะสม</h2><p>เรียงตามทักษะที่ตรง พื้นที่ และระยะทางโดยประมาณ</p></div></div>
      ${elig.length ? `<div class="vols">${elig.slice(0, 6).map(volCard).join('')}</div>` : callout('ยังไม่มีอาสาสมัครที่เข้าเงื่อนไข ลองขอกำลังจากหน่วยสนับสนุน', 'warn', 'alert')}
      ${inelig.length ? `<details class="more" style="margin-top:12px"><summary>ไม่เข้าเงื่อนไข ${inelig.length} คน</summary>${table(['อาสาสมัคร', 'เหตุผล'], inelig.map(r => ({ cells: [`${esc(r.volunteer.display_name)} · ${esc(agencyShort(r.volunteer.agency_id))}`, `<span class="small">${esc(r.reasons.join(' · '))}</span>`] })))}</details>` : ''}
      ${lock('assign')}</section>` : ''}
    <section class="card"><details class="more" style="border:0;padding:0"><summary>ทำไมได้คะแนนลำดับ ${p.score}${p.override ? ' (ปรับโดยเจ้าหน้าที่)' : ''}</summary>
      <div class="stack" style="margin-top:10px">${[['ความเร่งด่วน', c.urgency, `ระดับ ${c.urgency.value}/5`], ['กลุ่มเปราะบาง', c.vulnerability, c.vulnerability.flags.map(f => L.vuln[f] || f).join(', ') || 'ไม่มี'], ['ความรุนแรงของพื้นที่', c.area_severity, `เหตุหลักระดับ ${c.area_severity.severity ?? '—'}`], ['เวลารอ', c.wait, `${c.wait.minutes} นาที`]].map(([n, x, d]) => `<div class="bar-row"><span>${n}<br><span class="tiny">${esc(d)}</span></span><div class="track"><div class="fill" style="width:${x.norm * 100}%"></div></div><span class="tnum">${x.points}/${x.weight}</span></div>`).join('')}
      ${p.override ? `<p class="small">คะแนนคำนวณ ${p.computed_score} · ปรับโดย ${esc(userName(p.override.by))}: ${esc(p.override.reason)}</p>` : ''}
      ${can('assign') && !['completed', 'cancelled'].includes(t.status) ? `<div><button class="btn sm ghost" data-action="override" data-id="${t.task_id}" data-score="${p.score}">ปรับคะแนนลำดับ</button></div>` : ''}
      <p class="tiny">น้ำหนักเป็นข้อเสนอเพื่อเวิร์กช็อปกับเจ้าหน้าที่ ไม่ใช่เกณฑ์ทางการแพทย์${techI(`rule ${p.rule_version} · task v${t.version}`)}</p></div></details></section>
    <section class="card"><h2 style="margin-bottom:12px">ความคืบหน้า</h2>${timeline(t.events.map(e => ({ ts: e.occurred_at, text: taskEvText(e), note: e.note })))}</section>`;
  }

  /* ================================================================ ALERTS */
  async function screenAlerts() {
    const [m, alerts, signals] = await Promise.all([API.getMajorIncident(S.scenario), API.getAlerts(S.scenario), API.getSignals(S.scenario)]);
    const order = { review: 0, approved: 1, draft: 2, rejected: 3, published: 4, expired: 5 };
    const sorted = [...alerts].sort((a, b) => order[a.status] - order[b.status]);
    const a = alerts.find(x => x.alert_id === S.alert) || sorted[0];
    let editor = `<section class="card"><div class="empty">${icon('megaphone', 28)}<p>ยังไม่มีประกาศในเหตุการณ์นี้</p></div></section>`;
    if (a) {
      const langs = [['th', 'ไทย'], ['en', 'English'], ['zh', '中文']];
      const LN = { th: 'ภาษาไทย', en: 'ภาษาอังกฤษ', zh: 'ภาษาจีน' };
      const checks = [...langs.map(([l]) => [`${LN[l]}มีผู้ตรวจแล้ว`, !!(a.translations[l].message && a.translations[l].reviewed_by)]), ['เหตุที่อ้างอิงยืนยันแล้ว', m.status !== 'reported']];
      const ready = checks.every(x => x[1]);
      const tr = a.translations[S.lang];
      const editable = can('draft_alert') && ['draft', 'rejected', 'review'].includes(a.status);
      const acts = [];
      if (['draft', 'rejected'].includes(a.status)) acts.push(`<button class="btn" data-action="alert" data-op="submit" data-id="${a.alert_id}" ${can('draft_alert') ? '' : 'disabled'}>ส่งให้ผู้บัญชาการทบทวน</button>`);
      if (a.status === 'review') { acts.push(`<button class="btn" data-action="alert" data-op="approve" data-id="${a.alert_id}" ${can('approve_alert') ? '' : 'disabled'}>${icon('check', 17)} อนุมัติ</button>`); acts.push(`<button class="btn ghost" data-action="alert-reject" data-id="${a.alert_id}" ${can('approve_alert') ? '' : 'disabled'}>ส่งกลับแก้ไข</button>`); }
      if (a.status === 'approved') acts.push(`<button class="btn" data-action="alert" data-op="publish" data-id="${a.alert_id}" ${can('publish_alert') ? '' : 'disabled'}>${icon('megaphone', 17)} เผยแพร่ทุกช่องทาง</button>`);
      if (a.status === 'published' && can('ack_alert') && !(a.acks || []).some(k => k.actor === actor())) acts.push(`<button class="btn" data-action="ack" data-id="${a.alert_id}">${icon('check', 17)} รับทราบในนามหน่วยงาน</button>`);
      const needPerm = a.status === 'review' ? 'approve_alert' : a.status === 'approved' ? 'publish_alert' : ['draft', 'rejected'].includes(a.status) ? 'draft_alert' : null;
      const trBody = tr.message
        ? `<div class="msg"><h4>${esc(tr.title)}</h4>${esc(tr.message)}</div><div class="row between" style="margin-top:8px"><span class="small">${tr.reviewed_by ? `ตรวจภาษาแล้วโดย ${esc(userName(tr.reviewed_by))}` : 'ยังไม่มีผู้ตรวจภาษา'}</span>${!tr.reviewed_by && (can('draft_alert') || can('approve_alert')) && a.status !== 'published' ? `<button class="btn sm ghost" data-action="review-tr" data-id="${a.alert_id}" data-lang="${S.lang}">ยืนยันคำแปล</button>` : ''}</div>`
        : editable ? `<form class="form" id="tr-form" data-id="${a.alert_id}" data-lang="${S.lang}"><div class="field"><label for="tr-title">หัวข้อ</label><input id="tr-title"></div><div class="field"><label for="tr-msg">ข้อความ</label><textarea id="tr-msg" rows="3"></textarea></div><div><button class="btn sm" type="submit">บันทึกข้อความ</button></div></form>` : '<div class="empty">ยังไม่มีข้อความภาษานี้</div>';
      editor = `<section class="card"><div class="card-head"><div><span class="eyebrow">${esc(a.audience)}</span><h2>${lvl(a.level)} ${esc(a.translations.th.title)}</h2></div>${chip(L.alert[a.status], L.alertTone[a.status])}</div>
        ${['review', 'draft', 'rejected', 'approved'].includes(a.status) ? `<div class="callout ${ready ? 'good' : 'warn'}" style="margin-bottom:14px">${icon(ready ? 'check' : 'alert', 17)}<div><b>${ready ? 'พร้อมอนุมัติ' : 'ยังไม่พร้อมอนุมัติ'}</b><div class="checklist" style="margin-top:6px">${checks.map(([t2, ok]) => `<div class="ck ${ok ? 'ok' : 'no'}"><span class="m">${ok ? '✓' : '✕'}</span>${t2}</div>`).join('')}</div></div></div>` : ''}
        <div class="tabs" role="tablist">${langs.map(([l, n]) => { const t2 = a.translations[l]; return `<button class="tab" role="tab" data-lang="${l}" aria-selected="${S.lang === l}">${n} ${t2.message && t2.reviewed_by ? `<span style="color:var(--good)">${icon('check', 14)}</span>` : t2.message ? '<span class="count">รอตรวจ</span>' : '<span class="count">ว่าง</span>'}</button>`; }).join('')}</div>
        ${trBody}
        <div class="row" style="margin-top:16px">${acts.join('')}</div>${needPerm ? lock(needPerm) : ''}
        <div class="divider" style="margin:16px 0"></div>
        <div class="stack"><div><div class="eyebrow">ช่องทาง</div>${a.channels.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
          <div><div class="eyebrow">หน่วยงานที่ต้องรับทราบ ${a.status === 'published' ? `· ${(a.acks || []).length}/${(a.target_agencies || []).length}` : ''}</div>${(a.target_agencies || []).map(id => { const k = (a.acks || []).find(x => x.agency_id === id); return agencyPill(id, k ? ` ✓ ${hhmm(k.at)}` : ''); }).join('')}</div>
          ${a.deliveries.length ? `<div><div class="eyebrow">ผลการส่ง</div>${table(['ช่องทาง', '#ส่ง', '#ถึงผู้รับ', '#เปิดรับทราบ', '#ไม่สำเร็จ'], a.deliveries.map(dv => ({ cells: [esc(dv.channel), dv.sent.toLocaleString(), dv.delivered.toLocaleString(), dv.acknowledged.toLocaleString(), dv.failed] })))}<p class="tiny" style="margin-top:6px">ส่งถึงผู้รับไม่ได้แปลว่ารับทราบแล้ว ระบบนับแยกกัน · เดโมไม่ส่งข้อความออกจริง</p></div>` : ''}
          <details class="more"><summary>ประวัติประกาศ</summary>${timeline(a.history.map(h => ({ ts: h.ts, text: `${h.action} · ${userName(h.actor)}` })))}</details></div>
        ${tech(`ops.alert ${a.alert_id} · incident ${a.incident_id} · POST /v1/alerts/{id}/publish → outbox`)}</section>`;
    }
    return `<div class="split">
      <div class="stack">
        <section class="card"><div class="card-head"><h2>ประกาศ</h2>${can('draft_alert') ? `<button class="btn sm" data-action="new-alert">${icon('plus', 15)} ร่างประกาศ</button>` : ''}</div>
          <div class="list">${sorted.map(x => `<button class="item" data-alert="${x.alert_id}" aria-current="${!!a && x.alert_id === a.alert_id}"><span class="row" style="flex-wrap:nowrap;align-items:start">${lvl(x.level)}<span class="t">${esc(x.translations.th.title || '(ไม่มีหัวข้อ)')}</span></span><span class="meta">${chip(L.alert[x.status], L.alertTone[x.status])}<span>${esc(x.audience)}</span></span></button>`).join('') || '<div class="empty">ยังไม่มีประกาศ</div>'}</div></section>
        <section class="card"><div class="card-head"><div><h2>ข่าวจากโซเชียล</h2><p>ข่าวที่ยังไม่ยืนยันใช้ออกประกาศไม่ได้</p></div></div>
          <div class="list">${signals.map(s => `<div class="item" style="cursor:default"><span>${esc(s.text)}</span><span class="meta">${chip(L.sig[s.verification_status], L.sigTone[s.verification_status])}<span>${s.language.toUpperCase()} · ความเชื่อมั่น ${Math.round(s.confidence * 100)}%</span>${s.verification_status === 'unverified' && can('screen_sos') ? `<span style="margin-left:auto" class="row"><button class="btn sm ghost" data-action="sig" data-id="${s.signal_id}" data-status="verified">ยืนยัน</button><button class="btn sm quiet" data-action="sig" data-id="${s.signal_id}" data-status="rejected">ไม่จริง</button></span>` : ''}</span></div>`).join('')}</div></section>
      </div>
      <div class="stack">${editor}</div></div>`;
  }

  /* ================================================================ MY TASKS */
  async function screenMyTasks() {
    const [tasks, vols] = await Promise.all([API.getTasks(), API.getVolunteers()]);
    const me = vols.find(v => v.volunteer_id === S.persona) || vols[0];
    const mine = tasks.filter(t => (t.assignments || []).some(a => a.volunteer_id === me.volunteer_id));
    const offered = mine.filter(t => t.status === 'offered' && t.assignments.some(a => a.status === 'offered' && a.volunteer_id === me.volunteer_id));
    const active = mine.filter(t => ['accepted', 'en_route', 'on_scene'].includes(t.status) && t.assignments.some(a => a.status === 'accepted' && a.volunteer_id === me.volunteer_id));
    const history = mine.filter(t => !offered.includes(t) && !active.includes(t));
    const info = t => `<div class="row small" style="gap:14px"><span>${icon('map', 14)} ${esc(areaName(t.area_id))}</span><span>${icon('clock', 14)} ต้องเสร็จ ${hhmm(t.due_at)} น.</span><span>${icon('users', 14)} ${t.required_skills.map(skillName).join(', ')}</span></div>`;
    return `<div class="stack" style="max-width:760px;width:100%;gap:16px">
      <section class="card"><div class="row between"><div class="row"><span class="avatar" style="width:44px;height:44px">${esc(me.volunteer_id.slice(1))}</span><div><h2>${esc(me.display_name)}</h2><span class="small">${esc(agencyName(me.agency_id))}</span></div></div><div class="row">${chip(L.verif[me.verification_status], L.verifTone[me.verification_status])}${chip(L.vol[me.availability], L.volTone[me.availability])}</div></div>
        <div style="margin-top:10px">${me.skills.map(s => `<span class="tag ${s.valid ? '' : 'bad'}">${esc(s.name)}${s.valid_until ? ` · ถึง ${s.valid_until}` : ''}</span>`).join('')}</div>
        ${me.verification_status !== 'verified' ? `<div style="margin-top:10px">${callout('บัญชีนี้ยังไม่ผ่านการตรวจสอบหรือถูกระงับ ระบบจะไม่เสนองานให้', 'warn', 'alert')}</div>` : ''}</section>
      <div class="row"><h2>ข้อเสนองาน</h2>${offered.length ? chip(offered.length + ' งานรอคำตอบ', 'warn') : ''}</div>
      ${offered.map(t => { const a = t.assignments.find(x => x.status === 'offered'); const left = Math.max(0, Math.round((new Date(a.expires_at) - NOW) / 60000)); return `<section class="card" style="border-color:var(--accent)"><div class="row between"><h3>${esc(t.title)}</h3>${t.hard_priority ? chip('อันตรายถึงชีวิต', 'crit', true) : ''}</div>${info(t)}
        <p class="small" style="margin-top:6px">ตอบภายใน <b class="tnum" style="color:var(--crit)">${left} นาที</b> ถ้าไม่ตอบงานจะส่งให้คนอื่น</p>
        <div class="row" style="margin-top:12px"><button class="btn lg" data-action="respond" data-id="${t.task_id}" data-resp="accept">${icon('check', 18)} รับงาน</button><button class="btn lg ghost" data-action="respond" data-id="${t.task_id}" data-resp="decline">ปฏิเสธ</button></div></section>`; }).join('') || `<div class="card flat empty">${icon('clipboard', 26)}<p>ไม่มีข้อเสนองานตอนนี้</p></div>`}
      <h2>งานที่กำลังทำ</h2>
      ${active.map(t => { const nx = L.taskNext[t.status]; const fi = ['accepted', 'en_route', 'on_scene', 'completed'].indexOf(t.status); return `<section class="card"><div class="row between"><h3>${esc(t.title)}</h3>${chip(L.task[t.status], L.taskTone[t.status])}</div>${info(t)}
        <div class="steps" style="margin:14px 0">${['รับงาน', 'เดินทาง', 'ถึงที่เกิดเหตุ', 'เสร็จสิ้น'].map((s, i) => `<div class="st ${i < fi ? 'done' : i === fi ? 'cur' : ''}">${s}</div>`).join('')}</div>
        <div class="row"><button class="btn lg" data-action="task-status" data-id="${t.task_id}" data-status="${nx[0]}" data-version="${t.version}">${nx[1]}</button><button class="btn ghost" data-action="support" data-id="${t.task_id}">${icon('alert', 16)} ขอกำลังเสริม</button></div>
        ${t.support_requested ? `<div style="margin-top:10px">${callout(`ส่งคำขอกำลังเสริมแล้ว ${hhmm(t.support_requested.at)} น.`, 'info')}</div>` : ''}</section>`; }).join('') || `<div class="card flat empty">${icon('check', 26)}<p>ไม่มีงานที่กำลังทำ</p></div>`}
      ${history.length ? `<details class="more"><summary>ประวัติงาน ${history.length} รายการ</summary>${table(['ภารกิจ', 'ผล', 'สถานะงาน'], history.map(t => { const a = [...t.assignments].reverse().find(x => x.volunteer_id === me.volunteer_id); return { cells: [esc(t.title), a ? ({ accepted: 'รับงาน', declined: 'ปฏิเสธ', expired: 'หมดเวลา', released: 'ปล่อยงาน' }[a.status] || a.status) : '—', chip(L.task[t.status], L.taskTone[t.status])] }; }))}</details>` : ''}
    </div>`;
  }

  /* ================================================================ SOS */
  async function screenSOS() {
    const area = S.sosArea || 'A1';
    const alerts = await API.getPublicAlerts(area);
    const tracks = []; for (const no of S.tracking) { const r = await API.trackSOS(no); if (r.tracking_no) tracks.push(r); }
    const stages = ['รับคำขอ', 'คัดกรอง', 'มีผู้รับงาน', 'เดินทาง', 'ถึงที่เกิดเหตุ', 'เสร็จสิ้น'];
    return `<div class="grid2" style="align-items:start">
      <section class="card"><div class="card-head"><div><h2>ขอความช่วยเหลือ</h2><p>หากมีอันตรายถึงชีวิตให้โทร 1669 หรือ 191 ควบคู่ไปด้วย</p></div></div>
        <form class="form" id="sos-form">
          <div class="field"><span class="lbl">เกิดอะไรขึ้น</span><div class="tiles">${['trapped', 'medical', 'marine', 'missing', 'evacuate', 'stranded', 'shelter', 'other'].map(c => `<label class="tile"><input type="radio" name="sos-type" value="${c}" ${S.sosType === c ? 'checked' : ''}>${icon(L.reqIcon[c], 22)}${L.reqType[c]}</label>`).join('')}</div></div>
          <div class="grid2" style="gap:12px"><div class="field"><label for="sos-area">อยู่ที่ไหน</label><select id="sos-area">${ST.areas.filter(a => a.level !== 'province').map(a => `<option value="${a.area_id}" ${a.area_id === area ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select><span class="hint">ใช้ตำแหน่งจากโทรศัพท์ คลาดเคลื่อน ~25 ม.</span></div>
          <div class="field"><label for="sos-people">มีกี่คน</label><div class="stepper-input"><button type="button" data-step="-1" aria-label="ลดจำนวน">−</button><input id="sos-people" type="number" min="0" value="1"><button type="button" data-step="1" aria-label="เพิ่มจำนวน">+</button></div></div></div>
          <div class="field"><span class="lbl">เร่งด่วนแค่ไหน</span><div class="seg" id="sos-urg">${[[2, 'รอได้'], [3, 'ต้องการเร็ว'], [5, 'อันตรายถึงชีวิต']].map(([u, n]) => `<button type="button" data-surg="${u}" aria-pressed="${S.sosUrg === u}">${n}</button>`).join('')}</div></div>
          <div class="field"><label for="sos-detail">รายละเอียด</label><textarea id="sos-detail" rows="3" placeholder="เช่น ติดอยู่ชั้น 1 โรงแรม น้ำสูงถึงเอว มีเด็ก 1 คน"></textarea></div>
          <div class="field"><span class="lbl">มีกลุ่มเปราะบางไหม</span><div class="choices">${Object.entries(L.vuln).map(([c, n]) => `<label class="choice"><input type="checkbox" name="sos-vuln" value="${c}">${n}</label>`).join('')}</div></div>
          <div class="field"><label for="sos-contact">เบอร์ติดต่อกลับ</label><input id="sos-contact" placeholder="08x-xxx-xxxx" inputmode="tel"><span class="hint">เข้ารหัสก่อนบันทึก เจ้าหน้าที่เห็นแบบปิดบังบางส่วน</span></div>
          <div class="row"><button class="btn lg" type="submit">${icon('sos', 18)} ส่งคำขอ</button>${S.sosKey ? `<button class="btn ghost" type="button" data-action="sos-resend">ส่งซ้ำ</button>` : ''}</div>
          ${tech(`POST /v1/sos · Idempotency-Key: ${S.sosKey || '(สร้างเมื่อกดส่ง)'} · Rate limit 3/นาที`)}
        </form></section>
      <div class="stack">
        <section class="card"><div class="card-head"><h2>ติดตามคำขอ</h2></div>
          ${tracks.map(r => `<div class="stack" style="gap:10px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:14px"><div class="row between"><b class="mono" style="font-size:15px">${r.tracking_no}</b>${chip(r.stage >= 6 ? 'เสร็จสิ้น' : stages[Math.max(0, r.stage - 1)], r.stage >= 6 ? 'good' : 'info')}</div>
            <div class="steps">${stages.map((s, i) => `<div class="st ${i + 1 < r.stage || r.stage >= 6 ? 'done' : i + 1 === r.stage ? 'cur' : ''}">${s}</div>`).join('')}</div>${timeline(r.events)}</div>`).join('') || `<div class="empty">${icon('search', 26)}<p>ส่งคำขอแล้วเลขติดตามจะแสดงที่นี่<br>หรือลองเลขตัวอย่าง TRK-2569-1007</p></div>`}
          <form class="row" id="track-form" style="flex-wrap:nowrap"><input class="input" id="track-no" placeholder="เลขติดตาม เช่น TRK-2569-1007" aria-label="เลขติดตาม"><button class="btn ghost" type="submit">ติดตาม</button></form></section>
        <section class="card"><div class="card-head"><h2>ประกาศในพื้นที่ ${esc(areaName(area))}</h2></div>
          ${alerts.map(a => `<div class="msg" style="margin-bottom:10px"><h4>${lvl(a.level)} ${esc(a.translations.th.title)}</h4>${esc(a.translations.th.message)}<p class="small" style="margin-top:8px">EN · ${esc(a.translations.en.message)}</p><p class="small">中文 · ${esc(a.translations.zh.message)}</p></div>`).join('') || '<p class="muted">ไม่มีประกาศในพื้นที่นี้ตอนนี้</p>'}</section>
      </div></div>`;
  }

  /* ================================================================ ANALYTICS */
  async function screenAnalytics() {
    const [k, byArea, defs, incs, hm] = await Promise.all([API.getKPIs(S.scenario, S.filterArea || null), API.getKPIByArea(S.scenario), API.getKPIDefs(), API.getIncidents(S.scenario), API.getHeatmap(S.scenario)]);
    const hours = [10, 11, 12, 13, 14];
    const cum = hours.map(h => incs.filter(x => x.status !== 'reported' && new Date(x.occurred_at).getHours() <= h).length);
    const bar = Charts.bar(hours.map((h, i) => ({ label: `${h}:00`, value: cum[i], hl: i === 4 })), { height: 170, ariaLabel: 'เหตุที่ยืนยันสะสม' });
    const colors = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'], labels = ['11:00', '12:00', '13:00', '14:00'];
    const series = ST.areas.filter(a => a.level !== 'province').map((a, i) => ({ name: a.name, color: colors[i], values: labels.map((_, ti) => { const rows = hm.windows.filter(w => new Date(w.window_start).getHours() === 11 + ti && (hm.cells.find(c => c.cell_id === w.cell_id) || {}).area_id === a.area_id); if (rows.some(r => r.estimated_count == null)) return null; return rows.reduce((s, r) => s + r.estimated_count, 0); }) }));
    return `<div class="row between"><div class="seg" role="group" aria-label="พื้นที่"><button data-farea="" aria-pressed="${!S.filterArea}">ทุกพื้นที่</button>${ST.areas.filter(a => a.level !== 'province').map(a => `<button data-farea="${a.area_id}" aria-pressed="${S.filterArea === a.area_id}">${esc(a.name)}</button>`).join('')}</div>
      <div class="row"><span class="tiny">ข้อมูล ณ ${hhmm(k.snapshot_at)} น.</span><button class="btn sm ghost" data-action="export" ${can('export') ? '' : 'disabled'}>ส่งออกรายงาน</button></div></div>
    <div class="kpis six">${kpi('เหตุที่ยืนยันแล้ว', k.incidents_confirmed, 'เหตุ')}${kpi('คำขอที่ยังเปิด', k.sos_open, 'รายการ', `ใหม่ ${k.sos_new}`)}${kpi('เวลาเริ่มตอบสนอง', k.resp_start_p50, 'นาที', `ค่ากลาง · 95% ภายใน ${k.resp_start_p95 ?? '—'} นาที`)}${kpi('อาสารับงานเมื่อถูกเสนอ', k.accept_rate, '%', `จาก ${k.offers_n} ครั้ง`)}${kpi('งานเสร็จตามเวลา', k.sla_rate, '%', `${k.sla_n} งานที่ถึงกำหนด`)}${kpi('ความหนาแน่นสูงสุดพื้นที่เสี่ยง', k.density_risk_max ? k.density_risk_max.toLocaleString() : null, 'คน/ตร.กม.', 'ค่าประมาณ')}</div>
    <div class="grid2">
      <section class="card"><div class="card-head"><h2>เหตุที่ยืนยันสะสม</h2><span class="tiny">เหตุ</span></div>${bar}</section>
      <section class="card"><div class="card-head"><h2>จำนวนคนรายพื้นที่</h2><button class="btn sm quiet" data-action="chart-table">${S.chartTable ? 'ดูกราฟ' : 'ดูเป็นตาราง'}</button></div>${S.chartTable ? table(['พื้นที่', ...labels.map(l => '#' + l)], series.map(s => ({ cells: [esc(s.name), ...s.values.map(v => v == null ? '<span class="muted">ไม่มีข้อมูล</span>' : v)] }))) : Charts.lines(series, labels, { height: 200, ariaLabel: 'จำนวนคนรายพื้นที่' })}<p class="tiny" style="margin-top:6px">เส้นขาดคือช่วงที่ไม่มีข้อมูล ไม่ใช่ศูนย์คน</p></section>
    </div>
    <section class="card"><div class="card-head"><h2>เทียบรายพื้นที่</h2><span class="tiny">คลิกแถวเพื่อกรอง</span></div>${table(['พื้นที่', '#เหตุยืนยัน', '#SOS ค้าง', '#รอมอบหมาย', '#ตอบสนอง (นาที)', '#อาสาพร้อม', '#ข้อมูลตรงเวลา %'], byArea.map(r => ({ attrs: ` class="clickable ${S.filterArea === r.area.area_id ? 'selected' : ''}" data-farea="${r.area.area_id}"`, cells: [`<b>${esc(r.area.name)}</b>`, r.kpi.incidents_confirmed, r.kpi.sos_open, r.kpi.tasks_pending, r.kpi.resp_start_p50 ?? '—', r.kpi.volunteers_ready, r.kpi.data_on_time ?? '—'] })))}</section>
    <section class="card"><details class="more" style="border:0;padding:0"><summary>นิยามตัวชี้วัด ${defs.length} ตัว</summary>${table(['ตัวชี้วัด', 'หน่วย', 'วิธีคำนวณ', 'ข้อควรระวัง', 'เจ้าของ'], defs.map(d => ({ cells: [`<b>${esc(d.name)}</b>${techI(`${d.kpi_code} v${d.version}`)}`, esc(d.unit), `<span class="small">${esc(d.formula)}</span>`, `<span class="small">${esc(d.limitation)}</span>`, esc(agencyShort(d.owner_agency_id))] })))}</details></section>`;
  }

  /* ================================================================ RISK */
  async function screenRisk() {
    const r = await API.getRisk();
    const areas = ST.areas.filter(a => a.level !== 'province');
    const sel = areas.find(a => a.area_id === S.riskArea) || areas[0];
    const top = aid => r.assessments.filter(x => x.area_id === aid).sort((a, b) => b.risk_score - a.risk_score)[0];
    const map = Charts.statusMap(areas.map(a => { const t = top(a.area_id); return { id: a.area_id, name: a.name, x: a.x, y: a.y, r: 3.5 + t.risk_score / 25, color: Charts.seqColor(t.risk_score, 100), ink: Charts.seqInk(t.risk_score, 100), label: String(t.risk_score), sel: a.area_id === sel.area_id }; }), 'แผนที่เชิงสัญลักษณ์ · ไม่ใช่พิกัดจริง');
    const rows = r.assessments.filter(x => x.area_id === sel.area_id).sort((a, b) => b.risk_score - a.risk_score);
    const zones = r.zones.filter(z => z.area_id === sel.area_id);
    return `<div class="grid2">
      <section class="card"><div class="card-head"><h2>คะแนนความเสี่ยงสูงสุดรายพื้นที่</h2><span class="tiny">คลิกพื้นที่</span></div><div style="max-width:380px;margin:auto">${map}</div>
        <div class="legend"><span>ต่ำ</span>${[10, 30, 50, 70, 90].map(v => `<i class="swatch" style="background:${Charts.seqColor(v, 100)}"></i>`).join('')}<span>สูง (0–100)</span></div></section>
      <section class="card"><div class="card-head"><h2>${esc(sel.name)}</h2>${chip(`เสี่ยงสุด: ${hazardName(rows[0].hazard_code)}`, rows[0].risk_score >= 70 ? 'crit' : 'warn', true)}</div>
        <div class="stack">${rows.map(x => `<div class="bar-row" style="grid-template-columns:150px minmax(0,1fr) 48px"><span>${esc(hazardName(x.hazard_code))}<br><span class="tiny">ความเชื่อมั่น ${Math.round(x.confidence * 100)}%</span></span><div class="track"><div class="fill" style="width:${x.risk_score}%;background:${Charts.seqColor(x.risk_score, 100)}"></div></div><span class="score ${scoreCls(x.risk_score)}">${x.risk_score}</span></div>`).join('')}</div>
        <div class="divider" style="margin:14px 0"></div>
        <dl class="kv"><dt>ปัจจัยที่ใช้</dt><dd>${rows[0].explanation.inputs.map(esc).join(' · ')}</dd><dt>วิธีประเมิน</dt><dd>${esc(rows[0].explanation.note)} · ${esc(rows[0].explanation.weights)}${techI(rows[0].method)}</dd><dt>พื้นที่เสี่ยงที่ประกาศ</dt><dd>${zones.map(z => `${esc(hazardName(z.hazard_code))} ระดับ ${z.level} <span class="tiny">(${esc(z.evidence_reference)})</span>`).join('<br>') || '—'}</dd></dl>
        <p class="tiny" style="margin-top:8px">ยังไม่ใช้โมเดลพยากรณ์ จนกว่าจะมีข้อมูลย้อนหลังเพียงพอ</p></section>
    </div>
    <section class="card"><div class="card-head"><h2>ทะเบียนความเสี่ยงทุกพื้นที่</h2></div>${table(['พื้นที่', ...ST.hazard_types.map(h => '#' + h.name.split(' /')[0])], areas.map(a => ({ attrs: ` class="clickable ${a.area_id === sel.area_id ? 'selected' : ''}" data-risk="${a.area_id}"`, cells: [`<b>${esc(a.name)}</b>`, ...ST.hazard_types.map(h => { const x = r.assessments.find(y => y.area_id === a.area_id && y.hazard_code === h.hazard_code); return `<span class="score" style="background:${Charts.seqColor(x.risk_score, 100)};color:${Charts.seqInk(x.risk_score, 100)}">${x.risk_score}</span>`; })] })))}</section>
    <section class="card"><div class="card-head"><h2>เหตุย้อนหลัง 12 เดือน</h2><span class="tiny">ทุกพื้นที่ · ค่าจำลอง</span></div>${Charts.bar(r.monthly.map((m, i) => ({ label: m.month.slice(2).replace('-', '/'), value: m.count, hl: i === r.monthly.length - 1 })), { height: 160, ariaLabel: 'เหตุรายเดือน' })}</section>`;
  }

  /* ================================================================ HEATMAP */
  async function screenHeatmap() {
    const [m, hm] = await Promise.all([API.getMajorIncident(S.scenario), API.getHeatmap(S.scenario, { publicView: S.publicView })]);
    const hours = [11, 12, 13, 14];
    const get = (cid, h) => hm.windows.find(w => w.cell_id === cid && new Date(w.window_start).getHours() === h);
    const max = Math.max(...hm.windows.map(w => w.estimated_count || 0));
    const defCell = m.area_id === 'A1' ? 'C-PTG-1' : m.area_id === 'A4' ? 'C-CHL-1' : 'C-OLD-1';
    const selC = (S.cell && get(S.cell[0], S.cell[1])) || get(defCell, 14);
    const cell = hm.cells.find(c => c.cell_id === selC.cell_id);
    const flow = hm.flow.find(f => f.cell_id === selC.cell_id);
    const endT = new Date(new Date(selC.window_start).getTime() + 3600e3).toISOString();
    return `<div class="row between"><p class="sub">จำนวนคนโดยประมาณในแต่ละพื้นที่ย่อย ณ ช่วงเวลา ไม่ใช่จำนวนนักท่องเที่ยวไม่ซ้ำและไม่ใช่จำนวนผู้ประสบภัย</p><label class="choice"><input type="checkbox" id="pub-view" ${S.publicView ? 'checked' : ''}>มุมมองสาธารณะ (ซ่อนค่าน้อยกว่า 10)</label></div>
    <section class="card"><div class="table-wrap" style="border:0"><div class="matrix" style="min-width:560px"><span></span>${hours.map(h => `<span class="hdr">${h}:00–${h + 1}:00</span>`).join('')}
      ${hm.cells.map(c => `<span class="rowlbl"><b>${esc(c.name.split(' · ')[1] || c.name)}</b><span class="tiny">${esc(c.name.split(' · ')[0])}</span></span>` + hours.map(h => { const w = get(c.cell_id, h); const on = selC.cell_id === c.cell_id && new Date(selC.window_start).getHours() === h; if (!w || w.estimated_count == null) return `<button class="cell missing" data-cell="${c.cell_id}:${h}" aria-pressed="${on}">${w && w.suppressed_public ? 'ซ่อน' : 'ไม่มีข้อมูล'}</button>`; return `<button class="cell" data-cell="${c.cell_id}:${h}" aria-pressed="${on}" style="background:${Charts.seqColor(w.estimated_count, max)};color:${Charts.seqInk(w.estimated_count, max)}" aria-label="${esc(c.name)} ${h} นาฬิกา ${w.estimated_count} คน">${w.estimated_count}<small>${w.density_per_km2.toLocaleString()}/ตร.กม.</small></button>`; }).join('')).join('')}</div></div>
      <div class="legend"><span>น้อย</span>${['--seq-100', '--seq-300', '--seq-500', '--seq-700'].map(v => `<i class="swatch" style="background:var(${v})"></i>`).join('')}<span>มาก</span><span><i class="swatch" style="background:repeating-linear-gradient(45deg,var(--surface-2) 0 3px,var(--surface-3) 3px 5px)"></i>ไม่มีข้อมูล (ไม่แสดงเป็นพื้นที่ปลอดภัย)</span></div></section>
    <div class="grid2">
      <section class="card"><div class="card-head"><div><span class="eyebrow">${hhmm(selC.window_start)}–${hhmm(endT)} น.</span><h2>${esc(cell.name)}</h2></div></div>
        <div class="kpi" style="border:0;padding:0"><span class="k-val">${selC.estimated_count == null ? '<span class="muted" style="font-size:20px">ไม่มีข้อมูล</span>' : selC.estimated_count + '<small>คนโดยประมาณ</small>'}</span></div>
        <dl class="kv" style="margin-top:10px"><dt>ความหนาแน่น</dt><dd>${selC.density_per_km2 != null ? selC.density_per_km2.toLocaleString() + ' คน/ตร.กม.' : '—'} <span class="tiny">คิดจากพื้นที่ที่กล้องเห็นจริง</span></dd><dt>กล้องครอบคลุม</dt><dd>${selC.coverage_fraction != null ? Math.round(selC.coverage_fraction * 100) + '% ของพื้นที่' : '—'}</dd><dt>ความเชื่อมั่น</dt><dd>${selC.confidence != null ? Math.round(selC.confidence * 100) + '%' : '—'}</dd><dt>วิธีนับ</dt><dd>นับคนที่อยู่ในพื้นที่ ณ เวลานั้น จาก ${selC.source_count} แหล่ง</dd></dl>
        ${flow ? `<div style="margin-top:10px">${callout(`จุดทางเข้ามีคนผ่าน ${flow.count_value.toLocaleString()} คน/ชม. เป็นคนละตัวชี้วัดกับจำนวนคนในพื้นที่`, 'info')}</div>` : ''}
        ${tech(`analytics.heatmap_cell · ${selC.fusion_version} · window ${selC.window_seconds}s · ${cell.grid_version} · ${cell.area_m2} m² · is_suppressed=${selC.is_suppressed}`)}</section>
      <section class="card"><div class="card-head"><h2>ข้อเสนอสำหรับศูนย์สั่งการ</h2></div><p>${esc(m.decision)}</p>
        <ul class="small" style="margin:12px 0;padding-left:18px;display:grid;gap:4px"><li>แยกไม่ได้ว่าเป็นนักท่องเที่ยวหรือคนในพื้นที่</li><li>ห้ามใช้ความหนาแน่นแทนจำนวนผู้ประสบภัย</li><li>แสดงเฉพาะจำนวนรวม ไม่ติดตามรายบุคคล</li></ul>
        ${role().screens.includes('command') ? '<button class="btn ghost" data-go="command" data-tab="task">ไปที่ภารกิจ</button>' : ''}</section>
    </div>`;
  }

  /* ================================================================ AGENCIES */
  async function screenAgencies() {
    const { agencies, functions, rounds } = await API.getAgencies();
    const core = agencies.filter(a => a.tier === 'core');
    const list = agencies.filter(a => (S.agTier === 'all' || a.tier === S.agTier) && (!S.agFunc || a.func === S.agFunc));
    const sel = agencies.find(a => a.agency_id === S.agencySel) || core[0];
    const order = ['planned', 'invited', 'met', 'sample', 'agreement'];
    const colors = ['var(--line-2)', 'var(--info)', 'var(--warn-fill)', 'var(--accent-2)', 'var(--good)'];
    const cnt = st => core.filter(a => a.coord_status === st).length;
    const tierList = agencies.filter(a => S.agTier === 'all' || a.tier === S.agTier);
    const fn = Object.keys(functions).filter(k => tierList.some(a => a.func === k));
    const srcLive = core.reduce((n, a) => n + a.sources.filter(x => x.enabled).length, 0), srcAll = core.reduce((n, a) => n + a.sources.length, 0);
    const canEdit = can('admin') || can('kpi') || S.role === 'commander';
    const incName = id => (ST.scenarios.find(s => s.id === id) || {}).name || id;
    return `<div class="kpis">${kpi('หน่วยงานหลัก', core.length, 'หน่วย', 'สนจ.ภูเก็ตเป็นหน่วยประสานหลัก')}${kpi('ประชุมแล้ว', cnt('met') + cnt('sample') + cnt('agreement'), 'หน่วย', `ได้ข้อมูลตัวอย่าง ${cnt('sample')} · ตกลงเชื่อม ${cnt('agreement')}`)}${kpi('แหล่งข้อมูลที่เชื่อมแล้ว', `${srcLive}/${srcAll}`, '', 'ของหน่วยงานหลัก', srcLive < srcAll ? 'warn' : 'good')}${kpi('หน่วยสนับสนุน', agencies.filter(a => a.tier === 'support').length, 'หน่วย', `เพิ่มตามความเสี่ยงอีก ${agencies.filter(a => a.tier === 'conditional').length} กลุ่ม`)}</div>
    <section class="card"><div class="card-head"><h2>ความคืบหน้าการประสาน 20 หน่วยงานหลัก</h2><span class="tiny">ค่าจำลองเพื่อสาธิต</span></div>
      <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--surface-3)">${order.map((st, i) => `<div title="${L.coord[st][0]} ${cnt(st)}" style="width:${cnt(st) / core.length * 100}%;background:${colors[i]}"></div>`).join('')}</div>
      <div class="legend">${order.map((st, i) => `<span><i class="swatch" style="background:${colors[i]}"></i>${L.coord[st][0]} <b class="tnum">${cnt(st)}</b></span>`).join('')}</div>
      <details class="more" style="margin-top:12px"><summary>กำหนดการนัด 4 ช่วง</summary><div class="stack">${rounds.map(r => `<div><b>ช่วง ${r.round} · ${esc(r.week)}</b> <span class="small">${esc(r.title)}</span><br><span class="tiny">ผลที่ต้องได้: ${esc(r.output)} · ${r.round === 4 ? 'ทุกหน่วย' : agencies.filter(a => ['core', 'support'].includes(a.tier) && a.round === r.round).map(a => esc(a.short)).join(', ')}</span></div>`).join('')}</div></details></section>
    <div class="split">
      <section class="card"><div class="seg" role="group" style="margin-bottom:10px">${[['core', 'หลัก 20'], ['support', 'สนับสนุน 12'], ['conditional', 'ตามความเสี่ยง'], ['all', 'ทั้งหมด']].map(([k, n]) => `<button data-agtier="${k}" aria-pressed="${S.agTier === k}">${n}</button>`).join('')}</div>
        <div class="choices" style="margin-bottom:12px"><label class="choice"><input type="radio" name="agfunc" value="" ${!S.agFunc ? 'checked' : ''}>ทุกด้าน</label>${fn.map(k => `<label class="choice"><input type="radio" name="agfunc" value="${k}" ${S.agFunc === k ? 'checked' : ''}>${esc(functions[k])}</label>`).join('')}</div>
        <div class="list">${list.map(a => `<button class="item" data-agency-row="${a.agency_id}" aria-current="${a.agency_id === sel.agency_id}"><span class="row between" style="flex-wrap:nowrap;align-items:start"><span class="t">${a.no ? `<span class="muted tnum">${a.no}.</span> ` : ''}${esc(a.name)}</span>${chip(L.coord[a.coord_status][0], L.coord[a.coord_status][1])}</span><span class="meta"><span>${esc(functions[a.func] || '')}</span>${a.round ? `<span>นัดช่วง ${a.round}</span>` : ''}<span>${a.sources.length} แหล่งข้อมูล</span></span></button>`).join('') || '<div class="empty">ไม่มีหน่วยงานในกลุ่มนี้</div>'}</div></section>
      <div class="stack">
        <section class="card"><div class="card-head"><div><span class="eyebrow">${sel.no ? `หน่วยงานที่ ${sel.no}` : sel.tier === 'conditional' ? 'เพิ่มตามความเสี่ยง' : 'ทีมโครงการ'} · ${esc(functions[sel.func] || '')}</span><h2>${esc(sel.name)}</h2></div>${chip(L.coord[sel.coord_status][0], L.coord[sel.coord_status][1])}</div>
          <dl class="kv">${sel.invited ? `<dt>ผู้รับเชิญ</dt><dd>${esc(sel.invited)}</dd>` : ''}<dt>ประเด็นหารือ</dt><dd>${esc(sel.topics)}</dd>${sel.requested ? `<dt>ข้อมูลที่ขอ</dt><dd class="small">${esc(sel.requested)}</dd>` : ''}<dt>ช่องทางข้อมูล</dt><dd>${esc(sel.link)}<br><span class="tiny">${esc(sel.link_mode)}</span>${sel.urls.map(u => `<br><a href="${esc(u)}" target="_blank" rel="noopener" class="small">${esc(u.replace(/^https?:\/\//, ''))}</a>`).join('')}</dd>${sel.system_roles.length ? `<dt>บทบาทในระบบ</dt><dd>${sel.system_roles.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd>` : ''}</dl>
          ${sel.note ? `<div style="margin-top:10px">${callout(esc(sel.note), 'warn', 'alert')}</div>` : ''}
          ${canEdit ? `<div class="field" style="margin-top:14px"><span class="lbl">อัปเดตสถานะการประสาน</span><div class="seg" role="group">${order.map(st => `<button data-action="ag-status" data-id="${sel.agency_id}" data-status="${st}" aria-pressed="${st === sel.coord_status}">${L.coord[st][0]}</button>`).join('')}</div></div>` : ''}</section>
        <section class="card"><div class="card-head"><h2>เชื่อมกับระบบ</h2></div>
          <div class="stack">
            <div><div class="eyebrow">แหล่งข้อมูล</div>${sel.sources.length ? sel.sources.map(x => `<div class="row between" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${esc(x.name)}</span>${!x.enabled ? chip('รอข้อตกลง', '') : x.stale ? chip('ล่าช้า', 'warn') : chip('เชื่อมแล้ว', 'good')}</div>`).join('') : '<p class="muted">ยังไม่มีแหล่งข้อมูล</p>'}</div>
            <div><div class="eyebrow">บทบาทในเหตุการณ์จำลอง</div>${sel.incident_roles.map(r => `<span class="tag">${esc(incName(r.scenario))} · ${r.role === 'lead' ? 'หน่วยหลัก' : r.role === 'support' ? 'สนับสนุน' : 'รับทราบ'}</span>`).join('') || '<span class="muted">—</span>'}</div>
            <div><div class="eyebrow">ประกาศที่ต้องรับทราบ</div>${sel.alerts.map(x => `<span class="tag">${x.alert_id} · ${L.alert[x.status]}${x.acked ? ' ✓' : ''}</span>`).join('') || '<span class="muted">—</span>'}</div>
            <div class="row small" style="gap:18px"><span>บัญชีผู้ใช้ ${sel.users.length}</span><span>อาสาสมัครสังกัด ${sel.volunteers} คน</span><span>ภารกิจที่เปิด ${sel.tasks_open} จาก ${sel.tasks_total}</span></div>
          </div>${techI(sel.agency_id)}</section>
      </div></div>`;
  }

  /* ================================================================ DATA */
  async function screenData() {
    const [srcs, batches, issues] = await Promise.all([API.getDataSources(), API.getBatches(), API.getQualityIssues()]);
    const open = issues.filter(q => !q.resolved_at), live = srcs.filter(s => s.enabled);
    const refresh = s => s.refresh_seconds >= 86400 ? `ทุก ${Math.round(s.refresh_seconds / 86400)} วัน` : `ทุก ${Math.round(s.refresh_seconds / 60)} นาที`;
    const cls = c => c === 'Restricted' ? 'จำกัดสิทธิ์' : c === 'Internal' ? 'ใช้ภายใน' : 'สาธารณะ';
    return `<div class="kpis">${kpi('แหล่งที่เชื่อมแล้ว', live.length, 'แหล่ง', `รอข้อตกลง ${srcs.length - live.length} แหล่ง`)}${kpi('ข้อมูลล่าช้า', srcs.filter(s => s.stale).length, 'แหล่ง', 'เกิน 2 รอบอัปเดต', srcs.some(s => s.stale) ? 'warn' : 'good')}${kpi('ปัญหาคุณภาพที่ต้องแก้', open.length, 'รายการ', `${open.reduce((n, q) => n + q.rows, 0)} แถวถูกกักไว้`, open.some(q => q.severity === 'critical') ? 'crit' : open.length ? 'warn' : 'good')}${kpi('ชุดข้อมูลล่าสุด', batches[0].accepted_rows.toLocaleString(), 'แถว', `รับเข้า ${hhmm(batches[0].finished_at)} น.`)}</div>
    <div class="split">
      <section class="card"><div class="card-head"><h2>ปัญหาคุณภาพที่ต้องแก้</h2></div>
        <div class="list">${issues.map(q => `<div class="item" style="cursor:default"><span class="row between" style="flex-wrap:nowrap;align-items:start"><span class="t">${esc(q.message)}</span>${q.resolved_at ? chip('แก้แล้ว', 'good') : chip(`${q.rows} แถว`, q.severity === 'critical' ? 'crit' : 'warn')}</span><span class="small">${esc((srcs.find(s => s.source_id === q.source_id) || {}).name || '')} · วิธีแก้: ${esc(q.fix)}${techI(q.rule_code)}</span>${!q.resolved_at ? `<div><button class="btn sm ghost" data-action="resolve" data-id="${q.issue_id}" ${can('quality') ? '' : 'disabled'}>แก้ไขและตรวจซ้ำ</button></div>` : ''}</div>`).join('')}</div>${lock('quality')}
        <p class="tiny" style="margin-top:10px">ข้อมูลที่ไม่ผ่านถูกกักไว้ ไม่นำไปคำนวณตัวชี้วัดหรือแผนที่ความหนาแน่น</p></section>
      <section class="card"><div class="card-head"><h2>แหล่งข้อมูล</h2>${can('quality') || can('admin') ? `<button class="btn sm ghost" data-action="import">นำเข้าชุดข้อมูล</button>` : ''}</div>
        ${table(['แหล่งข้อมูล', 'เจ้าของ', 'รอบอัปเดต', 'รับล่าสุด', 'สถานะ'], srcs.map(s => ({ attrs: s.enabled ? '' : ' class="dim"', cells: [`<b>${esc(s.name)}</b><br><span class="tiny">${esc(s.dataset)} · ${cls(s.data_classification)}</span>${techI(`${s.source_id} · ${s.source_type} · ${s.request}`)}`, agencyPill(s.agency_id), refresh(s), s.last_received_at ? ago(s.last_received_at) : '—', !s.enabled ? chip('รอข้อตกลง', '') : s.stale ? chip('ล่าช้า', 'warn') : chip('ตรงเวลา', 'good')] })))}</section>
    </div>
    <section class="card"><details class="more" style="border:0;padding:0"><summary>ประวัติการนำเข้า ${batches.length} ชุด</summary>${table(['ชุดข้อมูล', 'แหล่ง', 'เวลาที่วัด', 'เวลารับเข้า', '#ผ่าน', '#กักไว้'], batches.map(x => ({ cells: [`<span class="mono">${esc(x.external_batch_key)}</span>`, esc((srcs.find(s => s.source_id === x.source_id) || {}).name || x.source_id), hhmm(x.observed_at), hhmm(x.finished_at), x.accepted_rows.toLocaleString(), x.rejected_rows] })))}<p class="tiny" style="margin-top:6px">ส่งชุดเดิมซ้ำ ระบบจะปฏิเสธเพื่อไม่ให้ข้อมูลซ้ำ</p></details></section>
    ${tech('Lineage: connector → object storage (raw) → validate → quality_issue/quarantine → PostgreSQL → worker (KPI · risk · heatmap) → analytics/cache · POST /v1/imports')}`;
  }

  /* ================================================================ ADMIN */
  async function screenAdmin() {
    const [users, defs, rules] = await Promise.all([API.getUsers(), API.getKPIDefs(), API.getAlertRules()]);
    const rn = c => (ST.roles.find(r => r.role_code === c) || {}).name || c;
    return `<section class="card"><div class="card-head"><h2>บัญชีผู้ใช้</h2></div>${table(['ผู้ใช้', 'บทบาท', 'หน่วยงาน', 'พื้นที่รับผิดชอบ', 'สถานะ', ''], users.map(u => ({ attrs: u.active ? '' : ' class="dim"', cells: [`<b>${esc(u.display_name)}</b>${techI(u.auth_subject)}`, esc(rn(u.role_code)), u.agency_id ? agencyPill(u.agency_id) : '—', u.tenant_id && u.tenant_id !== ST.tenant.tenant_id ? chip('อยู่นอกจังหวัดภูเก็ต', 'crit', true) : u.area_scope.map(a => `<span class="tag">${esc(areaName(a))}</span>`).join('') || '—', u.active ? chip('ใช้งาน', 'good') : chip('ปิด', ''), can('admin') ? `<button class="btn sm quiet" data-action="user-active" data-id="${u.user_id}" data-active="${u.active ? 0 : 1}">${u.active ? 'ปิดบัญชี' : 'เปิดบัญชี'}</button>` : ''] })))}</section>
    <div class="grid2">
      <section class="card"><div class="card-head"><div><h2>ทดสอบสิทธิ์</h2><p>ระบบตรวจสิทธิ์ก่อนแสดงหรือส่งออกข้อมูลทุกครั้ง</p></div></div>
        <form class="form" id="acc-form"><div class="grid2" style="gap:10px"><div class="field"><label for="acc-user">ผู้ใช้</label><select id="acc-user">${users.map(u => `<option value="${u.user_id}">${esc(u.display_name)}</option>`).join('')}</select></div><div class="field"><label for="acc-area">ดูข้อมูลพื้นที่</label><select id="acc-area">${ST.areas.filter(a => a.level !== 'province').map(a => `<option value="${a.area_id}">${esc(a.name)}</option>`).join('')}</select></div></div>
        <div class="row"><div class="seg" id="acc-action"><button type="button" data-acc="read" aria-pressed="${S.accAction === 'read'}">ดูข้อมูล</button><button type="button" data-acc="export" aria-pressed="${S.accAction === 'export'}">ส่งออก</button></div><button class="btn" type="submit">ตรวจสิทธิ์</button></div></form>
        ${S.access ? `<div style="margin-top:12px">${callout(esc(S.access.reason), S.access.allowed ? 'good' : 'crit', S.access.allowed ? 'check' : 'x')}</div>` : ''}</section>
      <section class="card"><div class="card-head"><h2>กฎแจ้งเตือนอัตโนมัติ</h2></div><div class="list">${rules.map(r => `<div class="item" style="cursor:default"><span class="row between" style="flex-wrap:nowrap"><span class="t">${esc(r.name)}</span>${can('admin') ? `<label class="choice"><input type="checkbox" data-rule="${r.rule_id}" ${r.enabled ? 'checked' : ''}>${r.enabled ? 'เปิด' : 'ปิด'}</label>` : chip(r.enabled ? 'เปิด' : 'ปิด', r.enabled ? 'good' : '')}</span><span class="small">เมื่อเกิด: ${esc(r.action)}${techI(r.condition)}</span></div>`).join('')}</div></section>
    </div>
    <section class="card"><div class="card-head"><h2>บทบาทในระบบ</h2></div>${table(['บทบาท', 'หน้าที่', 'เห็นข้อมูลอะไร'], ST.roles.map(r => ({ cells: [`<b>${esc(r.name)}</b>`, esc(r.duty), `<span class="small">${esc(r.scope)}</span>`] })))}</section>
    <section class="card"><details class="more" style="border:0;padding:0"><summary>เวอร์ชันสูตรตัวชี้วัด</summary>${table(['ตัวชี้วัด', 'เวอร์ชัน', ''], defs.map(d => ({ cells: [esc(d.name), `v${d.version}`, can('admin') || can('kpi') ? `<button class="btn sm quiet" data-action="kpi-bump" data-id="${d.kpi_code}">ออกเวอร์ชันใหม่</button>` : ''] })))}</details></section>
    <section class="card tech"><h2>สเปกเริ่มต้น (ระดับ A นำร่อง)</h2><dl class="kv" style="margin-top:10px"><dt>ผู้ใช้พร้อมกัน</dt><dd>100–300 · 10–30 RPS (burst 150)</dd><dt>API / Worker</dt><dd>2–4 × (2 vCPU, 4 GB) · worker 1–2</dd><dt>PostgreSQL</dt><dd>4 vCPU 16 GB · SSD 200 GB · standby เมื่อรับ SOS จริง</dd><dt>SLO</dt><dd>99.5% · SOS P95 ≤ 2 s · dashboard P95 ≤ 3 s · heatmap ≤ 5 นาที · RPO 1 ชม. · RTO 4 ชม.</dd></dl></section>`;
  }

  /* ================================================================ QA */
  async function screenQA() {
    const r = S.tests;
    return `<section class="card"><div class="card-head"><div><h2>ชุดทดสอบกฎสำคัญ</h2><p>รันกับสำเนาข้อมูล ไม่กระทบข้อมูลที่คุณกดไว้ในเดโม</p></div><button class="btn" data-action="run-tests" ${can('test') ? '' : 'disabled'}>${icon('play', 15)} รันทดสอบ</button></div>
      ${r ? `<div class="callout ${r.pass === r.total ? 'good' : 'crit'}" style="margin-bottom:12px">${icon(r.pass === r.total ? 'check' : 'x', 17)}<b>ผ่าน ${r.pass} จาก ${r.total} กรณี</b></div><div class="list">${r.results.map(x => `<div class="item" style="cursor:default;display:grid;grid-template-columns:auto 1fr;align-items:start;gap:10px"><span class="ck ${x.pass ? 'ok' : 'no'}"><span class="m">${x.pass ? '✓' : '✕'}</span></span><span><b>${esc(x.name)}</b><br><span class="small">${esc(x.detail)}</span></span></div>`).join('')}</div>` : `<div class="empty">${icon('flask', 28)}<p>กด "รันทดสอบ" เพื่อตรวจ 12 กรณี เช่น ส่งคำขอซ้ำ มอบหมายงานซ้อน ใบรับรองหมดอายุ และสิทธิ์ข้ามพื้นที่</p></div>`}${lock('test')}</section>
    <div class="grid2"><section class="card"><h2 style="margin-bottom:10px">เป้าหมายประสิทธิภาพ</h2>${table(['ตัวชี้วัด', 'เป้าหมาย'], [['บันทึก SOS (95% ของคำขอ)', 'ไม่เกิน 2 วินาที'], ['เปิดหน้าภาพรวม (95%)', 'ไม่เกิน 3 วินาที'], ['อัตราข้อผิดพลาด', 'น้อยกว่า 1%'], ['คำขอ SOS ที่ตอบรับแล้วสูญหาย', '0 รายการ']].map(x => ({ cells: x })))}</section>
      <section class="card"><h2 style="margin-bottom:10px">แผนทดสอบโหลด</h2><p class="small">ระดับนำร่อง 100–300 ผู้ใช้พร้อมกัน · ระดับหลายหน่วยงาน 1,000–3,000 คน · สัดส่วนการใช้งาน: ดูภาพรวม 65% แผนที่ 20% ติดตามงาน 10% แจ้ง SOS 5% · คงโหลด 60 นาที ทดสอบพุ่งสูง 5 เท่า 10 นาที และต่อเนื่อง 8 ชั่วโมง</p></section></div>`;
  }

  /* ================================================================ AUDIT */
  async function screenAudit() {
    const [log, outbox] = await Promise.all([API.getAudit(), API.getOutbox()]);
    return `<section class="card"><div class="card-head"><div><h2>บันทึกกิจกรรม</h2><p>เพิ่มได้อย่างเดียว แก้หรือลบย้อนหลังไม่ได้</p></div><button class="btn sm ghost" data-action="reset" style="color:var(--crit)">รีเซ็ตเดโมทั้งหมด</button></div>
      ${table(['เวลา', 'ผู้ทำ', 'การกระทำ', 'รายการ'], log.map(l => ({ cells: [`<span class="tnum">${dateTH(l.occurred_at)}</span>`, esc(userName(l.actor_id)), `${esc(l.action)}${techI(JSON.stringify(l.change_summary))}`, `<span class="small">${esc(l.entity_id)}</span>${techI(`${l.entity_type} · ${l.request_id}`)}`] })), 'ยังไม่มีกิจกรรม')}</section>
    <section class="card tech"><h2 style="margin-bottom:10px">ops.outbox_event</h2>${table(['เวลา', 'event_type', 'aggregate_id', 'payload'], outbox.map(o => ({ cells: [dateTH(o.created_at), `<span class="mono">${esc(o.event_type)}</span>`, esc(o.aggregate_id), `<span class="mono">${esc(JSON.stringify(o.payload))}</span>`] })), 'ว่าง')}</section>`;
  }

  const RENDER = { exec: screenExec, command: screenCommand, alerts: screenAlerts, mytasks: screenMyTasks, sos: screenSOS, analytics: screenAnalytics, risk: screenRisk, heatmap: screenHeatmap, agencies: screenAgencies, data: screenData, admin: screenAdmin, qa: screenQA, audit: screenAudit };

  /* ================================================================ SHELL */
  const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  async function drawShell(badges) {
    const r = role();
    const GORDER = ['ปฏิบัติการ', 'ภาคสนาม', 'สาธารณะ', 'วิเคราะห์', 'ข้อมูลและระบบ'];
    const groups = GORDER.filter(g => r.screens.some(k => SCREENS[k].group === g));
    const rail = $('#rail');
    rail.className = 'rail' + (S.nav ? ' open' : '');
    rail.innerHTML = `<div class="brand"><div class="brand-mark">${icon('shield', 20)}</div><div><div class="brand-name">Tourism Crisis Intelligence</div><div class="brand-sub">ภูเก็ต · พื้นที่นำร่อง</div></div></div>
      ${groups.map(g => `<div class="nav-group">${g}</div>` + r.screens.filter(k => SCREENS[k].group === g).map(k => `<button class="nav-item" data-screen="${k}" ${k === S.screen ? 'aria-current="page"' : ''}>${icon(SCREENS[k].icon, 19)}<span>${SCREENS[k].name}</span>${badges[k] ? `<span class="nav-badge">${badges[k]}</span>` : ''}</button>`).join('')).join('')}
      <div class="rail-foot"><button class="nav-item" data-action="tour-open">${icon('play', 17)}<span>ทัวร์สาธิต</span></button>
        <label class="switch"><input type="checkbox" id="tech-toggle" ${S.tech ? 'checked' : ''}>แสดงรายละเอียดเทคนิค</label>
        <label class="switch"><input type="checkbox" id="theme-toggle" ${isDark() ? 'checked' : ''}>โหมดมืด</label>
        <span class="tiny" style="color:var(--rail-mute)">ข้อมูลจำลองทั้งหมด · ไม่ส่งข้อความออกจริง</span></div>`;
    let personaName = '';
    if (S.role === 'volunteer') personaName = ((await API.getVolunteers()).find(v => v.volunteer_id === S.persona) || {}).display_name || '';
    else if (S.role === 'agency') { const u = ST.users.find(x => x.user_id === S.agencyUser); personaName = u ? `${u.display_name}` : ''; }
    else if (S.role === 'tourist') personaName = 'ผู้แจ้งเหตุ';
    else personaName = userName(ROLE_USER[S.role]);
    const showInc = !['sos', 'mytasks', 'agencies', 'data', 'admin', 'qa', 'audit'].includes(S.screen);
    let personaSel = '';
    if (S.rolePop && S.role === 'volunteer') personaSel = `<div class="pop-persona"><label class="small" for="persona-sel">เป็นอาสาสมัครคนไหน</label><select class="input" id="persona-sel">${(await API.getVolunteers()).map(v => `<option value="${v.volunteer_id}" ${v.volunteer_id === S.persona ? 'selected' : ''}>${esc(v.display_name)} · ${esc(agencyShort(v.agency_id))} · ${L.verif[v.verification_status]}</option>`).join('')}</select></div>`;
    if (S.rolePop && S.role === 'agency') personaSel = `<div class="pop-persona"><label class="small" for="persona-sel">เจ้าหน้าที่หน่วยงานไหน</label><select class="input" id="persona-sel">${ST.users.filter(u => AG_USERS.includes(u.user_id)).map(u => `<option value="${u.user_id}" ${u.user_id === S.agencyUser ? 'selected' : ''}>${esc(agencyShort(u.agency_id))}</option>`).join('')}</select></div>`;
    $('#topbar').innerHTML = `<button class="btn ghost sm menu-btn" data-action="nav" aria-label="เปิดเมนู">${icon('menu', 18)}</button>
      ${showInc ? `<div class="incident-switch" role="group" aria-label="เลือกเหตุการณ์">${ST.scenarios.map(s => { const mi = ST.majors.find(x => x.scenario === s.id); return `<button class="inc-btn" data-scenario="${s.id}" aria-pressed="${S.scenario === s.id}"><span class="dot ${mi.severity >= 5 ? '' : 'high'}"></span>${INC_SHORT[s.id]}</button>`; }).join('')}</div>` : ''}
      <span class="top-spacer"></span><span class="demo-flag">ข้อมูลจำลอง · 13 ต.ค. 2569</span>
      <button class="role-btn" data-action="role-pop" aria-expanded="${S.rolePop}" aria-haspopup="dialog"><span class="avatar">${ROLE_INIT[S.role]}</span><span><span class="rn">${esc(r.name)}</span><br><span class="rp">${esc(personaName)}</span></span></button>
      ${S.rolePop ? `<div class="pop" role="dialog" aria-label="เปลี่ยนมุมมอง"><div class="eyebrow" style="padding:6px 10px">ดูระบบในมุมมองของ</div>${ST.roles.map(x => `<button class="pop-item" data-role="${x.role_code}" aria-current="${x.role_code === S.role}"><span class="avatar">${ROLE_INIT[x.role_code]}</span><span><b>${esc(x.name)}</b><span>${esc(x.duty)}</span></span></button>`).join('')}${personaSel}</div>` : ''}`;
    let scr = document.querySelector('.scrim');
    if (S.nav && !scr) { scr = document.createElement('div'); scr.className = 'scrim'; scr.dataset.action = 'nav'; document.body.appendChild(scr); }
    if (!S.nav && scr) scr.remove();
  }

  function drawTour() {
    let el = $('#tour'); if (!el) { el = document.createElement('div'); el.id = 'tour'; document.body.appendChild(el); }
    if (!S.tour) { el.innerHTML = ''; return; }
    const st = TOUR[S.tourStep]; const r = ST.roles.find(x => x.role_code === st.role);
    const here = S.role === st.role && S.screen === st.screen;
    el.innerHTML = `<div class="tour" role="dialog" aria-label="ทัวร์สาธิต"><div class="tour-head"><b>ทัวร์สาธิต ${S.tourStep + 1}/${TOUR.length}</b><button data-action="tour-close" aria-label="ซ่อนทัวร์">ซ่อน</button></div>
      <div class="tour-body"><div class="tour-steps">${TOUR.map((_, i) => `<span class="${i <= S.tourStep ? 'on' : ''}"></span>`).join('')}</div>
        <span class="tour-who">${icon('person', 13)} มุมมอง: ${esc(r.name)}</span><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p>
        <div class="row between">${S.tourStep > 0 ? '<button class="btn sm quiet" data-action="tour-prev">ย้อนกลับ</button>' : '<span></span>'}
          ${here ? (S.tourStep < TOUR.length - 1 ? '<button class="btn sm" data-action="tour-next">ขั้นต่อไป</button>' : '<button class="btn sm" data-action="tour-close">จบทัวร์</button>') : `<button class="btn sm pulse" data-action="tour-go">${icon('play', 13)} พาไปที่ขั้นนี้</button>`}</div></div></div>`;
  }
  function tourGo() { S.cmdTabPinned = true; const st = TOUR[S.tourStep]; S.role = st.role; S.screen = st.screen; if (st.scenario) S.scenario = st.scenario; if (st.tab) S.cmdTab = st.tab; if (st.persona) S.persona = st.persona; if (st.tab === 'task') S.taskFilter = 'pending'; S.task = null; S.sos = null; S.alert = null; S.lang = 'th'; }

  async function draw() {
    NOW = new Date(await API.now());
    if (!role().screens.includes(S.screen)) S.screen = role().screens[0];
    const [tasks, alerts, sos] = await Promise.all([API.getTasks(S.scenario), API.getAlerts(S.scenario), API.getSOS(S.scenario)]);
    const badges = { command: sos.filter(x => x.status === 'received').length + tasks.filter(t => t.status === 'pending').length, alerts: alerts.filter(a => a.status === 'review').length, mytasks: S.role === 'volunteer' ? (await API.getTasks()).filter(t => t.status === 'offered' && t.assignments.some(a => a.status === 'offered' && a.volunteer_id === S.persona)).length : 0 };
    await drawShell(badges);
    const sc = SCREENS[S.screen];
    const body = await RENDER[S.screen]();
    content.innerHTML = `<div class="page-head"><div><h1>${sc.name}</h1><p>${sc.sub}${techI(sc.fr)}</p></div></div>${body}`;
    attachCharts(); drawTour(); persist();
    document.documentElement.classList.toggle('show-tech', !!S.tech);
  }

  function attachCharts() {
    $$('.chart[data-kind="bar"]', content).forEach(ch => { const labels = JSON.parse(ch.dataset.labels), values = JSON.parse(ch.dataset.values), tip = ch.querySelector('.tooltip'); ch.querySelectorAll('.bar-g').forEach((g, i) => { g.addEventListener('mousemove', e => { const r = ch.getBoundingClientRect(); tip.textContent = `${labels[i]} · ${values[i]}`; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top - 6) + 'px'; tip.classList.add('show'); }); g.addEventListener('mouseleave', () => tip.classList.remove('show')); }); });
    $$('.chart[data-kind="lines"]', content).forEach(ch => { const labels = JSON.parse(ch.dataset.labels), series = JSON.parse(ch.dataset.series), xs = JSON.parse(ch.dataset.xs), vbw = Number(ch.dataset.vbw), tip = ch.querySelector('.tooltip'), cross = ch.querySelector('.crosshair'), svg = ch.querySelector('svg'); ch.querySelectorAll('.hit').forEach(h => { const i = Number(h.dataset.i); h.addEventListener('mousemove', e => { const r = ch.getBoundingClientRect(), sx = svg.getBoundingClientRect().width / vbw; tip.textContent = `${labels[i]} · ` + series.map(s => `${s.name} ${s.values[i] == null ? 'ไม่มีข้อมูล' : s.values[i]}`).join(' · '); tip.style.left = (xs[i] * sx) + 'px'; tip.style.top = (e.clientY - r.top - 6) + 'px'; tip.classList.add('show'); cross.setAttribute('x1', xs[i]); cross.setAttribute('x2', xs[i]); cross.setAttribute('opacity', 1); }); h.addEventListener('mouseleave', () => { tip.classList.remove('show'); cross.setAttribute('opacity', 0); }); }); });
  }

  /* ================================================================ EVENTS */
  async function submitSOS(resend) {
    if (!resend || !S.sosKey) S.sosKey = 'idem-' + Math.random().toString(36).slice(2, 10);
    const detail = $('#sos-detail').value.trim();
    if (!detail && !resend) { toast('พิมพ์รายละเอียดสั้นๆ ว่าเกิดอะไรขึ้น', true); $('#sos-detail').focus(); return; }
    const r = await API.submitSOS({ area_id: $('#sos-area').value, request_type: ($('input[name="sos-type"]:checked') || {}).value || 'other', request_detail: detail || 'ส่งซ้ำ', people_count: $('#sos-people').value, urgency: S.sosUrg, location_accuracy_m: 25, contact: $('#sos-contact').value, vulnerability_flags: $$('input[name="sos-vuln"]:checked').map(x => x.value) }, S.sosKey);
    if (r.ok === false) return toast(r.error, true);
    if (!S.tracking.includes(r.tracking_no)) S.tracking.unshift(r.tracking_no);
    toast(r.idempotent_replay ? `ได้รับคำขอนี้แล้ว ใช้เลขติดตามเดิม ${r.tracking_no}` : `ส่งคำขอแล้ว เลขติดตาม ${r.tracking_no}`);
    return draw();
  }

  document.addEventListener('submit', async e => {
    const f = e.target; if (!f.id || f.id === 'mdl') return; e.preventDefault(); const me = actor();
    if (f.id === 'screen-form') {
      const urgBtn = $('#sc-urg [aria-pressed="true"]'); const urg = urgBtn ? Number(urgBtn.dataset.urg) : 3;
      return act(API.screenSOS(f.dataset.id, { urgency: urg, incident_id: $('#sc-inc').value, agency_id: $('#sc-ag').value, title: $('#sc-title').value, required_skills: $$('input[name="sc-skill"]:checked').map(x => x.value), vulnerability_flags: $$('input[name="sc-vuln"]:checked').map(x => x.value), hard_priority: $('#sc-hard').checked, task_type: 'other' }, me).then(r => { if (r.ok) { S.task = r.task.task_id; S.sos = null; S.cmdTab = 'task'; S.taskFilter = 'pending'; } return r; }), 'สร้างภารกิจแล้ว เลือกอาสาสมัครเพื่อเสนองานได้เลย');
    }
    if (f.id === 'sos-form') return submitSOS(false);
    if (f.id === 'track-form') { const no = $('#track-no').value.trim(); if (!no) return; const r = await API.trackSOS(no); if (r.ok === false) return toast('ไม่พบเลขติดตามนี้ ตรวจตัวอักษรอีกครั้ง', true); if (!S.tracking.includes(no)) S.tracking.unshift(no); return draw(); }
    if (f.id === 'tr-form') return act(API.setTranslation(f.dataset.id, f.dataset.lang, $('#tr-title').value, $('#tr-msg').value, me), 'บันทึกข้อความแล้ว');
    if (f.id === 'acc-form') { S.access = await API.checkAccess($('#acc-user').value, $('#acc-area').value, S.accAction); return draw(); }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.closest('#mdl')) return;
    if (t.id === 'tech-toggle') { S.tech = t.checked; document.documentElement.classList.toggle('show-tech', S.tech); persist(); return; }
    if (t.id === 'theme-toggle') { document.documentElement.dataset.theme = t.checked ? 'dark' : 'light'; try { localStorage.setItem('tci-theme', document.documentElement.dataset.theme); } catch (er) {} return; }
    if (t.id === 'persona-sel') { if (S.role === 'agency') S.agencyUser = t.value; else S.persona = t.value; S.rolePop = false; draw(); return; }
    if (t.id === 'pub-view') { S.publicView = t.checked; draw(); return; }
    if (t.id === 'sos-area') { S.sosArea = t.value; draw(); return; }
    if (t.name === 'sos-type') { S.sosType = t.value; return; }
    if (t.name === 'agfunc') { S.agFunc = t.value; draw(); return; }
    if (t.dataset.rule) act(API.toggleRule(t.dataset.rule, actor()), 'อัปเดตกฎแล้ว');
  });

  document.addEventListener('click', async e => {
    if (e.target.closest('#mdl, .modal-back')) return;
    if (e.target.closest('label.choice, label.tile, label.switch')) return;
    const b = e.target.closest('button, .agency-pill, tr[data-farea], tr[data-risk], g.marker, .scrim');
    if (!b) { if (S.rolePop && !e.target.closest('.pop')) { S.rolePop = false; draw(); } return; }
    const d = b.dataset, me = actor();
    if (S.rolePop && !b.closest('.pop') && d.action !== 'role-pop') S.rolePop = false;
    if (d.step) { const i = $('#sos-people'); i.value = Math.max(0, Number(i.value || 0) + Number(d.step)); return; }
    if (d.urg) { $$('#sc-urg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.surg) { S.sosUrg = Number(d.surg); $$('#sos-urg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.acc) { S.accAction = d.acc; $$('#acc-action button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.screen) { S.screen = d.screen; S.nav = false; return draw(); }
    if (d.role) { S.role = d.role; S.rolePop = false; S.screen = role().screens[0]; toast(`เปลี่ยนเป็นมุมมอง ${role().name}`); return draw(); }
    if (d.scenario) { S.cmdTabPinned = false; S.scenario = d.scenario; S.task = null; S.sos = null; S.alert = null; S.cell = null; return draw(); }
    if (d.go) { S.screen = d.go; if (d.tab) { S.cmdTab = d.tab; S.cmdTabPinned = false; } if (d.task) { S.task = d.task; S.taskFilter = 'open'; } if (d.alert) { S.alert = d.alert; S.lang = 'th'; } return draw(); }
    if (d.tab) { S.cmdTab = d.tab; S.cmdTabPinned = !d.go; return draw(); }
    if (d.tfilter) { S.taskFilter = d.tfilter; S.task = null; return draw(); }
    if (d.task) { S.task = d.task; return draw(); }
    if (d.sos) { S.sos = d.sos; return draw(); }
    if (d.alert && !d.action) { S.alert = d.alert; S.lang = 'th'; return draw(); }
    if (d.lang && !d.action) { S.lang = d.lang; return draw(); }
    if (d.agencyRow) { S.agencySel = d.agencyRow; return draw(); }
    if (d.agtier) { S.agTier = d.agtier; S.agFunc = ''; return draw(); }
    if (d.agency && b.classList.contains('agency-pill')) { if (!role().screens.includes('agencies')) return; const ag = ST.agencies.find(x => x.agency_id === d.agency); S.agencySel = d.agency; S.agTier = ag ? ag.tier : 'all'; S.agFunc = ''; S.screen = 'agencies'; return draw(); }
    if (d.farea !== undefined) { S.filterArea = d.farea; return draw(); }
    if (d.risk) { S.riskArea = d.risk; return draw(); }
    if (d.area && S.screen === 'risk') { S.riskArea = d.area; return draw(); }
    if (d.cell) { const [c, h] = d.cell.split(':'); S.cell = [c, Number(h)]; return draw(); }
    switch (d.action) {
      case 'nav': S.nav = !S.nav; return draw();
      case 'role-pop': S.rolePop = !S.rolePop; return draw();
      case 'tour-open': S.tour = true; S.nav = false; return draw();
      case 'tour-close': S.tour = false; return draw();
      case 'tour-go': tourGo(); return draw();
      case 'tour-next': S.tourStep = Math.min(TOUR.length - 1, S.tourStep + 1); tourGo(); return draw();
      case 'tour-prev': S.tourStep = Math.max(0, S.tourStep - 1); tourGo(); return draw();
      case 'stage': return act(API.advanceProtocol(S.scenario, me), 'เลื่อนขั้นตอนแล้ว');
      case 'verify-inc': return act(API.verifyIncident(d.id, me), 'ยืนยันเหตุแล้ว');
      case 'offer': return act(API.offerTask(d.id, d.vol, me), 'เสนองานแล้ว รออาสาสมัครตอบรับภายใน 10 นาที');
      case 'expire': return act(API.forceExpire(d.id, me), 'หมดเวลาตอบรับ งานกลับเข้าคิวแล้ว');
      case 'respond': return act(API.respondOffer(d.id, d.resp, S.persona, ''), d.resp === 'accept' ? 'รับงานแล้ว' : 'ปฏิเสธแล้ว งานจะส่งให้คนอื่น');
      case 'task-status': return act(API.taskEvent(d.id, d.status, d.version, me, ''), `อัปเดตเป็น "${L.task[d.status]}" แล้ว`);
      case 'task-cancel': { const v = await modal({ title: 'ยกเลิกภารกิจ', text: 'อาสาสมัครที่รับงานอยู่จะถูกปล่อยกลับมาพร้อมรับงานใหม่', fields: [{ id: 'note', label: 'เหตุผล', type: 'textarea', required: true, placeholder: 'เช่น ผู้ประสบภัยออกมาได้เองแล้ว' }], ok: 'ยกเลิกภารกิจ', danger: true }); if (!v) return; return act(API.taskEvent(d.id, 'cancelled', d.version, me, v.note), 'ยกเลิกภารกิจแล้ว'); }
      case 'support': { const v = await modal({ title: 'ขอกำลังเสริม', text: 'ศูนย์สั่งการจะเห็นคำขอนี้ทันที', fields: [{ id: 'note', label: 'ต้องการอะไรเพิ่ม', type: 'textarea', required: true, placeholder: 'เช่น ต้องการเรือเพิ่ม 1 ลำ ผู้ประสบภัยมากกว่าที่แจ้ง' }], ok: 'ส่งคำขอ' }); if (!v) return; return act(API.requestSupport(d.id, S.persona, v.note), 'ส่งคำขอกำลังเสริมแล้ว'); }
      case 'override': { const v = await modal({ title: 'ปรับคะแนนลำดับ', text: 'การปรับจะถูกบันทึกพร้อมชื่อผู้ปรับและเหตุผล', fields: [{ id: 'score', label: 'คะแนนใหม่ (0–100)', type: 'number', value: d.score, required: true }, { id: 'reason', label: 'เหตุผล', type: 'textarea', required: true }], ok: 'บันทึก' }); if (!v) return; return act(API.overridePriority(d.id, v.score, v.reason, me), 'ปรับคะแนนแล้ว'); }
      case 'new-alert': { const v = await modal({ title: 'ร่างประกาศใหม่', fields: [{ id: 'title', label: 'หัวข้อ (ภาษาไทย)', required: true }, { id: 'message', label: 'ข้อความ (ภาษาไทย)', type: 'textarea', required: true }, { id: 'audience', label: 'ส่งถึงใคร', placeholder: 'เช่น นักท่องเที่ยวในพื้นที่ป่าตอง' }, { id: 'level', label: 'ระดับ', type: 'select', value: 3, options: [[1, '1 · แจ้งข่าว'], [2, '2 · เฝ้าระวัง'], [3, '3 · เตรียมพร้อม'], [4, '4 · อันตราย'], [5, '5 · อพยพ']] }], ok: 'บันทึกร่าง' }); if (!v) return; return act(API.createAlert(S.scenario, v, me).then(r => { if (r.ok) { S.alert = r.alert.alert_id; S.lang = 'en'; } return r; }), 'บันทึกร่างแล้ว เพิ่มคำแปลอังกฤษและจีนต่อได้เลย'); }
      case 'alert-reject': { const v = await modal({ title: 'ส่งกลับให้แก้ไข', fields: [{ id: 'note', label: 'สิ่งที่ต้องแก้', type: 'textarea', required: true }], ok: 'ส่งกลับ' }); if (!v) return; return act(API.alertAction(d.id, 'reject', me, v.note), 'ส่งกลับให้แก้ไขแล้ว'); }
      case 'alert': return act(API.alertAction(d.id, d.op, me), { submit: 'ส่งให้ผู้บัญชาการทบทวนแล้ว', approve: 'อนุมัติแล้ว พร้อมเผยแพร่', publish: 'เผยแพร่แล้ว (เดโมไม่ส่งข้อความออกจริง)' }[d.op]);
      case 'review-tr': return act(API.reviewTranslation(d.id, d.lang, me), 'ยืนยันคำแปลแล้ว');
      case 'ack': { const u = ST.users.find(x => x.user_id === me); return act(API.acknowledgeAlert(d.id, me, u ? u.agency_id : ''), `รับทราบในนาม ${u ? agencyShort(u.agency_id) : 'หน่วยงาน'} แล้ว`); }
      case 'sig': return act(API.verifySignal(d.id, d.status, me), d.status === 'verified' ? 'ยืนยันข่าวแล้ว' : 'ทำเครื่องหมายว่าไม่จริงแล้ว');
      case 'sos-resend': return submitSOS(true);
      case 'chart-table': S.chartTable = !S.chartTable; return draw();
      case 'export': { const r = await API.exportReport(S.scenario, me); toast(`สร้างรายงานแล้ว (${r.snapshot_id}) และบันทึกผู้ส่งออก`); return draw(); }
      case 'import': { const srcs = (await API.getDataSources()).filter(s => s.enabled); const v = await modal({ title: 'นำเข้าชุดข้อมูล', text: 'จำลองการรับไฟล์จากแหล่งข้อมูล ถ้าใช้รหัสชุดเดิมซ้ำระบบจะปฏิเสธ', fields: [{ id: 'src', label: 'แหล่งข้อมูล', type: 'select', value: 'DS03', options: srcs.map(s => [s.source_id, s.name]) }, { id: 'key', label: 'รหัสชุดข้อมูล', value: 'smartcity-20261013-1345', hint: 'รหัสนี้เคยนำเข้าแล้ว ลองเปลี่ยนเป็นรหัสใหม่เพื่อดูผลสำเร็จ' }], ok: 'นำเข้า' }); if (!v) return; return act(API.importBatch(v.src, v.key, me), 'นำเข้าแล้ว'); }
      case 'resolve': return act(API.resolveIssue(d.id, me), 'แก้ไขและตรวจซ้ำแล้ว ข้อมูลถูกปล่อยเข้าระบบ');
      case 'user-active': return act(API.setUserActive(d.id, d.active === '1', me), 'อัปเดตบัญชีแล้ว');
      case 'kpi-bump': { const v = await modal({ title: 'ออกเวอร์ชันสูตรใหม่', text: 'ค่าเก่ายังอ้างอิงเวอร์ชันเดิม ไม่ปนกัน', fields: [{ id: 'f', label: 'สูตรใหม่ (เว้นว่างเพื่อคงเดิม)', type: 'textarea' }], ok: 'ออกเวอร์ชัน' }); if (!v) return; return act(API.bumpKPIVersion(d.id, v.f, me), 'ออกเวอร์ชันใหม่แล้ว'); }
      case 'ag-status': return act(API.setAgencyStatus(d.id, d.status, me), 'อัปเดตสถานะการประสานแล้ว');
      case 'run-tests': toast('กำลังทดสอบ…'); S.tests = await API.runTests(); toast(`ผ่าน ${S.tests.pass}/${S.tests.total}`); return draw();
      case 'reset': { const v = await modal({ title: 'รีเซ็ตเดโมทั้งหมด', text: 'ทุกอย่างที่กดไว้ในเบราว์เซอร์นี้จะกลับเป็นค่าเริ่มต้น', ok: 'รีเซ็ต', danger: true }); if (!v) return; await API.reset(); Object.assign(S, { task: null, sos: null, alert: null, cell: null, tracking: [], tests: null, access: null, sosKey: null }); toast('รีเซ็ตแล้ว'); return draw(); }
    }
    if (!S.rolePop && $('.pop')) draw();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#overlay').innerHTML && (S.rolePop || S.nav)) { S.rolePop = false; S.nav = false; draw(); } });

  /* ================================================================ INIT */
  (async () => {
    try { const th = localStorage.getItem('tci-theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
    ST = await API.getStatic();
    ST.users = await API.getUsers();
    ST.majors = await Promise.all(ST.scenarios.map(s => API.getMajorIncident(s.id)));
    await draw();
  })();
})();
