// Moteur du film : tout est fonction pure du temps (seek(t)), pour un rendu image par image reproductible.
const $ = (s) => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const E = {
  lin: (x) => x,
  outCubic: (x) => 1 - (1 - x) ** 3,
  outQuart: (x) => 1 - (1 - x) ** 4,
  outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  inCubic: (x) => x ** 3,
  inOutCubic: (x) => (x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  inOutQuart: (x) => (x < .5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2,
};
const P = (t, a, b, e = E.outExpo) => e(clamp((t - a) / (b - a)));
const Lr = (a, b, p) => a + (b - a) * p;
const eur = (n) => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' €';
const eur2 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' €';
function tf(el, { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, o = 1, px = null } = {}) {
  el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s * sx},${s * sy})`;
  el.style.opacity = o;
}
// place un flottant par son centre
const dims = new Map();
function ctr(el, cx, cy, o = {}) {
  let d = dims.get(el); if (!d) { d = [el.offsetWidth, el.offsetHeight]; dims.set(el, d); }
  tf(el, { ...o, x: cx - d[0] / 2, y: cy - d[1] / 2 });
}
// lignes masquées : chaque .ln > span monte depuis le bas
function lines(root, T, t0, step = .13, dur = .9, ease = E.outExpo) {
  [...root.querySelectorAll('.ln > span')].forEach((sp, i) => { const p = P(T, t0 + i * step, t0 + i * step + dur, ease); sp.style.transform = `translate3d(0,${(1 - p) * 118}%,0)`; });
}
function linesOut(root, T, t0, step = .08, dur = .5) {
  [...root.querySelectorAll('.ln > span')].forEach((sp, i) => { const p = P(T, t0 + i * step, t0 + i * step + dur, E.inCubic); sp.style.transform = `translate3d(0,${-p * 118}%,0)`; });
}
const fade = (el, T, a, b, dy = 24, ease = E.outCubic) => { const p = P(T, a, b, ease); tf(el, { y: (1 - p) * dy, o: p }); };

const NAT = { hook: 4.2, facture: 6.0, simu: 5.4, cal: 5.0, prive: 4.4, logo: 7.0 };
const PLANS = {
  main: [['hook', 4.2], ['facture', 6.0], ['simu', 5.4], ['cal', 5.0], ['prive', 4.4], ['logo', 7.0]],
  teaser: [['hook', 2.6], ['facture', 3.8], ['simu', 3.2], ['prive', 2.6], ['logo', 4.4]],
};
const planName = new URLSearchParams(location.search).get('plan') || 'main';
const plan = PLANS[planName];
let acc = 0; const SC = plan.map(([id, dur]) => { const o = { id, dur, start: acc, k: NAT[id] / dur }; acc += dur; return o; });
const TOTAL = acc;
const byId = Object.fromEntries(SC.map((s) => [s.id, s]));
const LAYERS = { hook: ['s1', null], facture: ['s2', 'w2'], simu: ['s3', 'w3'], cal: ['s4', 'w4'], prive: ['s5', 'w5'], logo: ['s6', 'w6'] };
const CENTER = { facture: [1400, 560], simu: [1400, 560], cal: [1400, 560], prive: [1400, 560], logo: [635, 470] };

/* ---------- calendrier de novembre 2026 ---------- */
{
  const g = $('#cGrid'); let h = '';
  for (const d of ['L', 'M', 'M', 'J', 'V', 'S', 'D']) h += `<div class="wd">${d}</div>`;
  const cells = [...[26, 27, 28, 29, 30, 31].map((n) => [n, true]), ...Array.from({ length: 30 }, (_, i) => [i + 1, false]), ...[1, 2, 3, 4, 5, 6].map((n) => [n, true])];
  cells.forEach(([n, mute], i) => { h += `<div class="d${mute ? ' mute' : ''}" data-i="${i}">${i === 35 ? '<i class="blob" id="cBlob"></i>' : ''}<span>${n}</span></div>`; });
  g.innerHTML = h;
}
const cCells = [...document.querySelectorAll('#cGrid .d')];

/* ---------- scènes ---------- */
function hook(T) {
  $('#h-dots').style.transform = `translateY(${-T * 14}px)`;
  fade($('#h-eye'), T, .1, .7, 18); if (T > 2.1) tf($('#h-eye'), { y: -P(T, 2.1, 2.5, E.inCubic) * 30, o: 1 - P(T, 2.1, 2.5, E.lin) });
  const w = $('#h-words'); lines(w, T, .5, .3, .9); if (T >= 2.2) linesOut(w, T, 2.2, .09, .55);
  const q = $('#h-q'); lines(q, T, 2.85, .16, 1.0);
  $('#h-pillbg').style.transform = `scaleX(${P(T, 3.45, 4.0, E.outExpo)})`;
  const card = (id, cx, cy, r0, t0, fa, ph) => {
    const pin = P(T, t0, t0 + .9, (x) => E.outBack(x, 1.4)), pout = P(T, 2.15 + (t0 - .7) * .2, 2.75, E.inCubic);
    ctr($(id), cx, cy + Math.sin(T * 1.9 + ph) * fa + pout * 220, { s: pin * (1 - pout * .4), r: r0 + (1 - pin) * -40 + Math.sin(T * 1.3 + ph) * 3 + pout * 25, o: pin * (1 - pout) });
  };
  card('#h-c1', 1580, 300, -8, .75, 12, 0); card('#h-c2', 1510, 610, 7, 1.05, 14, 2); card('#h-c3', 1710, 880, -5, 1.35, 10, 4);
  $('#s1 .in').style.transform = `scale(${1 + .03 * T / NAT.hook})`;
}

function leftText(pre, T, { eye = .25, h = .45, sub = 1.2, chips = 1.5 } = {}) {
  fade($(`#${pre}-eye`), T, eye, eye + .6, 20);
  lines($(`#${pre}-h`), T, h, .14, 1.0);
  fade($(`#${pre}-sub`), T, sub, sub + .7, 26);
  const ch = [...$(`#${pre}-chips`).children]; ch.forEach((c, i) => { const p = P(T, chips + i * .14, chips + i * .14 + .6, (x) => E.outBack(x, 1.2)); tf(c, { y: (1 - p) * 30, s: .8 + .2 * p, o: clamp(p * 1.6) }); });
}
function facture(T) {
  leftText('f', T);
  $('#s2 .in').style.transform = `scale(${1 + .03 * T / NAT.facture})`;
  // écran
  const typed = 'Atelier Lumière'; const n = Math.floor(clamp((T - 1.3) / .85) * typed.length);
  $('#fCl').textContent = typed.slice(0, n); $('#fCaret').style.opacity = (T > .9 && Math.floor(T * 2.4) % 2 === 0) || (T > 1.3 && T < 2.2) ? 1 : 0;
  for (const [id, a] of [['#fR1', 2.15], ['#fR2', 2.65]]) { const p = P(T, a, a + .55, E.outCubic); tf($(id), { x: (1 - p) * 34, o: p }); }
  const pay = P(T, 1.9, 2.5, E.outCubic); tf($('#fPay'), { y: (1 - pay) * 20, o: pay });
  const tp = P(T, 2.3, 3.5, E.outCubic); const pulse = 1 + .05 * Math.sin(clamp((T - 3.45) / .5) * Math.PI);
  $('#fTotV').textContent = eur2(1320 * tp); tf($('#fTot'), { s: pulse, o: P(T, 1.9, 2.4, E.outCubic) });
  const ok = P(T, 3.7, 4.2, (x) => E.outBack(x, 1.6)); tf($('#fOk'), { s: .7 + .3 * ok, y: (1 - ok) * 14, o: clamp(ok * 1.5) });
  const press = T < 4.55 ? P(T, 4.4, 4.55, E.lin) : 1 - P(T, 4.55, 4.8, E.outBack); tf($('#fBtn'), { s: 1 - .05 * clamp(T < 4.55 ? press : press) });
  const rp = P(T, 4.45, 5.1, E.outCubic); const r = $('#fRp'); r.style.left = '50%'; r.style.top = '50%'; r.style.transform = `scale(${rp * 16})`; r.style.opacity = (1 - rp) * .55;
  const ts = P(T, 4.95, 5.5, (x) => E.outBack(x, 1.5)); tf($('#fToast'), { y: (1 - ts) * 110, o: ts > 0 ? 1 : 0 });
  // flottants
  const bob = (ph, a = 9) => Math.sin(T * 1.7 + ph) * a;
  const pn = P(T, 3.75, 4.4, (x) => E.outBack(x, 1.5)); ctr($('#fl-num'), 1170, 215 + bob(1), { s: pn, r: -4 + (1 - pn) * -12, o: clamp(pn * 2) });
  const sp = P(T, 4.75, 5.6, (x) => E.outBack(x, 1.2));
  ctr($('#fl-sheet'), Lr(1400, 1745, sp), Lr(560, 360, sp) + bob(2, 10), { s: Lr(.35, 1, sp), r: Lr(-4, 7, sp), o: clamp(sp * 3) });
  const pp = P(T, 5.2, 5.8, (x) => E.outBack(x, 1.8)); ctr($('#fl-pdf'), 1690, 600 + bob(3), { s: pp, r: -3, o: clamp(pp * 2) });
}
function simu(T) {
  leftText('s', T);
  $('#s3 .in').style.transform = `scale(${1 + .03 * T / NAT.simu})`;
  const ca = Lr(2000, 3000, P(T, 1.1, 2.8, E.inOutCubic));
  $('#sCa').textContent = eur(ca); $('#sFill').style.width = `${ca / 5000 * 100}%`; $('#sKnob').style.left = `${ca / 5000 * 100}%`;
  const cot = Math.round(ca * .212), net = Math.round(ca) - cot;
  const bar = P(T, .9, 1.7, E.outCubic); $('#sNetBar').style.width = `${78.8 * bar}%`; $('#sCotBar').style.width = `${21.2 * bar}%`;
  $('#sCot').textContent = eur(cot); $('#sNet').textContent = eur(net);
  const tiles = [...document.querySelectorAll('#scrS .tile')]; tiles.forEach((el, i) => { const p = P(T, 1.7 + i * .15, 2.3 + i * .15, (x) => E.outBack(x, 1.3)); tf(el, { y: (1 - p) * 40, o: clamp(p * 1.5) }); });
  const nt = P(T, 3.0, 3.6, E.outCubic); tf($('#sNote'), { y: (1 - nt) * 20, o: nt });
  const wn = P(T, 3.5, 4.1, (x) => E.outBack(x, 1.3)); tf($('#sWarn'), { y: (1 - wn) * 30, o: clamp(wn * 1.5) });
  const bob = (ph, a = 9) => Math.sin(T * 1.7 + ph) * a;
  const pr = P(T, 1.9, 2.5, (x) => E.outBack(x, 1.6)); ctr($('#fl-rate'), 1190, 150 + bob(0), { s: pr, r: -3, o: clamp(pr * 2) });
  const pn = P(T, 3.0, 3.7, (x) => E.outBack(x, 1.7)); ctr($('#fl-net'), 1700, 830 + bob(2), { s: pn, r: 3, o: clamp(pn * 2) });
}
function cal(T) {
  leftText('c', T);
  $('#s4 .in').style.transform = `scale(${1 + .03 * T / NAT.cal})`;
  cCells.forEach((c, i) => { const p = P(T, .3 + i * .012, .7 + i * .012, E.outCubic); c.style.opacity = p; });
  const bl = P(T, 1.4, 1.9, (x) => E.outBack(x, 2)); $('#cBlob').style.transform = `scale(${bl})`; cCells[35].classList.toggle('hit', T > 1.5);
  for (const [id, a] of [['#cE1', 1.9], ['#cE2', 2.25]]) { const p = P(T, a, a + .55, E.outCubic); tf($(id), { x: (1 - p) * 40, o: p }); }
  const e3 = P(T, 2.6, 3.15, E.outCubic); tf($('#cE3'), { x: (1 - e3) * 40, o: e3 });
  const press = T < 3.25 ? P(T, 3.1, 3.25, E.lin) : 1 - P(T, 3.25, 3.5, E.outBack); tf($('#cBtn'), { s: 1 - .05 * press });
  const rp = P(T, 3.15, 3.8, E.outCubic); const r = $('#cRp'); r.style.left = '50%'; r.style.top = '50%'; r.style.transform = `scale(${rp * 18})`; r.style.opacity = (1 - rp) * .55;
  const bob = (ph, a = 9) => Math.sin(T * 1.7 + ph) * a;
  const pi = P(T, 3.5, 4.1, (x) => E.outBack(x, 1.7)); ctr($('#fl-ics'), 1700, 760 + bob(1), { s: pi, r: 3, o: clamp(pi * 2) });
  const pn = P(T, 3.9, 4.6, (x) => E.outBack(x, 1.3)); const shake = T > 4.4 ? Math.sin((T - 4.4) * 40) * 2 * Math.exp(-(T - 4.4) * 4) : 0;
  ctr($('#fl-notif'), 1400, Lr(-120, 130, pn) + shake, { o: clamp(pn * 3), s: Lr(.9, 1, pn) });
}
function prive(T) {
  $('#s5 .in').style.transform = `scale(${1 + .03 * T / NAT.prive})`;
  [['#p1', .35], ['#p2', .75], ['#p3', 1.15]].forEach(([id, a]) => {
    const el = $(id), pt = P(T, a, a + .55, (x) => E.outBack(x, 1.8)); el.querySelector('.tick').style.transform = `scale(${pt})`;
    el.querySelector('.ln > span').style.transform = `translate3d(0,${(1 - P(T, a + .1, a + 1, E.outExpo)) * 118}%,0)`;
  });
  fade($('#p-sub'), T, 1.9, 2.5, 24);
  const w = P(T, .7, 1.5, E.outExpo); tf($('#p-win'), { x: (1 - w) * 140, o: w });
  const ls = P(T, 1.2, 1.9, (x) => E.outBack(x, 1.6)); tf($('#p-lsvg'), { s: ls, o: ls });
  [['#p-d1', 1.7, 0], ['#p-d2', 1.95, 2], ['#p-d3', 2.2, 4]].forEach(([id, a, ph]) => { const p = P(T, a, a + .6, (x) => E.outBack(x, 1.5)); tf($(id), { s: p, y: Math.sin(T * 1.8 + ph) * 8, o: clamp(p * 2) }); });
  const cl = P(T, 2.6, 3.2, E.outCubic); tf($('#p-cloud'), { o: cl, x: -(1 - cl) * 60 });
  const cut = P(T, 3.0, 3.5, E.outCubic); const path = $('#p-cut'); path.setAttribute('stroke-dasharray', '130'); path.setAttribute('stroke-dashoffset', 130 * (1 - cut));
  fade($('#p-l1'), T, 2.4, 3.0, 20);
}
function logo(T) {
  const g = $('#gg'), sweep = $('#sweep');
  const cx0 = 960, cy0 = 470, cx1 = 635, cy1 = 470;
  const pop = P(T, .1, 1.0, (x) => E.outBack(x, 1.5)); const move = P(T, 3.0, 3.95, E.inOutQuart);
  const pulse = 1 + .07 * Math.sin(clamp((T - 2.35) / .6) * Math.PI) * (1 - move);
  const sc = Lr(1.95, 1.0, move) * pop * pulse;
  const rot = (1 - pop) * -16;
  const mono = $('#mono'); const cx = Lr(cx0, cx1, move), cy = Lr(cy0, cy1, move);
  mono.style.transform = `translate3d(${cx - 100}px,${cy - 100}px,0) rotate(${rot}deg) scale(${sc})`; mono.style.opacity = clamp(pop * 3);
  // le G se dessine en balayage
  const A0 = -20 * Math.PI / 180, R = 12; const pt = (a) => [32 + R * Math.cos(a), 32 + R * Math.sin(a)].map((v) => v.toFixed(3));
  const [ax, ay] = pt(A0), [mx, my] = pt(A0 - Math.PI);
  sweep.setAttribute('d', `M ${ax} ${ay} A ${R} ${R} 0 0 0 ${mx} ${my} A ${R} ${R} 0 0 0 ${ax} ${ay}`);
  const d = P(T, 1.0, 2.5, E.inOutCubic); sweep.setAttribute('stroke-dasharray', '1 1'); sweep.setAttribute('stroke-dashoffset', String(1 - d));
  const gr = (1 - d) * -50, gs = Lr(.8, 1, E.outCubic(d)); g.style.transform = `rotate(${gr}deg) scale(${gs})`;
  const th = A0 - 2 * Math.PI * d + gr * Math.PI / 180; const tip = $('#tip'), tip2 = $('#tip2'); const vis = d > 0 && d < 1 ? 1 : 0;
  for (const [el, rr] of [[tip, 15.6], [tip2, 15.6]]) { el.setAttribute('cx', (32 + rr * Math.cos(th)).toFixed(3)); el.setAttribute('cy', (32 + rr * Math.sin(th)).toFixed(3)); }
  tip.setAttribute('opacity', vis); tip2.setAttribute('opacity', vis * .5);
  $('#shine').setAttribute('x', String(Lr(-40, 90, P(T, 2.4, 3.1, E.inOutCubic))));
  // ondes
  for (const [id, a, w] of [['#l-ring1', 2.35, 6], ['#l-ring2', 2.5, 3]]) { const p = P(T, a, a + 1.0, E.outCubic); const el = $(id); el.style.left = `${cx}px`; el.style.top = `${cy}px`; el.style.transform = `scale(${1 + p * 7})`; el.style.opacity = p > 0 && p < 1 ? (1 - p) * .9 : 0; el.style.borderWidth = `${w * (1 - p * .6)}px`; }
  // mot-symbole
  $('#l-clip').style.clipPath = 'inset(0 0 0 772px)';
  $('#l-wm').style.left = '775px'; $('#l-wm').style.top = '372px';
  $('#l-wm-t').style.transform = `translate3d(${-(1 - P(T, 3.2, 4.2, E.outExpo)) * 520}px,0,0)`;
  const by = $('#l-by'); by.style.left = '783px'; by.style.top = '556px'; fade(by, T, 3.9, 4.5, 18);
  fade($('#l-tag'), T, 4.7, 5.4, 26);
  const u = $('#l-url'); const up = P(T, 5.4, 6.0, (x) => E.outBack(x, 1.6)); u.style.transform = `translate3d(-50%,${(1 - up) * 24}px,0) scale(${.85 + .15 * up})`; u.style.opacity = clamp(up * 2);
  $('#s6 .in').style.transform = `scale(${1 + .02 * T / NAT.logo})`;
}

/* ---------- téléphone ---------- */
function phone(t) {
  const loc = (id) => { const s = byId[id]; return s ? (t - s.start) * s.k : null; };
  const tF = loc('facture'), tS = loc('simu'), tC = loc('cal');
  const layer = $('#phoneLayer'); const first = byId.facture;
  const show = first && t >= first.start;
  layer.style.visibility = show ? 'visible' : 'hidden'; if (!show) return;
  const pe = P(tF, .3, 1.7, (x) => E.outBack(x, .9));
  const pS = tS === null ? 0 : P(tS, 0, 1.2, (x) => E.outBack(x, 1.1)), pC = tC === null ? 0 : P(tC, 0, 1.2, (x) => E.outBack(x, 1.1));
  const bump = (T, d = 1.0) => (T === null ? 0 : Math.sin(clamp(T / d) * Math.PI));
  const ry = Lr(-62, -16, pe) + 30 * pS - 26 * pC + Math.sin(t * 1.1) * 1.6;
  const rz = Lr(12, -3, pe) + 5 * pS - 4 * pC;
  const y = (1 - pe) * 1100 - 26 * bump(tS) - 26 * bump(tC) + Math.sin(t * 1.7) * 9;
  const s = Lr(.9, 1.12, pe) + .02 * bump(tS) + .02 * bump(tC);
  $('#phone').style.transform = `translate3d(0,${y}px,0) rotateX(5deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
  const idx = (tS === null ? 0 : P(tS, .05, .85, E.outExpo)) + (tC === null ? 0 : P(tC, .05, .85, E.outExpo));
  [['#scrF', 0], ['#scrS', 1], ['#scrC', 2]].forEach(([id, i]) => { const d = i - idx; const el = $(id); el.style.transform = `translate3d(${d * 392}px,0,0) scale(${1 - .05 * Math.min(1, Math.abs(d))})`; el.style.visibility = Math.abs(d) > 1.2 ? 'hidden' : 'visible'; });
  // les flottants ne sont visibles que pour leur scène
  const vis = (ids, on) => ids.forEach((id) => { $(id).style.visibility = on ? 'visible' : 'hidden'; });
  const inF = tF !== null && tF >= 0 && (tS === null || tS < .55), inS = tS !== null && tS >= 0 && (tC === null || tC < .55) && (tS > .3), inC = tC !== null && tC >= 0 && tC > .3;
  vis(['#fl-num', '#fl-sheet', '#fl-pdf'], inF); vis(['#fl-rate', '#fl-net'], inS); vis(['#fl-notif', '#fl-ics'], inC);
}

/* ---------- ordonnancement ---------- */
const RENDER = { hook, facture, simu, cal, prive, logo };
function seek(t) {
  SC.forEach((s, i) => {
    const [lid, wid] = LAYERS[s.id], layer = $(`#${lid}`), wave = wid ? $(`#${wid}`) : null;
    const lt = t - s.start; const T = Math.min(Math.max(lt, 0) * s.k, NAT[s.id]);
    if (i === 0) { layer.style.visibility = 'visible'; layer.style.clipPath = 'none'; } else {
      const [cx, cy] = CENTER[s.id]; const R = (x) => 2500 * E.inOutCubic(clamp(x / .95));
      const r1 = R(lt), r2 = R(lt - .22);
      layer.style.visibility = lt > .22 ? 'visible' : 'hidden'; layer.style.clipPath = r2 >= 2499 ? 'none' : `circle(${r2}px at ${cx}px ${cy}px)`;
      wave.style.visibility = lt > 0 ? 'visible' : 'hidden'; wave.style.clipPath = r1 >= 2499 ? 'none' : `circle(${r1}px at ${cx}px ${cy}px)`;
    }
    if (lt >= -.01) RENDER[s.id](T);
  });
  phone(t);
}
window.seek = seek; window.TOTAL = TOTAL; window.SC = SC;
document.fonts.ready.then(() => { seek(0); window.ready = true; });
