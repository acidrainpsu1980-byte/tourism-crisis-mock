/* =====================================================================
 * MOCK API LAYER — แทน Backend (REST บน PostgreSQL) ทุกฟังก์ชันคืน Promise
 * สัญญา API อิงตารางในเอกสารออกแบบ ข้อ 9 (POST /v1/sos, /v1/tasks/{id}/assign,
 * /v1/tasks/{id}/events, /v1/dashboard/summary, /v1/maps/heatmap, /v1/imports,
 * /v1/alerts/{id}/publish) — เมื่อมี Backend จริงให้แทนที่เนื้อในด้วย fetch()
 * สถานะที่ผู้ใช้เปลี่ยนเก็บใน localStorage
 * ===================================================================== */
window.API = (() => {
  const KEY = 'tci-mock-db-v2'; // ข้อมูลที่เก็บไว้จะถูกล้างเมื่อ SEED.meta.data_version เปลี่ยน
  const delay = (v) => new Promise(r => setTimeout(() => r(structuredClone(v)), 40));
  const NOW0 = new Date(SEED.meta.now).getTime();
  const RULE = SEED.meta.priority_rule_version;
  const AG0 = Object.fromEntries(SEED.agencies.map(a => [a.agency_id, a.coord_status]));
  const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  let db = load();
  if (db.agency_status) Object.entries(db.agency_status).forEach(([id, st]) => { const a = SEED.agencies.find(x => x.agency_id === id); if (a) a.coord_status = st; });
  function freshDB() {
    return structuredClone({
      data_version: SEED.meta.data_version, clock_start: Date.now(),
      major_incidents: SEED.major_incidents, incidents: SEED.incidents, sos_requests: SEED.sos_requests, rescue_tasks: SEED.rescue_tasks,
      volunteers: SEED.volunteers, alerts: SEED.alerts, import_batches: SEED.import_batches, quality_issues: SEED.quality_issues,
      social_signals: SEED.social_signals, users: SEED.users, kpi_definitions: SEED.kpi_definitions, alert_rules: SEED.alert_rules,
      audit_log: SEED.audit_log, data_sources: SEED.data_sources, outbox: [], seq: { sos: 100, task: 100, asg: 100, alert: 10, batch: 10 },
    });
  }
  function load() { try { const s = localStorage.getItem(KEY); if (s) { const d = JSON.parse(s); if (d && d.data_version === SEED.meta.data_version) return d; } } catch (e) {} return freshDB(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  /* ---- นาฬิกาจำลอง: เริ่ม 14:00 แล้วเดินตามเวลาจริง ---- */
  const simNow = () => new Date(NOW0 + (Date.now() - db.clock_start));
  const iso = (d = simNow()) => d.toISOString();
  const minutesSince = (isoTs, ref = simNow()) => (ref.getTime() - new Date(isoTs).getTime()) / 60000;
  const addMin = (d, m) => new Date(d.getTime() + m * 60000);

  function audit(actor_id, action, entity_type, entity_id, change_summary = {}) {
    db.audit_log.unshift({ occurred_at: iso(), actor_id, action, entity_type, entity_id, request_id: uid('req').toLowerCase(), change_summary });
    db.audit_log = db.audit_log.slice(0, 300);
  }
  function outbox(event_type, aggregate_id, payload) { db.outbox.unshift({ outbox_id: uid('OBX'), event_type, aggregate_id, payload, created_at: iso(), published_at: null }); }
  const find = (arr, k, v) => arr.find(x => x[k] === v);
  const fail = (error, extra = {}) => delay({ ok: false, error, ...extra });

  /* ---- กฎจัดลำดับ PR-2569.1: 0–100 = เร่งด่วน 35 + เปราะบาง 25 + ความรุนแรงพื้นที่ 20 + เวลารอ 20 ---- */
  const VULN_W = { elderly: 0.5, child: 0.5, injured: 0.4, chronic: 0.3, language: 0.2, disabled: 0.5, pregnant: 0.4 };
  function computePriority(task, ref = simNow()) {
    const sos = find(db.sos_requests, 'sos_id', task.sos_id) || { urgency: 3, vulnerability_flags: [], created_at: task.created_at };
    const inc = sos.incident_id ? (find(db.major_incidents, 'incident_id', sos.incident_id) || find(db.incidents, 'incident_id', sos.incident_id)) : null;
    const u = (sos.urgency - 1) / 4;
    const v = Math.min(1, (sos.vulnerability_flags || []).reduce((s, f) => s + (VULN_W[f] || 0.2), 0));
    const a = (inc ? inc.severity : 3) / 5;
    const w = Math.min(1, Math.max(0, minutesSince(sos.created_at, ref)) / 60);
    const score = Math.round(35 * u + 25 * v + 20 * a + 20 * w);
    const base = { rule_version: RULE, components: { urgency: { value: sos.urgency, norm: +u.toFixed(2), weight: 35, points: +(35 * u).toFixed(1) }, vulnerability: { flags: sos.vulnerability_flags || [], norm: +v.toFixed(2), weight: 25, points: +(25 * v).toFixed(1) }, area_severity: { severity: inc ? inc.severity : null, norm: +a.toFixed(2), weight: 20, points: +(20 * a).toFixed(1) }, wait: { minutes: Math.round(minutesSince(sos.created_at, ref)), norm: +w.toFixed(2), weight: 20, points: +(20 * w).toFixed(1) } }, hard_priority: !!task.hard_priority };
    if (task.priority_override) return { ...base, score: task.priority_override.score, computed_score: score, override: task.priority_override };
    return { ...base, score, computed_score: score, override: null };
  }
  const withPriority = (t) => ({ ...t, priority: computePriority(t) });
  const activeAssignment = (t) => (t.assignments || []).find(a => ['offered', 'accepted'].includes(a.status));
  const activeTaskCount = (vid) => db.rescue_tasks.filter(t => ['accepted', 'en_route', 'on_scene'].includes(t.status) && activeAssignment(t) && activeAssignment(t).volunteer_id === vid).length;
  const skillValid = (sk) => !sk.valid_until || sk.valid_until >= SEED.meta.today;
  const sourceStale = (s) => s.enabled && (!s.last_received_at || minutesSince(s.last_received_at) * 60 > 2 * s.refresh_seconds);

  /* ---- หมดเวลาตอบรับอัตโนมัติ (FR14) ---- */
  function sweepExpired(force_task_id = null) {
    let n = 0;
    db.rescue_tasks.forEach(t => {
      const a = activeAssignment(t);
      if (a && a.status === 'offered' && (force_task_id === t.task_id || new Date(a.expires_at) < simNow())) {
        a.status = 'expired'; a.responded_at = iso(); t.status = 'pending'; t.version++;
        t.events.push({ occurred_at: iso(), event_type: 'offer_expired', previous_status: 'offered', new_status: 'pending', actor_id: 'system', note: `หมดเวลาตอบรับ · คืนงานเข้าคิว (${a.volunteer_id})` });
        audit('system', 'assignment.expired', 'task_assignment', a.assignment_id, { task: t.task_id, volunteer: a.volunteer_id }); n++;
      }
    });
    if (n) save();
    return n;
  }

  const api = {
    reset() { db = freshDB(); save(); SEED.agencies.forEach(a => { a.coord_status = AG0[a.agency_id]; }); return delay({ ok: true }); },
    now: () => iso(),

    /* ======== READ ======== */
    getStatic: () => delay({ tenant: SEED.tenant, agencies: SEED.agencies, roles: SEED.roles, areas: SEED.areas, hazard_types: SEED.hazard_types, skill_names: SEED.skill_names, scenarios: SEED.scenarios, protocol_stages: SEED.protocol_stages, assets: SEED.tourism_assets }),
    getMajorIncident: (scenario) => delay(find(db.major_incidents, 'scenario', scenario)),
    getIncidents: (scenario) => delay(db.incidents.filter(i => !scenario || i.scenario === scenario)),
    getSOS: (scenario) => delay(db.sos_requests.filter(s => !scenario || s.scenario === scenario)),
    getTasks(scenario) { sweepExpired(); return delay(db.rescue_tasks.filter(t => !scenario || t.scenario === scenario).map(withPriority)); },
    getTask: (id) => delay(withPriority(find(db.rescue_tasks, 'task_id', id))),
    getVolunteers: () => delay(db.volunteers.map(v => ({ ...v, active_tasks: activeTaskCount(v.volunteer_id), skills: v.skills.map(s => ({ ...s, valid: skillValid(s), name: SEED.skill_names[s.code] || s.code })) }))),
    getAlerts: (scenario) => delay(db.alerts.filter(a => !scenario || a.scenario === scenario)),
    getPublicAlerts: (area_id) => delay(db.alerts.filter(a => a.status === 'published' && (!area_id || a.area_id === area_id)).map(a => ({ alert_id: a.alert_id, area_id: a.area_id, level: a.level, translations: a.translations, published_at: a.published_at, expires_at: a.expires_at }))),
    getDataSources: () => delay(db.data_sources.map(s => ({ ...s, stale: sourceStale(s), age_min: s.last_received_at ? Math.round(minutesSince(s.last_received_at)) : null }))),
    getBatches: () => delay(db.import_batches),
    getQualityIssues: () => delay(db.quality_issues),
    getSignals: (scenario) => delay(db.social_signals.filter(s => !scenario || s.scenario === scenario)),
    getRisk: () => delay({ assessments: SEED.risk_assessments, zones: SEED.risk_zones, monthly: SEED.monthly_incidents }),
    getHeatmap: (scenario, { publicView = false } = {}) => delay({ cells: SEED.mobility_cells, windows: SEED.heatmap_cells.filter(h => h.scenario === scenario).map(h => publicView && h.is_suppressed ? { ...h, estimated_count: null, density_per_km2: null, suppressed_public: true } : h), flow: SEED.flow_counts.filter(f => f.scenario === scenario) }),
    getKPIDefs: () => delay(db.kpi_definitions),
    getAlertRules: () => delay(db.alert_rules),
    getUsers: () => delay(db.users),
    /* ---- ทะเบียนหน่วยงานภาคี (แผนประสาน 16 ต.ค. 69) + ความเชื่อมโยงในระบบ ---- */
    getAgencies() {
      sweepExpired();
      const rows = SEED.agencies.map(a => {
        const sources = db.data_sources.filter(s => s.agency_id === a.agency_id);
        const roleIn = db.major_incidents.map(m => ({ scenario: m.scenario, code: m.code, role: m.agencies.lead === a.agency_id ? 'lead' : m.agencies.support.includes(a.agency_id) ? 'support' : m.agencies.inform.includes(a.agency_id) ? 'inform' : null })).filter(x => x.role);
        const alerts = db.alerts.filter(x => (x.target_agencies || []).includes(a.agency_id)).map(x => ({ alert_id: x.alert_id, status: x.status, acked: !!(x.acks || []).find(k => k.agency_id === a.agency_id) }));
        return { ...a, sources: sources.map(x => ({ source_id: x.source_id, name: x.name, enabled: x.enabled, stale: sourceStale(x), last_received_at: x.last_received_at })),
          users: db.users.filter(u => u.agency_id === a.agency_id).map(u => ({ user_id: u.user_id, display_name: u.display_name, role_code: u.role_code, active: u.active })),
          volunteers: db.volunteers.filter(v => v.agency_id === a.agency_id).length,
          tasks_open: db.rescue_tasks.filter(t => t.assigned_agency_id === a.agency_id && !['completed', 'cancelled'].includes(t.status)).length,
          tasks_total: db.rescue_tasks.filter(t => t.assigned_agency_id === a.agency_id).length,
          incident_roles: roleIn, alerts };
      });
      return delay({ agencies: rows, functions: SEED.agency_functions, rounds: SEED.meeting_rounds });
    },
    setAgencyStatus(agency_id, status, actor) {
      const order = ['planned', 'invited', 'met', 'sample', 'agreement'];
      if (!order.includes(status)) return fail('สถานะไม่ถูกต้อง');
      db.agency_status = db.agency_status || {}; db.agency_status[agency_id] = status;
      const a = SEED.agencies.find(x => x.agency_id === agency_id); if (a) a.coord_status = status;
      audit(actor, 'agency.coord_status', 'agency', agency_id, { status }); save(); return delay({ ok: true });
    },
    getAudit: () => delay(db.audit_log),
    getOutbox: () => delay(db.outbox),

    /* ======== KPI (GET /v1/dashboard/summary) ======== */
    getKPIs(scenario, area_id = null) {
      sweepExpired();
      const inScope = (x) => (!scenario || x.scenario === scenario) && (!area_id || x.area_id === area_id);
      const inc = db.incidents.filter(inScope), sos = db.sos_requests.filter(inScope), tasks = db.rescue_tasks.filter(inScope);
      const pct = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); const i = (s.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return +(s[lo] + (s[hi] - s[lo]) * (i - lo)).toFixed(1); };
      const resp = sos.filter(s => s.screened_at).map(s => minutesSince(s.created_at, new Date(s.screened_at)));
      const eligible = tasks.filter(t => t.status !== 'cancelled' && (t.status === 'completed' || (t.due_at && new Date(t.due_at) < simNow())));
      const onTime = tasks.filter(t => t.status === 'completed' && t.completed_at && new Date(t.completed_at) <= new Date(t.due_at)).length;
      const offers = tasks.flatMap(t => t.assignments || []);
      const vols = db.volunteers.filter(v => v.verification_status === 'verified' && v.availability === 'available' && activeTaskCount(v.volunteer_id) < v.max_active_tasks && (!area_id || v.area_id === area_id));
      const srcs = db.data_sources.filter(s => s.enabled);
      const hm = SEED.heatmap_cells.filter(h => h.scenario === scenario && h.estimated_count != null && h.window_start === SEED.meta.now);
      const zones = SEED.risk_zones.map(z => z.area_id);
      const dens = hm.filter(h => zones.includes((SEED.mobility_cells.find(c => c.cell_id === h.cell_id) || {}).area_id)).map(h => h.density_per_km2);
      return delay({
        incidents_confirmed: inc.filter(i => i.status !== 'reported').length, incidents_reported_unverified: inc.filter(i => i.status === 'reported').length,
        sos_new: sos.filter(s => s.status === 'received').length, sos_open: sos.filter(s => ['received', 'screened'].includes(s.status)).length,
        tasks_pending: tasks.filter(t => t.status === 'pending').length, tasks_offered: tasks.filter(t => t.status === 'offered').length, tasks_active: tasks.filter(t => ['accepted', 'en_route', 'on_scene'].includes(t.status)).length,
        tasks_completed: tasks.filter(t => t.status === 'completed').length, tasks_hard_pending: tasks.filter(t => t.hard_priority && ['pending', 'offered'].includes(t.status)).length,
        resp_start_p50: pct(resp, 0.5), resp_start_p95: pct(resp, 0.95), resp_n: resp.length,
        sla_rate: eligible.length ? Math.round(onTime / eligible.length * 100) : null, sla_n: eligible.length,
        accept_rate: offers.length ? Math.round(offers.filter(a => a.status === 'accepted').length / offers.length * 100) : null, offers_n: offers.length,
        volunteers_ready: vols.length, volunteers_total: db.volunteers.length,
        data_on_time: srcs.length ? Math.round(srcs.filter(s => !sourceStale(s)).length / srcs.length * 100) : null, stale_sources: srcs.filter(sourceStale).map(s => s.name),
        density_risk_max: dens.length ? Math.max(...dens) : null,
        snapshot_at: iso(), kpi_versions: Object.fromEntries(db.kpi_definitions.map(k => [k.kpi_code, k.version])),
      });
    },
    async getKPIByArea(scenario) { const rows = []; for (const a of SEED.areas.filter(a => a.level !== 'province')) rows.push({ area: a, kpi: await api.getKPIs(null, a.area_id) }); return rows; },

    /* ======== SOS (POST /v1/sos — Idempotency Key, Rate limit, บันทึกก่อนตอบรับ) ======== */
    submitSOS(payload, idempotency_key, requester = 'นักท่องเที่ยว (บัญชี)') {
      const dup = find(db.sos_requests, 'idempotency_key', idempotency_key);
      if (dup) return delay({ ok: true, idempotent_replay: true, tracking_no: dup.tracking_no, sos_id: dup.sos_id });
      const recent = db.sos_requests.filter(s => s.requester === requester && minutesSince(s.created_at) < 1 && minutesSince(s.created_at) >= 0);
      if (recent.length >= 3) return fail('ส่งคำขอถี่เกินไป (Rate limit 3 ครั้ง/นาที) โปรดรอสักครู่ · คำขอเดิมยังติดตามได้ด้วยเลขเดิม', { code: 429 });
      if (!payload.request_detail || !payload.area_id) return fail('ต้องระบุพื้นที่/ตำแหน่ง และรายละเอียด');
      const n = ++db.seq.sos;
      const scenario = payload.scenario || (SEED.areas.find(a => a.area_id === payload.area_id) ? ({ A1: 'flood', A4: 'boat', A3: 'crowd' }[payload.area_id] || 'flood') : 'flood');
      const s = { sos_id: `SOS-NEW-${n}`, tracking_no: `TRK-2569-${9000 + n}`, scenario, incident_id: null, area_id: payload.area_id, idempotency_key, request_type: payload.request_type || 'other',
        request_detail: payload.request_detail, people_count: Number(payload.people_count || 0), languages: payload.languages || ['TH'], contact_masked: payload.contact ? payload.contact.replace(/\d(?=\d{2})/g, 'x') : '—',
        location_accuracy_m: Number(payload.location_accuracy_m || 30), urgency: Number(payload.urgency || 3), vulnerability_flags: payload.vulnerability_flags || [], status: 'received', channel: payload.channel || 'app', created_at: iso(), screened_at: null, requester };
      db.sos_requests.unshift(s);
      outbox('sos.received', s.sos_id, { tracking_no: s.tracking_no, area_id: s.area_id }); // บันทึก SOS + Outbox ในธุรกรรมเดียว
      audit(requester, 'sos.received', 'sos_request', s.sos_id, { tracking_no: s.tracking_no, channel: s.channel });
      save();
      return delay({ ok: true, idempotent_replay: false, tracking_no: s.tracking_no, sos_id: s.sos_id });
    },
    trackSOS(tracking_no) {
      const s = find(db.sos_requests, 'tracking_no', tracking_no);
      if (!s) return fail('ไม่พบเลขติดตามนี้');
      const task = db.rescue_tasks.find(t => t.sos_id === s.sos_id);
      const a = task ? activeAssignment(task) : null;
      const stage = !task ? (s.status === 'received' ? 1 : 2) : task.status === 'pending' ? 2 : task.status === 'offered' ? 2 : task.status === 'accepted' ? 3 : task.status === 'en_route' ? 4 : task.status === 'on_scene' ? 5 : task.status === 'completed' ? 6 : 0;
      return delay({ tracking_no, status: s.status, created_at: s.created_at, screened_at: s.screened_at, area_id: s.area_id, stage, task_status: task ? task.status : null, eta_note: a && task.status === 'accepted' ? 'ทีมกำลังเตรียมตัว' : task && task.status === 'en_route' ? 'ทีมกำลังเดินทาง' : null, events: task ? task.events.filter(e => e.event_type !== 'offered').map(e => ({ ts: e.occurred_at, text: ({ created: 'เจ้าหน้าที่รับเรื่องและสร้างภารกิจ', accepted: 'มีผู้ช่วยเหลือรับงานแล้ว', status: { en_route: 'ผู้ช่วยเหลือกำลังเดินทาง', on_scene: 'ผู้ช่วยเหลือถึงจุดเกิดเหตุ', completed: 'ภารกิจเสร็จสิ้น', cancelled: 'ยกเลิกภารกิจ' }[e.new_status] || e.new_status, offer_expired: 'กำลังหาผู้ช่วยเหลือใหม่', support_requested: 'ขอกำลังสนับสนุนเพิ่ม' })[e.event_type] || e.event_type })) : [{ ts: s.created_at, text: 'ระบบบันทึกคำขอแล้ว รอเจ้าหน้าที่คัดกรอง' }] });
    },
    screenSOS(sos_id, form, actor) {
      const s = find(db.sos_requests, 'sos_id', sos_id);
      if (!s) return fail('ไม่พบคำขอ');
      if (s.status !== 'received') return fail('คำขอนี้คัดกรองแล้ว');
      s.urgency = Number(form.urgency || s.urgency); s.vulnerability_flags = form.vulnerability_flags || s.vulnerability_flags; s.incident_id = form.incident_id || null; s.status = 'screened'; s.screened_at = iso();
      const n = ++db.seq.task;
      const hard = !!form.hard_priority;
      const t = { task_id: `TSK-NEW-${n}`, sos_id, scenario: s.scenario, area_id: s.area_id, task_type: form.task_type || 'other', title: form.title || s.request_detail, required_skills: form.required_skills || [], hard_priority: hard, status: 'pending', version: 1, created_at: iso(), due_at: iso(addMin(simNow(), hard ? 15 : s.urgency >= 4 ? 30 : 60)), assigned_agency_id: form.agency_id || null, assignments: [], events: [{ occurred_at: iso(), event_type: 'created', previous_status: null, new_status: 'pending', actor_id: actor, note: form.note || 'คัดกรองแล้ว' }] };
      db.rescue_tasks.unshift(t);
      audit(actor, 'sos.screened', 'sos_request', sos_id, { urgency: s.urgency, task: t.task_id, hard_priority: hard });
      save();
      return delay({ ok: true, task: withPriority(t) });
    },
    overridePriority(task_id, score, reason, actor) {
      const t = find(db.rescue_tasks, 'task_id', task_id);
      if (!reason) return fail('ต้องระบุเหตุผลการปรับลำดับ (FR11)');
      t.priority_override = { score: Number(score), reason, by: actor, at: iso() }; t.version++;
      t.events.push({ occurred_at: iso(), event_type: 'priority_override', previous_status: t.status, new_status: t.status, actor_id: actor, note: `ปรับคะแนนเป็น ${score}: ${reason}` });
      audit(actor, 'task.priority_override', 'rescue_task', task_id, { score, reason });
      save(); return delay({ ok: true });
    },

    /* ======== เสนอ/มอบหมาย (POST /v1/tasks/{id}/assign) ======== */
    recommendVolunteers(task_id) {
      const t = find(db.rescue_tasks, 'task_id', task_id);
      const rows = db.volunteers.map(v => {
        const reasons = [], warn = [];
        if (v.verification_status !== 'verified') reasons.push(v.verification_status === 'suspended' ? 'ถูกระงับ' : 'ยังไม่ผ่านการตรวจสอบ');
        const skillRows = t.required_skills.map(code => { const sk = v.skills.find(s => s.code === code); return { code, name: SEED.skill_names[code] || code, has: !!sk, valid: sk ? skillValid(sk) : false, valid_until: sk ? sk.valid_until : null }; });
        const matched = skillRows.filter(s => s.has && s.valid).length;
        skillRows.filter(s => s.has && !s.valid).forEach(s => reasons.push(`ใบรับรอง ${s.name} หมดอายุ ${s.valid_until}`));
        if (matched === 0 && t.required_skills.length) reasons.push('ไม่มีทักษะที่ต้องการ');
        const active = activeTaskCount(v.volunteer_id);
        if (active >= v.max_active_tasks) reasons.push(`งานเต็ม (${active}/${v.max_active_tasks})`);
        if (v.availability === 'off') reasons.push('ไม่ปฏิบัติงาน');
        if (v.availability === 'busy' && active < v.max_active_tasks) warn.push('กำลังปฏิบัติงานอื่น');
        if (minutesSince(v.location_updated_at) > 30) warn.push('ตำแหน่งล่าสุดเกิน 30 นาที');
        const dist = v.distance_km[t.area_id];
        const score = matched * 30 + (matched === t.required_skills.length ? 20 : 0) + (v.area_id === t.area_id ? 15 : 0) + Math.max(0, 20 - dist * 2) + (v.availability === 'available' ? 15 : 0);
        return { volunteer: v, skills: skillRows, matched, required: t.required_skills.length, same_area: v.area_id === t.area_id, distance_km: dist, eta_min: Math.round(dist * 3 + 4), eta_note: 'ระยะทางโดยประมาณ · ไม่มีข้อมูลเส้นทาง', active_tasks: active, eligible: reasons.length === 0, reasons, warn, score: reasons.length ? -1 : Math.round(score) };
      }).sort((a, b) => b.score - a.score);
      return delay(rows);
    },
    offerTask(task_id, volunteer_id, actor) {
      sweepExpired();
      const t = find(db.rescue_tasks, 'task_id', task_id), v = find(db.volunteers, 'volunteer_id', volunteer_id);
      if (!t || !v) return fail('ไม่พบภารกิจหรืออาสาสมัคร');
      if (!['pending'].includes(t.status)) return fail(`ภารกิจอยู่ในสถานะ ${t.status} เสนอซ้ำไม่ได้`);
      if (activeAssignment(t)) return fail('ภารกิจนี้มีหัวหน้าภารกิจที่ยัง Active อยู่แล้ว (Partial Unique Index)');
      if (v.verification_status !== 'verified') return fail(`${v.display_name} ยังไม่ผ่านการตรวจสอบ/ถูกระงับ`);
      const bad = t.required_skills.filter(c => { const sk = v.skills.find(s => s.code === c); return !sk || !skillValid(sk); });
      if (bad.length) return fail(`${v.display_name} ขาดทักษะหรือใบรับรองหมดอายุ: ${bad.map(c => SEED.skill_names[c] || c).join(', ')} (FR12)`);
      if (activeTaskCount(volunteer_id) >= v.max_active_tasks) return fail(`${v.display_name} มีงานถึงเพดาน max_active_tasks แล้ว`);
      const a = { assignment_id: `ASG-NEW-${++db.seq.asg}`, volunteer_id, assigned_by: actor, status: 'offered', offered_at: iso(), responded_at: null, expires_at: iso(addMin(simNow(), SEED.meta.offer_timeout_min)) };
      t.assignments.push(a); t.status = 'offered'; t.version++;
      t.events.push({ occurred_at: iso(), event_type: 'offered', previous_status: 'pending', new_status: 'offered', actor_id: actor, note: `เสนอให้ ${v.display_name} · รอตอบรับ ${SEED.meta.offer_timeout_min} นาที (เจ้าหน้าที่รับรองแล้ว)` });
      outbox('task.offered', t.task_id, { volunteer_id }); audit(actor, 'task.offered', 'rescue_task', task_id, { volunteer: volunteer_id, expires_at: a.expires_at });
      save(); return delay({ ok: true, assignment: a });
    },
    respondOffer(task_id, response, volunteer_id, note = '') {
      sweepExpired();
      const t = find(db.rescue_tasks, 'task_id', task_id); const a = t && activeAssignment(t);
      if (!a || a.status !== 'offered') return fail('ไม่มีข้อเสนอที่รอตอบรับ (อาจหมดเวลาแล้ว)');
      if (a.volunteer_id !== volunteer_id) return fail('ข้อเสนอนี้ไม่ใช่ของคุณ');
      a.responded_at = iso();
      if (response === 'accept') {
        a.status = 'accepted'; t.status = 'accepted'; t.version++;
        const v = find(db.volunteers, 'volunteer_id', volunteer_id); if (activeTaskCount(volunteer_id) >= v.max_active_tasks) v.availability = 'busy';
        t.events.push({ occurred_at: iso(), event_type: 'accepted', previous_status: 'offered', new_status: 'accepted', actor_id: volunteer_id, note });
        audit(volunteer_id, 'assignment.accepted', 'task_assignment', a.assignment_id, { task: task_id });
      } else {
        a.status = 'declined'; t.status = 'pending'; t.version++;
        t.events.push({ occurred_at: iso(), event_type: 'declined', previous_status: 'offered', new_status: 'pending', actor_id: volunteer_id, note: note || 'ปฏิเสธ · คืนงานเข้าคิว' });
        audit(volunteer_id, 'assignment.declined', 'task_assignment', a.assignment_id, { task: task_id, note });
      }
      save(); return delay({ ok: true, task: withPriority(t) });
    },
    forceExpire(task_id, actor) { const n = sweepExpired(task_id); if (!n) return fail('ไม่มีข้อเสนอที่รอตอบรับ'); audit(actor, 'assignment.expire_simulated', 'rescue_task', task_id, {}); save(); return delay({ ok: true }); },

    /* ======== อัปเดตสถานะ (POST /v1/tasks/{id}/events — Expected Version + State transition) ======== */
    taskEvent(task_id, new_status, expected_version, actor, note = '') {
      const t = find(db.rescue_tasks, 'task_id', task_id);
      if (!t) return fail('ไม่พบภารกิจ');
      if (Number(expected_version) !== t.version) return fail(`Version ล้าสมัย (ส่ง ${expected_version} แต่ปัจจุบัน ${t.version}) โปรดโหลดใหม่`, { code: 409 });
      const allowed = { accepted: ['en_route', 'cancelled'], en_route: ['on_scene', 'cancelled'], on_scene: ['completed', 'cancelled'], pending: ['cancelled'], offered: ['cancelled'] };
      if (!(allowed[t.status] || []).includes(new_status)) return fail(`เปลี่ยนสถานะ ${t.status} → ${new_status} ไม่ได้ตาม State transition`, { code: 422 });
      if (new_status === 'cancelled' && !note) return fail('การยกเลิกต้องระบุเหตุผล');
      const prev = t.status; t.status = new_status; t.version++;
      t.events.push({ occurred_at: iso(), event_type: 'status', previous_status: prev, new_status, actor_id: actor, note });
      if (['completed', 'cancelled'].includes(new_status)) {
        const a = activeAssignment(t); if (a) { a.status = new_status === 'completed' ? 'accepted' : 'released'; const v = find(db.volunteers, 'volunteer_id', a.volunteer_id); if (v && activeTaskCount(a.volunteer_id) - (new_status === 'completed' ? 0 : 0) < v.max_active_tasks) v.availability = 'available'; }
        if (new_status === 'completed') { t.completed_at = iso(); const s = find(db.sos_requests, 'sos_id', t.sos_id); if (s) s.status = 'closed'; }
        // ปล่อย assignment ให้ไม่นับเป็น active
        (t.assignments || []).forEach(x => { if (x.status === 'accepted') x.released_at = iso(); });
      }
      audit(actor, 'task.status', 'rescue_task', task_id, { from: prev, to: new_status, version: t.version });
      save(); return delay({ ok: true, task: withPriority(t) });
    },
    requestSupport(task_id, actor, note) {
      const t = find(db.rescue_tasks, 'task_id', task_id);
      t.support_requested = { at: iso(), by: actor, note }; t.version++;
      t.events.push({ occurred_at: iso(), event_type: 'support_requested', previous_status: t.status, new_status: t.status, actor_id: actor, note });
      audit(actor, 'task.support_requested', 'rescue_task', task_id, { note }); save(); return delay({ ok: true });
    },

    /* ======== เหตุการณ์ / Protocol ======== */
    verifyIncident(incident_id, actor) { const i = find(db.incidents, 'incident_id', incident_id); if (!i || i.status !== 'reported') return fail('เหตุนี้ตรวจสอบแล้ว'); i.status = 'verified'; i.verified_by = actor; i.version++; audit(actor, 'incident.verified', 'incident', incident_id, {}); save(); return delay({ ok: true }); },
    advanceProtocol(scenario, actor) {
      const m = find(db.major_incidents, 'scenario', scenario); const order = SEED.protocol_stages.map(s => s[0]); const i = order.indexOf(m.status);
      if (i >= order.length - 1) return fail('ปิดเหตุแล้ว');
      const prev = m.status; m.status = order[i + 1]; m.version++;
      audit(actor, 'incident.stage', 'incident', m.incident_id, { from: prev, to: m.status }); save(); return delay({ ok: true });
    },

    /* ======== ประกาศ (FR08/FR09, POST /v1/alerts/{id}/publish) ======== */
    createAlert(scenario, form, actor) {
      const m = find(db.major_incidents, 'scenario', scenario);
      const a = { alert_id: `ALT-NEW-${++db.seq.alert}`, scenario, incident_id: m.incident_id, area_id: m.area_id, level: Number(form.level || 3), status: 'draft', audience: form.audience || 'ประชาชนทั่วไป', channels: form.channels || ['LINE OA'], target_agencies: [m.agencies.lead, ...m.agencies.support.slice(0, 3), 'SP30'],
        translations: { th: { title: form.title, message: form.message, reviewed_by: null }, en: { title: '', message: '', reviewed_by: null }, zh: { title: '', message: '', reviewed_by: null } }, history: [{ ts: iso(), actor, action: 'สร้างร่าง' }], deliveries: [] };
      db.alerts.unshift(a); audit(actor, 'alert.created', 'alert', a.alert_id, { level: a.level }); save(); return delay({ ok: true, alert: a });
    },
    setTranslation(alert_id, lang, title, message, actor) { const a = find(db.alerts, 'alert_id', alert_id); a.translations[lang] = { title, message, reviewed_by: null }; a.history.push({ ts: iso(), actor, action: `แก้ไขข้อความ ${lang.toUpperCase()}` }); save(); return delay({ ok: true }); },
    reviewTranslation(alert_id, lang, actor) { const a = find(db.alerts, 'alert_id', alert_id); if (!a.translations[lang].message) return fail(`ยังไม่มีข้อความ ${lang.toUpperCase()}`); a.translations[lang].reviewed_by = actor; a.history.push({ ts: iso(), actor, action: `ตรวจคำแปล ${lang.toUpperCase()}` }); audit(actor, 'alert.translation_reviewed', 'alert_translation', `${alert_id}/${lang}`, {}); save(); return delay({ ok: true }); },
    alertAction(alert_id, action, actor, note = '') {
      const a = find(db.alerts, 'alert_id', alert_id);
      const flow = { submit: { from: ['draft', 'rejected'], to: 'review', label: 'ส่งทบทวน' }, approve: { from: ['review'], to: 'approved', label: 'อนุมัติ' }, reject: { from: ['review'], to: 'rejected', label: 'ส่งกลับแก้ไข' }, publish: { from: ['approved'], to: 'published', label: 'เผยแพร่' }, expire: { from: ['published'], to: 'expired', label: 'หมดอายุ' } }[action];
      if (!flow) return fail('ไม่รู้จักการกระทำ');
      if (!flow.from.includes(a.status)) return fail(`สถานะ ${a.status} ทำ "${flow.label}" ไม่ได้`);
      if (action === 'approve') {
        const missing = ['th', 'en', 'zh'].filter(l => !a.translations[l].message || !a.translations[l].reviewed_by);
        if (missing.length) return fail(`ต้องมีข้อความและผู้ตรวจภาษา ${missing.map(l => l.toUpperCase()).join('/')} ก่อนอนุมัติ`);
        const inc = find(db.major_incidents, 'incident_id', a.incident_id) || find(db.incidents, 'incident_id', a.incident_id);
        if (inc && inc.status === 'reported') return fail('เหตุที่อ้างอิงยังไม่ผ่านการตรวจสอบโดยเจ้าหน้าที่ (FR08) ประกาศอัตโนมัติไม่ได้');
        a.approved_by = actor; a.approved_at = iso();
      }
      if (action === 'reject' && !note) return fail('ต้องระบุเหตุผลการส่งกลับ');
      if (action === 'publish') {
        a.published_at = iso(); a.expires_at = iso(addMin(simNow(), 240));
        a.deliveries = a.channels.map(ch => { const base = ch.includes('LINE') ? 1200 + Math.floor(Math.random() * 900) : ch.includes('SMS') ? 4000 + Math.floor(Math.random() * 2000) : ch.includes('อีเมล') ? 80 : 6; const failed = Math.round(base * 0.025); return { channel: ch, sent: base, delivered: base - failed, acknowledged: 0, failed, attempt_count: 1 }; });
        outbox('alert.published', alert_id, { channels: a.channels });
      }
      a.status = flow.to; a.history.push({ ts: iso(), actor, action: flow.label + (note ? ` · ${note}` : '') });
      audit(actor, `alert.${action}`, 'alert', alert_id, { status: a.status, note }); save(); return delay({ ok: true, alert: a });
    },
    acknowledgeAlert(alert_id, actor, agency_id) { const a = find(db.alerts, 'alert_id', alert_id); if (a.status !== 'published') return fail('ประกาศยังไม่เผยแพร่'); a.acks = a.acks || []; if ((a.target_agencies || []).length && !a.target_agencies.includes(agency_id)) return fail('หน่วยงานของคุณไม่อยู่ในรายชื่อผู้รับประกาศนี้'); if (a.acks.find(x => x.agency_id === agency_id)) return fail('หน่วยงานนี้ตอบรับแล้ว'); a.acks.push({ agency_id, actor, at: iso() }); const d = a.deliveries[0]; if (d) d.acknowledged++; audit(actor, 'alert.acknowledged', 'alert', alert_id, { agency_id }); save(); return delay({ ok: true }); },

    /* ======== ข้อมูล (POST /v1/imports — กันชุดซ้ำ, Quality) ======== */
    importBatch(source_id, external_batch_key, actor) {
      if (find(db.import_batches, 'external_batch_key', external_batch_key)) return fail(`ชุดข้อมูล ${external_batch_key} เคยนำเข้าแล้ว — ไม่เพิ่มข้อมูลซ้ำ (FR03)`, { duplicate: true });
      const src = find(db.data_sources, 'source_id', source_id); if (!src) return fail('ไม่พบแหล่งข้อมูล');
      const rows = 900 + Math.floor(Math.random() * 400), rej = Math.floor(Math.random() * 12);
      const b = { batch_id: `B-NEW-${++db.seq.batch}`, external_batch_key, source_id, observed_at: iso(addMin(simNow(), -12)), started_at: iso(), finished_at: iso(), status: 'loaded', accepted_rows: rows - rej, rejected_rows: rej, raw_object_key: `s3://raw/${source_id.toLowerCase()}/${external_batch_key}.csv`, checksum: 'sha256:' + Math.random().toString(16).slice(2, 6) + '…' };
      db.import_batches.unshift(b); src.last_received_at = iso();
      if (rej) db.quality_issues.unshift({ issue_id: `QI-NEW-${db.seq.batch}`, batch_id: b.batch_id, source_id, rule_code: 'GEO_OUT_OF_AREA', message: 'พิกัดอยู่นอกขอบเขตจังหวัด', rows: rej, severity: 'warning', resolved_at: null, fix: 'ปรับพิกัดจาก lookup' });
      audit(actor, 'import_batch.loaded', 'import_batch', b.batch_id, { accepted: b.accepted_rows, rejected: rej }); save(); return delay({ ok: true, batch: b });
    },
    resolveIssue(issue_id, actor) { const q = find(db.quality_issues, 'issue_id', issue_id); if (q.resolved_at) return fail('แก้ไขแล้ว'); q.resolved_at = iso(); const b = find(db.import_batches, 'batch_id', q.batch_id); if (b) { b.accepted_rows += q.rows; b.rejected_rows -= q.rows; } audit(actor, 'quality_issue.resolved', 'quality_issue', issue_id, { rows: q.rows, rule: q.rule_code }); save(); return delay({ ok: true }); },
    verifySignal(signal_id, status, actor) { const s = find(db.social_signals, 'signal_id', signal_id); s.verification_status = status; audit(actor, 'social_signal.' + status, 'social_signal', signal_id, {}); save(); return delay({ ok: true }); },
    exportReport(scenario, actor, kind = 'kpi') { const id = `SNAP-${Date.now().toString(36).toUpperCase()}`; audit(actor, 'report.exported', 'dashboard', id, { scenario, kind, snapshot_at: iso() }); save(); return delay({ ok: true, snapshot_id: id, snapshot_at: iso() }); },

    /* ======== Administration (FR01) ======== */
    setUserActive(user_id, active, actor) { const u = find(db.users, 'user_id', user_id); u.active = !!active; audit(actor, 'user.' + (active ? 'activated' : 'deactivated'), 'app_user', user_id, {}); save(); return delay({ ok: true }); },
    setAreaScope(user_id, area_ids, actor) { const u = find(db.users, 'user_id', user_id); u.area_scope = area_ids; audit(actor, 'user.area_scope', 'user_area_scope', user_id, { area_ids }); save(); return delay({ ok: true }); },
    checkAccess(user_id, area_id, action = 'read') {
      const u = find(db.users, 'user_id', user_id); if (!u) return delay({ allowed: false, reason: 'ไม่พบผู้ใช้' });
      if ((u.tenant_id || SEED.tenant.tenant_id) !== SEED.tenant.tenant_id) return delay({ allowed: false, reason: `ปฏิเสธ: ผู้ใช้อยู่คนละ Tenant (${u.tenant_id}) — RLS บล็อกทั้ง API และ Export` });
      if (!u.active) return delay({ allowed: false, reason: 'ปฏิเสธ: บัญชีถูกปิดใช้งาน' });
      const scopeOK = u.area_scope.includes('A0') || u.area_scope.includes(area_id);
      if (!scopeOK) return delay({ allowed: false, reason: `ปฏิเสธ: พื้นที่ ${area_id} ไม่อยู่ใน Area Scope [${u.area_scope.join(', ')}] — API ต้องตรวจสิทธิ์ก่อน Query` });
      if (action === 'export' && !['steward', 'commander'].includes(u.role_code)) return delay({ allowed: false, reason: 'ปฏิเสธ: บทบาทนี้ไม่มีสิทธิ์ Export' });
      return delay({ allowed: true, reason: `อนุญาต: Tenant ตรง, บัญชีใช้งานได้, พื้นที่ ${area_id} อยู่ในขอบเขต` });
    },
    toggleRule(rule_id, actor) { const r = find(db.alert_rules, 'rule_id', rule_id); r.enabled = !r.enabled; audit(actor, 'alert_rule.' + (r.enabled ? 'enabled' : 'disabled'), 'alert_rule', rule_id, {}); save(); return delay({ ok: true }); },
    bumpKPIVersion(kpi_code, formula, actor) { const k = find(db.kpi_definitions, 'kpi_code', kpi_code); k.version++; k.formula = formula || k.formula; audit(actor, 'kpi_definition.version', 'kpi_definition', `${kpi_code}/v${k.version}`, {}); save(); return delay({ ok: true }); },

    /* ======== ชุดทดสอบอัตโนมัติ (ข้อ 12) — รันกับสำเนา DB แล้วคืนค่าเดิม ======== */
    async runTests() {
      const backup = structuredClone(db); const results = [];
      const test = async (id, name, fn) => { try { const r = await fn(); results.push({ id, name, pass: !!r.pass, detail: r.detail }); } catch (e) { results.push({ id, name, pass: false, detail: 'ข้อผิดพลาด: ' + e.message }); } };
      await test('T01', 'ส่ง Batch ซ้ำต้องไม่เพิ่มข้อมูล (FR03)', async () => { const before = db.import_batches.length; const r = await api.importBatch('DS03', 'smartcity-20261013-1345', 'test'); return { pass: r.ok === false && r.duplicate && db.import_batches.length === before, detail: r.error || 'รับเข้าซ้ำ!' }; });
      await test('T02', 'ส่ง SOS ซ้ำด้วย Idempotency Key เดิมได้เลขเดิม (FR10)', async () => { const a = await api.submitSOS({ area_id: 'A1', request_detail: 'ทดสอบ' }, 'k-test-1', 'tester'); const b = await api.submitSOS({ area_id: 'A1', request_detail: 'ทดสอบ' }, 'k-test-1', 'tester'); return { pass: a.ok && b.ok && a.tracking_no === b.tracking_no && b.idempotent_replay, detail: `${a.tracking_no} = ${b.tracking_no}` }; });
      await test('T03', 'Rate limit SOS เกิน 3 ครั้ง/นาที ถูกปฏิเสธ', async () => { let last; for (let i = 0; i < 4; i++) last = await api.submitSOS({ area_id: 'A1', request_detail: 'ทดสอบ' + i }, 'k-rate-' + i, 'rate-tester'); return { pass: last.ok === false && last.code === 429, detail: last.error || 'ไม่ถูกจำกัด' }; });
      await test('T04', 'Concurrent assignment: เสนอหัวหน้าภารกิจซ้ำต้องถูกปฏิเสธ (FR13)', async () => { const a = await api.offerTask('TSK-FL-001', 'V01', 'U02'); const b = await api.offerTask('TSK-FL-001', 'V02', 'U03'); return { pass: a.ok && b.ok === false, detail: b.error || 'มอบหมายซ้ำได้!' }; });
      await test('T05', 'อาสาสมัครเกิน max_active_tasks ต้องถูกปฏิเสธ', async () => { const r = await api.offerTask('TSK-SEA-002', 'V03', 'U03'); return { pass: r.ok === false && /max_active_tasks/.test(r.error || ''), detail: r.error || 'รับงานเกินเพดานได้!' }; });
      await test('T06', 'ใบรับรองหมดอายุต้องไม่ถูกเสนอภารกิจที่ใช้ทักษะนั้น (FR12)', async () => { const rec = await api.recommendVolunteers('TSK-FL-003'); const r = await api.offerTask('TSK-FL-005', 'V08', 'U02'); const v8 = (await api.recommendVolunteers('TSK-FL-001')).find(x => x.volunteer.volunteer_id === 'V08'); return { pass: v8 && !v8.eligible && r.ok === false, detail: v8 ? v8.reasons.join('; ') : '—' }; });
      await test('T07', 'State transition ผิด (accepted → completed) ต้องถูกปฏิเสธ', async () => { const t = find(db.rescue_tasks, 'task_id', 'TSK-SEA-004'); const r = await api.taskEvent('TSK-SEA-004', 'completed', t.version, 'V03'); return { pass: r.ok === false && r.code === 422, detail: r.error || 'ข้ามสถานะได้!' }; });
      await test('T08', 'Version ล้าสมัยต้องถูกปฏิเสธ (Expected Version)', async () => { const t = find(db.rescue_tasks, 'task_id', 'TSK-FL-007'); const r = await api.taskEvent('TSK-FL-007', 'on_scene', t.version - 1, 'V07'); return { pass: r.ok === false && r.code === 409, detail: r.error || 'ยอมรับ version เก่า!' }; });
      await test('T09', 'หมดเวลาตอบรับ → คืนงานเข้าคิว (FR14)', async () => { const r = await api.forceExpire('TSK-FL-002', 'test'); const t = find(db.rescue_tasks, 'task_id', 'TSK-FL-002'); return { pass: r.ok && t.status === 'pending' && !activeAssignment(t), detail: `สถานะ ${t.status} · assignment ล่าสุด ${t.assignments.at(-1).status}` }; });
      await test('T10', 'ประกาศต้องมีผู้ตรวจครบ 3 ภาษาและเหตุยืนยันแล้วก่อนอนุมัติ (FR08/FR09)', async () => { const r = await api.alertAction('ALT-FL-01', 'approve', 'U01'); return { pass: r.ok === false, detail: r.error || 'อนุมัติได้ทั้งที่ ZH ยังไม่ตรวจ!' }; });
      await test('T11', 'ผู้ใช้ข้าม Tenant ถูกปฏิเสธ (FR01)', async () => { const r = await api.checkAccess('U08', 'A1'); return { pass: !r.allowed, detail: r.reason }; });
      await test('T12', 'ผู้ใช้นอก Area Scope ถูกปฏิเสธ (FR01)', async () => { const r = await api.checkAccess('U02', 'A4'); return { pass: !r.allowed, detail: r.reason }; });
      db = backup; save();
      return delay({ results, pass: results.filter(r => r.pass).length, total: results.length });
    },
  };
  return api;
})();
