"""Synthesizes the 30 s soundtrack (music + SFX) for the VA short -> audio.wav (48 kHz stereo).
Pure numpy, no samples. Timings match scene.js."""
import numpy as np, wave

SR = 48000
DUR = 30.0
N = int(SR * DUR)
L = np.zeros(N); Rch = np.zeros(N)
rng = np.random.default_rng(7)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    Rch[i:i + len(sig)] += sig * (0.5 + 0.5 * pan) * 1.4
    L[i:i + len(sig)] += sig * (0.5 - 0.5 * pan) * 1.4


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def tone(f, dur, a=0.005, d=0.3, harm=(1,), wave_="sine"):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in harm)
    return s * env(n, a, d)


def pluck(f, dur=0.9, bright=0.5):
    # Karplus-Strong ukulele-ish pluck
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.4985 * (buf[i % p] + buf[(i + 1) % p])
    return out * env(n, 0.002, dur * 0.5)


def noise(dur, lp=None):
    n = int(dur * SR); x = rng.uniform(-1, 1, n)
    if lp:
        a = np.exp(-2 * np.pi * lp / SR); y = np.zeros(n); acc = 0
        for i in range(n): acc = (1 - a) * x[i] + a * acc; y[i] = acc
        x = y / (np.abs(y).max() + 1e-9)
    return x


def midi(m): return 440 * 2 ** ((m - 69) / 12)


# ---------------- music: cheerful uke loop 0-25s (muffled while headphones on), stops at the DING
bpm = 118; beat = 60 / bpm
prog = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
cache = {}
def pl(m, d=0.8):
    k = (m, d)
    if k not in cache: cache[k] = pluck(midi(m), d)
    return cache[k]

pattern = [0, 1, 2, 1, 0, 2, 1, 2]
music = np.zeros(N)
t = 0.0; bar = 0
while t < 25.0:
    ch = prog[bar % 4]
    for i, idx in enumerate(pattern):
        tt = t + i * beat / 2
        if tt >= 25.0: break
        s = pl(ch[idx] + 12 * (i % 4 == 3), 0.7)
        j = int(tt * SR); music[j:j + len(s)] += s[: N - j] * 0.22
    # bass
    b = tone(midi(ch[0] - 24), beat * 3.6, 0.01, 0.6, (1, 2, 3))
    j = int(t * SR); music[j:j + len(b)] += b[: N - j] * 0.22
    # melody on bars after she's free (from ~11s)
    if t > 10.5:
        mel = [ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]
        for i, m in enumerate(mel):
            s = tone(midi(m), beat * 0.9, 0.01, 0.25, (1, 0.5, 0.25))
            j = int((t + i * beat) * SR); music[j:j + len(s)] += s[: N - j] * 0.09
    t += beat * 4; bar += 1
# muffle music until headphones come off (8.9s): simple one-pole LPF blended
def lpf(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
cut = int(9.0 * SR)
muf = lpf(music[:cut], 700) * 1.5
xf = np.clip((np.arange(cut) / SR - 8.8) / 0.25, 0, 1)
music[:cut] = muf * (1 - xf) + music[:cut] * xf
# fade out quickly at the DING (record scratch replaces it)
fade = np.ones(N); i0 = int(24.98 * SR); fade[i0:] = 0
fade[int(24.9 * SR):i0] = np.linspace(1, 0, i0 - int(24.9 * SR))
music *= fade
L += music; Rch += music

# ---------------- SFX
# keyboard clatter 0-8s
for k in range(int(8.0 * 15)):
    tt = k / 15 + rng.uniform(0, 0.04)
    if 4.6 < tt < 5.4: continue
    add(noise(0.025) * env(int(0.025 * SR), 0.001, 0.006), tt, 0.25 + rng.uniform(0, 0.1), rng.uniform(-0.3, 0.3))
# notification pings for each bubble
for tt, f in [(2.85, 1320), (3.45, 1480), (4.05, 1175), (4.65, 1320), (5.25, 1568), (5.85, 1760)]:
    add(tone(f, 0.25, 0.002, 0.08, (1, 2)) + 0.6 * np.concatenate([np.zeros(int(0.07 * SR)), tone(f * 1.5, 0.18, 0.002, 0.07)])[: int(0.25 * SR)], tt, 0.35, rng.uniform(-0.5, 0.5))
# coffee slurp
add(noise(0.35, 1500) * np.sin(np.linspace(0, np.pi, int(0.35 * SR))) ** 2, 4.95, 0.25)
# clock ticks + ding at 5:00
for k in range(5): add(noise(0.02, 4000) * env(int(0.02 * SR), 0.001, 0.004), 7.0 + k * 0.17, 0.5)
bell = sum(tone(784 * r, 2.0, 0.002, 0.9 / r, (1,)) * g for r, g in [(1, 1), (2.76, 0.5), (5.4, 0.25), (8.9, 0.12)])
add(bell, 7.85, 0.45)
# headphones off "pop" + chair roll
add(tone(220, 0.15, 0.002, 0.04) * 0.8 + noise(0.15, 2000) * env(int(0.15 * SR), 0.001, 0.03) * 0.3, 8.95, 0.5)
add(noise(0.5, 600) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))), 9.5, 0.25)
# stretch: rising slide whistle + crack
n = int(0.7 * SR); tt_ = np.arange(n) / SR
add(np.sin(2 * np.pi * np.cumsum(np.linspace(400, 1200, n)) / SR) * np.sin(np.linspace(0, np.pi, n)), 9.9, 0.18)
for k in range(3): add(noise(0.02) * env(int(0.02 * SR), 0.0005, 0.004), 10.15 + k * 0.06, 0.8)
# happy footsteps
for k in range(9): add(tone(140, 0.08, 0.002, 0.02, (1, 2)) + noise(0.08, 1200) * env(int(0.08 * SR), 0.001, 0.015) * 0.5, 11.0 + k * 0.19, 0.35)
# door creak (FM sweep) 13.2
n = int(0.8 * SR); f = 300 + 120 * np.sin(np.linspace(0, 9, n)) + np.linspace(0, 200, n)
add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 * np.sin(np.linspace(0, np.pi, n)), 13.2, 0.18)
# heavenly choir "aaah" when sunlight hits
n = int(3.0 * SR); tt_ = np.arange(n) / SR
choir = sum(np.sin(2 * np.pi * midi(m) * tt_ * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt_ + m))) for m in [60, 64, 67, 72, 76])
choir *= np.minimum(1, tt_ / 0.4) * np.minimum(1, (3.0 - tt_) / 1.2)
add(choir, 13.6, 0.08)
# birds 13.5-25
for k in range(26):
    tt = 13.5 + k * 0.44 + rng.uniform(0, 0.2)
    if tt > 24.9: break
    for c in range(rng.integers(2, 4)):
        n = int(0.07 * SR); f0 = rng.uniform(2800, 4200)
        f = np.linspace(f0, f0 * rng.uniform(1.2, 1.5), n)
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)), tt + c * 0.09, 0.06, rng.uniform(-0.8, 0.8))
# sparkle chimes at amazement & looking at hands
for base_t in (17.4, 22.5):
    for k, m in enumerate([84, 88, 91, 96]): add(tone(midi(m), 0.6, 0.002, 0.25), base_t + k * 0.07, 0.12, (k - 1.5) / 2)
# grass rustle 20.5-22.3 and pats
for k in range(10): add(noise(0.18, 3000) * np.sin(np.linspace(0, np.pi, int(0.18 * SR))), 20.55 + k * 0.18, 0.12)
for tt in (23.9, 24.1, 27.3, 27.65): add(noise(0.08, 900) * env(int(0.08 * SR), 0.002, 0.02), tt, 0.4)
# butterfly flutter
for k in range(12): add(noise(0.03, 2500) * env(int(0.03 * SR), 0.001, 0.01), 24.2 + k * 0.06, 0.08, -0.5 + k / 12)
# THE notification: two-tone ding + record scratch
ding = tone(1568, 0.6, 0.002, 0.25, (1, 2)) + np.concatenate([np.zeros(int(0.12 * SR)), tone(2093, 0.48, 0.002, 0.25, (1, 2))])
add(ding, 25.0, 0.6)
n = int(0.35 * SR); f = np.concatenate([np.linspace(900, 150, n // 2), np.linspace(150, 700, n - n // 2)])
add((noise(0.35, 5000) * 0.5 + np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3) * np.sin(np.linspace(0, np.pi, n)), 24.98, 0.45)
# sad trombone wah-wah-wah-waaah 26.7
notes = [(55, 0.4), (54, 0.4), (53, 0.4), (52, 1.1)]
tt = 26.7
for m, d in notes:
    n = int(d * SR); x = np.arange(n) / SR
    vib = 1 + 0.012 * np.sin(2 * np.pi * 6 * x) * (d > 1)
    ph = 2 * np.pi * np.cumsum(midi(m) * vib) / SR
    s = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 7))
    s *= np.minimum(1, x / 0.04) * np.minimum(1, (d - x) / 0.12)
    add(s, tt, 0.13); tt += d
# frantic run: fast steps + whoosh, door slam
for k in range(9): add(tone(150, 0.06, 0.001, 0.015, (1, 2)) + noise(0.06, 1500) * env(int(0.06 * SR), 0.001, 0.01) * 0.6, 28.5 + k * 0.085, 0.4)
n = int(0.6 * SR); add(noise(0.6, 1800) * np.sin(np.linspace(0, np.pi, n)) ** 2, 28.45, 0.35, -0.3)
slam = tone(70, 0.6, 0.001, 0.12, (1, 2, 3)) + noise(0.6, 900) * env(int(0.6 * SR), 0.001, 0.05)
add(slam, 29.33, 0.9)
# tiny "ta-da" sting for the caption
for k, m in enumerate([72, 76]): add(pluck(midi(m), 0.5), 29.5 + k * 0.12, 0.3)

# ---------------- master
mix = np.stack([L, Rch], 1)
mix /= max(1e-9, np.abs(mix).max() / 0.89)
fo = np.ones(N); fo[-int(0.15 * SR):] = np.linspace(1, 0, int(0.15 * SR)); mix *= fo[:, None]
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('audio.wav written')
