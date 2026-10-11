/* =========================================================
   Carte électronique réaliste (SVG) — interlude « du schéma au signal ».
   window.buildPCB(svg) dessine la carte et renvoie les éléments à animer.
   Repère : viewBox 1600 × 900, carte de 1280 × 680 centrée.
   ========================================================= */
(function () {
  'use strict';

  const r2 = v => Math.round(v * 100) / 100;
  const pt = (x, y) => ({ x, y });
  const path = pts => 'M' + pts.map(p => r2(p.x) + ',' + r2(p.y)).join('L');

  // horizontal → 45° → horizontal (lead = longueur avant le coude)
  function hdh(a, b, lead) {
    const adx = Math.abs(b.x - a.x), ady = Math.abs(b.y - a.y);
    const sx = Math.sign(b.x - a.x) || 1;
    if (ady > adx) return [a, b];
    const L = Math.max(0, Math.min(lead == null ? (adx - ady) / 2 : lead, adx - ady));
    const p1 = pt(a.x + sx * L, a.y);
    return [a, p1, pt(p1.x + sx * ady, b.y), b];
  }
  // vertical → 45° → vertical
  function vdv(a, b, lead) {
    const adx = Math.abs(b.x - a.x), ady = Math.abs(b.y - a.y);
    const sy = Math.sign(b.y - a.y) || 1;
    if (adx > ady) return [a, b];
    const L = Math.max(0, Math.min(lead == null ? (ady - adx) / 2 : lead, ady - adx));
    const p1 = pt(a.x, a.y + sy * L);
    return [a, p1, pt(b.x, p1.y + sy * adx), b];
  }
  // éventail de pistes sans croisement : les pistes extérieures tournent en premier
  function fan(pins, pads, axis, start, step) {
    const f = axis === 'h' ? hdh : vdv;
    const perp = p => (axis === 'h' ? p.y : p.x);
    const neg = [], pos = [], out = [];
    pins.forEach((p, i) => (perp(pads[i]) < perp(p) ? neg : pos).push(i));
    neg.sort((i, j) => perp(pins[i]) - perp(pins[j])).forEach((i, k) => { out[i] = f(pins[i], pads[i], start + k * step); });
    pos.sort((i, j) => perp(pins[j]) - perp(pins[i])).forEach((i, k) => { out[i] = f(pins[i], pads[i], start + k * step); });
    return out;
  }

  const DEFS = `
  <defs>
    <linearGradient id="pcb-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3dc9c"/><stop offset=".45" stop-color="#c99d4c"/><stop offset="1" stop-color="#e6c97f"/>
    </linearGradient>
    <linearGradient id="pcb-silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6f7f4"/><stop offset=".55" stop-color="#aab0ae"/><stop offset="1" stop-color="#dcdfdc"/>
    </linearGradient>
    <linearGradient id="pcb-silver-h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#dcdfdc"/><stop offset=".5" stop-color="#f6f7f4"/><stop offset="1" stop-color="#a3a9a7"/>
    </linearGradient>
    <linearGradient id="pcb-chip" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2d3435"/><stop offset="1" stop-color="#121718"/>
    </linearGradient>
    <linearGradient id="pcb-cer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d4b98d"/><stop offset="1" stop-color="#9b7e51"/>
    </linearGradient>
    <linearGradient id="pcb-plastic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#262b2c"/><stop offset="1" stop-color="#0f1213"/>
    </linearGradient>
    <radialGradient id="pcb-can" cx=".38" cy=".34" r=".78">
      <stop offset="0" stop-color="#fbfbf9"/><stop offset=".55" stop-color="#bfc3c1"/><stop offset="1" stop-color="#8b908e"/>
    </radialGradient>
    <radialGradient id="pcb-btn" cx=".4" cy=".35" r=".7">
      <stop offset="0" stop-color="#3a3f40"/><stop offset="1" stop-color="#101314"/>
    </radialGradient>
    <filter id="pcb-shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#000" flood-opacity=".65"/>
    </filter>
    <filter id="pcb-board-shadow" x="-10%" y="-10%" width="120%" height="135%">
      <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#001011" flood-opacity=".26"/>
    </filter>
    <filter id="pcb-glow" x="-300%" y="-300%" width="700%" height="700%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>`;

  window.buildPCB = function (svg) {
    const traces = [];          // { d, w, spark }
    const pads = [];
    const vias = [];
    const silk = [];
    const parts = [];
    const fx = [];

    const T = (pts, w = 4.2, spark = false) => traces.push({ d: path(pts), w, spark });
    const via = (x, y) => vias.push(`<g class="pcb-via"><circle cx="${x}" cy="${y}" r="6.2"/><circle cx="${x}" cy="${y}" r="2.3" class="pcb-via__h"/></g>`);
    const pad = (x, y, w, h, rx = 1.6) => pads.push(`<rect x="${r2(x - w / 2)}" y="${r2(y - h / 2)}" width="${w}" height="${h}" rx="${rx}"/>`);
    const thPad = (x, y, r = 10) => pads.push(`<circle cx="${x}" cy="${y}" r="${r}"/>`);
    const part = (order, x, y, rot, inner, cls = '') => parts.push({ order, s: `<g class="pcb-part ${cls}" data-o="${order}"><g transform="translate(${x} ${y})${rot ? ` rotate(${rot})` : ''}">${inner}</g></g>` });
    const txt = (x, y, s, size, anchor = 'start', cls = 'pcb-silk-t') => silk.push(`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" class="${cls}">${s}</text>`);
    const box = (x, y, w, h, rx = 3) => silk.push(`<rect x="${r2(x - w / 2)}" y="${r2(y - h / 2)}" width="${w}" height="${h}" rx="${rx}" class="pcb-silk-l"/>`);

    /* ---- composants (repère local centré) ---- */
    const endCaps = (L, W, e) =>
      `<rect x="${-L / 2}" y="${-W / 2}" width="${e}" height="${W}" rx="1.4" fill="url(#pcb-silver)"/>` +
      `<rect x="${L / 2 - e}" y="${-W / 2}" width="${e}" height="${W}" rx="1.4" fill="url(#pcb-silver)"/>`;
    function chipPassive(kind, L, W, code) {
      const e = Math.round(L * 0.22);
      if (kind === 'C') return `<rect x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" rx="2" fill="url(#pcb-cer)"/>` + endCaps(L, W, e);
      if (kind === 'R') return `<rect x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" rx="2" fill="#141718"/>` + endCaps(L, W, e) +
        (code ? `<text x="0" y="${W * 0.22}" font-size="${W * 0.55}" text-anchor="middle" class="pcb-code">${code}</text>` : '');
      if (kind === 'F') return `<rect x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" rx="2" fill="#2a2d2e"/>` + endCaps(L, W, e);
      // LED
      return `<rect x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" rx="2" fill="#efe9de"/>` + endCaps(L, W, e) +
        `<rect x="-4" y="-4" width="8" height="8" rx="1" fill="#d6b469"/>` +
        `<rect class="pcb-led-on" x="${-L / 2 + e}" y="${-W / 2}" width="${L - 2 * e}" height="${W}" fill="#fd5321" opacity="0"/>`;
    }
    function passive(order, kind, x, y, rot, ref, code = '', size = 'm') {
      const L = size === 's' ? 24 : 34, W = size === 's' ? 12 : 17;
      const off = L / 2 - 3, pw = size === 's' ? 10 : 13, ph = W + 6;
      const v = rot === 90 || rot === 270;
      if (v) { pad(x, y - off, ph, pw); pad(x, y + off, ph, pw); } else { pad(x - off, y, pw, ph); pad(x + off, y, pw, ph); }
      part(order, x, y, rot, chipPassive(kind, L, W, code), kind === 'D' ? 'pcb-led' : '');
      if (ref) {
        if (v) txt(x + W / 2 + 7, y + 4, ref, 11);
        else txt(x, y - W / 2 - 8, ref, 11, 'middle');
      }
    }

    function lqfp() {
      let s = '';
      for (let i = 0; i < 16; i++) {
        const o = -78.75 + i * 10.5;
        s += `<rect x="-112" y="${o - 2.3}" width="19" height="4.6" fill="url(#pcb-silver)"/>`;
        s += `<rect x="93" y="${o - 2.3}" width="19" height="4.6" fill="url(#pcb-silver)"/>`;
        s += `<rect x="${o - 2.3}" y="-112" width="4.6" height="19" fill="url(#pcb-silver-h)"/>`;
        s += `<rect x="${o - 2.3}" y="93" width="4.6" height="19" fill="url(#pcb-silver-h)"/>`;
      }
      s += `<rect x="-95" y="-95" width="190" height="190" rx="5" fill="url(#pcb-chip)" stroke="#363d3e"/>`;
      s += `<rect x="-87" y="-87" width="174" height="174" rx="3" fill="none" stroke="rgba(255,255,255,.04)"/>`;
      s += `<circle cx="-68" cy="-68" r="7.5" fill="#0d1112" stroke="#2c3334"/>`;
      s += `<circle cx="60" cy="60" r="14" fill="none" stroke="rgba(255,255,255,.05)"/>`;
      s += `<text x="0" y="-14" font-size="21" text-anchor="middle" class="pcb-chip-t">STM32F411</text>`;
      s += `<text x="0" y="12" font-size="14" text-anchor="middle" class="pcb-chip-t">CEU6</text>`;
      s += `<text x="0" y="36" font-size="11" text-anchor="middle" class="pcb-chip-t">GH21Q · 2614</text>`;
      return s;
    }
    function lqfpPads(cx, cy) {
      for (let i = 0; i < 16; i++) {
        const o = -78.75 + i * 10.5;
        pad(cx - 104, cy + o, 26, 6, 1);
        pad(cx + 104, cy + o, 26, 6, 1);
        pad(cx + o, cy - 104, 6, 26, 1);
        pad(cx + o, cy + 104, 6, 26, 1);
      }
    }
    function soic8() {
      let s = '';
      for (let i = 0; i < 4; i++) {
        const o = -19.5 + i * 13;
        s += `<rect x="-46" y="${o - 3}" width="15" height="6" fill="url(#pcb-silver)"/><rect x="31" y="${o - 3}" width="15" height="6" fill="url(#pcb-silver)"/>`;
      }
      s += `<rect x="-32" y="-28" width="64" height="56" rx="3" fill="url(#pcb-chip)" stroke="#363d3e"/>`;
      s += `<circle cx="-21" cy="-17" r="3.6" fill="#0d1112"/>`;
      s += `<text x="0" y="0" font-size="12" text-anchor="middle" class="pcb-chip-t">24C02</text><text x="0" y="15" font-size="9" text-anchor="middle" class="pcb-chip-t">2617</text>`;
      return s;
    }
    function sot223() {
      return `<rect x="-30" y="-44" width="60" height="26" rx="2" fill="url(#pcb-silver-h)"/>` +
        [-26, 0, 26].map(x => `<rect x="${x - 5}" y="26" width="10" height="16" fill="url(#pcb-silver-h)"/>`).join('') +
        `<rect x="-38" y="-22" width="76" height="50" rx="3" fill="url(#pcb-chip)" stroke="#363d3e"/>` +
        `<text x="0" y="0" font-size="12" text-anchor="middle" class="pcb-chip-t">AMS1117</text><text x="0" y="16" font-size="11" text-anchor="middle" class="pcb-chip-t">3.3 · 2611</text>`;
    }
    function crystal() {
      return `<rect x="-30" y="-21" width="60" height="42" rx="4" fill="url(#pcb-can)" stroke="#8d9290"/>` +
        `<rect x="-24" y="-15" width="48" height="30" rx="3" fill="none" stroke="rgba(0,0,0,.14)"/>` +
        `<text x="0" y="5" font-size="11" text-anchor="middle" class="pcb-can-t">8.000</text>`;
    }
    function usbc() {
      let s = `<rect x="-50" y="-66" width="100" height="132" rx="9" fill="url(#pcb-silver-h)" stroke="#8d9290"/>`;
      s += `<rect x="-50" y="-48" width="12" height="96" rx="5" fill="#121516"/>`;
      s += `<rect x="-30" y="-52" width="66" height="104" rx="6" fill="none" stroke="rgba(0,0,0,.16)"/>`;
      s += `<line x1="-20" y1="-30" x2="26" y2="-30" stroke="rgba(0,0,0,.12)" stroke-width="2"/><line x1="-20" y1="30" x2="26" y2="30" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`;
      [[-42, -74], [24, -74], [-42, 66], [24, 66]].forEach(([x, y]) => { s += `<rect x="${x}" y="${y}" width="18" height="8" rx="1.5" fill="url(#pcb-silver)"/>`; });
      return s;
    }
    function header(n, vertical) {
      const len = n * 26;
      let s = vertical
        ? `<rect x="-13" y="${-len / 2}" width="26" height="${len}" rx="2" fill="url(#pcb-plastic)"/>`
        : `<rect x="${-len / 2}" y="-13" width="${len}" height="26" rx="2" fill="url(#pcb-plastic)"/>`;
      for (let i = 0; i < n; i++) {
        const o = -len / 2 + 13 + i * 26;
        const x = vertical ? 0 : o, y = vertical ? o : 0;
        if (i) s += vertical ? `<line x1="-13" y1="${o - 13}" x2="13" y2="${o - 13}" stroke="#050707" stroke-width="1.4"/>` : `<line x1="${o - 13}" y1="-13" x2="${o - 13}" y2="13" stroke="#050707" stroke-width="1.4"/>`;
        s += `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1" fill="url(#pcb-gold)"/><rect x="${x - 2}" y="${y - 2}" width="4" height="4" fill="#a9823d" opacity=".55"/>`;
      }
      return s;
    }
    function electrolytic() {
      return `<path d="M-38,-30 L-30,-38 L38,-38 L38,38 L-30,38 L-38,30 Z" fill="#1a1d1e"/>` +
        `<circle r="31" fill="url(#pcb-can)" stroke="#7f8482"/>` +
        `<path d="M-31,0 A31,31 0 0 1 -9,-29.6 L-9,29.6 A31,31 0 0 1 -31,0 Z" fill="#202425" opacity=".9"/>` +
        `<path d="M-14,-10 L14,10 M-14,10 L14,-10" stroke="rgba(0,0,0,.18)" stroke-width="2"/>` +
        `<text x="10" y="4" font-size="9" text-anchor="middle" class="pcb-can-t">100µF</text>`;
    }
    function tactile() {
      let s = '';
      [[-40, -22], [-40, 22], [40, -22], [40, 22]].forEach(([x, y]) => { s += `<rect x="${x - 9}" y="${y - 5}" width="18" height="10" fill="url(#pcb-silver-h)"/>`; });
      s += `<rect x="-31" y="-31" width="62" height="62" rx="4" fill="url(#pcb-silver-h)" stroke="#8d9290"/>`;
      s += `<rect x="-25" y="-25" width="50" height="50" rx="3" fill="none" stroke="rgba(0,0,0,.15)"/>`;
      s += `<circle r="17" fill="url(#pcb-btn)"/><circle r="17" fill="none" stroke="rgba(255,255,255,.12)"/>`;
      [[-20, -20], [20, -20], [-20, 20], [20, 20]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="2.6" fill="rgba(0,0,0,.25)"/>`; });
      return s;
    }

    /* ---- carte ---- */
    const BX = 160, BY = 110, BW = 1280, BH = 680;
    const holes = [[205, 155], [1395, 155], [205, 745], [1395, 745]];
    let board = `<g class="pcb-board" filter="url(#pcb-board-shadow)">
      <rect x="${BX}" y="${BY + 9}" width="${BW}" height="${BH}" rx="26" fill="#040808"/>
      <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="26" fill="#0b1415" stroke="#203031" stroke-width="2"/>
      <rect x="${BX + 16}" y="${BY + 16}" width="${BW - 32}" height="${BH - 32}" rx="14" fill="#0f1b1c"/>`;
    holes.forEach(([x, y]) => {
      board += `<circle cx="${x}" cy="${y}" r="31" fill="#0b1415"/><circle cx="${x}" cy="${y}" r="22" fill="url(#pcb-gold)"/><circle cx="${x}" cy="${y}" r="13" class="pcb-hole"/>`;
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        board += `<circle cx="${r2(x + Math.cos(a) * 17.5)}" cy="${r2(y + Math.sin(a) * 17.5)}" r="1.8" fill="#8a6a2e"/>`;
      }
    });
    [[300, 155], [1300, 745], [1310, 155]].forEach(([x, y]) => {
      board += `<circle cx="${x}" cy="${y}" r="13" fill="#0b1415"/><circle cx="${x}" cy="${y}" r="5.5" fill="url(#pcb-gold)"/>`;
    });
    board += '</g>';

    /* ---- U1 : microcontrôleur ---- */
    const CX = 800, CY = 440, TIP = 116, SPAN = 78.75, PITCH = 10.5;
    const lp = i => pt(CX - TIP, CY - SPAN + i * PITCH);
    const rp = i => pt(CX + TIP, CY - SPAN + i * PITCH);
    const tp = i => pt(CX - SPAN + i * PITCH, CY - TIP);
    const bp = i => pt(CX - SPAN + i * PITCH, CY + TIP);
    lqfpPads(CX, CY);
    part(1, CX, CY, 0, lqfp(), 'pcb-mcu');
    silk.push(`<path d="M${CX - 124},${CY - 108} V${CY - 124} H${CX - 108} M${CX + 108},${CY - 124} H${CX + 124} V${CY - 108} M${CX + 124},${CY + 108} V${CY + 124} H${CX + 108} M${CX - 108},${CY + 124} H${CX - 124} V${CY + 108}" class="pcb-silk-l"/>`);
    silk.push(`<circle cx="${CX - 132}" cy="${CY - 132}" r="4" class="pcb-silk-f"/>`);
    txt(CX - 124, CY - 134, 'U1', 12);

    /* ---- Y1 : quartz 8 MHz + capacités de charge ---- */
    const YX = 550, YY = 335;
    [[-22, -13], [-22, 13], [22, -13], [22, 13]].forEach(([dx, dy]) => pad(YX + dx, YY + dy, 15, 12));
    part(4, YX, YY, 0, crystal());
    box(YX, YY, 76, 56, 4);
    txt(YX, YY - 36, 'Y1 · 8 MHz', 11, 'middle');
    fan([lp(1), lp(2)], [pt(579, 322), pt(579, 348)], 'h', 12, 10).forEach(p => T(p, 4.2, true));
    passive(5, 'C', 488, 322, 0, '', '', 'm');
    passive(5, 'C', 488, 348, 0, '', '', 'm');
    txt(452, 302, 'C5', 11, 'middle'); txt(452, 376, 'C6', 11, 'middle');
    T([pt(528, 322), pt(504, 322)]); T([pt(528, 348), pt(504, 348)]);
    T([pt(472, 322), pt(448, 322)]); T([pt(472, 348), pt(448, 348)]);
    via(442, 322); via(442, 348);

    /* ---- J1 : USB-C + paire différentielle D+ / D- ---- */
    const JX = 200, JY = 440;
    [398, 410, lp(7).y, lp(8).y, 470, 482].forEach(y => pad(258, y, 14, 6, 1));
    part(9, JX, JY, 0, usbc());
    txt(JX + 8, JY - 82, 'J1 · USB-C', 11, 'middle');
    T([pt(264, lp(7).y), lp(7)], 3.6, true);
    T([pt(264, lp(8).y), lp(8)], 3.6, true);
    passive(10, 'R', 380, lp(7).y, 0, '', '220', 's');
    passive(10, 'R', 412, lp(8).y, 0, '', '220', 's');
    txt(380, 416, 'R1', 10, 'middle'); txt(412, 471, 'R2', 10, 'middle');
    for (let x = 456; x <= 624; x += 42) { via(x, 414); via(x, 466); }

    /* ---- alimentation : VBUS → ferrite → régulateur 3,3 V ---- */
    T([pt(258, 470), pt(300, 470), pt(300, 610), pt(346, 656), pt(392, 656)], 8.5, true);
    passive(11, 'F', 300, 540, 90, 'FB1');
    const RX = 440, RY = 630;
    pad(RX + 34, RY, 26, 66, 2);                       // languette (VOUT)
    [-26, 0, 26].forEach(d => pad(RX - 40, RY + d, 24, 14));
    part(12, RX, RY, 90, sot223());
    txt(RX, RY - 58, 'U2 · 3V3', 11, 'middle');
    T([pt(RX - 40, RY - 26), pt(372, RY - 26)]); via(366, RY - 26);
    T([pt(474, 630), pt(513, 630), pt(645.25, lp(13).y), pt(660, lp(13).y)], 8.5, true);
    T([pt(660, lp(13).y), lp(13)], 4.2);
    const EX = 330, EY = 722;
    pad(EX, EY - 30, 20, 16); pad(EX, EY + 30, 20, 16);
    part(13, EX, EY, 0, electrolytic());
    txt(EX - 50, EY - 30, '+', 16, 'middle'); txt(EX + 52, EY + 4, 'C7', 11);
    T([pt(EX, EY - 38), pt(EX, 672), pt(346, 656)], 6);
    passive(14, 'C', 520, 692, 90, 'C8');
    T([pt(520, 677), pt(520, 650), pt(500, 630)], 5); T([pt(520, 707), pt(520, 722)]); via(520, 728);

    /* ---- LED de mise sous tension + LED d'état ---- */
    const ledPins = [tp(2), tp(3)];
    fan(ledPins, [pt(700, 279), pt(740, 279)], 'v', 10, 10).forEach(p => T(p, 3.8, true));
    passive(15, 'R', 700, 262, 90, '', '102'); passive(15, 'R', 740, 262, 90, '', '102');
    txt(688, 266, 'R3', 10, 'end'); txt(756, 266, 'R4', 10);
    T([pt(700, 247), pt(700, 215)]); T([pt(740, 247), pt(740, 215)]);
    passive(16, 'D', 700, 200, 90, ''); passive(16, 'D', 740, 200, 90, '');
    txt(684, 205, 'PWR', 10, 'end'); txt(756, 205, 'STAT', 10);
    T([pt(700, 185), pt(700, 166)]); T([pt(740, 185), pt(740, 166)]); via(700, 160); via(740, 160);
    fx.push(`<circle class="pcb-glow pcb-glow--pwr" cx="700" cy="200" r="20" filter="url(#pcb-glow)"/>`);
    fx.push(`<circle class="pcb-glow pcb-glow--stat" cx="740" cy="200" r="20" filter="url(#pcb-glow)"/>`);

    /* ---- SW1 : bouton reset ---- */
    const SX = 1000, SY = 170;
    [[-40, -22], [-40, 22], [40, -22], [40, 22]].forEach(([dx, dy]) => pad(SX + dx, SY + dy, 20, 13));
    part(17, SX, SY, 0, tactile());
    txt(SX, SY - 44, 'SW1 · RST', 11, 'middle');
    T(vdv(tp(12), pt(SX - 40, SY + 22)), 3.8, true);
    T([pt(SX + 40, SY + 22), pt(SX + 40, 222)]); via(SX + 40, 228);
    passive(18, 'C', 880, 205, 90, 'C9', '', 's');
    T([pt(880, 217), pt(880, 236)]); via(880, 242);

    /* ---- J2 : connecteur SWD ---- */
    const swdY = [300, 326, 352, 378, 404];
    swdY.forEach(y => thPad(1210, y, 10.5));
    fan([2, 3, 4, 5, 6].map(rp), swdY.map(y => pt(1200, y)), 'h', 14, 10).forEach(p => T(p, 3.8, true));
    part(20, 1210, 352, 0, header(5, true));
    ['3V3', 'SWDIO', 'SWCLK', 'NRST', 'GND'].forEach((l, i) => txt(1234, swdY[i] + 4, l, 11));
    txt(1210, 276, 'J2 · SWD', 11, 'middle');

    /* ---- U3 : EEPROM I²C + résistances de rappel ---- */
    const UX = 1150, UY = 560;
    for (let i = 0; i < 4; i++) { pad(UX - 46, UY - 19.5 + i * 13, 22, 8); pad(UX + 46, UY - 19.5 + i * 13, 22, 8); }
    part(21, UX, UY, 0, soic8());
    box(UX, UY, 118, 72, 4); txt(UX, UY - 44, 'U3', 11, 'middle');
    silk.push(`<circle cx="${UX - 66}" cy="${UY - 30}" r="3.4" class="pcb-silk-f"/>`);
    fan([rp(10), rp(11)], [pt(UX - 56, UY + 6.5), pt(UX - 56, UY + 19.5)], 'h', 14, 10).forEach(p => T(p, 3.8, true));
    T([pt(UX + 56, UY - 19.5), pt(UX + 76, UY - 19.5)]); via(UX + 82, UY - 19.5);
    T([pt(UX + 56, UY + 19.5), pt(UX + 76, UY + 19.5)]); via(UX + 82, UY + 19.5);
    passive(22, 'R', 1120, 628, 0, 'R5', '472', 's'); passive(22, 'R', 1180, 628, 0, 'R6', '472', 's');

    /* ---- J3 : connecteur GPIO ---- */
    const gx = Array.from({ length: 8 }, (_, k) => 709 + k * 26);
    gx.forEach(x => thPad(x, 720, 10.5));
    fan([4, 5, 6, 7, 8, 9, 10, 11].map(bp), gx.map(x => pt(x, 711)), 'v', 16, 10).forEach(p => T(p, 3.8, true));
    part(23, 800, 720, 0, header(8, false));
    gx.forEach((x, k) => txt(x, 754, 'PA' + k, 10, 'middle'));
    txt(684, 724, 'J3', 11, 'end');

    /* ---- découplage autour du microcontrôleur ---- */
    [[650, 300], [950, 300], [950, 585], [650, 585]].forEach(([x, y], k) => {
      passive(24, 'C', x, y, 0, 'C' + (k + 1), '', 's');
      via(x - 24, y); T([pt(x - 12, y), pt(x - 18, y)]);
    });

    /* ---- points de test ---- */
    [990, 1020, 1050].forEach((x, k) => { pads.push(`<circle cx="${x}" cy="470" r="7"/>`); silk.push(`<circle cx="${x}" cy="470" r="11" class="pcb-silk-l"/>`); txt(x, 494, 'TP' + (k + 1), 9, 'middle'); });

    /* ---- sérigraphie : cartouche, logo, matrice ---- */
    silk.push(`<line x1="965" y1="680" x2="1380" y2="680" class="pcb-silk-l"/>`);
    txt(965, 712, 'KT-26 · DEV BOARD', 28, 'start', 'pcb-silk-t pcb-silk-t--title');
    txt(965, 736, 'KOUTHIEYE THIAW — BUT GEII · ESE', 12.5);
    txt(965, 756, 'REV 2.6 · 2026 · BORDEAUX, FR', 12.5);
    txt(250, 238, '(k)thiaw', 30, 'start', 'pcb-silk-t pcb-silk-t--title');
    txt(252, 262, 'STM32 · USB-C · SWD · I²C', 11);
    let dm = '';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      if (i === 0 || j === 9 || (i === 9 && j % 2 === 0) || (j === 0 && i % 2 === 1) || rnd() > 0.52) dm += `<rect x="${1272 + j * 4.4}" y="${212 + i * 4.4}" width="4.4" height="4.4"/>`;
    }
    silk.push(`<g class="pcb-silk-f">${dm}</g>`);

    /* ---- assemblage ---- */
    parts.sort((a, b) => a.order - b.order);
    svg.innerHTML = DEFS + board +
      `<g class="pcb-clear">${traces.map(t => `<path d="${t.d}" stroke-width="${t.w + 7}"/>`).join('')}</g>` +
      `<g class="pcb-traces">${traces.map(t => `<path d="${t.d}" stroke-width="${t.w}"/>`).join('')}</g>` +
      `<g class="pcb-pads">${pads.join('')}</g>` +
      `<g class="pcb-vias">${vias.join('')}</g>` +
      `<g class="pcb-silk">${silk.join('')}</g>` +
      `<g class="pcb-parts">${parts.map(p => p.s).join('')}</g>` +
      `<g class="pcb-fx">${fx.join('')}</g>`;

    const q = s => Array.from(svg.querySelectorAll(s));
    const ledParts = q('.pcb-led');
    if (ledParts[1]) ledParts[1].classList.add('pcb-led--stat');
    const tr = q('.pcb-traces path');
    return {
      board: svg.querySelector('.pcb-board'),
      clear: q('.pcb-clear path'),
      traces: tr,
      sparkPaths: tr.filter((_, i) => traces[i].spark),
      pads: svg.querySelector('.pcb-pads'),
      vias: svg.querySelector('.pcb-vias'),
      silk: svg.querySelector('.pcb-silk'),
      parts: q('.pcb-part'),
      fx: svg.querySelector('.pcb-fx'),
      leds: q('.pcb-led-on'),
      glows: q('.pcb-glow')
    };
  };
})();
