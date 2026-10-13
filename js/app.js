/* =====================================================================
 * APP v4 — Shell ตามไฟล์นำเสนอ TRI: Dashboard 3 ระดับ + ระบบปฏิบัติการเดิม
 * ===================================================================== */
(() => {
  const T = TRI, { $, $$, esc, icon, logo, icT, sev, toast, modal, hhmm, dateTH, table, callout } = T;
  const content = $('#content');

  /* ---------------- screens ---------------- */
  const SCREENS = {
    overview:    { name: 'ภาพรวมสถานการณ์', sub: 'ศูนย์บัญชาการเพื่อการตัดสินใจเชิงกลยุทธ์ในการบริหารจัดการวิกฤตการท่องเที่ยว', icon: 'home', group: 'strategic', code: '4.1.1' },
    risk:        { name: 'สถานการณ์ความเสี่ยง', sub: 'มุมมองเชิงกลยุทธ์สำหรับผู้บริหาร เพื่อการตัดสินใจและบริหารจัดการความเสี่ยงเชิงรุก', icon: 'alert', group: 'strategic', code: '4.1.2' },
    riskmap:     { name: 'แผนที่ความเสี่ยง (Risk Map)', sub: 'มุมมองแผนที่เชิงพื้นที่ เพื่อวิเคราะห์จุดเสี่ยงและพื้นที่ที่ได้รับผลกระทบ', icon: 'map', group: 'strategic', code: '4.1.2' },
    alertcenter: { name: 'การแจ้งเตือนและเหตุการณ์', sub: 'ศูนย์รวมการแจ้งเตือนและเหตุการณ์ สำหรับการติดตามและตัดสินใจในภาวะวิกฤต', icon: 'bell', group: 'strategic', code: '4.1.2' },
    forecast:    { name: 'การวิเคราะห์และคาดการณ์', sub: 'การคาดการณ์ความเสี่ยง การวางแผนสถานการณ์ และข้อเสนอแนะจาก AI', icon: 'trend', group: 'strategic', code: '4.1.2' },
    social:      { name: 'Social Listening', sub: 'ติดตามบทสนทนาออนไลน์ ชื่อเสียง ข่าวลือ และสัญญาณวิกฤตด้านการท่องเที่ยว', icon: 'chat', group: 'strategic', code: '4.1.2' },
    economy:     { name: 'นักท่องเที่ยวและเศรษฐกิจ', sub: 'จำนวนนักท่องเที่ยว รายได้ ตลาดหลัก และอัตราการเข้าพัก', icon: 'coins', group: 'strategic', code: '4.1.2' },
    crowd:       { name: 'Crowd & Mobility Analytics', sub: 'ความหนาแน่นรายพื้นที่และช่วงเวลา เที่ยวบิน เรือ และนักท่องเที่ยวต่างชาติในพื้นที่', icon: 'users', group: 'strategic', code: '5.11' },
    response:    { name: 'การตอบสนองและการดำเนินงาน', sub: 'ศูนย์บัญชาการและประสานงาน ติดตามภารกิจและขับเคลื่อนการดำเนินงาน (Single Command)', icon: 'shieldcheck', group: 'strategic', code: '4.2' },
    kpi:         { name: 'KPI และ Performance', sub: 'ตัวชี้วัดการตอบสนองจากข้อมูลจริงในระบบ พร้อมนิยามและเวอร์ชันสูตร', icon: 'target', group: 'strategic', code: '4.1.2' },
    reports:     { name: 'รายงานและเอกสาร', sub: 'แม่แบบรายงาน รายงานที่สร้างแล้ว และข้อเสนอเชิงนโยบาย', icon: 'doc', group: 'strategic', code: '4.1.2' },
    toc:         { name: 'ศูนย์ปฏิบัติการ (TOC)', sub: 'คัดกรองคำขอ SOS มอบหมายภารกิจ และติดตามการช่วยเหลือแบบเรียลไทม์', icon: 'radio', group: 'operational', code: '4.2' },
    comms:       { name: 'การสื่อสารภาวะวิกฤต', sub: 'ร่าง ทบทวน อนุมัติ และเผยแพร่ประกาศ 3 ภาษา ตรวจข่าวโซเชียลก่อนใช้', icon: 'megaphone', group: 'operational', code: '4.2' },
    field:       { name: 'แอปปฏิบัติงานภาคสนาม', sub: 'รับคำสั่ง ภารกิจของฉัน รายงานสถานการณ์ และช่องทางการสื่อสาร', icon: 'phone', group: 'field', code: '4.2' },
    sos:         { name: 'แจ้งเหตุขอความช่วยเหลือ', sub: 'แจ้งเหตุ รับเลขติดตาม และดูประกาศในพื้นที่', icon: 'sos', group: 'public', code: '4.2' },
    agencies:    { name: 'หน่วยงานและผู้ใช้งาน', sub: 'หน่วยงานภาคี 20 หน่วยตามแผนนัดหมายภูเก็ต ผู้ใช้ 3 ระดับ และสิทธิ์', icon: 'building', group: 'system', code: '4.1.1' },
    data:        { name: 'แหล่งข้อมูล', sub: 'ความสดของข้อมูล ชุดนำเข้า และปัญหาคุณภาพที่ต้องแก้', icon: 'db', group: 'system', code: '4.1.3' },
    plan:        { name: 'แผนข้อมูลโครงการ', sub: 'Dashboard 3 ระดับ ข้อมูลที่ต้องการ Dataflow แผน 9 เดือน และประเด็นหารือ', icon: 'route', group: 'system', code: '4.1.3' },
    settings:    { name: 'ตั้งค่าระบบ', sub: 'จัดการการตั้งค่าและการทำงานของระบบ', icon: 'settings', group: 'system', code: '4.1.2' },
    qa:          { name: 'ทดสอบระบบ', sub: 'ชุดทดสอบอัตโนมัติ UAT กับผู้ใช้ และเกณฑ์ประสิทธิภาพ', icon: 'flask', group: 'system', code: '4.1.4' },
    audit:       { name: 'บันทึกกิจกรรม', sub: 'ทุกการกระทำในเดโมถูกบันทึกที่นี่ แก้ไขย้อนหลังไม่ได้', icon: 'list', group: 'system', code: '4.1.4' },
  };
  const GROUPS = { strategic: 'ระดับผู้บริหาร', operational: 'ระดับปฏิบัติการ', field: 'ระดับพื้นที่', public: 'สาธารณะ', system: 'ข้อมูลและระบบ' };
  const ROLE_SCREENS = {
    commander: ['overview', 'risk', 'riskmap', 'alertcenter', 'forecast', 'social', 'economy', 'crowd', 'response', 'kpi', 'reports', 'toc', 'comms', 'agencies', 'plan', 'settings', 'audit'],
    dispatcher: ['toc', 'comms', 'response', 'alertcenter', 'riskmap', 'crowd', 'overview', 'agencies', 'plan', 'audit'],
    agency: ['alertcenter', 'comms', 'response', 'riskmap', 'agencies'],
    steward: ['data', 'plan', 'kpi', 'forecast', 'social', 'risk', 'riskmap', 'crowd', 'reports', 'agencies', 'qa', 'audit'],
    admin: ['settings', 'agencies', 'data', 'plan', 'qa', 'audit'],
    volunteer: ['field'],
    tourist: ['sos'],
  };
  const LEVELS = [['ระดับผู้บริหาร (Strategic)', ['commander'], '#1d2a4a'], ['ระดับปฏิบัติการ (Operational)', ['dispatcher', 'agency'], '#2f6fec'], ['ระดับปฏิบัติงานพื้นที่ (Field)', ['volunteer'], '#1f9d55'], ['ข้อมูล ระบบ และสาธารณะ', ['steward', 'admin', 'tourist'], '#0e8f88']];
  T.LEVEL_OF = { commander: 'ผู้บริหาร', dispatcher: 'ปฏิบัติการ', agency: 'ปฏิบัติการ', volunteer: 'พื้นที่', steward: 'ข้อมูล', admin: 'ระบบ', tourist: 'สาธารณะ' };
  const ROLE_USER = { commander: 'U01', dispatcher: 'U02', agency: 'U04', steward: 'U05', admin: 'U06' };
  const AG_USERS = ['U04', 'U09', 'U10', 'U11', 'U12'];
  const ROLE_INIT = { commander: 'ผบ', dispatcher: 'ศป', agency: 'นง', steward: 'ขม', volunteer: 'อส', tourist: 'นท', admin: 'ผร' };
  const ROLE_TITLE = { commander: 'ผู้บริหารระดับสูง', dispatcher: 'เจ้าหน้าที่ศูนย์ปฏิบัติการ', agency: 'เจ้าหน้าที่หน่วยงาน', steward: 'ผู้ดูแลข้อมูล', admin: 'ผู้ดูแลระบบ', volunteer: 'เจ้าหน้าที่ภาคสนาม', tourist: 'นักท่องเที่ยว' };

  const TOUR = [
    { role: 'commander', screen: 'overview', scenario: 'flood', title: 'ภาพรวมสำหรับผู้บริหาร', text: 'KPI 6 ตัว แผนที่ความเสี่ยง ศูนย์แจ้งเตือน และคำแนะนำ AI อยู่ในหน้าเดียว แถบด้านบนคือเรื่องที่รอการตัดสินใจจากระบบปฏิบัติการ' },
    { role: 'tourist', screen: 'sos', title: 'นักท่องเที่ยวแจ้งขอความช่วยเหลือ', text: 'เลือกประเภทปัญหา พิมพ์รายละเอียด แล้วกด "ส่งคำขอ" ระบบให้เลขติดตามทันที ลองกด "ส่งซ้ำ" จะได้เลขเดิม' },
    { role: 'dispatcher', screen: 'toc', tab: 'sos', title: 'ศูนย์ปฏิบัติการคัดกรองคำขอ', text: 'คำขอใหม่อยู่ในแท็บ "รอคัดกรอง" กำหนดความเร่งด่วนและทักษะ แล้วกด "ยืนยันและสร้างภารกิจ"' },
    { role: 'dispatcher', screen: 'toc', tab: 'task', title: 'เสนองานให้อาสาสมัคร', text: 'เลือกภารกิจที่รอมอบหมาย ระบบจัดอาสาที่เหมาะที่สุดไว้แรก กด "เสนองาน" บนการ์ดได้เลย' },
    { role: 'volunteer', persona: 'V01', screen: 'field', title: 'แอปภาคสนาม: รับงานและรายงาน', text: 'อาสาสมัคร 01 มีข้อเสนองานรออยู่ กด "รับงาน" แล้วกดสถานะถัดไป ส่งรายงานจากหน้างานได้ในส่วน "รายงานสถานการณ์"' },
    { role: 'commander', screen: 'comms', title: 'ผู้บริหารอนุมัติประกาศ 3 ภาษา', text: 'เปิดประกาศที่ "รอทบทวน" ถ้าภาษาจีนยังไม่มีผู้ตรวจ ให้กดแท็บ 中文 แล้ว "ยืนยันคำแปล" ก่อน จากนั้นกด "อนุมัติ"' },
    { role: 'commander', screen: 'response', title: 'สั่งการหน่วยงาน (Single Command)', text: 'กด "สั่งการหน่วยงาน" เลือกหน่วยงานและพิมพ์คำสั่ง แล้วติดตามเวลาส่ง–รับทราบ–เสร็จสิ้นในบันทึกการสั่งการ' },
  ];

  /* ---------------- state ---------------- */
  const S = T.S = { screen: 'overview', scenario: 'flood', role: 'commander', persona: 'V01', agencyUser: 'U04', cmdTab: 'sos', taskFilter: 'open', mapPlace: 'patong', tracking: [], tech: false, tour: true, tourStep: 0, sosUrg: 3, accAction: 'read', uat: {} };
  try { Object.assign(S, JSON.parse(localStorage.getItem('tri-ui-v4') || '{}')); } catch (e) {}
  { const q = new URLSearchParams(location.search); ['screen', 'scenario', 'role', 'persona', 'agencyUser'].forEach(k => { if (q.has(k)) { S[k] = q.get(k); S.tour = false; } }); const h = location.hash.slice(1); if (h && SCREENS[h]) S.screen = h; }
  S.rolePop = false; S.nav = false; S.bellPop = false;
  const persist = () => { try { localStorage.setItem('tri-ui-v4', JSON.stringify({ screen: S.screen, scenario: S.scenario, role: S.role, persona: S.persona, agencyUser: S.agencyUser, tracking: S.tracking, tech: S.tech, tour: S.tour, tourStep: S.tourStep, cmdTab: S.cmdTab, sosKey: S.sosKey, uat: S.uat, layers: S.layers, mapPlace: S.mapPlace })); } catch (e) {} };

  T.role = () => T.ST.roles.find(r => r.role_code === S.role) || T.ST.roles[0];
  T.can = p => T.role().can.includes(p);
  T.actor = () => S.role === 'volunteer' ? S.persona : S.role === 'agency' ? S.agencyUser : S.role === 'tourist' ? 'นักท่องเที่ยว (บัญชี)' : ROLE_USER[S.role];
  T.userName = id => { const u = (T.ST.users || []).find(x => x.user_id === id); if (u) return u.display_name; const v = (T.ST.vols || []).find(x => x.volunteer_id === id); return v ? v.display_name : (id === 'system' ? 'ระบบ' : id); };
  const screensOf = () => ROLE_SCREENS[S.role] || ['overview'];

  async function act(p, ok) { const r = await p; if (r && r.ok === false) { toast(r.error, true); return false; } if (ok) toast(ok); await draw(); return r; }

  /* ---------------- shell ---------------- */
  async function drawShell(badges) {
    const r = T.role(), list = screensOf();
    const groups = Object.keys(GROUPS).filter(g => list.some(k => SCREENS[k].group === g));
    const rail = $('#rail');
    rail.className = 'rail' + (S.nav ? ' open' : '');
    const personaName = S.role === 'volunteer' ? T.userName(S.persona) : S.role === 'agency' ? T.userName(S.agencyUser) : S.role === 'tourist' ? 'ผู้แจ้งเหตุ' : T.userName(ROLE_USER[S.role]);
    rail.innerHTML = `<div class="brand"><span class="brand-mark">${logo(40)}</span><div><div class="brand-name">Tourism Risk Intelligence</div><div class="brand-sub">Thailand · Phuket Sandbox</div></div></div>
      <button class="profile" data-action="role-pop"><span class="avatar">${ROLE_INIT[S.role]}</span><span style="min-width:0;flex:1"><b>${esc(ROLE_TITLE[S.role])}</b><span>${esc(personaName)}</span><span class="online">● ออนไลน์ · ระดับ${esc(T.LEVEL_OF[S.role])}</span></span>${icon('down', 16)}</button>
      ${groups.map(g => `${groups.length > 1 ? `<div class="nav-group">${GROUPS[g]}</div>` : ''}` + list.filter(k => SCREENS[k].group === g).map(k => `<button class="nav-item" data-screen="${k}" ${k === S.screen ? 'aria-current="page"' : ''}>${icon(SCREENS[k].icon, 19)}<span>${SCREENS[k].name}</span>${badges[k] ? `<span class="nav-badge">${badges[k]}</span>` : ''}</button>`).join('')).join('')}
      <button class="nav-item" data-action="logout">${icon('logout', 19)}<span>ออกจากระบบ</span></button>
      <div class="rail-foot"><button class="nav-item" data-action="tour-open" style="padding:7px 6px">${icon('play', 16)}<span>ทัวร์สาธิต</span></button>
        <label class="switch"><input type="checkbox" id="tech-toggle" ${S.tech ? 'checked' : ''}>แสดงรายละเอียดเทคนิค</label>
        <span>ข้อมูลจำลองทั้งหมด · ไม่ส่งข้อความออกจริง</span></div>`;
    const sc = SCREENS[S.screen];
    const feed = DASH.alerts.feed.slice(0, 6);
    let personaSel = '';
    if (S.rolePop && S.role === 'volunteer') personaSel = `<div class="pop-persona"><label class="small" for="persona-sel">เป็นอาสาสมัครคนไหน</label><select class="input" id="persona-sel">${T.ST.vols.map(v => `<option value="${v.volunteer_id}" ${v.volunteer_id === S.persona ? 'selected' : ''}>${esc(v.display_name)} · ${esc(T.agencyShort(v.agency_id))}</option>`).join('')}</select></div>`;
    if (S.rolePop && S.role === 'agency') personaSel = `<div class="pop-persona"><label class="small" for="persona-sel">เจ้าหน้าที่หน่วยงานไหน</label><select class="input" id="persona-sel">${T.ST.users.filter(u => AG_USERS.includes(u.user_id)).map(u => `<option value="${u.user_id}" ${u.user_id === S.agencyUser ? 'selected' : ''}>${esc(T.agencyShort(u.agency_id))}</option>`).join('')}</select></div>`;
    $('#topbar').innerHTML = `<button class="btn ghost sm menu-btn" data-action="nav" aria-label="เปิดเมนู">${icon('menu', 18)}</button>
      <div class="page-title"><h1>${esc(sc.name)} <span class="stp info" style="vertical-align:4px;font-size:11px" title="งานส่งมอบตามงบประมาณ">งาน ${sc.code}</span></h1><p>${esc(sc.sub)}</p></div>
      <div class="top-tools"><span class="tchip hide-m">${icon('calendar', 16)} 13 ต.ค. 2569</span><span class="tchip hide-m" id="clock">${icon('clock', 16)} ${hhmm(T.NOW.toISOString())} น.</span><span class="tchip hide-m">${icon('globe', 16)} TH</span>
        <button class="bell" data-action="bell" aria-label="การแจ้งเตือน ${badges._bell} รายการ">${icon('bell', 19)}${badges._bell ? `<span class="dot">${badges._bell}</span>` : ''}</button>
        <button class="user-btn" data-action="role-pop" aria-expanded="${S.rolePop}" aria-haspopup="dialog"><span class="avatar">${ROLE_INIT[S.role]}</span><span class="uinfo"><b>${esc(personaName)}</b><span>${esc(r.name)}</span></span>${icon('down', 16)}</button>
        ${S.rolePop ? `<div class="pop" role="dialog" aria-label="เปลี่ยนมุมมอง">${LEVELS.map(([n, roles, col]) => `<div class="pop-level"><i class="dotsw" style="background:${col}"></i>${esc(n)}</div>${roles.map(rc => { const x = T.ST.roles.find(y => y.role_code === rc); return `<button class="pop-item" data-role="${rc}" aria-current="${rc === S.role}"><span class="avatar">${ROLE_INIT[rc]}</span><span><b>${esc(x.name)}</b><span>${esc(x.duty)}</span></span></button>`; }).join('')}`).join('')}${personaSel}</div>` : ''}
        ${S.bellPop ? `<div class="pop" role="dialog" aria-label="การแจ้งเตือน" style="right:60px"><div class="row between" style="padding:6px 10px"><b>การแจ้งเตือน</b>${screensOf().includes('alertcenter') ? '<button class="link-btn" data-go="alertcenter">ดูทั้งหมด</button>' : ''}</div>${badges._live.map(x => `<button class="notif-item" data-go="${x.go}" ${x.tab ? `data-tab="${x.tab}"` : ''}>${icT(x.icon, x.tone, 15)}<span><b style="font-size:13.5px">${esc(x.t)}</b><br><span class="tiny">จากระบบปฏิบัติการ</span></span><span class="tiny">ตอนนี้</span></button>`).join('')}${feed.map(f => `<button class="notif-item" ${screensOf().includes('alertcenter') ? `data-go="alertcenter" data-alertsel="${f.id}"` : ''}>${icT(f.icon, { crit: 'red', high: 'orange', med: 'yellow' }[f.sev], 15)}<span><b style="font-size:13.5px">${esc(f.name)}</b><br><span class="tiny">${esc(f.area)}</span></span><span class="tiny">${f.time} น.</span></button>`).join('')}</div>` : ''}
      </div>`;
    let scr = document.querySelector('.scrim');
    if (S.nav && !scr) { scr = document.createElement('div'); scr.className = 'scrim'; scr.dataset.action = 'nav'; document.body.appendChild(scr); }
    if (!S.nav && scr) scr.remove();
  }

  function drawTour() {
    let el = $('#tour'); if (!el) { el = document.createElement('div'); el.id = 'tour'; document.body.appendChild(el); }
    if (!S.tour) { el.innerHTML = ''; return; }
    S.tourStep = Math.min(S.tourStep || 0, TOUR.length - 1);
    const st = TOUR[S.tourStep], r = T.ST.roles.find(x => x.role_code === st.role);
    const here = S.role === st.role && S.screen === st.screen;
    el.innerHTML = `<div class="tour" role="dialog" aria-label="ทัวร์สาธิต"><div class="tour-head"><b>ทัวร์สาธิต ${S.tourStep + 1}/${TOUR.length}</b><button data-action="tour-close" aria-label="ซ่อนทัวร์">ซ่อน</button></div>
      <div class="tour-body"><div class="tour-steps">${TOUR.map((_, i) => `<span class="${i <= S.tourStep ? 'on' : ''}"></span>`).join('')}</div>
        <span class="tour-who">${icon('person', 13)} มุมมอง: ${esc(r.name)} · ระดับ${esc(T.LEVEL_OF[st.role])}</span><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p>
        <div class="row between">${S.tourStep > 0 ? '<button class="btn sm quiet" data-action="tour-prev">ย้อนกลับ</button>' : '<span></span>'}
          ${here ? (S.tourStep < TOUR.length - 1 ? '<button class="btn sm" data-action="tour-next">ขั้นต่อไป</button>' : '<button class="btn sm" data-action="tour-close">จบทัวร์</button>') : `<button class="btn sm pulse" data-action="tour-go">${icon('play', 13)} พาไปที่ขั้นนี้</button>`}</div></div></div>`;
  }
  function tourGo() { const st = TOUR[S.tourStep]; S.role = st.role; S.screen = st.screen; if (st.scenario) S.scenario = st.scenario; if (st.tab) S.cmdTab = st.tab; if (st.persona) S.persona = st.persona; if (st.tab === 'task') S.taskFilter = 'pending'; S.cmdTabPinned = true; S.task = null; S.sos = null; S.alert = null; S.lang = 'th'; }

  async function draw() {
    T.NOW = new Date(await API.now());
    if (!screensOf().includes(S.screen)) S.screen = screensOf()[0];
    const [tasks, alerts, sos, allTasks] = await Promise.all([API.getTasks(S.scenario), API.getAlerts(S.scenario), API.getSOS(S.scenario), API.getTasks()]);
    const review = alerts.filter(a => a.status === 'review').length, waitS = sos.filter(x => x.status === 'received').length, pend = tasks.filter(t => t.status === 'pending').length;
    const live = [];
    if (review) live.push({ t: `ประกาศรออนุมัติ ${review} รายการ`, go: 'comms', icon: 'megaphone', tone: 'orange' });
    if (waitS) live.push({ t: `คำขอ SOS รอคัดกรอง ${waitS} รายการ`, go: 'toc', tab: 'sos', icon: 'sos', tone: 'red' });
    if (pend) live.push({ t: `ภารกิจรอมอบหมาย ${pend} งาน`, go: 'toc', tab: 'task', icon: 'clipboard', tone: 'blue' });
    const liveOk = live.filter(x => screensOf().includes(x.go));
    const badges = { toc: waitS + pend, comms: review, field: S.role === 'volunteer' ? allTasks.filter(t => t.status === 'offered' && t.assignments.some(a => a.status === 'offered' && a.volunteer_id === S.persona)).length : 0, alertcenter: DASH.alerts.kpis[1].value, _live: liveOk, _bell: DASH.alerts.feed.slice(0, 6).length + liveOk.length };
    await drawShell(badges);
    let body;
    try { body = await T.screens[S.screen](); }
    catch (err) { console.error(err); body = `<section class="card"><div class="empty">${icon('alert', 28)}<p><b>แสดงหน้านี้ไม่ได้</b><br>ข้อมูลเดโมในเบราว์เซอร์นี้อาจมาจากเวอร์ชันเก่า กดรีเซ็ตเพื่อเริ่มใหม่</p><p style="margin-top:12px"><button class="btn" data-action="hard-reset">รีเซ็ตข้อมูลเดโม</button></p></div></section>`; }
    content.innerHTML = body + `<div class="footer"><span>Tourism Risk Intelligence · Phuket Sandbox · เว็บจำลองด้วยข้อมูลสมมติ</span><span>มุมมอง: ${esc(T.role().name)}</span></div>`;
    drawTour(); persist();
    document.documentElement.classList.toggle('show-tech', !!S.tech);
  }
  T.draw = draw;

  /* ---------------- helpers for actions ---------------- */
  const agencyOptions = () => T.ST.agencies.filter(a => ['core', 'support'].includes(a.tier)).map(a => [a.agency_id, `${a.no ? a.no + '. ' : ''}${a.short}`]);
  function needsDrawer() {
    const key = DASH.needs[S.screen] ? S.screen : 'overview';
    const ov = $('#overlay');
    ov.innerHTML = `<div class="drawer-back"><div class="drawer" role="dialog" aria-label="ข้อมูลที่ต้องการ"><div class="row between"><div><span class="eyebrow">ข้อมูลที่ต้องการสำหรับหน้า</span><h2>${esc(SCREENS[S.screen].name)}</h2></div><button class="btn ghost sm" data-close="1">${icon('x', 16)} ปิด</button></div>
      ${DASH.needs[S.screen] ? '' : callout('หน้านี้ใช้ข้อมูลชุดเดียวกับภาพรวมสถานการณ์', 'info')}
      <div class="needs" style="grid-template-columns:repeat(2,minmax(0,1fr))">${DASH.needs[key].map(([h, items]) => `<div class="need"><h4>${esc(h)}</h4><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
      ${screensOf().includes('plan') ? '<button class="btn outline" data-close="1" data-go="plan" data-plantab="tables">ดูตารางข้อมูลที่ต้องการทั้ง 7 หมวด</button>' : ''}</div></div>`;
    $('.drawer-back').onclick = e => { const c = e.target.closest('[data-close]'); if (e.target.classList.contains('drawer-back') || c) { ov.innerHTML = ''; if (c && c.dataset.go) { S.screen = c.dataset.go; if (c.dataset.plantab) S.planTab = c.dataset.plantab; draw(); } } };
  }
  async function compareModal() {
    const rows = []; for (const s of T.ST.scenarios) { const [k, m] = await Promise.all([API.getKPIs(s.id), API.getMajorIncident(s.id)]); rows.push({ s, k, m }); }
    await modal({ title: 'เปรียบเทียบสถานการณ์ 3 เหตุการณ์', wide: true, ok: '', cancel: 'ปิด', html: table(['ตัวชี้วัด', ...rows.map(r => r.s.name)], [['ความรุนแรง', r => `${r.m.severity}/5`], ['ขั้นตอนการตอบสนอง', r => (T.ST.protocol_stages.find(p => p[0] === r.m.status) || [])[1]], ['เหตุที่ยืนยันแล้ว', r => r.k.incidents_confirmed], ['คำขอ SOS ที่ยังเปิด', r => r.k.sos_open], ['ภารกิจรอมอบหมาย', r => r.k.tasks_pending], ['เวลาเริ่มตอบสนอง (นาที)', r => r.k.resp_start_p50 ?? '—'], ['งานเสร็จตามเวลา (%)', r => r.k.sla_rate ?? '—']].map(([n, f]) => ({ cells: [`<b>${n}</b>`, ...rows.map(r => esc(f(r)))] }))) + '<p class="tiny" style="margin-top:8px">ค่าจากข้อมูลสดในเดโม ณ เวลาปัจจุบัน</p>' });
  }
  const REPORT_NAMES = { exec: 'รายงานผู้บริหารรายวัน', daily: 'รายงานสถานการณ์ประจำวัน', aar: 'รายงานหลังเหตุการณ์ (AAR)', social: 'รายงาน Social Listening', forecast: 'รายงานวิเคราะห์และคาดการณ์', risk: 'รายงานสถานการณ์ความเสี่ยง' };
  async function makeReport(type) {
    const sc = T.ST.scenarios.find(s => s.id === S.scenario);
    await API.generateReport(type, `${REPORT_NAMES[type] || 'รายงาน'} · ${sc.name} · ${hhmm(T.NOW.toISOString())} น.`, S.scenario, T.actor());
    toast(`สร้าง "${REPORT_NAMES[type] || 'รายงาน'}" แล้ว ดูได้ที่หน้ารายงานและเอกสาร`);
  }
  async function newAlert() {
    const v = await modal({ title: 'ร่างประกาศใหม่', fields: [{ id: 'title', label: 'หัวข้อ (ภาษาไทย)', required: true }, { id: 'message', label: 'ข้อความ (ภาษาไทย)', type: 'textarea', required: true }, { id: 'audience', label: 'ส่งถึงใคร', placeholder: 'เช่น นักท่องเที่ยวในพื้นที่ป่าตอง' }, { id: 'level', label: 'ระดับ', type: 'select', value: 3, options: [[1, '1 · แจ้งข่าว'], [2, '2 · เฝ้าระวัง'], [3, '3 · เตรียมพร้อม'], [4, '4 · อันตราย'], [5, '5 · อพยพ']] }], ok: 'บันทึกร่าง' });
    if (!v) return;
    return act(API.createAlert(S.scenario, v, T.actor()).then(r => { if (r.ok) { S.alert = r.alert.alert_id; S.lang = 'en'; } return r; }), 'บันทึกร่างแล้ว เพิ่มคำแปลอังกฤษและจีนต่อได้เลย');
  }
  async function submitSOS(resend) {
    if (!resend || !S.sosKey) S.sosKey = 'idem-' + Math.random().toString(36).slice(2, 10);
    const detail = $('#sos-detail').value.trim();
    if (!detail && !resend) { toast('พิมพ์รายละเอียดสั้นๆ ว่าเกิดอะไรขึ้น', true); $('#sos-detail').focus(); return; }
    const r = await API.submitSOS({ area_id: $('#sos-area').value, request_type: ($('input[name="sos-type"]:checked') || {}).value || 'other', request_detail: detail || 'ส่งซ้ำ', people_count: $('#sos-people').value, urgency: S.sosUrg || 3, location_accuracy_m: 25, contact: $('#sos-contact').value, vulnerability_flags: $$('input[name="sos-vuln"]:checked').map(x => x.value) }, S.sosKey);
    if (r.ok === false) return toast(r.error, true);
    S.tracking = S.tracking || []; if (!S.tracking.includes(r.tracking_no)) S.tracking.unshift(r.tracking_no);
    toast(r.idempotent_replay ? `ได้รับคำขอนี้แล้ว ใช้เลขติดตามเดิม ${r.tracking_no}` : `ส่งคำขอแล้ว เลขติดตาม ${r.tracking_no}`); return draw();
  }

  /* ---------------- events ---------------- */
  document.addEventListener('submit', async e => {
    const f = e.target; if (!f.id || f.id === 'mdl') return; e.preventDefault(); const me = T.actor();
    if (f.id === 'screen-form') { const ub = $('#sc-urg [aria-pressed="true"]'); return act(API.screenSOS(f.dataset.id, { urgency: ub ? Number(ub.dataset.urg) : 3, incident_id: $('#sc-inc').value, agency_id: $('#sc-ag').value, title: $('#sc-title').value, required_skills: $$('input[name="sc-skill"]:checked').map(x => x.value), vulnerability_flags: $$('input[name="sc-vuln"]:checked').map(x => x.value), hard_priority: $('#sc-hard').checked, task_type: 'other' }, me).then(r => { if (r.ok) { S.task = r.task.task_id; S.sos = null; S.cmdTab = 'task'; S.taskFilter = 'pending'; } return r; }), 'สร้างภารกิจแล้ว เลือกอาสาสมัครเพื่อเสนองานได้เลย'); }
    if (f.id === 'sos-form') return submitSOS(false);
    if (f.id === 'track-form') { const no = $('#track-no').value.trim(); if (!no) return; const r = await API.trackSOS(no); if (r.ok === false) return toast('ไม่พบเลขติดตามนี้ ตรวจตัวอักษรอีกครั้ง', true); S.tracking = S.tracking || []; if (!S.tracking.includes(no)) S.tracking.unshift(no); return draw(); }
    if (f.id === 'tr-form') return act(API.setTranslation(f.dataset.id, f.dataset.lang, $('#tr-title').value, $('#tr-msg').value, me), 'บันทึกข้อความแล้ว');
    if (f.id === 'acc-form') { S.access = await API.checkAccess($('#acc-user').value, $('#acc-area').value, S.accAction || 'read'); return draw(); }
    if (f.id === 'field-form') { const vol = T.ST.vols.find(v => v.volunteer_id === S.persona) || {}; const sc = { A1: 'flood', A2: 'flood', A3: 'crowd', A4: 'boat' }[vol.area_id] || S.scenario; return act(API.submitFieldReport(sc, { kind: S.repKind || 'photo', text: $('#fr-text').value.trim(), injured: $('#fr-inj').value, missing: $('#fr-mis').value, area_id: vol.area_id }, me), 'ส่งรายงานแล้ว ศูนย์ปฏิบัติการเห็นในแท็บ "เหตุและรายงานภาคสนาม"'); }
  });

  document.addEventListener('change', e => {
    const t = e.target; if (t.closest('#mdl')) return;
    if (t.id === 'tech-toggle') { S.tech = t.checked; document.documentElement.classList.toggle('show-tech', S.tech); persist(); return; }
    if (t.id === 'persona-sel') { if (S.role === 'agency') S.agencyUser = t.value; else S.persona = t.value; S.rolePop = false; draw(); return; }
    if (t.id === 'pub-view') { S.publicView = t.checked; draw(); return; }
    if (t.id === 'sos-area') { S.sosArea = t.value; draw(); return; }
    if (t.name === 'sos-type') { S.sosType = t.value; return; }
    if (t.name === 'agfunc') { S.agFunc = t.value; draw(); return; }
    if (t.dataset.rule) { act(API.toggleRule(t.dataset.rule, T.actor()), 'อัปเดตกฎแล้ว'); return; }
    if (t.dataset.layer) { S.layers = (S.layers || DASH.map.layers.map(l => ({ id: l.id, on: l.on }))).map(l => l.id === t.dataset.layer ? { ...l, on: t.checked } : l); draw(); return; }
    if (t.dataset.setting) { act(API.saveSetting(t.dataset.setting, t.checked, T.actor()), 'บันทึกการตั้งค่าแล้ว'); return; }
    if (t.dataset.settingSel) { act(API.saveSetting(t.dataset.settingSel, t.value, T.actor()), 'บันทึกการตั้งค่าแล้ว'); return; }
    if (t.dataset.filter) {
      const k = t.dataset.filter, v = t.value;
      if (k === 'scenario') { S.scenario = v; S.task = null; S.sos = null; S.alert = null; S.cell = null; S.cmdTabPinned = false; toast('เปลี่ยนเหตุการณ์ที่ติดตามแล้ว'); }
      else if (k === 'area') { if (v) { S.mapPlace = v; S.areaChosen = true; } else { S.mapPlace = 'patong'; S.areaChosen = false; } }
      else if (k === 'province') { if (v === 'all') { toast('ยังเชื่อมต่อเฉพาะภูเก็ต (Sandbox) จังหวัดอื่นอยู่ในระยะขยายผล', true); t.value = 'phuket'; } return; }
      else S['f' + k[0].toUpperCase() + k.slice(1)] = v;
      draw();
    }
  });

  document.addEventListener('click', async e => {
    if (e.target.closest('#mdl, .modal-back, .drawer-back')) return;
    if (e.target.closest('label.choice, label.tile, label.switch, label.layer')) return;
    const b = e.target.closest('button, .agency-pill, tr[data-alertsel], g.map-zone, .scrim');
    if (!b) { if ((S.rolePop || S.bellPop) && !e.target.closest('.pop')) { S.rolePop = false; S.bellPop = false; draw(); } return; }
    const d = b.dataset, me = T.actor();
    if ((S.rolePop || S.bellPop) && !b.closest('.pop') && !['role-pop', 'bell'].includes(d.action)) { S.rolePop = false; S.bellPop = false; }
    if (d.step) { const i = $('#sos-people'); i.value = Math.max(0, Number(i.value || 0) + Number(d.step)); return; }
    if (d.urg) { $$('#sc-urg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.surg) { S.sosUrg = Number(d.surg); $$('#sos-urg button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.acc) { S.accAction = d.acc; $$('#acc-action button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if (d.repkind) { S.repKind = d.repkind; return draw(); }
    if (d.screen) { S.screen = d.screen; S.nav = false; return draw(); }
    if (d.role) { S.role = d.role; S.rolePop = false; S.screen = screensOf()[0]; toast(`เปลี่ยนเป็นมุมมอง ${T.role().name}`); return draw(); }
    if (d.go) {
      if (!screensOf().includes(d.go)) { toast(`มุมมอง "${T.role().name}" ไม่มีหน้านี้ เปลี่ยนมุมมองที่มุมขวาบน`, true); return; }
      S.screen = d.go; S.nav = false;
      if (d.scenarioGo) S.scenario = d.scenarioGo;
      if (d.tab) { S.cmdTab = d.tab; S.cmdTabPinned = true; } if (d.task) { S.task = d.task; S.taskFilter = 'open'; } if (d.alert) { S.alert = d.alert; S.lang = 'th'; }
      if (d.alertsel) S.alertSel = d.alertsel; if (d.plantab) S.planTab = d.plantab; if (d.agtab) S.agTab = d.agtab;
      return draw();
    }
    if (d.alertsel) { S.alertSel = d.alertsel; return draw(); }
    if (d.place) { S.mapPlace = d.place; S.areaChosen = true; return draw(); }
    if (d.fctab) { S.fcTab = Number(d.fctab); return draw(); }
    if (d.soclang) { S.socLang = d.soclang; return draw(); }
    if (d.trendtab) { S.trendTab = d.trendtab; return draw(); }
    if (d.fcrange) { S.fcRange = Number(d.fcrange); return draw(); }
    if (d.scsel) { S.scSel = d.scsel; return draw(); }
    if (d.settab) { S.setTab = d.settab; return draw(); }
    if (d.plantab) { S.planTab = d.plantab; return draw(); }
    if (d.dtab) { S.dTab = Number(d.dtab); return draw(); }
    if (d.agtab) { S.agTab = d.agtab; return draw(); }
    if (d.qatab) { S.qaTab = d.qatab; return draw(); }
    if (d.tab) { S.cmdTab = d.tab; S.cmdTabPinned = true; return draw(); }
    if (d.tfilter) { S.taskFilter = d.tfilter; S.task = null; return draw(); }
    if (d.task) { S.task = d.task; return draw(); }
    if (d.sos) { S.sos = d.sos; return draw(); }
    if (d.alert && !d.action) { S.alert = d.alert; S.lang = 'th'; return draw(); }
    if (d.lang && !d.action) { S.lang = d.lang; return draw(); }
    if (d.agencyRow) { S.agencySel = d.agencyRow; return draw(); }
    if (d.agtier) { S.agTier = d.agtier; S.agFunc = ''; return draw(); }
    if (d.agency && b.classList.contains('agency-pill')) { if (!screensOf().includes('agencies')) return; const ag = T.ST.agencies.find(x => x.agency_id === d.agency); S.agencySel = d.agency; S.agTier = ag ? ag.tier : 'all'; S.agFunc = ''; S.agTab = 'agencies'; S.screen = 'agencies'; return draw(); }
    if (d.cell) { const [c, h] = d.cell.split(':'); S.cell = [c, Number(h)]; return draw(); }
    const scName = () => T.ST.scenarios.find(s => s.id === S.scenario).name;
    switch (d.action) {
      case 'nav': S.nav = !S.nav; return draw();
      case 'role-pop': S.rolePop = !S.rolePop; S.bellPop = false; return draw();
      case 'bell': S.bellPop = !S.bellPop; S.rolePop = false; return draw();
      case 'logout': S.rolePop = true; toast('เดโม: เลือกมุมมองผู้ใช้ใหม่จากรายการ'); return draw();
      case 'tour-open': S.tour = true; S.nav = false; return draw();
      case 'tour-close': S.tour = false; return draw();
      case 'tour-go': tourGo(); return draw();
      case 'tour-next': S.tourStep = Math.min(TOUR.length - 1, S.tourStep + 1); tourGo(); return draw();
      case 'tour-prev': S.tourStep = Math.max(0, S.tourStep - 1); tourGo(); return draw();
      case 'noop': return toast('ส่วนนี้แสดงเพื่อสาธิตหน้าจอ ยังไม่เชื่อมฟังก์ชัน');
      case 'needs': return needsDrawer();
      case 'compare': return compareModal();
      case 'export-report': return makeReport(S.screen === 'social' ? 'social' : S.screen === 'forecast' ? 'forecast' : ['risk', 'riskmap'].includes(S.screen) ? 'risk' : 'exec');
      case 'report': await makeReport(d.type || 'exec'); if (S.screen === 'reports') draw(); return;
      case 'report-view': { const r = (await API.getReports()).find(x => x.rep_id === d.id); const k = await API.getKPIs(r.scenario || S.scenario); return modal({ title: r.name, ok: '', cancel: 'ปิด', html: `<p class="small">สร้างโดย ${esc(T.userName(r.by))} · ${dateTH(r.at)}</p><dl class="kv"><dt>เหตุที่ยืนยันแล้ว</dt><dd>${k.incidents_confirmed} เหตุ</dd><dt>คำขอ SOS ที่ยังเปิด</dt><dd>${k.sos_open} รายการ</dd><dt>ภารกิจกำลังดำเนินการ</dt><dd>${k.tasks_active} งาน</dd><dt>เวลาเริ่มตอบสนอง</dt><dd>${k.resp_start_p50 ?? '—'} นาที</dd><dt>อาสาพร้อมออกงาน</dt><dd>${k.volunteers_ready} คน</dd></dl>${callout('เดโมแสดงสรุปจาก Snapshot ไม่สร้างไฟล์จริง ระบบจริงส่งออกเป็น PDF/Excel พร้อมบันทึกผู้ส่งออก')}` }); }
      case 'q-alert': if (!screensOf().includes('comms')) return toast('มุมมองนี้ไม่มีสิทธิ์ร่างประกาศ', true); S.screen = 'comms'; await draw(); if (T.can('draft_alert')) return newAlert(); return toast('มุมมองนี้อนุมัติประกาศได้ การร่างประกาศเป็นหน้าที่ศูนย์ปฏิบัติการ');
      case 'q-multilang': if (!screensOf().includes('comms')) return toast('มุมมองนี้ไม่มีหน้าการสื่อสาร', true); S.screen = 'comms'; S.lang = 'en'; await draw(); return toast('ตรวจคำแปลภาษาอังกฤษและจีนก่อนเผยแพร่');
      case 'cmd': { const m = await API.getMajorIncident(S.scenario); const place = d.area ? DASH.riskmap.areas[d.area] : null; const v = await modal({ title: 'สั่งการหน่วยงาน', text: `เหตุการณ์: ${m.title}`, fields: [{ id: 'ag', label: 'หน่วยงานผู้รับคำสั่ง', type: 'select', value: d.agency || m.agencies.lead, options: agencyOptions() }, { id: 'text', label: 'คำสั่ง', type: 'textarea', required: true, value: place ? `ดำเนินการตามแนวทางในพื้นที่${place.name}: ${place.advice}` : '', placeholder: 'เช่น ส่งทีมกู้ภัยทางน้ำ 2 ชุดไปถนนบางลา รายงานกลับทุก 30 นาที' }], ok: 'ส่งคำสั่ง' }); if (!v) return; return act(API.issueCommand(S.scenario, v.ag, v.text, me), 'ส่งคำสั่งแล้ว ติดตามได้ในบันทึกการสั่งการ (หน้าการตอบสนอง)'); }
      case 'cmd-step': return act(API.commandStep(d.id, me), 'อัปเดตสถานะคำสั่งแล้ว');
      case 'meeting': { const v = await modal({ title: 'เปิดประชุมด่วน', text: 'เชิญหน่วยงานที่เกี่ยวข้องเข้าห้องประชุมออนไลน์ (เดโมบันทึกเฉพาะคำเชิญ)', fields: [{ id: 'topic', label: 'หัวข้อ', value: `ติดตาม${scName()}`, required: true }, { id: 'time', label: 'เวลา', type: 'select', value: 'now', options: [['now', 'ทันที'], ['30', 'อีก 30 นาที'], ['60', 'อีก 1 ชั่วโมง']] }, { id: 'who', label: 'เชิญ', type: 'select', value: 'lead', options: [['lead', 'หน่วยหลัก + หน่วยสนับสนุนของเหตุการณ์'], ['core', 'หน่วยงานหลักทั้ง 20 หน่วย'], ['exec', 'ผู้บริหารเท่านั้น']] }], ok: 'ส่งคำเชิญ' }); if (!v) return; await API.logAction(me, 'meeting.called', { ref: S.scenario, topic: v.topic, when: v.time, who: v.who }); return toast('ส่งคำเชิญประชุมแล้ว บันทึกไว้ในบันทึกกิจกรรม'); }
      case 'open-plan': if (!T.can('protocol')) return toast('มุมมองนี้เลื่อนขั้นตอนแผนรับมือไม่ได้', true); return act(API.advanceProtocol(S.scenario, me), 'เปิดแผนรับมือขั้นถัดไปแล้ว');
      case 'allocate': { const v = await modal({ title: 'จัดสรรทรัพยากร', fields: [{ id: 'res', label: 'ทรัพยากร', type: 'select', value: 'รถพยาบาล', options: DASH.response.resources.map(r => [r.name, `${r.name} (พร้อม ${r.ready})`]) }, { id: 'qty', label: 'จำนวน', type: 'number', value: 2, required: true }, { id: 'area', label: 'ไปที่', type: 'select', value: 'patong', options: Object.entries(DASH.riskmap.areas).map(([k, a]) => [k, a.name]) }], ok: 'จัดสรร' }); if (!v) return; await API.logAction(me, 'resource.allocated', { ref: S.scenario, ...v }); return toast(`จัดสรร${v.res} ${v.qty} หน่วย ไป${DASH.riskmap.areas[v.area].name} แล้ว`); }
      case 'close-incident': { if (!T.can('protocol')) return toast('มุมมองนี้ปิดเหตุการณ์ไม่ได้', true); const v = await modal({ title: 'ปิดเหตุการณ์และสรุป AAR', text: scName(), fields: [{ id: 'aar', label: 'สรุปบทเรียน (After Action Review)', type: 'textarea', required: true, placeholder: 'สิ่งที่ทำได้ดี สิ่งที่ต้องปรับ และข้อเสนอ' }], ok: 'ปิดเหตุการณ์', danger: true }); if (!v) return; let r; do { r = await API.advanceProtocol(S.scenario, me); } while (r.ok); await API.generateReport('aar', `รายงานหลังเหตุการณ์ (AAR) · ${scName()}`, S.scenario, me); toast('ปิดเหตุการณ์แล้ว และสร้างรายงาน AAR'); return draw(); }
      case 'event-detail': { const ev = DASH.risk.events[Number(d.i)]; const v = await modal({ title: ev.name, ok: ev.scenario && screensOf().includes('toc') ? 'ไปที่ศูนย์ปฏิบัติการ' : '', cancel: 'ปิด', html: `<dl class="kv"><dt>ระดับ</dt><dd>${sev(ev.sev)}</dd><dt>เวลา</dt><dd>${esc(ev.time)}</dd><dt>พื้นที่</dt><dd>${esc(ev.area)}</dd><dt>หน่วยงาน</dt><dd>${esc(T.agencyName(ev.agency))}</dd></dl>` }); if (v && ev.scenario) { S.scenario = ev.scenario; S.screen = 'toc'; draw(); } return; }
      case 'ai-open': { const v = await modal({ title: d.title, ok: 'ส่งเป็นคำสั่งให้หน่วยงาน', cancel: 'ปิด', html: `<p>${esc(d.text || '')}</p>${d.conf ? `<p class="small" style="margin-top:6px">ความเชื่อมั่น ${d.conf}% · คำนวณจากผลการรับมือในอดีต (ค่าจำลอง)</p>` : ''}${callout('ระบบเสนอข้อมูล ผู้มีอำนาจของหน่วยงานเป็นผู้ตัดสินใจ')}` }); if (!v) return; const m = await API.getMajorIncident(S.scenario); return act(API.issueCommand(S.scenario, m.agencies.lead, d.title + (d.text ? `: ${d.text}` : ''), me), 'ส่งคำแนะนำเป็นคำสั่งแล้ว'); }
      case 'field-guide': { const f = DASH.alerts.feed.find(x => x.scenario === d.scenarioId) || DASH.alerts.feed[0]; return modal({ title: 'แนวทางปฏิบัติ', text: f.name, ok: '', cancel: 'ปิด', html: `<ol style="margin:0;padding-left:20px;display:grid;gap:6px">${[...f.advice, 'รายงานสถานการณ์กลับศูนย์ทุก 30 นาที', 'ใช้ล่ามหรือแอปแปลภาษาเมื่อสื่อสารกับนักท่องเที่ยวต่างชาติ'].map(a => `<li>${esc(a)}</li>`).join('')}</ol>` }); }
      case 'backup-now': await API.logAction(me, 'backup.manual', { ref: 'settings' }); return toast('สั่งสำรองข้อมูลแล้ว (จำลอง)');
      case 'go-audit': if (screensOf().includes('audit')) S.screen = 'audit'; return draw();
      case 'go-data': if (screensOf().includes('data')) S.screen = 'data'; return draw();
      case 'uat-retest': S.uat = { ...(S.uat || {}), [d.id]: 'fixed' }; await API.logAction(me, 'uat.retest', { ref: d.id }); toast('บันทึกผลตรวจซ้ำแล้ว รอการยืนยัน UAT จริง'); return draw();
      case 'stage': return act(API.advanceProtocol(S.scenario, me), 'เลื่อนขั้นตอนแล้ว');
      case 'verify-inc': return act(API.verifyIncident(d.id, me), 'ยืนยันเหตุแล้ว');
      case 'offer': return act(API.offerTask(d.id, d.vol, me), 'เสนองานแล้ว รออาสาสมัครตอบรับภายใน 10 นาที');
      case 'expire': return act(API.forceExpire(d.id, me), 'หมดเวลาตอบรับ งานกลับเข้าคิวแล้ว');
      case 'respond': return act(API.respondOffer(d.id, d.resp, S.persona, ''), d.resp === 'accept' ? 'รับงานแล้ว' : 'ปฏิเสธแล้ว งานจะส่งให้คนอื่น');
      case 'task-status': return act(API.taskEvent(d.id, d.status, d.version, me, ''), `อัปเดตเป็น "${T.L.task[d.status]}" แล้ว`);
      case 'task-cancel': { const v = await modal({ title: 'ยกเลิกภารกิจ', text: 'อาสาสมัครที่รับงานอยู่จะถูกปล่อยกลับมาพร้อมรับงานใหม่', fields: [{ id: 'note', label: 'เหตุผล', type: 'textarea', required: true, placeholder: 'เช่น ผู้ประสบภัยออกมาได้เองแล้ว' }], ok: 'ยกเลิกภารกิจ', danger: true }); if (!v) return; return act(API.taskEvent(d.id, 'cancelled', d.version, me, v.note), 'ยกเลิกภารกิจแล้ว'); }
      case 'support': { const v = await modal({ title: 'ขอกำลังเสริม', text: 'ศูนย์ปฏิบัติการจะเห็นคำขอนี้ทันที', fields: [{ id: 'note', label: 'ต้องการอะไรเพิ่ม', type: 'textarea', required: true, placeholder: 'เช่น ต้องการเรือเพิ่ม 1 ลำ' }], ok: 'ส่งคำขอ' }); if (!v) return; return act(API.requestSupport(d.id, S.persona, v.note), 'ส่งคำขอกำลังเสริมแล้ว'); }
      case 'override': { const v = await modal({ title: 'ปรับคะแนนลำดับ', text: 'การปรับจะถูกบันทึกพร้อมชื่อผู้ปรับและเหตุผล', fields: [{ id: 'score', label: 'คะแนนใหม่ (0–100)', type: 'number', value: d.score, required: true }, { id: 'reason', label: 'เหตุผล', type: 'textarea', required: true }], ok: 'บันทึก' }); if (!v) return; return act(API.overridePriority(d.id, v.score, v.reason, me), 'ปรับคะแนนแล้ว'); }
      case 'new-alert': return newAlert();
      case 'alert-reject': { const v = await modal({ title: 'ส่งกลับให้แก้ไข', fields: [{ id: 'note', label: 'สิ่งที่ต้องแก้', type: 'textarea', required: true }], ok: 'ส่งกลับ' }); if (!v) return; return act(API.alertAction(d.id, 'reject', me, v.note), 'ส่งกลับให้แก้ไขแล้ว'); }
      case 'alert': return act(API.alertAction(d.id, d.op, me), { submit: 'ส่งให้ผู้บัญชาการทบทวนแล้ว', approve: 'อนุมัติแล้ว พร้อมเผยแพร่', publish: 'เผยแพร่แล้ว (เดโมไม่ส่งข้อความออกจริง)' }[d.op]);
      case 'review-tr': return act(API.reviewTranslation(d.id, d.lang, me), 'ยืนยันคำแปลแล้ว');
      case 'ack': { const u = T.ST.users.find(x => x.user_id === me); return act(API.acknowledgeAlert(d.id, me, u ? u.agency_id : ''), `รับทราบในนาม ${u ? T.agencyShort(u.agency_id) : 'หน่วยงาน'} แล้ว`); }
      case 'sig': return act(API.verifySignal(d.id, d.status, me), d.status === 'verified' ? 'ยืนยันข่าวแล้ว' : 'ทำเครื่องหมายว่าไม่จริงแล้ว');
      case 'sos-resend': return submitSOS(true);
      case 'import': { const srcs = (await API.getDataSources()).filter(s => s.enabled); const v = await modal({ title: 'นำเข้าชุดข้อมูล', text: 'จำลองการรับไฟล์จากแหล่งข้อมูล ถ้าใช้รหัสชุดเดิมซ้ำระบบจะปฏิเสธ', fields: [{ id: 'src', label: 'แหล่งข้อมูล', type: 'select', value: 'DS03', options: srcs.map(s => [s.source_id, s.name]) }, { id: 'key', label: 'รหัสชุดข้อมูล', value: 'smartcity-20261013-1345', hint: 'รหัสนี้เคยนำเข้าแล้ว ลองเปลี่ยนเป็นรหัสใหม่เพื่อดูผลสำเร็จ' }], ok: 'นำเข้า' }); if (!v) return; return act(API.importBatch(v.src, v.key, me), 'นำเข้าแล้ว'); }
      case 'resolve': return act(API.resolveIssue(d.id, me), 'แก้ไขและตรวจซ้ำแล้ว ข้อมูลถูกปล่อยเข้าระบบ');
      case 'user-active': return act(API.setUserActive(d.id, d.active === '1', me), 'อัปเดตบัญชีแล้ว');
      case 'ag-status': return act(API.setAgencyStatus(d.id, d.status, me), 'อัปเดตสถานะการประสานแล้ว');
      case 'run-tests': toast('กำลังทดสอบ…'); S.tests = await API.runTests(); toast(`ผ่าน ${S.tests.pass}/${S.tests.total}`); return draw();
      case 'hard-reset': await API.reset(); try { localStorage.removeItem('tri-ui-v4'); } catch (er) {} location.reload(); return;
      case 'reset': { const v = await modal({ title: 'รีเซ็ตเดโมทั้งหมด', text: 'ทุกอย่างที่กดไว้ในเบราว์เซอร์นี้จะกลับเป็นค่าเริ่มต้น', ok: 'รีเซ็ต', danger: true }); if (!v) return; await API.reset(); Object.assign(S, { task: null, sos: null, alert: null, cell: null, tracking: [], tests: null, access: null, sosKey: null, uat: {} }); toast('รีเซ็ตแล้ว'); return draw(); }
    }
    if (!S.rolePop && !S.bellPop && $('.pop')) draw();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('#overlay').innerHTML) { $('#overlay').innerHTML = ''; return; } if (S.rolePop || S.nav || S.bellPop) { S.rolePop = false; S.nav = false; S.bellPop = false; draw(); } }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g.map-zone')) { e.preventDefault(); S.mapPlace = e.target.dataset.place; draw(); }
  });
  setInterval(async () => { const c = $('#clock'); if (c) { T.NOW = new Date(await API.now()); c.innerHTML = `${icon('clock', 16)} ${hhmm(T.NOW.toISOString())} น.`; } }, 30000);

  /* ---------------- init ---------------- */
  (async () => {
    T.ST = await API.getStatic();
    T.ST.users = await API.getUsers();
    T.ST.vols = await API.getVolunteers();
    await draw();
  })();
})();
