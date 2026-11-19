import json, sys
D = json.load(open(sys.argv[1])); OUT = sys.argv[2]
items = D["items"]; TOTAL = D["total"]
sec = {}
for it in items:
    s = sec.setdefault(it["section"], [it["start"], it["start"] + it["dur"]])
    s[1] = it["start"] + it["dur"]
r = lambda x: round(x, 3)

GOLD_CSS = """.gold { background: linear-gradient(135deg, #f7d774 0%, #d6a743 55%, #9a6a1e 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }"""
GLASS = "border-radius: 36px; background: rgba(12, 12, 14, 0.78); backdrop-filter: blur(20px); border: 2px solid rgba(214, 167, 67, 0.55); color: #fff;"

def scene(cid, body, css, script):
    return f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; font-family: "Inter", sans-serif; }}
    {GOLD_CSS}
{css}
  </style>
  <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">
{body}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{script}
    window.__timelines["{cid}"] = tl;
  </script>
</template>
"""

def w(name, text): open(f"{OUT}/compositions/{name}.html", "w").write(text)

# ---- intro (frame 0 is the thumbnail: the title is already on screen) ----
d = sec["intro"][1] - sec["intro"][0]
w("intro", scene("intro", f"""    <div id="in-block" class="clip" data-start="0" data-duration="{r(d)}">
      <div id="in-day">DAY <span class="gold">3</span></div>
      <div id="in-title">OPERATIONS TEAM</div>
      <div id="in-line"></div>
      <div id="in-sub">2027 PLANNING · <span data-var-text="meetingDate">NOV 19, 2026</span></div>
    </div>""", """    #in-block { position: absolute; left: 90px; width: 900px; top: 1010px; text-align: center; color: #fff; text-shadow: 0 10px 40px rgba(0,0,0,0.55); }
    #in-day { font-weight: 900; font-size: 120px; line-height: 0.9; letter-spacing: -0.04em; }
    #in-title { margin-top: 6px; font-weight: 900; font-size: 74px; line-height: 0.95; letter-spacing: -0.03em; }
    #in-line { width: 320px; height: 6px; margin: 22px auto 0; border-radius: 3px; background: linear-gradient(90deg,#f7d774,#d6a743,#9a6a1e); }
    #in-sub { margin-top: 18px; font-weight: 700; font-size: 34px; letter-spacing: 0.12em; color: #f7d774; }""",
f"""    tl.fromTo("#in-day", {{ scale: 1.1 }}, {{ scale: 1, duration: 0.8, ease: "power3.out" }}, 0);
    tl.fromTo("#in-line", {{ scaleX: 0.2 }}, {{ scaleX: 1, duration: 0.7, ease: "power3.out" }}, 0.15);
    tl.fromTo("#in-sub", {{ opacity: 1, y: 8 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }}, 0.4);
    tl.to("#in-block", {{ opacity: 0, y: -30, duration: 0.3, ease: "power2.in" }}, {r(d - 0.35)});"""))

# ---- chapter card (one file, mounted three times with variables) ----
card = scene("card", """    <div id="cd-bg" class="clip" data-start="0" data-duration="2.903"></div>
    <div id="cd-num" class="clip" data-start="0" data-duration="2.903" data-var-text="num" data-layout-ignore>01</div>
    <div id="cd-block" class="clip" data-start="0" data-duration="2.903">
      <div id="cd-kicker">CHAPTER <span data-var-text="num">01</span></div>
      <div id="cd-title" data-var-text="title">THE TEAM</div>
      <div id="cd-line"></div>
      <div id="cd-sub" data-var-text="sub">Most of the operations team. One room.</div>
    </div>""", """    #cd-bg { position: absolute; inset: 0; background: radial-gradient(circle at 540px 860px, #2a2010 0%, #050505 62%); }
    #cd-num { position: absolute; left: 0; width: 1080px; top: 420px; text-align: center; font-weight: 900; font-size: 520px; line-height: 1; letter-spacing: -0.06em; color: transparent; -webkit-text-stroke: 3px rgba(214,167,67,0.28); }
    #cd-block { position: absolute; left: 110px; width: 860px; top: 640px; text-align: center; color: #fff; }
    #cd-kicker { font-weight: 700; font-size: 32px; letter-spacing: 0.3em; color: #d6a743; }
    #cd-title { margin-top: 18px; font-weight: 900; font-size: 116px; line-height: 0.98; letter-spacing: -0.035em; }
    #cd-line { width: 260px; height: 6px; margin: 30px auto 0; border-radius: 3px; background: linear-gradient(90deg,#f7d774,#d6a743,#9a6a1e); }
    #cd-sub { margin-top: 26px; font-weight: 600; font-size: 40px; line-height: 1.25; color: #e8e2d4; }""",
"""    tl.fromTo("#cd-bg", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0);
    tl.fromTo("#cd-num", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 0.05);
    tl.fromTo("#cd-kicker", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.25);
    tl.fromTo("#cd-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.35);
    tl.fromTo("#cd-line", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, 0.6);
    tl.fromTo("#cd-sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.5);
    tl.to("#cd-block", { opacity: 0, duration: 0.18, ease: "power2.in" }, 2.72);
    tl.to("#cd-num", { opacity: 0, duration: 0.2, ease: "power2.in" }, 2.68);""")
w("card", card)

# ---- text beats over footage: (start, end, kicker, html) relative to the section ----
def beats_scene(cid, s0, s1, beats, top=300):
    body, css, js = [], [], []
    for k, (a, b, kicker, html) in enumerate(beats):
        a -= s0; b -= s0
        body.append(f'''    <div id="{cid}-b{k}" class="{cid}-card clip" data-start="{r(a)}" data-duration="{r(b - a)}">
      <div class="{cid}-kick">{kicker}</div>
      <div class="{cid}-text">{html}</div>
    </div>''')
        js.append(f'    tl.fromTo("#{cid}-b{k}", {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }}, {r(a + 0.05)});')
        js.append(f'    tl.fromTo("#{cid}-b{k} .{cid}-text", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }}, {r(a + 0.2)});')
        js.append(f'    tl.to("#{cid}-b{k}", {{ opacity: 0, duration: 0.3, ease: "power2.in" }}, {r(b - 0.35)});')
    css.append(f"""    .{cid}-card {{ position: absolute; left: 80px; right: 80px; top: {top}px; padding: 34px 40px 38px; {GLASS} }}
    .{cid}-kick {{ font-weight: 700; font-size: 28px; letter-spacing: 0.22em; color: #d6a743; }}
    .{cid}-text {{ margin-top: 14px; font-weight: 800; font-size: 54px; line-height: 1.12; letter-spacing: -0.02em; }}
    .{cid}-small {{ display: block; margin-top: 10px; font-weight: 600; font-size: 36px; color: #e8e2d4; letter-spacing: 0; }}""")
    w(cid, scene(cid, "\n".join(body), "\n".join(css), "\n".join(js)))

t0, t1 = sec["team"]
cut = [it["start"] for it in items if it["section"] == "team"] + [t1]
beats_scene("team", t0, t1, [
    (cut[0], cut[2], "DAY 3 · OPERATIONS TEAM", 'Most of the team.<br /><span class="gold">One room.</span>'),
    (cut[3], cut[5], "WHY WE'RE HERE", 'Talking about <span class="gold">2027.</span>'),
    (cut[6], cut[8], "IN THE ROOM", 'Listening. Planning.<br /><span class="gold">Owning it.</span>'),
])
t0, t1 = sec["dept"]
cut = [it["start"] for it in items if it["section"] == "dept"] + [t1]
beats_scene("dept", t0, t1, [
    (cut[0], cut[2], "01 · THE REPORT", 'Where each department <span class="gold">stands today.</span>'),
    (cut[2], cut[5], "02 · THE PLAN", 'How each team gets there <span class="gold">in 2027.</span>'),
    (cut[5], cut[8], "03 · THE GOALS", 'What we need <span class="gold">to achieve.</span>'),
    (cut[8], cut[10], "EVERY DEPARTMENT", 'One <span class="gold">direction.</span>'),
])
t0, t1 = sec["goals"]
cut = [it["start"] for it in items if it["section"] == "goals"] + [t1]
mid = cut[1] + (cut[2] - cut[1]) / 2
beats_scene("goals", t0, t1, [
    (mid, cut[2], "THE 2027 GOAL", 'To <span class="gold">serve more.</span>'),
    (cut[2], cut[3], "HOW", 'Better support for<br />every client we serve.'),
    (cut[3], cut[4], "DAY 3 · DONE", 'Building 2027.<br /><span class="gold">Together.</span>'),
], top=300)

# Ryan name tag on the first presenting shot of the goals section (and in the intro clip)
g0 = cut[1]
w("ryan", scene("ryan", f"""    <div id="ry-tag" class="clip" data-start="0.2" data-duration="{r(mid - g0 - 0.3)}"><div id="ry-bar"></div><div id="ry-box"><div id="ry-name">Ryan</div><div id="ry-role">President</div></div></div>""",
"""    #ry-tag { position: absolute; left: 70px; top: 1110px; display: flex; align-items: stretch; }
    #ry-bar { width: 10px; border-radius: 5px; background: linear-gradient(180deg,#f7d774,#d6a743 55%,#9a6a1e); }
    #ry-box { margin-left: 18px; padding: 18px 32px 20px; border-radius: 20px; background: rgba(10,10,12,0.74); backdrop-filter: blur(16px); color: #fff; }
    #ry-name { font-weight: 900; font-size: 66px; letter-spacing: -0.02em; line-height: 1; }
    #ry-role { margin-top: 8px; font-weight: 700; font-size: 30px; color: #f7d774; }""",
f"""    tl.fromTo("#ry-bar", {{ scaleY: 0 }}, {{ scaleY: 1, duration: 0.3, ease: "power3.out", transformOrigin: "50% 100%" }}, 0.25);
    tl.fromTo("#ry-box", {{ opacity: 0, x: -40 }}, {{ opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }}, 0.32);
    tl.to("#ry-tag", {{ opacity: 0, duration: 0.25, ease: "power2.in" }}, {r(mid - g0 - 0.6)});"""))

# ---- outro ----
o0, o1 = sec["outro"]; od = o1 - o0
w("outro", scene("outro", f"""    <div id="ot-bg" class="clip" data-start="0" data-duration="{r(od)}"></div>
    <div id="ot-year" class="clip" data-start="0" data-duration="{r(od)}" data-layout-ignore>2027</div>
    <img id="ot-logo" class="clip" data-start="0" data-duration="{r(od)}" src="assets/sas-logo.png" alt="SAS" data-layout-allow-occlusion />
    <div id="ot-name" class="clip" data-start="0" data-duration="{r(od)}">STRATEGIC ASSISTANT STAFFING</div>
    <div id="ot-line" class="clip" data-start="0" data-duration="{r(od)}">Serve more.<br /><span class="gold">Grow together.</span></div>
    <div id="ot-meta" class="clip" data-start="0" data-duration="{r(od)}">DAY 3 · OPERATIONS TEAM · 2027 PLANNING</div>""",
"""    #ot-bg { position: absolute; inset: 0; background: radial-gradient(circle at 540px 760px, #2a2010 0%, #050505 62%); }
    #ot-year { position: absolute; left: 0; width: 1080px; top: 270px; text-align: center; font-weight: 900; font-size: 360px; line-height: 1; letter-spacing: -0.06em; color: transparent; -webkit-text-stroke: 3px rgba(214,167,67,0.3); }
    #ot-logo { position: absolute; left: 340px; top: 400px; width: 400px; height: 400px; object-fit: contain; }
    #ot-name { position: absolute; left: 110px; width: 760px; top: 850px; text-align: center; font-weight: 700; font-size: 30px; letter-spacing: 0.16em; color: #fff; }
    #ot-line { position: absolute; left: 110px; width: 760px; top: 920px; text-align: center; font-weight: 900; font-size: 92px; line-height: 1.04; letter-spacing: -0.03em; color: #fff; }
    #ot-meta { position: absolute; left: 110px; width: 760px; top: 1170px; text-align: center; font-weight: 700; font-size: 28px; letter-spacing: 0.08em; color: #f7d774; }""",
"""    tl.fromTo("#ot-bg", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0);
    tl.fromTo("#ot-year", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 0.05);
    tl.fromTo("#ot-logo", { opacity: 0, scale: 0.4, rotation: -15 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.8)" }, 0.15);
    tl.fromTo("#ot-name", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.6);
    tl.fromTo("#ot-line", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.95);
    tl.fromTo("#ot-meta", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.5);"""))

# ---- persistent label + progress (from the first card to the outro) ----
b0 = sec["card1"][0]; b1 = sec["outro"][0]; bd = b1 - b0
w("bug", scene("bug", f"""    <div id="bg-pill" class="clip" data-start="0" data-duration="{r(bd)}"><img id="bg-logo" src="assets/sas-logo.png" alt="SAS" /><span>DAY 3 · OPERATIONS TEAM · 2027</span></div>
    <div id="bg-progress" class="clip" data-start="0" data-duration="{r(bd)}" data-layout-ignore></div>""",
"""    #bg-pill { position: absolute; left: 60px; top: 220px; display: flex; align-items: center; gap: 14px; padding: 10px 24px 10px 12px; border-radius: 999px; background: rgba(0,0,0,0.55); color: #fff; font-weight: 700; font-size: 28px; letter-spacing: 0.06em; }
    #bg-logo { width: 54px; height: 54px; object-fit: contain; }
    #bg-progress { position: absolute; left: 0; bottom: 0; width: 1080px; height: 10px; background: linear-gradient(90deg,#f7d774,#d6a743,#9a6a1e); transform-origin: 0 50%; }""",
f"""    tl.fromTo("#bg-progress", {{ scaleX: 0 }}, {{ scaleX: 1, duration: {r(bd)}, ease: "none" }}, 0);"""))

# ---- index.html ----
vids, pushes = [], []
for k, it in enumerate([x for x in items if x["kind"] in ("clip", "photo")]):
    i = it["i"]; nid = f"s{i:02d}"
    if it["kind"] == "clip":
        vids.append(f'      <div id="w-{nid}" class="wrap"><video id="v-{nid}" class="clip shot" data-start="{it["start"]}" data-duration="{r(it["dur"] - 0.01)}" data-track-index="0" muted playsinline src="assets/seg{i:02d}.mp4" style="z-index: 1"></video></div>')
    else:
        vids.append(f'      <div id="w-{nid}" class="wrap"><img id="v-{nid}" class="clip shot" data-start="{it["start"]}" data-duration="{r(it["dur"])}" data-track-index="0" src="assets/photo{it["name"]}.jpg" alt="Day 3 photo" style="z-index: 1" /></div>')
    a, b = (1.0, 1.08) if k % 2 == 0 else (1.08, 1.0)
    pushes.append(f'      ["#w-{nid}", {it["start"]}, {it["dur"]}, {a}, {b}],')
cards = {"card1": ("01", "THE TEAM", "Most of the operations team. One room."),
         "card2": ("02", "DEPARTMENT REPORTS", "Its report, its plan, its goals."),
         "card3": ("03", "2027 GOALS", "The 2027 Sales Plan and Forecast.")}
hosts = []
for key, (num, title, sub) in cards.items():
    s0, s1 = sec[key]
    vals = json.dumps({"num": num, "title": title, "sub": sub}).replace("'", "&#39;")
    hosts.append(f"""      <div id="{key}" data-composition-id="card" data-composition-src="compositions/card.html" data-variable-values='{vals}' data-start="{r(s0)}" data-duration="{r(s1 - s0)}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: 5"></div>""")
def host(cid, s0, s1, track, z):
    return f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" data-start="{r(s0)}" data-duration="{r(s1 - s0)}" data-track-index="{track}" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: {z}"></div>'
hosts += [host("intro", *sec["intro"], 3, 3), host("team", *sec["team"], 3, 3), host("dept", *sec["dept"], 3, 3),
          host("goals", *sec["goals"], 3, 3), host("ryan", cut[1], mid, 4, 3),
          host("bug", b0, b1, 5, 4), host("outro", *sec["outro"], 2, 6)]
lens = {"whoosh": 0.73, "impact": 1.88, "riser": 1.6, "chime": 1.72, "pop": 0.25}
sfx = []
def a(name, at, vol, track):
    sfx.append(f'      <audio id="sfx-{len(sfx)}" class="clip" data-start="{r(at)}" data-duration="{lens[name]}" data-track-index="{track}" data-volume="{vol}" src="assets/{name}.wav"></audio>')
for key in ("card1", "card2", "card3"):
    a("whoosh", sec[key][0] - 0.15, 0.16, 9)
a("whoosh", sec["outro"][0] - 0.15, 0.16, 9)
a("chime", sec["outro"][0] + 0.4, 0.16, 10)
index = f"""<!doctype html>
<html lang="en" data-resolution="portrait" data-composition-variables='[{{"id":"meetingDate","type":"string","label":"Meeting date","default":"NOV 19, 2026"}}]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="vendor/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 100%; height: 100%; font-family: "Inter", sans-serif; }}
      .wrap {{ position: absolute; inset: 0; }}
      .shot {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
      #shade {{ position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0) 54%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.2) 100%); }}
    </style>
  </head>
  <body>
    <!-- Day 3 · Operations team · 2027 planning. Edit list: tools/edl2.py. Music: Stock-Waves, Relaxed Corporate. -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
{chr(10).join(vids)}
      <div id="shade" class="clip" data-start="0" data-duration="{r(sec['outro'][0])}" data-track-index="1" style="z-index: 2"></div>
{chr(10).join(hosts)}
      <audio id="music" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="7" data-volume="0.5" data-fade-out="3" src="assets/music.mp3"></audio>
{chr(10).join(sfx)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      // slow push on every shot, alternating in and out
      const shots = [
{chr(10).join(pushes)}
      ];
      shots.forEach(([el, at, d, a, b]) => tl.fromTo(el, {{ scale: a, transformOrigin: "50% 40%" }}, {{ scale: b, duration: d, ease: "none" }}, at));
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""
open(f"{OUT}/index.html", "w").write(index)
print("ok", TOTAL, {k: [round(v[0], 2), round(v[1], 2)] for k, v in sec.items()})
