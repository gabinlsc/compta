"""Bande son synthétique du film (numpy seul) : nappe, arpège, bruitages d'interface, montée et impact du logo.
Usage : python3 promo/audio.py <main|teaser> <sortie.wav>. Les repères sont ceux de promo/engine.js (temps local des scènes)."""
import sys, wave
import numpy as np

SR = 48000
PLANS = {
    'main': [('hook', 4.2), ('facture', 6.0), ('simu', 5.4), ('cal', 5.0), ('prive', 4.4), ('logo', 7.0)],
    'teaser': [('hook', 2.6), ('facture', 3.8), ('simu', 3.2), ('prive', 2.6), ('logo', 4.4)],
}
NAT = {'hook': 4.2, 'facture': 6.0, 'simu': 5.4, 'cal': 5.0, 'prive': 4.4, 'logo': 7.0}
plan = sys.argv[1] if len(sys.argv) > 1 else 'main'
out = sys.argv[2] if len(sys.argv) > 2 else f'promo/out/{plan}.wav'
rng = np.random.default_rng(7)

scenes, acc = {}, 0.0
for sid, dur in PLANS[plan]:
    scenes[sid] = (acc, NAT[sid] / dur); acc += dur
TOTAL = acc
N = int((TOTAL + 1.0) * SR)
L = np.zeros(N); R = np.zeros(N)
REV = np.zeros(N); REVL = np.zeros(N)

def at(sid, T):  # temps global d'un repère local
    s, k = scenes[sid]; return s + T / k

def add(sig, t, pan=0.0, gain=1.0, rev=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l; R[i:i + len(sig)] += sig * r
    if rev: REV[i:i + len(sig)] += sig * rev

def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def tone(f, dur, a=0.005, d=0.3, h=(1.0,), sh=None):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(amp * np.sin(2 * np.pi * f * (i + 1) * t) for i, amp in enumerate(h))
    return s * env(n, a, d)

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); p = 0.0
    for i, v in enumerate(x): p = (1 - a) * v + a * p; y[i] = p
    return y

def lp_sweep(x, c0, c1):
    n = len(x); y = np.zeros(n); p = 0.0
    cs = np.exp(np.linspace(np.log(c0), np.log(c1), n))
    for i in range(n):
        a = np.exp(-2 * np.pi * cs[i] / SR); p = (1 - a) * x[i] + a * p; y[i] = p
    return y

def whoosh(dur=0.9, up=True, c=(300, 7000), gain=.35):
    n = int(dur * SR); x = rng.standard_normal(n)
    y = lp_sweep(x, *(c if up else c[::-1]))
    y = y - lowpass(y, 120)
    t = np.linspace(0, 1, n); e = np.sin(np.pi * t ** (0.7 if up else 1.4)) ** 2
    return y * e * gain

def tick(f=2400, gain=.25):
    n = int(.03 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / .004)
    return (x - lowpass(x, 800)) * gain + tone(f, .03, .0005, .008) * gain * .4

def pop(f=520, gain=.35):
    n = int(.22 * SR); t = np.arange(n) / SR
    fr = f * (1 + 1.2 * np.exp(-t / .03)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * env(n, .002, .07) * gain

def thud(f=55, gain=.9, dur=.6):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + 3 * np.exp(-t / .05)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * np.exp(-t / .22) * gain

def bell(f, gain=.3, dur=1.6):
    return (tone(f, dur, .002, .5, (1.0, .0)) + .5 * tone(f * 2.76, dur, .002, .25) + .25 * tone(f * 5.4, dur, .001, .1)) * gain

def sparkle(t0, n=7, base=1800, gap=.045, gain=.12):
    for i in range(n):
        add(tone(base * 2 ** ((i % 5) / 6) * (1 + i // 5), .35, .002, .12), t0 + i * gap, pan=rng.uniform(-.7, .7), gain=gain * (1 - i / (n + 2)), rev=.6)

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- nappe et arpège (La mineur / Fa / Do / Sol, 120 BPM)
CH = [(57, 60, 64, 67), (53, 57, 60, 64), (48, 52, 55, 59), (55, 59, 62, 66)]
def pad(t0, t1, notes, gain):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in notes:
        for det in (-.004, 0, .004):
            f = NOTE(m - 12) * (1 + det); s += (2 * ((f * t) % 1) - 1) * .12
    s = lowpass(lowpass(s, 1100), 1500)
    e = np.minimum(1, t / 1.0) * np.minimum(1, (t1 - t0 - t) / 1.0)
    add(s * e, t0, gain=gain, rev=.5)

BAR = 2.0
bars = int(TOTAL / BAR) + 1
sec = lambda t: next((sid for sid in reversed(list(scenes)) if t >= scenes[sid][0]), 'hook')
lvl = {'hook': .55, 'facture': .8, 'simu': .85, 'cal': .9, 'prive': 1.0, 'logo': .9}
for b in range(bars):
    t0 = b * BAR
    if t0 > TOTAL: break
    s = sec(t0 + .1); g = lvl[s]
    if 'logo' in scenes and s == 'logo' and t0 + .1 < at('logo', 2.4): g *= .35
    pad(t0 - .3 if b else t0, t0 + BAR + .5, CH[b % 4], .5 * g)
    if s != 'hook' and not (s == 'logo' and t0 < at('logo', 3.0)):
        add(thud(NOTE(CH[b % 4][0] - 12), .0, 0.1), t0, gain=0)
        add(tone(NOTE(CH[b % 4][0] - 12), BAR, .01, 1.0, (1, .3)), t0, gain=.22 * g)
    if s not in ('hook',) and not (s == 'logo' and t0 < at('logo', 3.0)):
        notes = [CH[b % 4][i % 4] + 12 * (i // 4 + (1 if i % 8 > 4 else 0)) for i in (0, 1, 2, 3, 2, 1, 2, 3)]
        for i, m in enumerate(notes):
            add(tone(NOTE(m), .6, .004, .16, (1, .4, .15)), t0 + i * .25, pan=(-.3 if i % 2 else .3), gain=.13 * g * (1.2 if i % 4 == 0 else 1), rev=.45)

# ---------------- bruitages par scène
def hit(sid, T, f=1, gain=.4):
    add(thud(60 * f, 1.0), at(sid, T), gain=gain)

# accroche
for T in (.5, .8, 1.1): add(tick(1800, .4), at('hook', T), pan=-.2); hit('hook', T, 1, .25); add(whoosh(.5, True, (400, 5000), .22), at('hook', T) - .1)
for T, m in ((.75, 72), (1.05, 76), (1.35, 79)): add(pop(NOTE(m), .22), at('hook', T), pan=.5, rev=.4)
add(whoosh(.7, False, (7000, 300), .35), at('hook', 2.2)); hit('hook', 2.2, 1.2, .3)
for T in (2.85, 3.01): add(tick(2600, .35), at('hook', T))
add(pop(NOTE(81), .3), at('hook', 3.3), rev=.4); add(whoosh(.45, True, (500, 8000), .3), at('hook', 3.4))
add(bell(NOTE(84), .22), at('hook', 3.5), rev=.7)

# vagues et transitions
for sid in scenes:
    if sid == 'hook': continue
    s0 = scenes[sid][0]
    add(whoosh(1.0, True, (250, 9000), .55), s0 - .05, pan=0, rev=.15); add(thud(52, 1.0, .8), s0 + .05, gain=.7)

# facture
TF = lambda T: at('facture', T)
add(whoosh(1.2, True, (200, 5000), .3), TF(.3), pan=.6)
for i in range(15): add(tick(2200 + (i % 3) * 200, .3), TF(1.3) + i * .057, pan=.25)
for T in (2.15, 2.65): add(pop(620, .3), TF(T), pan=.3)
for i in range(18): add(tone(420 * 2 ** (i / 14), .08, .002, .04), TF(2.3) + i * .066, gain=.07, pan=.3)
add(bell(NOTE(88), .22), TF(3.75), rev=.6); add(pop(700, .3), TF(3.7))
add(tick(1500, .5), TF(4.42)); add(pop(380, .35), TF(4.47))
add(whoosh(.8, True, (300, 6500), .35), TF(4.7), pan=.7); add(pop(540, .3), TF(4.95), pan=.2); add(bell(NOTE(91), .25), TF(5.2), rev=.7); sparkle(TF(5.25), 6, 2200)
# simulateur
TS = lambda T: at('simu', T)
add(whoosh(.9, True, (300, 6000), .3), TS(.0), pan=-.4)
for i in range(30): add(tone(300 * 2 ** (i / 22), .05, .002, .03), TS(1.1) + i * .057, gain=.06, pan=-.2)
for T in (1.7, 1.85): add(pop(560, .3), TS(T), pan=.3)
add(pop(660, .32), TS(1.9), pan=-.3); add(bell(NOTE(88), .25), TS(3.05), rev=.7); add(pop(500, .3), TS(3.0), pan=.4); add(pop(450, .28), TS(3.5), pan=-.3)
# calendrier
if "cal" in scenes:
    TC = lambda T: at('cal', T)
    add(whoosh(.9, True, (300, 6000), .3), TC(.0), pan=.4)
    for i in range(18): add(tick(2800 - i * 40, .12), TC(.3) + i * .028, pan=.2)
    add(pop(740, .4), TC(1.4)); add(bell(NOTE(84), .2), TC(1.45), rev=.6)
    for T in (1.9, 2.25, 2.6): add(pop(580, .28), TC(T), pan=.3)
    add(tick(1500, .5), TC(3.1)); add(pop(380, .35), TC(3.15)); add(pop(660, .3), TC(3.5), pan=.4)
    add(whoosh(.5, False, (6000, 800), .25), TC(3.9)); add(bell(NOTE(96), .35, 2.0), TC(4.0), rev=.8); add(bell(NOTE(91), .25, 2.0), TC(4.12), rev=.8)
# confiance
TP = lambda T: at('prive', T)
for T, m in ((.45, 79), (.85, 83), (1.25, 86)): add(pop(NOTE(m - 12), .35), TP(T)); add(bell(NOTE(m), .22), TP(T + .02), rev=.6); add(whoosh(.35, True, (600, 6000), .2), TP(T - .05))
add(whoosh(.7, True, (300, 5000), .3), TP(.7), pan=.6); add(thud(70, 1, .4), TP(1.2), gain=.5); add(tick(1200, .5), TP(1.45))
for T in (1.7, 1.95, 2.2): add(pop(480 + (T - 1.7) * 200, .28), TP(T), pan=.4)
add(whoosh(.5, False, (6000, 500), .3), TP(3.0)); add(tone(NOTE(55), .6, .01, .2, (1, .5)), TP(3.0), gain=.25)
# logo
TL = lambda T: at('logo', T)
add(pop(300, .5), TL(.1), rev=.4); add(thud(80, 1, .5), TL(.15), gain=.5)
n = int(1.45 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
ris = lp_sweep(x, 400, 9000) * (t / 1.45) ** 2 * .3
add(ris - lowpass(ris, 150), TL(1.0), rev=.3)
sw = np.zeros(n); fr = 300 * 2 ** (t / 1.45 * 3.2); sw = np.sin(2 * np.pi * np.cumsum(fr) / SR) * (t / 1.45) ** 2 * .12
add(sw, TL(1.0), pan=0, rev=.4)
add(thud(42, 1, 1.6), TL(2.38), gain=1.1); add(whoosh(1.3, False, (9000, 300), .4), TL(2.38))
for i, m in enumerate((72, 76, 79, 83, 88)): add(bell(NOTE(m), .26, 3.0), TL(2.4) + i * .035, pan=(i - 2) * .3, rev=.9)
sparkle(TL(2.45), 14, 2000, .05, .1)
add(whoosh(.9, True, (400, 7000), .35), TL(3.0)); add(tick(2000, .4), TL(3.2))
for i, m in enumerate((67, 72, 76, 79, 84)): pass
pad_t = TL(2.4)
for k, m in enumerate((60, 67, 71, 74, 79)): add(tone(NOTE(m), TOTAL + .8 - pad_t, .6, 5.0, (1, .35, .12)), pad_t + .01 * k, pan=(k - 2) * .25, gain=.11, rev=.7)
add(pop(520, .3), TL(5.4), rev=.4); add(bell(NOTE(91), .2, 2.5), TL(5.45), rev=.8)

# ---------------- réverbération (réponse impulsionnelle bruitée) et mixage
ir_n = int(2.2 * SR); ti = np.arange(ir_n) / SR
ir = rng.standard_normal(ir_n) * np.exp(-ti / .55); ir = lowpass(ir, 5500); ir[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR)); ir /= np.sqrt((ir ** 2).sum())
def conv(x, h):
    m = len(x) + len(h); k = 1 << (m - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, k) * np.fft.rfft(h, k), k)[:len(x)]
wet = conv(REV, ir) * .9
Lm = L + wet; Rm = R + conv(REV, ir[::-1] * np.where(np.arange(ir_n) % 2, 1, -1)) * .9
# fondu d'entrée et de sortie, limiteur doux
fi = np.minimum(1, np.arange(N) / (.03 * SR)); fo = np.clip((TOTAL + .6 - np.arange(N) / SR) / 1.6, 0, 1)
Lm *= fi * fo; Rm *= fi * fo
pk = max(abs(Lm).max(), abs(Rm).max()); Lm, Rm = np.tanh(Lm / pk * 1.6) / np.tanh(1.6) * .89, np.tanh(Rm / pk * 1.6) / np.tanh(1.6) * .89
st = np.stack([Lm[: int(TOTAL * SR + SR * .5)], Rm[: int(TOTAL * SR + SR * .5)]], 1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print(out, f'{len(st) / SR:.1f} s')
