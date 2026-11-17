import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT, Gold, GOLD, GOLD_GRADIENT, GOLD_LIGHT, Icon, inOut, lerp, Logo, MUTED, outBack, outCubic, prog, WHITE } from "./brand";

// "Why I recommend SAS" testimonial edit.
// Timeline: 2.0 s intro sting → her clip from 0.9 s → a 1.3 s freeze-frame
// pause in her natural break before "that's what makes SAS different" → the
// rest of the clip → end card. T() maps a time in the source clip to video time.
const INTRO = 2.0;
const SRC_IN = 0.9;
const FREEZE_AT = 24.95; // source time of the pause
const FREEZE = 0;
const SRC_END = 40.3;
const T = (s: number) => (s < FREEZE_AT ? s - SRC_IN + INTRO : s - SRC_IN + INTRO + FREEZE);
const OUTRO_AT = T(SRC_END);
void FREEZE_AT;
export const TESTIMONIAL_SECONDS = Math.ceil(OUTRO_AT + 4.5);

const INK = "#111111";

// Spoken phrases (source times from the pauses in the clip).
const PHRASES: { a: number; b: number; text: string; gold?: string[] }[] = [
  { a: 1.04, b: 3.17, text: "If you ask me why I recommend SAS,", gold: ["SAS,"] },
  { a: 3.31, b: 5.45, text: "I'd say it's because I've seen what happens" },
  { a: 5.6, b: 7.99, text: "when the right people are given the right support.", gold: ["right", "people", "support."] },
  { a: 8.63, b: 11.03, text: "At SAS, we don't just look for someone who can do the job.", gold: ["SAS,"] },
  { a: 11.62, b: 13.54, text: "We look for people who are willing to learn,", gold: ["learn,"] },
  { a: 13.93, b: 14.46, text: "take ownership,", gold: ["ownership,"] },
  { a: 14.59, b: 16.62, text: "and genuinely care about the work they do.", gold: ["genuinely", "care"] },
  { a: 17.27, b: 19.06, text: "I've seen our VAs grow in confidence,", gold: ["confidence,"] },
  { a: 19.15, b: 20.08, text: "develop new skills,", gold: ["skills,"] },
  { a: 20.18, b: 23.69, text: "and become trusted partners to the businesses they support.", gold: ["trusted", "partners"] },
  { a: 24.29, b: 24.87, text: "And for me," },
  { a: 25.27, b: 26.65, text: "that's what makes SAS different.", gold: ["SAS", "different."] },
  { a: 27.16, b: 29.02, text: "It's not just about finding a VA." },
  { a: 29.34, b: 31.42, text: "It's about finding the right person,", gold: ["right", "person,"] },
  { a: 31.74, b: 34.69, text: "giving them the support they need,", gold: ["support"] },
  { a: 34.89, b: 36.92, text: "and building a relationship that works for both the client and the VA.", gold: ["relationship"] },
  { a: 37.36, b: 39.2, text: "That's why I recommend SAS.", gold: ["SAS."] },
];

type Word = { w: string; s: number; e: number; gold: boolean };
type Page = { words: Word[]; s: number; e: number };

// Split phrases into words (timed evenly by length) and into 3-word pages.
const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  for (const p of PHRASES) {
    const ws = p.text.split(" ");
    const total = ws.reduce((n, w) => n + w.length + 1, 0);
    let acc = 0;
    const words: Word[] = ws.map((w) => {
      const s = p.a + ((p.b - p.a) * acc) / total;
      acc += w.length + 1;
      const e = p.a + ((p.b - p.a) * acc) / total;
      return { w, s, e, gold: (p.gold ?? []).includes(w) };
    });
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3);
      pages.push({ words: chunk, s: chunk[0].s, e: chunk[chunk.length - 1].e });
    }
  }
  return pages;
})();

const Captions: React.FC<{ s: number }> = ({ s }) => {
  const page = PAGES.find((p, i) => s >= p.s - 0.05 && s < (PAGES[i + 1] && PAGES[i + 1].s - p.e < 0.6 ? PAGES[i + 1].s - 0.05 : p.e + 0.35));
  if (!page) return null;
  const enter = outBack(prog(s, page.s - 0.05, page.s + 0.15));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1420, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 44, rowGap: 4, transform: `scale(${lerp(0.85, 1, clamp(enter))})` }}>
      {page.words.map((w, i) => {
        const active = s >= w.s && s < w.e + 0.05;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 84,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: w.gold ? GOLD_LIGHT : WHITE,
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke",
              textShadow: "0 6px 20px rgba(0,0,0,0.7)",
              transform: `scale(${active ? 1.06 : 1}) translateY(${active ? -4 : 0}px)`,
              opacity: s >= w.s - 0.05 ? 1 : 0.35,
            }}
          >
            {w.w.replace(/,$/, "")}
          </span>
        );
      })}
    </div>
  );
};

// Frosted card used for the pop-ups.
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 34,
      background: "rgba(12,12,12,0.72)",
      backdropFilter: "blur(18px)",
      border: "2px solid rgba(214,167,67,0.55)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
      fontFamily: FONT,
      color: WHITE,
      ...style,
    }}
  >
    {children}
  </div>
);

const pop = (s: number, at: number, until: number) => {
  const p = outBack(prog(s, at, at + 0.45));
  const o = 1 - prog(s, until, until + 0.35);
  return { p, o: Math.min(clamp(p * 1.5), o) };
};

const CheckRow: React.FC<{ s: number; at: number; label: string; icon?: string }> = ({ s, at, label, icon = "check" }) => {
  const p = outBack(prog(s, at, at + 0.4));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: clamp(p * 1.5), transform: `translateX(${(1 - clamp(p)) * -60}px)` }}>
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p})`, flexShrink: 0 }}>
        <Icon name={icon} size={36} color={INK} stroke={3} />
      </div>
      <div style={{ fontSize: 46, fontWeight: 800 }}>{label}</div>
    </div>
  );
};

// Pop-ups keyed to source time, all in the open space above her head.
const Overlays: React.FC<{ s: number }> = ({ s }) => {
  const right = pop(s, 6.0, 8.3);
  const job = pop(s, 9.0, 11.3);
  const strike = outCubic(prog(s, 10.2, 10.7));
  const traits = pop(s, 12.9, 16.9);
  const growth = pop(s, 17.6, 23.9);
  const notJust = pop(s, 27.3, 29.1);
  const notStrike = outCubic(prog(s, 28.2, 28.7));
  const steps = pop(s, 29.6, 37.0);
  const finale = pop(s, 37.4, 40.6);
  const chart = outCubic(prog(s, 17.8, 23.0));
  return (
    <>
      {/* Right people + right support */}
      {right.o > 0 ? (
        <div style={{ position: "absolute", top: 230, width: "100%", display: "flex", justifyContent: "center", gap: 26, opacity: right.o }}>
          {[
            { k: "Right people", at: 6.0, icon: "users" },
            { k: "Right support", at: 7.3, icon: "target" },
          ].map((x) => {
            const p = outBack(prog(s, x.at, x.at + 0.45));
            return (
              <div key={x.k} style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 36px", borderRadius: 999, background: GOLD_GRADIENT, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK, transform: `scale(${p}) rotate(${x.at === 6 ? -3 : 3}deg)`, opacity: clamp(p * 1.5), boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
                <Icon name={x.icon} size={44} color={INK} stroke={2.4} />
                {x.k}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Not just someone who can do the job */}
      {job.o > 0 ? (
        <Card style={{ left: 110, right: 110, top: 220, padding: "34px 40px", opacity: job.o, transform: `scale(${lerp(0.8, 1, clamp(job.p))})` }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.2em", color: GOLD }}>AT SAS, WE DON'T JUST LOOK FOR</div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 12, fontSize: 52, fontWeight: 800 }}>
            someone who can do the job
            <span style={{ position: "absolute", left: -6, top: "54%", height: 8, borderRadius: 4, width: `calc(${strike * 100}% + 12px)`, background: "#E5484D" }} />
          </div>
        </Card>
      ) : null}

      {/* What we look for */}
      {traits.o > 0 ? (
        <Card style={{ left: 110, right: 110, top: 165, padding: "36px 44px", opacity: traits.o, transform: `translateY(${(1 - clamp(traits.p)) * -80}px)` }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.2em", color: GOLD, marginBottom: 24 }}>WE LOOK FOR PEOPLE WHO…</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <CheckRow s={s} at={13.2} label="Are willing to learn" />
            <CheckRow s={s} at={13.95} label="Take ownership" />
            <CheckRow s={s} at={15.0} label="Genuinely care" />
          </div>
        </Card>
      ) : null}

      {/* Growth card */}
      {growth.o > 0 ? (
        <Card style={{ left: 110, right: 110, top: 165, padding: "34px 40px", opacity: growth.o, transform: `translateY(${(1 - clamp(growth.p)) * -80}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.2em", color: GOLD }}>OUR VAs GROW</div>
            <Icon name="trend" size={46} color={GOLD_LIGHT} stroke={2.4} />
          </div>
          <div style={{ display: "flex", gap: 30, alignItems: "flex-end", marginTop: 24 }}>
            <svg width="300" height="190" viewBox="0 0 300 190">
              <path d="M 10 175 C 80 170, 120 130, 160 110 S 250 40, 290 15" stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none" strokeLinecap="round" />
              <path d="M 10 175 C 80 170, 120 130, 160 110 S 250 40, 290 15" stroke={GOLD_LIGHT} strokeWidth="10" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - chart} />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              {[
                { k: "Confidence", at: 18.1 },
                { k: "New skills", at: 19.25 },
                { k: "Trusted partners", at: 20.9 },
              ].map((x) => {
                const p = outBack(prog(s, x.at, x.at + 0.4));
                return (
                  <div key={x.k} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 40, fontWeight: 800, opacity: clamp(p * 1.5), transform: `scale(${p})`, transformOrigin: "0 50%" }}>
                    <span style={{ color: GOLD_LIGHT, fontSize: 36 }}>▲</span>
                    {x.k}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : null}

      {/* "And for me, that's what makes SAS different." */}
      {(() => {
        const st = pop(s, 24.3, 27.0);
        if (st.o <= 0) return null;
        const word = "DIFFERENT.";
        return (
          <div style={{ position: "absolute", top: 150, left: 70, right: 70, padding: "30px 0 34px", borderRadius: 36, background: "rgba(8,8,8,0.78)", backdropFilter: "blur(16px)", border: "2px solid rgba(214,167,67,0.5)", boxShadow: "0 30px 60px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", opacity: st.o, transform: `scale(${lerp(0.85, 1, clamp(st.p))})` }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.2em", color: WHITE, opacity: prog(s, 24.3, 24.7) }}>
              WHAT MAKES <Gold>SAS</Gold>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 6 }}>
              {word.split("").map((ch, i) => {
                const p = outBack(prog(s, 25.6 + i * 0.045, 26.0 + i * 0.045));
                return (
                  <span key={i} style={{ display: "inline-block", opacity: clamp(p * 1.5), transform: `translateY(${(1 - clamp(p)) * 80}px) rotate(${(1 - clamp(p)) * (i % 2 ? 14 : -14)}deg)` }}>
                    <Gold>{ch}</Gold>
                  </span>
                );
              })}
            </div>
            <div style={{ height: 8, width: 520 * outCubic(prog(s, 26.0, 26.5)), borderRadius: 4, background: GOLD_GRADIENT, boxShadow: "0 0 30px rgba(214,167,67,0.7)" }} />
          </div>
        );
      })()}

      {/* Not just finding a VA */}
      {notJust.o > 0 ? (
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", opacity: notJust.o, transform: `scale(${lerp(0.8, 1, clamp(notJust.p))})` }}>
          <span style={{ position: "relative", display: "inline-block", padding: "22px 44px", borderRadius: 24, background: "rgba(12,12,12,0.75)", fontFamily: FONT, fontWeight: 800, fontSize: 54, color: WHITE }}>
            Just finding a VA
            <span style={{ position: "absolute", left: 30, top: "50%", height: 8, borderRadius: 4, width: `calc(${notStrike} * (100% - 60px))`, background: "#E5484D" }} />
          </span>
        </div>
      ) : null}

      {/* The SAS way: three steps */}
      {steps.o > 0 ? (
        <Card style={{ left: 90, right: 90, top: 165, padding: "34px 40px", opacity: steps.o, transform: `translateY(${(1 - clamp(steps.p)) * -80}px)` }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.2em", color: GOLD, marginBottom: 22 }}>IT'S ABOUT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { n: "1", k: "Finding the right person", at: 30.4 },
              { n: "2", k: "Giving them the support they need", at: 32.0 },
              { n: "3", k: "A relationship that works for both", at: 35.0 },
            ].map((x) => {
              const p = outBack(prog(s, x.at, x.at + 0.4));
              return (
                <div key={x.n} style={{ display: "flex", alignItems: "center", gap: 22, opacity: clamp(p * 1.5), transform: `translateX(${(1 - clamp(p)) * 60}px)` }}>
                  <div style={{ width: 58, height: 58, borderRadius: 16, background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 32, color: INK, flexShrink: 0 }}>{x.n}</div>
                  <div style={{ fontSize: 40, fontWeight: 800 }}>{x.k}</div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18, marginTop: 8, ...(() => {
              const p = outBack(prog(s, 36.2, 36.6));
              return { opacity: clamp(p * 1.5), transform: `scale(${p})` };
            })() }}>
              <div style={{ padding: "12px 28px", borderRadius: 999, border: `2px solid ${GOLD}`, fontSize: 32, fontWeight: 800 }}>Client</div>
              <div style={{ width: 70, height: 4, background: GOLD_GRADIENT }} />
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: GOLD_GRADIENT }} />
              <div style={{ width: 70, height: 4, background: GOLD_GRADIENT }} />
              <div style={{ padding: "12px 28px", borderRadius: 999, border: `2px solid ${GOLD}`, fontSize: 32, fontWeight: 800 }}>VA</div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Finale quote */}
      {finale.o > 0 ? (
        <div style={{ position: "absolute", top: 190, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: finale.o, transform: `scale(${lerp(0.8, 1, clamp(finale.p))})` }}>
          <Logo size={170} />
          <div style={{ padding: "22px 46px", borderRadius: 999, background: GOLD_GRADIENT, fontFamily: FONT, fontWeight: 900, fontSize: 52, color: INK, boxShadow: "0 0 60px rgba(214,167,67,0.5)" }}>That's why I recommend SAS</div>
        </div>
      ) : null}
    </>
  );
};

// Name lower-third, shown early and again near the end.
const NameTag: React.FC<{ s: number }> = ({ s }) => {
  const show = (a: number, b: number) => Math.min(outCubic(prog(s, a, a + 0.5)), 1 - prog(s, b, b + 0.4));
  const o = Math.max(show(1.4, 6.6), show(37.4, 39.6));
  if (o <= 0) return null;
  const bar = outCubic(prog(s, s < 20 ? 1.4 : 37.4, (s < 20 ? 1.4 : 37.4) + 0.5));
  return (
    <div style={{ position: "absolute", left: 60, top: 1260, display: "flex", alignItems: "stretch", opacity: o, transform: `translateX(${(1 - o) * -60}px)` }}>
      <div style={{ width: 10, borderRadius: 5, background: GOLD_GRADIENT, transform: `scaleY(${bar})` }} />
      <div style={{ marginLeft: 20, padding: "16px 30px", borderRadius: 18, background: "rgba(10,10,10,0.72)", backdropFilter: "blur(14px)", fontFamily: FONT }}>
        <div style={{ fontWeight: 900, fontSize: 52, color: WHITE, letterSpacing: "-0.01em" }}>Regine</div>
        <div style={{ fontWeight: 700, fontSize: 28, color: GOLD_LIGHT, letterSpacing: "0.08em", marginTop: 2 }}>CEO & FOUNDER, STRATEGIC ASSISTANT STAFFING</div>
      </div>
    </div>
  );
};

// Jump-cut style punch-ins: each phrase alternates framing.
const zoomFor = (s: number) => {
  const idx = PHRASES.findIndex((p, i) => s >= p.a - 0.2 && (i === PHRASES.length - 1 || s < PHRASES[i + 1].a - 0.2));
  const punch = [2, 6, 7, 9, 11, 13, 16].includes(idx);
  return punch ? 1.14 : 1.0;
};

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const q = outBack(prog(t, 0.05, 0.6));
  const out = inOut(prog(t, 1.7, INTRO));
  const words = ["WHY I", "RECOMMEND"];
  return (
    <AbsoluteFill style={{ background: "#000", clipPath: `inset(0 0 ${out * 100}% 0)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 540px 900px, rgba(120,84,24,0.55), rgba(0,0,0,0) 60%)" }} />
      <div style={{ position: "absolute", left: 90, top: 520, fontFamily: "Georgia, serif", fontSize: 360, lineHeight: 1, color: GOLD, opacity: clamp(q), transform: `scale(${q})`, transformOrigin: "0 0" }}>“</div>
      <div style={{ position: "absolute", left: 100, top: 800, fontFamily: FONT, fontWeight: 900, fontSize: 130, lineHeight: 1, letterSpacing: "-0.04em", color: WHITE }}>
        {words.map((w, i) => (
          <div key={w} style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - outCubic(prog(t, 0.2 + i * 0.12, 0.6 + i * 0.12))) * 110}%)` }}>{w}</div>
          </div>
        ))}
        <div style={{ overflow: "hidden" }}>
          <div style={{ transform: `translateY(${(1 - outCubic(prog(t, 0.6, 1.0))) * 110}%)` }}>
            <Gold>SAS.</Gold>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 1400, fontFamily: FONT, fontWeight: 700, fontSize: 32, letterSpacing: "0.24em", color: MUTED, opacity: prog(t, 0.9, 1.3) }}>REGINE · CEO & FOUNDER</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const f = t - OUTRO_AT;
  const inP = outCubic(prog(f, 0, 0.6));
  return (
    <AbsoluteFill>
      <Img src={staticFile("testimonial-last.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover", filter: `blur(${inP * 24}px) brightness(${lerp(1, 0.35, inP)})`, transform: `scale(${lerp(1, 1.1, inP)})` }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.45 * inP})` }} />
      <div style={{ position: "absolute", left: 540 - 220, top: 430, transform: `scale(${outBack(prog(f, 0.2, 0.9))})` }}>
        <Logo size={440} />
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 36, letterSpacing: "0.2em", color: WHITE, opacity: prog(f, 0.6, 1.0) }}>
        STRATEGIC ASSISTANT STAFFING
      </div>
      <div style={{ position: "absolute", top: 1020, left: 80, right: 80, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 80, lineHeight: 1.08, letterSpacing: "-0.03em", color: WHITE, opacity: prog(f, 0.9, 1.3), transform: `translateY(${(1 - outCubic(prog(f, 0.9, 1.4))) * 40}px)` }}>
        The right person.
        <br />
        <Gold>The right support.</Gold>
      </div>
      <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", opacity: prog(f, 1.5, 1.9) }}>
        <span style={{ display: "inline-block", padding: "28px 60px", borderRadius: 999, background: GOLD_GRADIENT, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK, boxShadow: "0 0 60px rgba(214,167,67,0.4)" }}>strategic-assistant.com</span>
      </div>
    </AbsoluteFill>
  );
};

// Sound design: synthesized effects in public/sfx, cued to the animations.
// [sound, video time, volume]. Overlay cues are in source time, so they go through T().
const SFX: [string, number, number][] = [
  ["whoosh", 0.05, 0.35],
  ["impact", 0.62, 0.3],
  ["whoosh", 1.75, 0.4],
  ["pop", T(6.0), 0.35],
  ["pop", T(7.3), 0.35],
  ["whoosh", T(9.0), 0.3],
  ["swipe", T(10.2), 0.35],
  ["whoosh", T(12.9), 0.3],
  ["tick", T(13.2), 0.4],
  ["tick", T(13.95), 0.4],
  ["tick", T(15.0), 0.4],
  ["whoosh", T(17.6), 0.3],
  ["pop", T(18.1), 0.3],
  ["pop", T(19.25), 0.3],
  ["pop", T(20.9), 0.3],
  ["whoosh", T(24.3), 0.3],
  ["impact", T(25.6), 0.35],
  ["chime", T(26.0), 0.22],
  ["whoosh", T(27.3), 0.3],
  ["swipe", T(28.2), 0.35],
  ["whoosh", T(29.6), 0.3],
  ["tick", T(30.4), 0.4],
  ["tick", T(32.0), 0.4],
  ["tick", T(35.0), 0.4],
  ["chime", T(36.2), 0.2],
  ["chime", T(37.4), 0.22],
  ["riser", OUTRO_AT - 1.5, 0.28],
  ["impact", OUTRO_AT + 0.2, 0.35],
  ["chime", OUTRO_AT + 1.5, 0.22],
];

const SoundDesign: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(2 * fps)}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </>
  );
};

export const TestimonialReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // source time for overlays/captions
  const s = t < INTRO ? -1 : t - INTRO + SRC_IN;
  const target = zoomFor(s);
  const zoom = target;
  const progress = clamp((t - INTRO) / (OUTRO_AT - INTRO));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Her clip (cleaned up: testimonial-hq.mp4) */}
      <Sequence from={Math.round(INTRO * fps)} durationInFrames={Math.round((SRC_END - SRC_IN) * fps)}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 42%" }}>
          <OffthreadVideo src={staticFile("testimonial-hq.mp4")} trimBefore={Math.round(SRC_IN * fps)} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>

      {/* soft top/bottom gradient so cards and captions read */}
      {t >= INTRO && t < OUTRO_AT ? (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)" }} />
          <Overlays s={s} />
          <NameTag s={s} />
          <Captions s={s} />
          {/* brand bug + progress */}
          <div style={{ position: "absolute", left: 50, top: 60, display: "flex", alignItems: "center", gap: 14, padding: "10px 22px 10px 12px", borderRadius: 999, background: "rgba(0,0,0,0.55)" }}>
            <Logo size={56} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: "0.16em", color: WHITE }}>WHY I RECOMMEND SAS</span>
          </div>
          <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${progress * 100}%`, background: GOLD_GRADIENT }} />
        </>
      ) : null}

      <SoundDesign />
      {t < INTRO ? <Intro t={t} /> : null}
      {t >= OUTRO_AT ? <Outro t={t} /> : null}
      {/* gold flash on each transition */}
      {[INTRO, OUTRO_AT].map((at) => (
        <AbsoluteFill key={at} style={{ background: GOLD_LIGHT, opacity: 0.5 * (1 - clamp(Math.abs(t - at) / 0.12)), pointerEvents: "none" }} />
      ))}
    </AbsoluteFill>
  );
};

