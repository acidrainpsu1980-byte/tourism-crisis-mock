/* SVG chart helpers (no library) — bar, multi-line, heatmap cells, risk map */
window.Charts = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* bar chart, single series. data: [{label, value, hl?}] */
  function bar(data, { height = 180, unit = '', ariaLabel = '' } = {}) {
    const W = 600, H = height, padL = 36, padB = 26, padT = 18;
    const max = Math.max(1, ...data.map(d => d.value));
    const innerH = H - padT - padB, innerW = W - padL - 8;
    const bw = innerW / data.length;
    const ticks = 4;
    let g = '';
    for (let i = 0; i <= ticks; i++) {
      const v = Math.round(max / ticks * i), y = padT + innerH - (v / max) * innerH;
      g += `<line class="grid-line" x1="${padL}" x2="${W - 8}" y1="${y}" y2="${y}"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end">${v}</text>`;
    }
    const bars = data.map((d, i) => {
      const h = Math.max(2, (d.value / max) * innerH), x = padL + i * bw + bw * 0.22, w = bw * 0.56;
      const y = padT + innerH - h;
      const last = i === data.length - 1;
      return `<g class="bar-g" data-i="${i}"><rect class="bar ${d.hl ? 'hl' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" ry="4"/>` +
        `<rect x="${x}" y="${y + h - 3}" width="${w}" height="3" class="bar ${d.hl ? 'hl' : ''}"/>` + // ปลายล่างเหลี่ยม (anchored to baseline)
        `<rect class="hit" x="${padL + i * bw}" y="${padT}" width="${bw}" height="${innerH}" fill="transparent"/>` +
        (last || d.hl ? `<text class="lbl" x="${x + w / 2}" y="${y - 5}" text-anchor="middle">${d.value}${unit}</text>` : '') +
        `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text></g>`;
    }).join('');
    return `<div class="chart" data-kind="bar" data-labels='${JSON.stringify(data.map(d=>d.label))}' data-values='${JSON.stringify(data.map(d=>d.value))}' data-unit="${esc(unit)}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${g}<line class="axis" x1="${padL}" x2="${W - 8}" y1="${padT + innerH}" y2="${padT + innerH}"/>${bars}</svg><div class="tooltip"></div></div>`;
  }

  /* multi-line. series: [{name, color, values:[number|null]}], labels: x labels */
  function lines(series, labels, { height = 200, unit = '', ariaLabel = '' } = {}) {
    const W = 600, H = height, padL = 40, padB = 26, padT = 16, padR = 70;
    const all = series.flatMap(s => s.values).filter(v => v != null);
    const max = Math.max(1, ...all);
    const innerH = H - padT - padB, innerW = W - padL - padR;
    const x = i => padL + (i / (labels.length - 1)) * innerW;
    const y = v => padT + innerH - (v / max) * innerH;
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const v = Math.round(max / 4 * i);
      g += `<line class="grid-line" x1="${padL}" x2="${padL + innerW}" y1="${y(v)}" y2="${y(v)}"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    }
    const xl = labels.map((l, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(l)}</text>`).join('');
    // end-label positions with simple de-collision (min 12 units apart)
    const ends = series.map((s, si) => { let li = s.values.length - 1; while (li >= 0 && s.values[li] == null) li--; return { si, li, y: li >= 0 ? y(s.values[li]) : null }; })
      .filter(e => e.y != null).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
    const paths = series.map((s, si) => {
      const segs = []; let cur = [];
      s.values.forEach((v, i) => { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push(`${x(i)},${y(v)}`); });
      if (cur.length) segs.push(cur);
      const d = segs.map(seg => 'M' + seg.join(' L')).join(' ');
      const pts = s.values.map((v, i) => v == null ? '' : `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`).join('');
      const e = ends.find(q => q.si === si);
      const lbl = e ? `<text x="${x(e.li) + 8}" y="${e.y + 4}" class="lbl">${esc(s.name)}</text>` : '';
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"/>${pts}${lbl}`;
    }).join('');
    const hits = labels.map((l, i) => `<rect class="hit" data-i="${i}" x="${i === 0 ? padL : (x(i - 1) + x(i)) / 2}" y="${padT}" width="${innerW / (labels.length - 1)}" height="${innerH}" fill="transparent"/>`).join('');
    const legend = `<div class="chart-legend">${series.map(s => `<span><i class="swatch" style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
    return `<div class="chart" data-kind="lines" data-labels='${JSON.stringify(labels)}' data-series='${JSON.stringify(series.map(s=>({name:s.name,values:s.values})))}' data-xs='${JSON.stringify(labels.map((_,i)=>x(i)))}' data-vbw="${W}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${g}${xl}<line class="axis" x1="${padL}" x2="${padL + innerW}" y1="${padT + innerH}" y2="${padT + innerH}"/><line class="crosshair" x1="0" x2="0" y1="${padT}" y2="${padT + innerH}" stroke="var(--axis)" stroke-dasharray="3 3" opacity="0"/>${paths}${hits}</svg><div class="tooltip"></div></div>${legend}`;
  }

  /* sequential color for heatmap */
  function seqColor(v, max) {
    const steps = ['--seq-100', '--seq-200', '--seq-300', '--seq-400', '--seq-500', '--seq-600', '--seq-700'];
    const i = Math.min(steps.length - 1, Math.floor((v / max) * steps.length));
    return `var(${steps[i]})`;
  }
  function seqInk(v, max) { return (v / max) >= 0.45 ? '#ffffff' : 'var(--ink-2)'; }

  /* schematic Phuket map (ไม่ใช่พิกัดจริง) areas: [{name,x,y,score,sel}] */
  function riskMap(areas, maxScore = 5) {
    const island = 'M50,4 C60,6 66,14 68,24 C70,34 66,44 72,52 C78,60 76,70 70,80 C64,90 56,96 48,94 C40,92 36,84 30,76 C22,66 18,56 22,46 C26,36 24,26 30,18 C36,10 42,4 50,4 Z';
    const marks = areas.map(a => {
      const c = seqColor(a.score, maxScore), r = 3 + a.score * 0.7, right = a.x > 50;
      return `<g class="marker ${a.sel ? 'sel' : ''}" data-area="${a.id}" tabindex="0" role="button" aria-label="${esc(a.name)} คะแนนความเสี่ยงสูงสุด ${a.score}">
        <circle cx="${a.x}" cy="${a.y}" r="${r}" style="fill:${c}"/>
        <text x="${a.x}" y="${a.y + 1.3}" text-anchor="middle" style="font-size:3.6px;font-weight:700;fill:${seqInk(a.score, maxScore)}">${a.score}</text>
        <text x="${a.x + (right ? r + 2 : -(r + 2))}" y="${a.y + 1.3}" text-anchor="${right ? 'start' : 'end'}" style="font-size:4px;font-weight:600;fill:var(--ink)">${esc(a.name)}</text></g>`;
    }).join('');
    return `<svg class="map" viewBox="0 0 100 100" role="img" aria-label="แผนที่เชิงสัญลักษณ์จังหวัดภูเก็ต แสดงคะแนนความเสี่ยงรายพื้นที่"><path class="island" d="${island}"/>${marks}<text x="50" y="99" text-anchor="middle" style="font-size:3.2px;fill:var(--muted)">แผนที่เชิงสัญลักษณ์ · ไม่ใช่พิกัดจริง</text></svg>`;
  }

  /* schematic status map: markers [{id,name,x,y,color,label,sel,r}] */
  function statusMap(markers, caption = 'แผนที่เชิงสัญลักษณ์ · ไม่ใช่พิกัดจริง') {
    const island = 'M50,4 C60,6 66,14 68,24 C70,34 66,44 72,52 C78,60 76,70 70,80 C64,90 56,96 48,94 C40,92 36,84 30,76 C22,66 18,56 22,46 C26,36 24,26 30,18 C36,10 42,4 50,4 Z';
    const marks = markers.map(m => { const r = m.r || 4, right = m.x > 50; return `<g class="marker ${m.sel ? 'sel' : ''}" data-area="${m.id}" tabindex="0" role="button" aria-label="${esc(m.name)} ${esc(m.label || '')}">
      <circle cx="${m.x}" cy="${m.y}" r="${r}" style="fill:${m.color}"/>${m.label ? `<text x="${m.x}" y="${m.y + 1.3}" text-anchor="middle" style="font-size:3.4px;font-weight:700;fill:${m.ink || '#fff'}">${esc(m.label)}</text>` : ''}
      <text x="${m.x + (right ? r + 2 : -(r + 2))}" y="${m.y + 1.3}" text-anchor="${right ? 'start' : 'end'}" style="font-size:3.8px;font-weight:600;fill:var(--ink)">${esc(m.name)}</text></g>`; }).join('');
    return `<svg class="map" viewBox="0 0 100 100" role="img" aria-label="แผนที่เชิงสัญลักษณ์"><path class="island" d="${island}"/>${marks}<text x="50" y="99" text-anchor="middle" style="font-size:3.2px;fill:var(--muted)">${esc(caption)}</text></svg>`;
  }

  return { bar, lines, statusMap, seqColor, seqInk, riskMap, esc };
})();
