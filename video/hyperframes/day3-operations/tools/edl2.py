# Day 3 edit v2: photos + clips (IMG_3187 and IMG_3195 left out). Prints JSON.
import json
src = {n: f for n, f in [
 ("3181","1a4d319e"),("3182","b470a2b0"),("3183","6d755377"),("3184","a752b928"),("3185","ea2a132b"),
 ("3186","69829a59"),("3188","cdf96fdc"),("3189","f4f6205a"),("3190","19df6cae"),
 ("3191","6bb64344"),("3192","9e44cc7b"),("3193","3c8f5304"),("3194","52002544"),("3196","46b8c927")]}
P = lambda n, d, sec: (sec, "photo", n, 0, d)
C = lambda n, ss, d, sec: (sec, "clip", n, ss, d)
plan = [
 P("3147", 6.0, "intro"),
 ("card1", "card", None, 0, 3.0),
 C("3182", 0.3, 6.3, "team"), C("3183", 0.3, 7.0, "team"), C("3185", 0.3, 6.0, "team"), P("3151", 3.5, "team"),
 C("3188", 0.2, 6.0, "team"), C("3189", 0.3, 6.5, "team"), C("3191", 0.2, 6.0, "team"), C("3196", 0.3, 6.0, "team"), P("3150", 3.5, "team"),
 ("card2", "card", None, 0, 3.0),
 P("3171", 3.5, "dept"), P("3165", 3.5, "dept"), C("3184", 0.2, 6.5, "dept"), C("3186", 0.2, 5.0, "dept"), P("3162", 3.5, "dept"),
 P("3157", 3.5, "dept"), C("3192", 0.2, 6.0, "dept"), C("3193", 0.1, 2.9, "dept"), C("3194", 0.3, 6.0, "dept"), P("3149", 3.5, "dept"), C("3190", 0.2, 4.4, "dept"),
 ("card3", "card", None, 0, 3.0),
 P("3176", 4.5, "goals"), C("3181", 0.2, 11.0, "goals"), C("3196", 6.7, 3.3, "goals"), C("3182", 6.7, 4.0, "goals"),
 ("outro", "card", None, 0, 6.5),
]
t = 0.0; out = []
for i, (sec, kind, n, ss, d) in enumerate(plan):
    out.append({"i": i, "section": sec, "kind": kind, "name": n, "ss": ss, "dur": d, "start": round(t, 3),
                "src": (f"{src[n]}-IMG_{n}.mov" if kind == "clip" else None)})
    t += d
print(json.dumps({"total": round(t, 3), "items": out}))
