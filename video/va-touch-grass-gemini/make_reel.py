"""Turns the 10 s landscape Gemini clip (source-gemini.mp4, 1280x720) into a 30 s vertical
1080x1920 reel: 9:16 reframing per shot, motion-interpolated slow motion, a replay, a zoom on the
URGENT notification, captions, and a synthesized soundtrack.  ->  va-touch-grass-reel.mp4
Requires: ffmpeg, Python 3 with numpy + Pillow, Inter fonts."""
import os, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SRC = 'source-gemini.mp4'
W, H, FPS, DUR = 1080, 1920, 30, 30.0
TMP = 'build'; os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/opentype/inter/Inter-{}.otf'


def run(cmd):
    subprocess.run(cmd, check=True)


# ------------------------------------------------------------------ shots
# (src_in, src_out, speed, crop width in src px, crop centre x start, end, crop centre y, mode)
SHOTS = [
    (0.00, 2.20, 1.0, 405, 610, 610, 360, 'fwd'),      # typing
    (0.00, 2.20, 1.0, 330, 612, 612, 320, 'rev'),      # typing (boomerang, punched in)
    (0.00, 2.20, 1.0, 380, 600, 615, 345, 'fwd'),      # typing
    (2.20, 3.45, 0.5, 405, 600, 690, 360, 'fwd'),      # 5 PM: stretch, headset off, runs
    (3.50, 5.15, 0.45, 405, 640, 640, 360, 'fwd'),     # door + sunlight
    (5.17, 7.03, 0.4, 405, 610, 630, 360, 'fwd'),      # touches grass, butterfly
    (5.90, 7.03, 0.5, 300, 560, 600, 400, 'fwd'),      # instant replay, punched in
    (7.04, 8.30, 0.45, 405, 600, 590, 360, 'fwd'),     # notification arrives
    (8.30, 8.30, 2.40, 405, 590, 590, 360, 'zoom'),    # freeze + zoom on URGENT
    (8.30, 9.70, 0.5, 405, 600, 560, 360, 'fwd'),      # runs back inside
    (9.70, 9.70, 2.22, 405, 560, 560, 360, 'still'),   # end card
]


def shot_clip(i, s):
    a, b, sp, cw, x0, x1, cy, mode = s
    out = f'{TMP}/shot_{i:02d}.mp4'
    ch = round(cw * 16 / 9) // 2 * 2
    cw = round(ch * 9 / 16) // 2 * 2
    if mode in ('zoom', 'still'):
        img = f'{TMP}/still_{i}.png'
        run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a), '-i', SRC, '-frames:v', '1', img])
        n = round(sp * FPS)
        x = x0 - cw / 2
        if mode == 'zoom':
            # zoom toward the notification (upper-left of this crop)
            vf = (f'crop={cw}:{ch}:{x}:{cy - ch / 2},scale=2160:3840:flags=lanczos,'
                  f"zoompan=z='1+0.6*(1-cos(PI*min(on/{n * 0.55},1)))/2':x='0.06*iw*(zoom-1)/0.6':y='0.11*ih*(zoom-1)/0.6':d={n}:s={W}x{H}:fps={FPS},"
                  'unsharp=5:5:0.5,setsar=1,format=yuv420p')
        else:
            vf = (f'crop={cw}:{ch}:{x}:{cy - ch / 2},scale=2160:3840:flags=lanczos,'
                  f"zoompan=z='1+0.06*on/{n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={n}:s={W}x{H}:fps={FPS},"
                  'unsharp=5:5:0.5,setsar=1,format=yuv420p')
        run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', img, '-vf', vf, '-frames:v', str(n),
             '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', out])
        return out, n / FPS
    d_src = b - a
    d_out = d_src / sp
    time_fx = (f'setpts=PTS/{sp},minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,'
               if sp < 1 else f'fps={FPS},')
    rev = 'reverse,' if mode == 'rev' else ''
    vf = (f'{rev}{time_fx}'
          f"crop={cw}:{ch}:'min(max({x0}+({x1}-{x0})*t/{d_out}-{cw}/2,0),iw-{cw})':{max(0, min(720 - ch, cy - ch / 2))},"
          f'scale={W}:{H}:flags=lanczos,unsharp=5:5:0.6,setsar=1,format=yuv420p')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(a), '-t', str(d_src), '-i', SRC, '-an', '-vf', vf,
         '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', out])
    return out, d_out


starts = []; t = 0; clips = []
for i, s in enumerate(SHOTS):
    c, d = shot_clip(i, s); clips.append(c); starts.append(round(t, 3)); t += d
    print(f'shot {i}: starts {starts[-1]:6.2f}s  len {d:.2f}s')
print('total', round(t, 2))
with open(f'{TMP}/list.txt', 'w') as f:
    for c in clips: f.write(f"file '{os.path.basename(c)}'\n")
run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{TMP}/list.txt',
     '-vf', f'fps={FPS},tpad=stop_mode=clone:stop_duration=1', '-frames:v', str(int(DUR * FPS)),
     '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', f'{TMP}/base.mp4'])
S = dict(typing=starts[0], five=starts[3], door=starts[4], grass=starts[5], replay=starts[6],
         notif=starts[7], zoom=starts[8], run=starts[9], end=starts[10])


# ------------------------------------------------------------------ caption graphics
def font(w, size): return ImageFont.truetype(FONT.format(w), size)


def pill(text, size=56, bg=(255, 255, 255), fg=(17, 17, 17), weight='ExtraBold', pad=(40, 24)):
    f = font(weight, size); lines = text.split('\n')
    d0 = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    ws = [d0.textlength(l, font=f) for l in lines]; lh = int(size * 1.18)
    w, h = int(max(ws) + pad[0] * 2), lh * len(lines) + pad[1] * 2
    im = Image.new('RGBA', (w, h + 12)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 10, w, h + 10), 30, fill=(0, 0, 0, 60))
    d.rounded_rectangle((0, 0, w, h), 30, fill=bg)
    for k, l in enumerate(lines):
        d.text(((w - ws[k]) / 2, pad[1] + k * lh - size * 0.08), l, font=f, fill=fg)
    return im


def outlined(text, size, fill, stroke=(20, 20, 20)):
    f = font('Black', size); d0 = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    w = int(d0.textlength(text, font=f)) + 60
    im = Image.new('RGBA', (w, int(size * 1.4))); d = ImageDraw.Draw(im)
    d.text((30, 10), text, font=f, fill=fill, stroke_width=12, stroke_fill=stroke)
    return im


def laugh_emoji(r):
    s = 4; R = r * s; im = Image.new('RGBA', (R * 2 + 40 * s, R * 2)); d = ImageDraw.Draw(im)
    cx, cy = im.width // 2, R
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=(255, 205, 50))
    for sd in (-1, 1):  # >< eyes
        pts = [(cx + sd * R * 0.55, cy - R * 0.35), (cx + sd * R * 0.2, cy - R * 0.18), (cx + sd * R * 0.55, cy - R * 0.02)]
        d.line(pts, fill=(107, 58, 0), width=int(R * 0.1), joint='curve')
        d.ellipse((cx + sd * R * 1.0 - R * 0.17, cy - R * 0.05, cx + sd * R * 1.0 + R * 0.17, cy + R * 0.6), fill=(79, 195, 255))
    d.chord((cx - R * 0.6, cy - R * 0.45, cx + R * 0.6, cy + R * 0.8), 0, 180, fill=(107, 26, 26))
    d.rectangle((cx - R * 0.5, cy + R * 0.16, cx + R * 0.5, cy + R * 0.3), fill=(255, 255, 255))
    d.ellipse((cx - R * 0.25, cy + R * 0.5, cx + R * 0.25, cy + R * 0.75), fill=(255, 127, 147))
    return im.resize((im.width // s, im.height // s), Image.LANCZOS)


def urgent_card():
    w, h = 900, 420; im = Image.new('RGBA', (w, h + 16)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 16, w, h + 16), 44, fill=(0, 0, 0, 80))
    d.rounded_rectangle((0, 0, w, h), 44, fill=(255, 255, 255))
    d.rounded_rectangle((0, 0, w, 140), 44, fill=(255, 45, 69)); d.rectangle((0, 100, w, 140), fill=(255, 45, 69))
    f1 = font('Black', 92); t1 = 'URGENT:'
    d.text(((w - d.textlength(t1, font=f1)) / 2, 14), t1, font=f1, fill='white')
    f2 = font('ExtraBold', 66); t2 = 'Just one quick task'
    tw = d.textlength(t2, font=f2); em = laugh_emoji(40)
    x = (w - tw - em.width - 10) / 2
    d.text((x, 196), t2, font=f2, fill=(27, 31, 46)); im.alpha_composite(em, (int(x + tw + 10), 192))
    f3 = font('Bold', 38); t3 = 'Open now'
    d.rounded_rectangle((w / 2 - 150, 312, w / 2 + 150, 392), 40, fill=(61, 123, 253))
    d.text(((w - d.textlength(t3, font=f3)) / 2, 328), t3, font=f3, fill='white')
    return im


GOLD = (232, 180, 67)
OVERLAYS = [  # (image, t_in, t_out, y_center)
    (pill('POV: Day 847 of\nworking from home'), 0.25, S['five'] - 0.1, 330),
    (outlined('5:00 PM!!', 150, GOLD), S['five'] + 0.05, S['five'] + 1.6, 560),
    (pill('Wait... is that\nthe SUN?!', 54), S['door'] + 0.6, S['grass'] - 0.15, 330),
    (pill('*touches grass*', 60, GOLD, (27, 27, 27)), S['grass'] + 0.5, S['replay'] - 0.1, 330),
    (pill('INSTANT REPLAY', 48, (255, 45, 69), (255, 255, 255)), S['replay'] + 0.1, S['notif'] - 0.1, 330),
    (outlined('DING!', 160, (255, 71, 87)), S['notif'] + 0.03, S['notif'] + 1.3, 520),
    (urgent_card(), S['zoom'] + 0.15, S['run'] - 0.05, 900),
    (pill('VA life.', 66, (27, 27, 27), GOLD), S['end'] + 0.1, DUR, 330),
]
ins, chains = [], []
for k, (im, a, b, yc) in enumerate(OVERLAYS):
    p = f'{TMP}/ov_{k}.png'; im.save(p)
    ins += ['-loop', '1', '-t', str(DUR), '-framerate', str(FPS), '-i', p]
    chains.append((k + 1, a, b, (W - im.width) // 2, int(yc - im.height / 2)))
fc, last = [], '0:v'
for n, (idx, a, b, x, y) in enumerate(chains):
    fc.append(f'[{idx}:v]format=rgba,fade=t=in:st={a}:d=0.18:alpha=1,fade=t=out:st={max(a, b - 0.18)}:d=0.18:alpha=1[o{n}]')
    fc.append(f"[{last}][o{n}]overlay={x}:{y}:enable='between(t,{a},{b})'[v{n}]"); last = f'v{n}'


# ------------------------------------------------------------------ soundtrack
SR = 48000; N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(3)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = sig[:N - i] * g; L[i:i + len(s)] += s * (1 - pan) * 0.7; R[i:i + len(s)] += s * (1 + pan) * 0.7
def env(n, a=0.005, d=0.3): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def tone(f, dur, a=0.005, d=0.3, harm=(1,)):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in harm) * env(n, a, d)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
_nz = {}
def noise(dur, fc=None):
    k = (dur, fc)
    if k not in _nz:
        x = rng.uniform(-1, 1, int(dur * SR))
        if fc: x = lp(x, fc); x /= np.abs(x).max() + 1e-9
        _nz[k] = x
    return _nz[k]
_pl = {}
def pluck(f, dur=0.7):
    k = (round(f, 2), dur)
    if k not in _pl:
        n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
        for i in range(n): out[i] = buf[i % p]; buf[i % p] = 0.4985 * (buf[i % p] + buf[(i + 1) % p])
        _pl[k] = out * env(n, 0.002, dur * 0.5)
    return _pl[k]
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ukulele bed until the notification; muffled (headset on) until 5 PM
music = np.zeros(N); beat = 60 / 118; prog = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
t = 0.0; bar = 0
while t < S['notif']:
    ch = prog[bar % 4]
    for i, idx in enumerate([0, 1, 2, 1, 0, 2, 1, 2]):
        tt = t + i * beat / 2
        if tt < S['notif']:
            s = pluck(midi(ch[idx] + 12 * (i % 4 == 3))); j = int(tt * SR); music[j:j + len(s)] += s[:N - j] * 0.22
    b = tone(midi(ch[0] - 24), beat * 3.6, 0.01, 0.6, (1, 2, 3)); j = int(t * SR); music[j:j + len(b)] += b[:N - j] * 0.22
    if t > S['door'] - 0.5:
        for i, m in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]):
            s = tone(midi(m), beat * 0.9, 0.01, 0.25, (1, 0.5, 0.25)); j = int((t + i * beat) * SR); music[j:j + len(s)] += s[:N - j] * 0.08
    t += beat * 4; bar += 1
cut = int(S['five'] * SR); xf = np.clip((np.arange(cut) / SR - S['five'] + 0.3) / 0.3, 0, 1)
music[:cut] = lp(music[:cut], 800) * 1.5 * (1 - xf) + music[:cut] * xf
k0 = int((S['notif'] - 0.05) * SR); music[k0:] *= 0; music[k0 - 2400:k0] *= np.linspace(1, 0, 2400)
L += music; R += music

for k in range(int(S['five'] * 14)):  # keyboard
    add(noise(0.025) * env(int(0.025 * SR), 0.001, 0.006), k / 14 + rng.uniform(0, 0.04), 0.22, rng.uniform(-0.3, 0.3))
for tt, f in [(0.8, 1320), (2.0, 1480), (3.1, 1175), (4.3, 1568), (5.5, 1760)]:  # pings
    add(tone(f, 0.25, 0.002, 0.08, (1, 2)), tt, 0.3, rng.uniform(-0.5, 0.5))
add(sum(tone(784 * r, 2.0, 0.002, 0.9 / r) * g for r, g in [(1, 1), (2.76, .5), (5.4, .25), (8.9, .12)]), S['five'], 0.45)
for k in range(3): add(noise(0.02) * env(int(0.02 * SR), 0.0005, 0.004), S['five'] + 0.9 + k * 0.06, 0.7)
n = int(0.6 * SR); add(noise(0.6, 1800) * np.sin(np.linspace(0, np.pi, n)) ** 2, S['door'] - 0.7, 0.3)
n = int(0.8 * SR); f = 300 + 120 * np.sin(np.linspace(0, 9, n)) + np.linspace(0, 200, n)
add(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 * np.sin(np.linspace(0, np.pi, n)), S['door'], 0.15)
n = int(3.2 * SR); x = np.arange(n) / SR   # heavenly choir
add(sum(np.sin(2 * np.pi * midi(m) * x * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * x + m))) for m in [60, 64, 67, 72, 76])
    * np.minimum(1, x / 0.4) * np.minimum(1, (3.2 - x) / 1.2), S['door'] + 0.2, 0.07)
tt = S['door'] + 0.3
while tt < S['notif'] - 0.3:  # birds
    for c in range(rng.integers(2, 4)):
        n = int(0.07 * SR); f0 = rng.uniform(2800, 4200)
        add(np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f0 * rng.uniform(1.2, 1.5), n)) / SR) * np.sin(np.linspace(0, np.pi, n)), tt + c * 0.09, 0.05, rng.uniform(-0.8, 0.8))
    tt += 0.45 + rng.uniform(0, 0.2)
for base in (S['grass'] + 0.4, S['replay'] + 0.05):  # sparkles + rustle
    for k, m in enumerate([84, 88, 91, 96]): add(tone(midi(m), 0.6, 0.002, 0.25), base + k * 0.07, 0.1, (k - 1.5) / 2)
for k in range(14): add(noise(0.18, 3000) * np.sin(np.linspace(0, np.pi, int(0.18 * SR))), S['grass'] + 0.6 + k * 0.28, 0.1)
for k in range(10): add(noise(0.03, 2500) * env(int(0.03 * SR), 0.001, 0.01), S['grass'] + 1.2 + k * 0.07, 0.07, -0.5 + k / 10)
add(tone(1568, 0.6, 0.002, 0.25, (1, 2)) + np.concatenate([np.zeros(int(0.12 * SR)), tone(2093, 0.48, 0.002, 0.25, (1, 2))]), S['notif'], 0.55)
n = int(0.35 * SR); f = np.concatenate([np.linspace(900, 150, n // 2), np.linspace(150, 700, n - n // 2)])
add((noise(0.35, 5000) * 0.5 + np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3) * np.sin(np.linspace(0, np.pi, n)), S['notif'] - 0.02, 0.4)
tt = S['zoom'] + 0.2   # sad trombone
for m, d in [(55, 0.42), (54, 0.42), (53, 0.42), (52, 1.2)]:
    n = int(d * SR); x = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(midi(m) * (1 + 0.012 * np.sin(2 * np.pi * 6 * x) * (d > 1))) / SR
    add(sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 7)) * np.minimum(1, x / 0.04) * np.minimum(1, (d - x) / 0.12), tt, 0.12); tt += d
n = int(0.6 * SR); add(noise(0.6, 1800) * np.sin(np.linspace(0, np.pi, n)) ** 2, S['run'] + 0.1, 0.3, -0.3)
for k in range(14): add(tone(150, 0.06, 0.001, 0.015, (1, 2)) + noise(0.06, 1500) * env(int(0.06 * SR), 0.001, 0.01) * 0.6, S['run'] + 0.3 + k * 0.17, 0.35)
add(tone(70, 0.6, 0.001, 0.12, (1, 2, 3)) + noise(0.6, 900) * env(int(0.6 * SR), 0.001, 0.05), S['end'] - 0.02, 0.7)
for k, m in enumerate([72, 76]): add(pluck(midi(m), 0.5), S['end'] + 0.2 + k * 0.12, 0.3)
mix = np.stack([L, R], 1); mix /= np.abs(mix).max() / 0.89
mix[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR))[:, None]
with wave.open(f'{TMP}/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())

# ------------------------------------------------------------------ final mux
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{TMP}/base.mp4', *ins, '-i', f'{TMP}/audio.wav',
     '-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-map', f'{len(OVERLAYS) + 1}:a',
     '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS),
     '-c:a', 'aac', '-b:a', '192k', '-t', str(DUR), '-movflags', '+faststart', 'va-touch-grass-reel.mp4'])
print('done: va-touch-grass-reel.mp4')
