/* =====================================================================
 * UI toolkit — window.TRI : ไอคอน ป้าย การ์ด KPI กราฟ แผนที่ modal toast
 * ===================================================================== */
window.TRI = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6M19 6a7 7 0 0 1 0 12"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>',
    sos: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5 5l4.2 4.2M14.8 14.8L19 19M14.8 9.2L19 5M5 19l4.2-4.2"/>',
    chart: '<path d="M4 20V11M10 20V4M16 20v-7M2 20h20"/>', trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    check: '<path d="M20 6L9 17l-5-5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>', play: '<path d="M7 4l13 8-13 8z"/>', chev: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16"/>',
    boat: '<path d="M3 17l2 4h14l2-4H3zM12 3v11M12 4l6 8h-6"/>', med: '<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', shield: '<path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z"/>',
    shieldcheck: '<path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    plane: '<path d="M10 14l-7-2 1.5-1.5 7 .5 4-4.5a2 2 0 0 1 3 3L14 14l.5 7L13 22.5l-2-7"/>', anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 12a7 7 0 0 0 14 0M8 11h8"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>', frown: '<circle cx="12" cy="12" r="9"/><path d="M8.5 16a4 4 0 0 1 7 0M9 9.5h.01M15 9.5h.01"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7M3 11v4c0 1.7 2.7 3 6 3 1.2 0 2.3-.2 3.2-.5"/><circle cx="17" cy="16" r="4.5"/>',
    fire: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3-1-6 1-8.5z"/>', pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    rain: '<path d="M7 15a4.5 4.5 0 0 1 .5-9 6 6 0 0 1 11 2.5A3.5 3.5 0 0 1 18 15H7z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>', wave: '<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M7 10c0-3 2-6 6-6 0 2-1 3-3 3 2 0 4 1 4 3"/>',
    water: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bed: '<path d="M3 18V6M3 13h18v5M21 13a3 3 0 0 0-3-3h-8v3"/><circle cx="7" cy="10" r="2"/>', card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>', doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    car: '<path d="M5 16l1.5-5h11L19 16"/><rect x="3" y="15" width="18" height="4" rx="1"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>', ambulance: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M8.5 9.5v4M6.5 11.5h4"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', siren: '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14v3H5zM12 3v2M4 7l1.5 1M20 7l-1.5 1"/>', hub: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M6 6.5l4 3.5M18 6.5l-4 3.5M6 17.5l4-3.5M18 17.5l-4-3.5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>', compare: '<path d="M8 4v16M16 4v16M3 8h5M16 16h5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    logout: '<path d="M10 4H5v16h5M15 8l4 4-4 4M9 12h10"/>', phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    cloud: '<path d="M7 18a5 5 0 0 1-.5-10 6.5 6.5 0 0 1 12.5 2.5A3.8 3.8 0 0 1 18 18z"/>', palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5-1-2-1-3s1-2 2.5-2H19a2 2 0 0 0 2-2c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>', layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', ai: '<rect x="4" y="5" width="16" height="13" rx="3"/><path d="M9 10h.01M15 10h.01M9 14h6M12 2v3"/>',
  };
  const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.info}</svg>`;
  const logo = (s = 40) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l15 6v11c0 9.5-6.4 16-15 19C11.4 35 5 28.5 5 19V8z" fill="none" stroke="#ffffff" stroke-width="2.4"/><circle cx="20" cy="18" r="7" fill="none" stroke="#7fb0ff" stroke-width="2"/><path d="M13 18h14M20 11a10 10 0 0 1 0 14M20 11a10 10 0 0 0 0 14" fill="none" stroke="#7fb0ff" stroke-width="1.4"/></svg>`;

  /* ---------- small builders ---------- */
  const SEVL = { crit: 'วิกฤติ', high: 'สูง', med: 'ปานกลาง', low: 'ต่ำ' };
  const sev = (k, label) => `<span class="sev ${k}">${esc(label || SEVL[k] || k)}</span>`;
  const stp = (t, tone = 'plain') => `<span class="stp ${tone}">${esc(t)}</span>`;
  const chip = (t, tone = '', plain = false) => `<span class="chip ${tone} ${plain ? 'plain' : ''}">${esc(t)}</span>`;
  const icT = (n, tone = 'blue', s = 18, cls = '') => `<span class="ic-t t-${tone} ${cls}">${icon(n, s)}</span>`;
  const table = (headers, rows, empty = 'ไม่มีข้อมูล', cls = '') => `<div class="table-wrap"><table class="${cls}"><thead><tr>${headers.map(h => `<th${/^#/.test(h) ? ' class="num"' : ''}>${esc(h.replace(/^#/, ''))}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr${r.attrs || ''}>${r.cells.map((c, i) => `<td${/^#/.test(headers[i]) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="muted">${esc(empty)}</td></tr>`}</tbody></table></div>`;
  const callout = (text, tone = '', ic = 'info') => `<div class="callout ${tone}">${icon(ic, 17)}<div>${text}</div></div>`;
  const tech = html => `<div class="tech tech-note">${html}</div>`;
  const techI = html => `<span class="tech mono muted"> ${esc(html)}</span>`;
  const card = (title, body, { right = '', more = '', moreAct = '', info = true, cls = '' } = {}) => `<section class="card ${cls}"><div class="card-head"><h2>${esc(title)}${info ? `<span class="i" title="ข้อมูลจำลอง">${icon('info', 14)}</span>` : ''}</h2>${right}</div><div class="card-body">${body}</div>${more ? `<button class="more-btn" ${moreAct}>${esc(more)}</button>` : ''}</section>`;
  const delta = (k) => { if (!k.delta) return ''; const arrow = k.dir === 'up' ? '▲' : k.dir === 'down' ? '▼' : ''; const cls = k.bad === undefined ? '' : k.bad ? 'bad' : 'good'; return `<span class="k-note ${cls}">${arrow ? `<b>${arrow}</b>` : ''}${esc(k.delta)}</span>`; };
  const kpiTile = (k) => {
    if (k.gauge) return `<div class="kpi tinted-red noicon"><span class="k-label">${esc(k.label)}</span><div class="kpi-gauge">${gauge(k.value, k.of || 100, 112)}<div><div class="k-val" style="color:var(--crit)">${esc(k.word)}</div><div class="tnum"><b style="font-size:20px">${k.value}</b> <span class="small">/ ${k.of || 100}</span></div></div></div>${delta(k)}</div>`;
    return `<div class="kpi tinted-${k.tone || 'blue'}"><span class="ic t-${k.tone || 'blue'}">${icon(k.icon || 'chart', 21)}</span><span class="k-label">${esc(k.label)}</span><span class="k-val">${esc(k.value)}${k.unit ? `<small>${esc(k.unit)}</small>` : ''}</span>${delta(k)}${k.spark ? spark(k.spark, `var(--t-${k.tone || 'blue'})`) : ''}</div>`;
  };
  const kpiRow = (list, cls = 'six') => `<div class="kpis ${cls}">${list.map(kpiTile).join('')}</div>`;
  const kpi = (label, val, unit, note, tone = '') => `<div class="kpi noicon ${tone}"><span class="k-label">${esc(label)}</span><span class="k-val">${val == null ? '<span class="muted" style="font-size:18px">ไม่มีข้อมูล</span>' : val}${val != null && unit ? `<small>${esc(unit)}</small>` : ''}</span>${note ? `<span class="k-note">${note}</span>` : ''}</div>`;
  const airow = (a, i = 0) => { const tones = ['blue', 'red', 'orange', 'green', 'purple', 'teal']; return `<button class="airow" ${a.go ? `data-go="${a.go}"` : 'data-action="ai-open"'} data-title="${esc(a.title)}" data-text="${esc(a.text || '')}" data-conf="${a.conf || ''}">${icT(a.icon, tones[i % tones.length], 19)}<div><b>${esc(a.title)}</b>${a.text ? `<span>${esc(a.text)}</span>` : ''}</div>${a.conf ? `<div class="conf">ความเชื่อมั่น<b>${a.conf}%</b></div>` : icon('chev', 16)}</button>`; };
  const actionBar = (items, label = 'การดำเนินการด่วน', sub = 'เครื่องมือสำหรับการสื่อสารและจัดการสถานการณ์อย่างรวดเร็ว') => `<section class="card"><div class="actionbar">${label ? `<div class="ab-label"><b>${esc(label)}</b><span>${esc(sub)}</span></div>` : ''}${items.map(a => `<button class="abtn ${a.tone}" data-action="${a.action}" ${a.extra || ''}><span class="ai">${icon(a.icon, 22)}</span><span><b>${esc(a.title)}</b><span>${esc(a.sub || '')}</span></span>${icon('chev', 18)}</button>`).join('')}</div></section>`;
  const hbars = (rows, { max = 100, color = 'var(--crit)', rank = true, fmt = v => v, colors } = {}) => `<div class="hbars">${rows.map((r, i) => { const c = colors ? colors[i % colors.length] : (typeof color === 'function' ? color(r.v, i) : color); return `<div class="hbar ${rank ? '' : 'norank'}">${rank ? `<span class="rk">${i + 1}</span>` : ''}<span>${esc(r.name)}${r.dist ? `<br><span class="tiny">${esc(r.dist)}</span>` : ''}</span><div class="tr"><div class="fl" style="width:${Math.max(2, r.v / max * 100)}%;background:${c}"></div></div><span class="v">${fmt(r.v, r)}</span></div>`; }).join('')}</div>`;
  const riskColor = v => v >= 80 ? 'var(--crit)' : v >= 60 ? 'var(--high)' : v >= 40 ? 'var(--med-fill)' : 'var(--low)';

  /* ---------- charts ---------- */
  function spark(vals, color = 'var(--primary)', w = 76, h = 30) {
    const mx = Math.max(...vals), mn = Math.min(...vals), rg = mx - mn || 1;
    const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - 3 - (v - mn) / rg * (h - 6)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d} L${w},${h} L0,${h} Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="2.4" fill="${color}"/></svg>`;
  }
  function gauge(v, max = 100, w = 120) {
    const cx = 60, cy = 58, r = 46, a0 = Math.PI, seg = [[0, .4, '#22b45f'], [.4, .6, '#f4b400'], [.6, .8, '#f07a12'], [.8, 1, '#e03a3e']];
    const pt = t => [cx + r * Math.cos(a0 - Math.PI * t), cy - r * Math.sin(a0 - Math.PI * t)];
    const arcs = seg.map(([a, b, c]) => { const p1 = pt(a), p2 = pt(b); return `<path d="M${p1[0]},${p1[1]} A${r},${r} 0 0 1 ${p2[0]},${p2[1]}" stroke="${c}" stroke-width="11" fill="none"/>`; }).join('');
    const t = Math.min(1, v / max), n = [cx + (r - 12) * Math.cos(a0 - Math.PI * t), cy - (r - 12) * Math.sin(a0 - Math.PI * t)];
    return `<svg viewBox="0 0 120 66" width="${w}" role="img" aria-label="ระดับความเสี่ยง ${v} จาก ${max}">${arcs}<line x1="${cx}" y1="${cy}" x2="${n[0]}" y2="${n[1]}" stroke="#1d2433" stroke-width="3.2" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="#1d2433"/></svg>`;
  }
  function donut(segs, center = '', sub = '', size = 150) {
    const tot = segs.reduce((s, x) => s + x.value, 0) || 1, r = 52, c = 2 * Math.PI * r; let off = 0;
    const arcs = segs.map(sg => { const len = sg.value / tot * c; const el = `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${sg.color}" stroke-width="20" stroke-dasharray="${Math.max(0, len - 1.5)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(sg.name)} ${sg.value}</title></circle>`; off += len; return el; }).join('');
    return `<svg viewBox="0 0 140 140" width="${size}" role="img" aria-label="${esc(segs.map(s => `${s.name} ${s.value}`).join(', '))}">${arcs}<text x="70" y="${sub ? 66 : 75}" text-anchor="middle" style="font:700 19px var(--f);fill:var(--ink-2)">${esc(center)}</text>${sub ? `<text x="70" y="84" text-anchor="middle" style="font:500 10.5px var(--f);fill:var(--sub)">${esc(sub)}</text>` : ''}</svg>`;
  }
  const dlegend = (segs, fmt = s => `${s.value}`) => `<div class="dlegend">${segs.map(s => `<div><i class="dotsw" style="background:${s.color}"></i><span>${esc(s.name)}</span><b>${fmt(s)}</b></div>`).join('')}</div>`;
  /* line chart: series [{name,color,values,dash,area}], bands [{lo,hi,color,opacity}] */
  function lineChart({ labels, series, bands = [], height = 200, yMax, yMin = 0, unit = '', endLabels = true, markIdx = null, ticks = 4, labelEvery = 1 }) {
    const W = 600, H = height, pl = 34, pr = endLabels ? 66 : 12, pt = 12, pb = 24, iw = W - pl - pr, ih = H - pt - pb;
    const all = series.flatMap(s => s.values).concat(bands.flatMap(b => b.hi)).filter(v => v != null);
    const mx = yMax ?? (Math.ceil(Math.max(...all) / 10) * 10 || 1);
    const fmtT = v => (mx - yMin) <= 5 ? v.toFixed(1) : Math.round(v);
    const x = i => pl + (labels.length === 1 ? iw / 2 : i / (labels.length - 1) * iw), y = v => pt + ih - (v - yMin) / (mx - yMin) * ih;
    let g = '';
    for (let i = 0; i <= ticks; i++) { const v = yMin + (mx - yMin) / ticks * i; g += `<line class="grid-line" x1="${pl}" x2="${pl + iw}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${fmtT(v)}${unit}</text>`; }
    labels.forEach((l, i) => { if (i % labelEvery === 0 || i === labels.length - 1) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
    const bandsSvg = bands.map(b => { const idx = b.hi.map((v, i) => v == null ? null : i).filter(i => i != null); if (!idx.length) return ''; const top = idx.map(i => `${x(i)},${y(b.hi[i])}`).join(' L'); const bot = [...idx].reverse().map(i => `${x(i)},${y(b.lo[i])}`).join(' L'); return `<path d="M${top} L${bot} Z" fill="${b.color}" opacity="${b.opacity ?? .18}"/>`; }).join('');
    const ends = [];
    const paths = series.map(s => {
      const segs = []; let cur = []; s.values.forEach((v, i) => { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`); }); if (cur.length) segs.push(cur);
      const d = segs.map(sg => 'M' + sg.join(' L')).join(' ');
      let li = s.values.length - 1; while (li >= 0 && s.values[li] == null) li--;
      if (endLabels && li >= 0) ends.push({ name: s.name, color: s.color, x: x(li), y: y(s.values[li]), v: s.values[li] });
      const area = s.area && segs.length ? `<path d="${d} L${x(li)},${pt + ih} L${x(s.values.findIndex(v => v != null))},${pt + ih} Z" fill="${s.color}" opacity=".08"/>` : '';
      const dots = s.dots === false ? '' : s.values.map((v, i) => v == null ? '' : `<circle cx="${x(i)}" cy="${y(v)}" r="${s.dots === 'small' ? 2.2 : 3.2}" fill="${s.color}" stroke="#fff" stroke-width="1.2"><title>${esc(s.name)} ${esc(labels[i])}: ${v}${unit}</title></circle>`).join('');
      return `${area}<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" ${s.dash ? 'stroke-dasharray="6 5"' : ''} stroke-linejoin="round"/>${dots}`;
    }).join('');
    ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
    const endSvg = ends.map(e => `<text x="${e.x + 7}" y="${e.y + 4}" style="fill:${e.color};font-weight:700">${esc(e.name)}</text>`).join('');
    const mark = markIdx != null ? `<line x1="${x(markIdx)}" x2="${x(markIdx)}" y1="${pt}" y2="${pt + ih}" stroke="var(--sub)" stroke-dasharray="3 3"/>` : '';
    return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))}">${g}<line x1="${pl}" x2="${pl + iw}" y1="${pt + ih}" y2="${pt + ih}" stroke="var(--axis)"/>${bandsSvg}${mark}${paths}${endSvg}</svg>`;
  }
  const legend = items => `<div class="legend">${items.map(i => `<span><i class="dotsw" style="background:${i.color}"></i>${esc(i.name)}</span>`).join('')}</div>`;
  function heatGrid(cols, rows, colorFn, { label = 0 } = {}) {
    return `<div class="heatgrid" style="grid-template-columns:minmax(76px,100px) repeat(${cols.length}, minmax(0,1fr))"><span></span>${cols.map(c => `<span class="h">${esc(c)}</span>`).join('')}${rows.map(r => `<span class="r">${esc(r.name)}</span>${r.v.map((v, i) => `<span class="c" style="background:${colorFn(v)}" title="${esc(r.name)} ${esc(cols[i])}: ${v}"></span>`).join('')}`).join('')}</div>`;
  }
  const lvlColors = { 1: '#cfeedd', 2: '#ffe08a', 3: '#ffb066', 4: '#f2665c', 5: '#d63031' };
  function riskMatrix(items) {
    const cellColor = (l, i) => { const s = l * i; return s >= 15 ? '#f15b4f' : s >= 10 ? '#f7964a' : s >= 6 ? '#fbc659' : s >= 3 ? '#cfe6a3' : '#9dd7a8'; };
    const ylab = ['สูงมาก', 'สูง', 'ปานกลาง', 'ต่ำ', 'ต่ำมาก'], xlab = ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];
    let cells = '';
    for (let r = 0; r < 5; r++) { const l = 5 - r; cells += `<div class="ylab"><b>${ylab[r]}</b>${l}</div>`; for (let c = 1; c <= 5; c++) { const here = items.filter(it => it.l === l && it.i === c); cells += `<div class="mc" style="background:${cellColor(l, c)}">${here.map((it, k) => `<span class="mpin" style="top:${50 + (k - (here.length - 1) / 2) * 44}%" title="${esc(it.name)} โอกาส ${it.l} ผลกระทบ ${it.i}">${icT(it.icon, 'blue', 13)}${esc(it.name)}</span>`).join('')}</div>`; } }
    cells += `<div></div>${xlab.map((x, i) => `<div class="xlab"><b>${i + 1}</b> ${x}</div>`).join('')}`;
    return `<div style="display:grid;grid-template-columns:20px minmax(0,1fr);gap:4px"><div style="writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-size:12px;font-weight:700;color:var(--sub)">โอกาสเกิด</div><div><div class="matrix5">${cells}</div><div style="text-align:right;font-size:12px;font-weight:700;color:var(--sub);margin-top:2px">ผลกระทบ</div></div></div>`;
  }
  /* Phuket layered map */
  const POI_STYLE = { hospital: ['med', '#1c9a52'], police: ['shield', '#1d5bd8'], airport: ['plane', '#3b4c6b'], pier: ['anchor', '#0e9384'], help: ['sos', '#e03a3e'], evac: ['route', '#7a4ad8'], cctv: ['camera', '#56637b'], siren: ['megaphone', '#f07a12'] };
  const ZONE_LAYER = { patong: ['nature', 'crowd', 'crime'], karon: ['sea', 'accident'], kata: ['sea'], town: ['crowd', 'crime'], chalong: ['sea'], rawai: ['accident'] };
  function phuketMap({ layers, selected, incidents = [], height = 'auto', showLabels = true, small = false }) {
    const M = DASH.map, on = id => (layers || []).find(l => l.id === id)?.on;
    const pl = id => M.places.find(p => p.id === id);
    const riskOn = ['nature', 'crime', 'crowd', 'accident', 'sea'].some(on);
    const zones = M.zones.filter(z => (ZONE_LAYER[z.place] || []).some(on));
    const zc = l => l >= 4 ? '#e03a3e' : l === 3 ? '#f07a12' : '#f4b400';
    const heat = zones.map(z => { const p = pl(z.place); return `<circle cx="${p.x}" cy="${p.y}" r="${z.r * 1.6}" fill="url(#heat${z.level >= 4 ? 4 : z.level})"/>`; }).join('');
    const counts = zones.map(z => { const p = pl(z.place); const sel = selected === z.place; return `<g class="map-zone" data-place="${z.place}" role="button" tabindex="0" aria-label="${esc(p.name)} ${z.count} เหตุการณ์"><circle cx="${p.x + 4}" cy="${p.y - 1}" r="${sel ? 4.6 : 3.8}" fill="${zc(z.level)}" stroke="#fff" stroke-width="${sel ? 1.2 : .7}"/><text class="map-count" x="${p.x + 4}" y="${p.y + .1}" text-anchor="middle">${z.count}</text></g>`; }).join('');
    const pois = M.pois.filter(p => on(p.type)).map(p => { const [ic, col] = POI_STYLE[p.type]; return `<g class="map-poi"><title>${esc(p.name)}</title><circle cx="${p.x}" cy="${p.y}" r="2.6" fill="${col}" stroke="#fff" stroke-width=".6"/><g transform="translate(${p.x - 1.6},${p.y - 1.6}) scale(.135)" stroke="#fff" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${IC[ic]}</g></g>`; }).join('');
    const incs = incidents.map(i => { const p = pl(i.place); return p ? `<g><title>${esc(i.name)}</title><path d="M${p.x - 3},${p.y - 9} h6 v4 h-2 l-1,1.6 l-1,-1.6 h-2 z" fill="${i.sev === 'crit' ? '#e03a3e' : i.sev === 'high' ? '#f07a12' : '#f4b400'}"/><text x="${p.x}" y="${p.y - 6.2}" text-anchor="middle" style="font:700 2.8px var(--f);fill:#fff">!</text></g>` : ''; }).join('');
    const labels = showLabels ? M.places.map(p => `<text class="map-label" x="${p.x - (p.x < 50 ? 4 : -4)}" y="${p.y + 1}" text-anchor="${p.x < 50 ? 'end' : 'start'}">${esc(p.name)}</text>`).join('') : '';
    const seaLabels = `<text x="14" y="70" style="font:italic 3.4px var(--f);fill:#5b7fa6">ทะเลอันดามัน</text><text x="80" y="48" style="font:italic 3px var(--f);fill:#5b7fa6">อ่าวพังงา</text>`;
    return `<svg viewBox="0 0 100 130" ${small ? 'style="max-height:330px"' : ''} role="img" aria-label="แผนที่เชิงสัญลักษณ์จังหวัดภูเก็ต"><defs>${[2, 3, 4].map(l => `<radialGradient id="heat${l}"><stop offset="0" stop-color="${zc(l)}" stop-opacity=".75"/><stop offset=".55" stop-color="${l >= 4 ? '#f07a12' : '#f4b400'}" stop-opacity=".35"/><stop offset="1" stop-color="#f4b400" stop-opacity="0"/></radialGradient>`).join('')}</defs>
      <path class="map-land" d="${M.island}"/>${M.islets.map(d => `<path class="map-land" d="${d}"/>`).join('')}${seaLabels}${riskOn ? heat : ''}${labels}${pois}${incs}${riskOn ? counts : ''}</svg>`;
  }

  /* ---------- toast & modal ---------- */
  let tt;
  function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (err ? ' err' : ''); clearTimeout(tt); tt = setTimeout(() => { t.className = 'toast'; }, 3800); }
  function modal({ title, text = '', fields = [], ok = 'ยืนยัน', danger = false, html = '', wide = false, cancel = 'ยกเลิก' }) {
    return new Promise(res => {
      const ov = $('#overlay');
      const fieldHtml = f => {
        const ctl = f.type === 'textarea' ? `<textarea class="input" id="mf-${f.id}" rows="3" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>${esc(f.value || '')}</textarea>`
          : f.type === 'select' ? `<select class="input" id="mf-${f.id}">${f.options.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(f.value) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
          : `<input class="input" id="mf-${f.id}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>`;
        return `<div class="field"><label for="mf-${f.id}">${esc(f.label)}</label>${ctl}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</div>`;
      };
      ov.innerHTML = `<div class="modal-back"><form class="modal ${wide ? 'wide' : ''}" id="mdl"><h2>${esc(title)}</h2>${text ? `<p class="sub">${esc(text)}</p>` : ''}${html}${fields.map(fieldHtml).join('')}<div class="actions">${cancel ? `<button type="button" class="btn ghost" id="mdl-cancel">${esc(cancel)}</button>` : ''}${ok ? `<button type="submit" class="btn ${danger ? 'danger' : ''}">${esc(ok)}</button>` : ''}</div></form></div>`;
      const close = v => { ov.innerHTML = ''; res(v); };
      const c = $('#mdl-cancel'); if (c) c.onclick = () => close(null);
      $('.modal-back').onclick = e => { if (e.target.classList.contains('modal-back')) close(null); };
      $('#mdl').onsubmit = e => { e.preventDefault(); e.stopPropagation(); close(Object.fromEntries(fields.map(f => [f.id, $('#mf-' + f.id).value.trim()]))); };
      const first = $('#mdl input, #mdl textarea, #mdl select') || $('#mdl button[type=submit]') || c; if (first) first.focus();
    });
  }

  /* ---------- time ---------- */
  const hhmm = iso => iso ? new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '—';
  const dateTH = iso => iso ? new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return { esc, $, $$, IC, icon, logo, sev, stp, chip, icT, table, callout, tech, techI, card, kpiTile, kpiRow, kpi, airow, actionBar, hbars, riskColor, spark, gauge, donut, dlegend, lineChart, legend, heatGrid, riskMatrix, phuketMap, toast, modal, hhmm, dateTH, lvlColors,
    S: null, ST: null, screens: {}, actions: {} };
})();
