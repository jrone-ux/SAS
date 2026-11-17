import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT, GOLD, GOLD_GRADIENT, GOLD_LIGHT, inOut, lerp, Logo, outBack, outCubic, prog } from "./brand";

// Editorial take on the training reel: cream paper, black ink, gold accents,
// oversized type and colour-block wipes.
//
// The voiceover is split after its first sentence so a 2 s motion graphic can
// play in the gap. V() converts a time in training-vo.mp3 to video time.
const LEAD = 0.3;
const SPLIT = 4.3; // audio time where the first sentence has finished
const GAP = 2;
const V = (a: number) => (a < SPLIT ? a + LEAD : a + LEAD + GAP);
export const TRAINING2_SECONDS = 74;

const CREAM = "#F3EEE4";
const INK = "#0E0E0E";
const SOFT = "#6f685d";

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------
const rise = (t: number, at: number, dur = 0.45, dist = 60): React.CSSProperties => {
  const p = outCubic(prog(t, at, at + dur));
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

// Word that slides up from behind a mask line.
const MaskWord: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => {
  const p = outCubic(prog(t, at, at + 0.5));
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", ...style }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{children}</span>
    </span>
  );
};

// Highlighter box that wipes in behind a phrase.
const Mark: React.FC<{ t: number; at: number; children: React.ReactNode; color?: string; ink?: string }> = ({ t, at, children, color = INK, ink = CREAM }) => {
  const p = inOut(prog(t, at, at + 0.4));
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.14em", whiteSpace: "nowrap" }}>
      <span style={{ position: "absolute", left: 0, top: "8%", bottom: "4%", width: `${p * 100}%`, background: color }} />
      <span style={{ position: "relative", color: p > 0.5 ? ink : "inherit" }}>{children}</span>
    </span>
  );
};

const GoldText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{children}</span>
);

// Thin editorial frame: corner label, page number, hairlines.
const Frame: React.FC<{ label: string; no: string; dark?: boolean }> = ({ label, no, dark }) => {
  const c = dark ? "rgba(243,238,228,0.55)" : "rgba(14,14,14,0.5)";
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 120, height: 2, background: c, opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 120, height: 2, background: c, opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 60, top: 70, fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", color: c }}>{label}</div>
      <div style={{ position: "absolute", right: 60, top: 70, fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", color: c }}>{no}</div>
      <div style={{ position: "absolute", left: 60, bottom: 70, fontFamily: FONT, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", color: c }}>STRATEGIC ASSISTANT STAFFING</div>
    </>
  );
};

// Scrolling ticker ribbon.
const Ticker: React.FC<{ t: number; text: string; top: number; rot?: number; speed?: number; bg?: string; ink?: string; size?: number }> = ({
  t,
  text,
  top,
  rot = 0,
  speed = 220,
  bg = INK,
  ink = CREAM,
  size = 56,
}) => {
  const unit = `${text}  ✦  `;
  const run = unit.repeat(8);
  const w = unit.length * size * 0.62;
  const x = -((((t * speed) % w) + w) % w);
  return (
    <div style={{ position: "absolute", left: -200, right: -200, top, transform: `rotate(${rot}deg)`, background: bg, padding: `${size * 0.3}px 0`, overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ transform: `translateX(${x}px)`, fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: "0.02em", color: ink }}>{run}</div>
    </div>
  );
};

// Circular rotating text badge.
const Badge: React.FC<{ t: number; text: string; size: number; x: number; y: number; dark?: boolean; children?: React.ReactNode }> = ({ t, text, size, x, y, dark, children }) => {
  const chars = text.split("");
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: dark ? INK : GOLD_GRADIENT }} />
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${t * 40}deg)` }}>
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: 8,
              height: size / 2 - 8,
              transformOrigin: "0 100%",
              transform: `rotate(${(i / chars.length) * 360}deg)`,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: size * 0.085,
              color: dark ? GOLD_LIGHT : INK,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};

// Full-screen colour-block wipe used between scenes.
const Wipe: React.FC<{ t: number; at: number; color: string; dir?: "up" | "left" | "diag" }> = ({ t, at, color, dir = "up" }) => {
  const a = inOut(prog(t, at - 0.4, at));
  const b = inOut(prog(t, at, at + 0.4));
  if (a <= 0 || b >= 1) return null;
  let clip = "";
  if (dir === "up") clip = `inset(${(1 - a) * 100}% 0 ${b * 100}% 0)`;
  if (dir === "left") clip = `inset(0 ${b * 100}% 0 ${(1 - a) * 100}%)`;
  if (dir === "diag") clip = `polygon(${lerp(130, -30, a)}% 0, 130% 0, 130% 100%, ${lerp(100, -60, a)}% 100%, ${lerp(100, -60, b)}% 100%, ${lerp(130, -30, b)}% 0)`;
  return <AbsoluteFill style={{ background: color, clipPath: clip, zIndex: 50 }} />;
};

// Shows children between two video times (with a hard cut hidden by a wipe).
const Cut: React.FC<{ t: number; from: number; to: number; bg: string; children: React.ReactNode }> = ({ t, from, to, bg, children }) => {
  if (t < from || t >= to) return null;
  return <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>{children}</AbsoluteFill>;
};

const Pin: React.FC<{ size: number; color?: string }> = ({ size, color = INK }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <path d="M50 128 C 50 128, 6 76, 6 46 A 44 44 0 0 1 94 46 C 94 76, 50 128, 50 128 Z" fill={color} />
    <circle cx="50" cy="46" r="17" fill={GOLD} />
  </svg>
);

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

// v0 – 4.6  "November is here, and we're starting the month with something special."
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const letters = "NOVEMBER".split("");
  const scribble = outCubic(prog(t, V(3.3), V(3.9)));
  return (
    <>
      <Frame label="SAS · NEWS" no="11 / 2026" />
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 168, letterSpacing: "-0.04em", lineHeight: 1, color: INK, whiteSpace: "nowrap" }}>
        {letters.map((c, i) => {
          const at = 0.05 + i * 0.07;
          const p = outBack(prog(t, at, at + 0.45));
          return (
            <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - clamp(p)) * -500}px) rotate(${(1 - clamp(p)) * (i % 2 ? 25 : -25)}deg)`, opacity: clamp(p * 2) }}>
              {c}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, letterSpacing: "-0.03em", color: INK }}>
        <MaskWord t={t} at={V(0.75)}>is</MaskWord> <MaskWord t={t} at={V(0.9)}>here.</MaskWord>
      </div>
      <div style={{ position: "absolute", top: 860, left: 90, right: 90, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 62, lineHeight: 1.2, letterSpacing: "-0.02em", color: SOFT }}>
        <span style={rise(t, V(1.6), 0.5, 30)}>And we're starting the month with</span>
        <div style={{ position: "relative", display: "inline-block", marginTop: 20, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: INK, ...rise(t, V(3.0), 0.45, 40) }}>
          <GoldText>something special.</GoldText>
          <svg width="900" height="220" viewBox="0 0 900 220" style={{ position: "absolute", left: -40, top: -30, overflow: "visible" }}>
            <path d="M 40 150 C 200 200, 700 200, 860 120 C 900 60, 700 10, 420 20 C 150 30, 10 80, 70 150" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - scribble} />
          </svg>
        </div>
      </div>
      <Badge t={t} text="SOMETHING SPECIAL IS COMING · " size={260} x={860} y={1560} dark>
        <Logo size={130} />
      </Badge>
      <div style={{ position: "absolute", left: 90, top: 1490, fontFamily: FONT, fontWeight: 900, fontSize: 200, lineHeight: 1, color: "rgba(14,14,14,0.08)" }}>2026</div>
    </>
  );
};

// v4.6 – 6.6  Silent motion graphic: logo sting with tickers.
const Sting: React.FC<{ t: number }> = ({ t }) => {
  const s = V(SPLIT) - GAP; // start of the gap
  const punch = outBack(prog(t, s + 0.15, s + 0.65));
  const spin = lerp(-180, 0, outCubic(prog(t, s + 0.15, s + 0.8)));
  const out = inOut(prog(t, s + 1.6, s + 2.0));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(214,167,67,${0.45 * punch}) 0%, rgba(0,0,0,0) 60%), ${INK}` }} />
      <div style={{ opacity: 1 - out }}>
        <Ticker t={t} text="VIRTUAL ASSISTANT TRAINING" top={360} rot={-8} bg={GOLD} ink={INK} size={70} speed={600} />
        <Ticker t={t} text="SAN FERNANDO · PAMPANGA" top={1420} rot={-8} bg={CREAM} ink={INK} size={70} speed={-600} />
      </div>
      {[0, 1, 2].map((k) => {
        const p = prog(t, s + 0.4 + k * 0.18, s + 1.4 + k * 0.18);
        return <div key={k} style={{ position: "absolute", left: 540 - 220, top: 960 - 220, width: 440, height: 440, borderRadius: "50%", border: `4px solid rgba(214,167,67,${1 - p})`, transform: `scale(${lerp(1, 3, outCubic(p))})` }} />;
      })}
      <div style={{ position: "absolute", left: 540 - 220, top: 960 - 220, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #23201a, #050505)", border: `5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${punch * lerp(1, 6, out)}) rotate(${spin}deg)`, opacity: 1 - out * 0.8 }}>
        <Logo size={330} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: 0.45 * (1 - prog(t, s + 0.6, s + 0.8)) * (t > s + 0.6 ? 1 : 0) }} />
    </>
  );
};

// a4.60 – 10.96  "This December, SAS is bringing VA Training to San Fernando, Pampanga."
const December: React.FC<{ t: number }> = ({ t }) => {
  const drift = (t - V(4.6)) * 90;
  return (
    <>
      <Frame label="THE EVENT" no="01" />
      <div style={{ position: "absolute", top: 160, left: 0, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900, fontSize: 520, lineHeight: 1, letterSpacing: "-0.05em", color: "transparent", WebkitTextStroke: `4px ${GOLD}`, transform: `translateX(${200 - drift}px)`, opacity: 0.8 }}>
        DECEMBER
      </div>
      <div style={{ position: "absolute", top: 760, left: 80, right: 80, fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.06, letterSpacing: "-0.035em", color: INK }}>
        <MaskWord t={t} at={V(4.62)}>This</MaskWord> <MaskWord t={t} at={V(4.85)}>December,</MaskWord>
        <br />
        <span style={rise(t, V(5.6), 0.4, 30)}>SAS is bringing</span>
        <br />
        <Mark t={t} at={V(6.9)}>Virtual Assistant</Mark>
        <br />
        <Mark t={t} at={V(7.6)} color={GOLD} ink={INK}>
          Training
        </Mark>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1450, display: "flex", alignItems: "center", gap: 26, ...rise(t, V(9.0), 0.5, 40) }}>
        <div style={{ transform: `translateY(${(1 - outBack(prog(t, V(9.0), V(9.6)))) * -300}px)` }}>
          <Pin size={90} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, color: INK, lineHeight: 1.1 }}>
          San Fernando,
          <br />
          <GoldText>Pampanga</GoldText>
        </div>
      </div>
    </>
  );
};

// a11.47 – 24.30  Partnership split screen, then skill tickers
const Partners: React.FC<{ t: number }> = ({ t }) => {
  const split = outCubic(prog(t, V(11.5), V(12.2)));
  const toSkills = inOut(prog(t, V(15.1), V(15.6)));
  const world = inOut(prog(t, V(20.5), V(21.0)));
  const skillsA = "EMAIL MANAGEMENT  ·  SCHEDULING  ·  SOCIAL MEDIA";
  const skillsB = "CUSTOMER SUPPORT  ·  ONLINE TOOLS  ·  ORGANIZATION";
  return (
    <>
      {/* Split screen: SAS on black, CLASP on cream */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toSkills }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 960, background: INK, transform: `translateY(${(1 - split) * -960}px)` }}>
          <div style={{ position: "absolute", left: 60, top: 70, fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(243,238,228,0.55)" }}>IN PARTNERSHIP</div>
          <div style={{ position: "absolute", left: 540 - 180, top: 300 }}>
            <Logo size={360} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, height: 960, background: CREAM, transform: `translateY(${(1 - split) * 960}px)` }}>
          <div style={{ position: "absolute", left: 540 - 180, top: 240, width: 360, height: 360, borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.25)" }}>
            <Img src={staticFile("clasp.png")} style={{ width: 360, height: 360 }} />
          </div>
          <div style={{ position: "absolute", top: 640, left: 60, right: 60, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: INK, letterSpacing: "-0.02em" }}>
            <MaskWord t={t} at={V(12.3)}>Church Leaders Association</MaskWord>
            <br />
            <MaskWord t={t} at={V(13.3)}>
              Serving <GoldText>Pampanga</GoldText>
            </MaskWord>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 956, height: 8, background: GOLD_GRADIENT, transform: `scaleX(${split})` }} />
        <div style={{ position: "absolute", left: 540 - 70, top: 960 - 70, width: 140, height: 140, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 300, fontSize: 110, lineHeight: 1, color: INK, transform: `scale(${outBack(prog(t, V(12.0), V(12.5)))}) rotate(${lerp(-90, 0, outCubic(prog(t, V(12.0), V(12.6))))}deg)`, paddingBottom: 12, boxSizing: "border-box" }}>
          ×
        </div>
      </div>
      {/* Skills as crossing tickers */}
      <div style={{ position: "absolute", inset: 0, background: CREAM, opacity: toSkills }}>
        <Frame label="THE TRAINING" no="02" />
        <div style={{ position: "absolute", top: 230, left: 80, right: 80, fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.06, letterSpacing: "-0.035em", color: INK, opacity: 1 - world }}>
          <span style={rise(t, V(15.4), 0.4, 30)}>An opportunity to learn</span>
          <br />
          <Mark t={t} at={V(18.9)} color={GOLD} ink={INK}>
            practical digital skills
          </Mark>
        </div>
        <div style={{ position: "absolute", top: 230, left: 80, right: 80, fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.06, letterSpacing: "-0.035em", color: INK, opacity: world }}>
          <span style={rise(t, V(20.65), 0.4, 30)}>and discover</span>
          <br />
          <Mark t={t} at={V(21.4)}>new possibilities</Mark>
          <br />
          <span style={{ fontSize: 60, color: SOFT, ...rise(t, V(22.6), 0.4, 20) }}>in the world of virtual assistance.</span>
        </div>
        <div style={{ opacity: prog(t, V(17.4), V(17.9)) }}>
          <Ticker t={t} text={skillsA} top={900} rot={-6} bg={INK} ink={CREAM} size={58} speed={260} />
          <Ticker t={t} text={skillsB} top={1130} rot={5} bg={GOLD} ink={INK} size={58} speed={-260} />
        </div>
        <div style={{ position: "absolute", left: 80, top: 1400, display: "flex", gap: 20, ...rise(t, V(21.8), 0.5, 40) }}>
          {["Learn", "Practice", "Launch"].map((w, i) => (
            <div key={w} style={{ padding: "22px 40px", borderRadius: 999, border: `3px solid ${INK}`, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: i === 2 ? CREAM : INK, background: i === 2 ? INK : "transparent" }}>
              {w}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// a24.77 – 29.47  "Our mission goes beyond providing virtual staffing solutions."
const Beyond: React.FC<{ t: number }> = ({ t }) => {
  const grow = outCubic(prog(t, V(26.0), V(29.2)));
  return (
    <>
      <Frame label="OUR MISSION" no="03" dark />
      <div style={{ position: "absolute", top: 260, left: 80, right: 80, fontFamily: FONT, fontWeight: 800, fontSize: 80, lineHeight: 1.1, letterSpacing: "-0.03em", color: CREAM }}>
        <MaskWord t={t} at={V(24.8)}>At SAS,</MaskWord> <MaskWord t={t} at={V(25.9)}>our mission goes</MaskWord>
      </div>
      <div style={{ position: "absolute", top: 700, left: 0, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900, fontSize: lerp(230, 330, grow), lineHeight: 1, letterSpacing: "-0.05em", transform: `translateX(${lerp(1080, 60, outCubic(prog(t, V(26.4), V(27.2)))) - grow * 160}px)` }}>
        <GoldText>BEYOND →</GoldText>
      </div>
      <div style={{ position: "absolute", top: 1260, left: 80, right: 80, fontFamily: FONT, fontWeight: 600, fontSize: 52, lineHeight: 1.2, color: "rgba(243,238,228,0.7)", ...rise(t, V(27.4), 0.5, 30) }}>
        providing{" "}
        <span style={{ position: "relative", color: CREAM }}>
          virtual staffing solutions
          <span style={{ position: "absolute", left: 0, top: "55%", height: 6, width: `${outCubic(prog(t, V(28.7), V(29.2))) * 100}%`, background: GOLD }} />
        </span>
        .
      </div>
    </>
  );
};

// a29.90 – 37.90  Numbered beliefs
const Beliefs: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    { n: "01", text: "Empowering people through skills", at: 29.9 },
    { n: "02", text: "Creating opportunities", at: 33.05 },
    { n: "03", text: "Making a meaningful impact in the communities we serve", at: 34.65 },
  ];
  return (
    <>
      <Frame label="WE BELIEVE IN" no="04" />
      <div style={{ position: "absolute", top: 200, left: 80, fontFamily: FONT, fontWeight: 900, fontSize: 110, letterSpacing: "-0.04em", color: INK }}>
        <MaskWord t={t} at={V(29.9)}>We believe in</MaskWord>
      </div>
      {rows.map((r, i) => {
        const line = outCubic(prog(t, V(r.at) - 0.1, V(r.at) + 0.6));
        return (
          <div key={r.n} style={{ position: "absolute", left: 80, right: 80, top: 450 + i * 370 }}>
            <div style={{ height: 4, background: INK, width: `${line * 100}%` }} />
            <div style={{ display: "flex", gap: 30, marginTop: 30, alignItems: "flex-start" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 0.85, letterSpacing: "-0.05em", ...rise(t, V(r.at), 0.5, 80) }}>
                <GoldText>{r.n}</GoldText>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.1, letterSpacing: "-0.025em", color: INK, ...rise(t, V(r.at) + 0.12, 0.5, 40) }}>{r.text}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// a38.40 – 42.05  Mission into action
const Action: React.FC<{ t: number }> = ({ t }) => {
  const swap = prog(t, V(40.6), V(40.9));
  const flash = 1 - prog(t, V(40.75), V(41.2));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: swap > 0.5 ? GOLD_GRADIENT : INK }} />
      <div style={{ position: "absolute", top: 380, left: 80, right: 80, fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: 1.15, color: swap > 0.5 ? INK : CREAM, ...rise(t, V(38.45), 0.4, 30) }}>
        This is one of the ways we're putting that
      </div>
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 210, letterSpacing: "-0.05em", lineHeight: 1 }}>
        <div style={{ position: "relative", display: "inline-block", color: swap > 0.5 ? "rgba(14,14,14,0.35)" : CREAM, ...rise(t, V(39.0), 0.4, 40) }}>
          MISSION
          <span style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 18, background: swap > 0.5 ? INK : GOLD, transform: `scaleX(${outCubic(prog(t, V(40.3), V(40.6)))})`, transformOrigin: "0 50%" }} />
        </div>
        <div style={{ color: INK, marginTop: 30, transform: `scale(${lerp(2.5, 1, outCubic(swap))})`, opacity: swap }}>into ACTION.</div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: swap > 0 ? flash * 0.7 : 0 }} />
    </>
  );
};

// a42.56 – 49.61  December 11, place, venue TBA
const DateScene: React.FC<{ t: number }> = ({ t }) => {
  const elevenP = outBack(prog(t, V(43.0), V(43.6)));
  const tba = outBack(prog(t, V(48.0), V(48.5)));
  return (
    <>
      <Frame label="SAVE THIS" no="05" />
      <div style={{ position: "absolute", top: 220, left: 80, fontFamily: FONT, fontWeight: 900, fontSize: 200, lineHeight: 0.9, letterSpacing: "-0.05em", color: INK }}>
        <MaskWord t={t} at={V(42.6)}>DEC</MaskWord>
      </div>
      <div style={{ position: "absolute", top: 360, right: 40, fontFamily: FONT, fontWeight: 900, fontSize: 760, lineHeight: 0.8, letterSpacing: "-0.08em", transform: `scale(${elevenP}) rotate(${lerp(-20, 0, clamp(elevenP))}deg)`, transformOrigin: "100% 100%" }}>
        <GoldText>11</GoldText>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060, height: 6, background: INK, transform: `scaleX(${outCubic(prog(t, V(43.7), V(44.4)))})`, transformOrigin: "0 50%" }} />
      <div style={{ position: "absolute", left: 80, top: 1110, fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15, letterSpacing: "-0.02em", color: INK }}>
        <span style={rise(t, V(43.8), 0.4, 30)}>Virtual Assistant Training</span>
        <br />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 16, ...rise(t, V(45.6), 0.4, 30) }}>
          <Pin size={56} /> San Fernando, Pampanga
        </span>
      </div>
      {/* Venue TBA stamp */}
      <div style={{ position: "absolute", left: 80, top: 1400, transform: `rotate(-6deg) scale(${lerp(2.2, 1, outCubic(prog(t, V(48.0), V(48.35))))})`, opacity: clamp(tba) }}>
        <div style={{ border: `8px solid ${INK}`, borderRadius: 26, padding: "20px 34px", fontFamily: FONT, fontWeight: 900, fontSize: 48, letterSpacing: "0.04em", color: INK, whiteSpace: "nowrap" }}>
          VENUE: <span style={{ color: "#9A6A1E" }}>ANNOUNCED SOON</span>
        </div>
      </div>
    </>
  );
};

// a50.12 – 59.20  Opportunity kinetic panels
const Opportunity: React.FC<{ t: number }> = ({ t }) => {
  const panels = [
    { at: 50.12, to: 51.75, bg: CREAM, ink: INK, small: "If you've been looking for", big: "an opportunity" },
    { at: 51.75, to: 53.2, bg: INK, ink: CREAM, small: "to", big: "learn a new skill" },
    { at: 53.2, to: 54.55, bg: GOLD, ink: INK, small: "to", big: "grow professionally" },
    { at: 54.55, to: 57.25, bg: CREAM, ink: INK, small: "or explore the world of", big: "virtual assistance" },
    { at: 57.25, to: 59.5, bg: INK, ink: CREAM, small: "this could be", big: "YOUR opportunity." },
  ];
  return (
    <>
      {panels.map((p, i) => {
        if (t < V(p.at) - 0.01 || t >= V(p.to)) return null;
        const enter = outCubic(prog(t, V(p.at), V(p.at) + 0.35));
        const last = i === panels.length - 1;
        return (
          <AbsoluteFill key={i} style={{ background: p.bg === GOLD ? GOLD_GRADIENT : p.bg, clipPath: `inset(${(1 - enter) * 100}% 0 0 0)` }}>
            <div style={{ position: "absolute", left: 80, right: 80, top: 640, fontFamily: FONT, color: p.ink }}>
              <div style={{ fontSize: 58, fontWeight: 600, opacity: 0.8, ...rise(t, V(p.at) + 0.1, 0.35, 20) }}>{p.small}</div>
              <div style={{ fontSize: last ? 150 : 128, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.045em", marginTop: 14, transform: `scale(${lerp(1.15, 1, enter)})`, transformOrigin: "0 50%" }}>
                {last ? (
                  <>
                    <GoldText>YOUR</GoldText>
                    <br />
                    opportunity.
                  </>
                ) : (
                  p.big
                )}
              </div>
            </div>
            <div style={{ position: "absolute", left: 80, bottom: 200, fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: "0.2em", color: p.ink, opacity: 0.4 }}>{`0${i + 1} / 05`}</div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// a59.71 – 63.67  Save the date poster on gold
const Poster: React.FC<{ t: number }> = ({ t }) => {
  const slam = prog(t, V(60.87), V(61.15));
  const shake = slam > 0 && slam < 1 ? Math.sin(t * 90) * 12 * (1 - slam) : 0;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: GOLD_GRADIENT }} />
      <Ticker t={t} text="SAVE THE DATE" top={140} bg={INK} ink={GOLD_LIGHT} size={50} speed={300} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 130, letterSpacing: "-0.03em", lineHeight: 0.95, color: INK }}>
          <MaskWord t={t} at={V(59.72)}>SAVE</MaskWord> <MaskWord t={t} at={V(59.9)}>THE</MaskWord> <MaskWord t={t} at={V(60.05)}>DATE.</MaskWord>
        </div>
        <div style={{ position: "absolute", top: 620, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 330, letterSpacing: "-0.06em", lineHeight: 1, color: INK, opacity: slam, transform: `scale(${lerp(3, 1, outCubic(slam))})` }}>
          DEC 11
        </div>
        <div style={{ position: "absolute", top: 1040, width: "100%", display: "flex", justifyContent: "center", ...rise(t, V(62.15), 0.4, 40) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 54px", borderRadius: 999, background: INK, fontFamily: FONT, fontWeight: 800, fontSize: 54, color: CREAM }}>
            <Pin size={50} color={CREAM} /> San Fernando, Pampanga
          </div>
        </div>
        <div style={{ position: "absolute", top: 1240, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, opacity: 0.75, ...rise(t, V(62.8), 0.4, 20) }}>
          Virtual Assistant Training · Venue to be announced
        </div>
      </div>
      <Badge t={t} text="SAS × CLASP · COMMUNITY · " size={250} x={540} y={1560} dark>
        <Logo size={120} />
      </Badge>
    </>
  );
};

// a64.16 – end  Closing
const Closing: React.FC<{ t: number }> = ({ t }) => {
  const words: { w: string; at: number; gold?: boolean }[] = [
    { w: "We're", at: 64.2 },
    { w: "excited", at: 64.4 },
    { w: "to", at: 64.85 },
    { w: "learn,", at: 65.05, gold: true },
    { w: "grow,", at: 65.75, gold: true },
    { w: "and", at: 66.45 },
    { w: "serve", at: 66.6, gold: true },
    { w: "the", at: 67.0 },
    { w: "community", at: 67.15 },
    { w: "with", at: 67.6 },
    { w: "you.", at: 67.8 },
  ];
  const logos = outBack(prog(t, V(64.2), V(64.9)));
  return (
    <>
      <Frame label="SEE YOU THERE" no="06" />
      <div style={{ position: "absolute", top: 220, left: 80, right: 80, fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.06, letterSpacing: "-0.035em", color: INK }}>
        {words.map((x, i) => (
          <React.Fragment key={i}>
            <MaskWord t={t} at={V(x.at)}>{x.gold ? <GoldText>{x.w}</GoldText> : x.w}</MaskWord>{" "}
          </React.Fragment>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1000, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 40, transform: `scale(${logos})` }}>
        <div style={{ width: 260, height: 260, borderRadius: "50%", background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Logo size={190} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 110, color: GOLD }}>×</div>
        <div style={{ width: 260, height: 260, borderRadius: "50%", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
          <Img src={staticFile("clasp.png")} style={{ width: 260, height: 260 }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1360, width: "100%", textAlign: "center", ...rise(t, V(66.8), 0.5, 30) }}>
        <div style={{ display: "inline-block", padding: "26px 56px", borderRadius: 999, background: INK, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: CREAM }}>
          <GoldText>Dec 11</GoldText> · San Fernando, Pampanga
        </div>
      </div>
      <div style={{ position: "absolute", top: 1510, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: INK, ...rise(t, V(67.6), 0.5, 20) }}>
        strategic-assistant.com
      </div>
      <div style={{ position: "absolute", top: 1590, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 30, color: SOFT, ...rise(t, V(68.0), 0.5, 20) }}>
        Follow us for the venue announcement
      </div>
    </>
  );
};

// Scene boundaries in video time; each change is covered by a wipe.
const B = {
  sting: V(SPLIT) - GAP,
  dec: V(SPLIT),
  partners: V(11.3),
  beyond: V(24.55),
  beliefs: V(29.7),
  action: V(38.2),
  date: V(42.35),
  opp: V(49.95),
  poster: V(59.55),
  closing: V(63.95),
};

export const TrainingReelV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: CREAM, fontFamily: FONT }}>
      <Sequence from={Math.round(LEAD * fps)} durationInFrames={Math.round(SPLIT * fps)}>
        <Audio src={staticFile("training-vo.mp3")} />
      </Sequence>
      <Sequence from={Math.round(V(SPLIT) * fps)}>
        <Audio src={staticFile("training-vo.mp3")} trimBefore={Math.round(SPLIT * fps)} />
      </Sequence>

      <Cut t={t} from={0} to={B.sting} bg={CREAM}>
        <Hook t={t} />
      </Cut>
      <Cut t={t} from={B.sting} to={B.dec} bg={INK}>
        <Sting t={t} />
      </Cut>
      <Cut t={t} from={B.dec} to={B.partners} bg={CREAM}>
        <December t={t} />
      </Cut>
      <Cut t={t} from={B.partners} to={B.beyond} bg={CREAM}>
        <Partners t={t} />
      </Cut>
      <Cut t={t} from={B.beyond} to={B.beliefs} bg={INK}>
        <Beyond t={t} />
      </Cut>
      <Cut t={t} from={B.beliefs} to={B.action} bg={CREAM}>
        <Beliefs t={t} />
      </Cut>
      <Cut t={t} from={B.action} to={B.date} bg={INK}>
        <Action t={t} />
      </Cut>
      <Cut t={t} from={B.date} to={B.opp} bg={CREAM}>
        <DateScene t={t} />
      </Cut>
      <Cut t={t} from={B.opp} to={B.poster} bg={CREAM}>
        <Opportunity t={t} />
      </Cut>
      <Cut t={t} from={B.poster} to={B.closing} bg={GOLD}>
        <Poster t={t} />
      </Cut>
      <Cut t={t} from={B.closing} to={TRAINING2_SECONDS + 1} bg={CREAM}>
        <Closing t={t} />
      </Cut>

      <Wipe t={t} at={B.sting} color={GOLD} dir="up" />
      <Wipe t={t} at={B.dec} color={CREAM} dir="diag" />
      <Wipe t={t} at={B.partners} color={INK} dir="left" />
      <Wipe t={t} at={B.beyond} color={GOLD} dir="up" />
      <Wipe t={t} at={B.beliefs} color={INK} dir="diag" />
      <Wipe t={t} at={B.action} color={GOLD} dir="left" />
      <Wipe t={t} at={B.date} color={INK} dir="up" />
      <Wipe t={t} at={B.poster} color={INK} dir="diag" />
      <Wipe t={t} at={B.closing} color={INK} dir="up" />
      <AbsoluteFill style={{ background: CREAM, opacity: prog(t, TRAINING2_SECONDS - 0.6, TRAINING2_SECONDS) }} />
    </AbsoluteFill>
  );
};

export const TrainingThumbnailV2: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <Frame label="SAS · EVENT" no="12 / 2026" />
    <div style={{ position: "absolute", top: 210, left: 80, right: 80, fontFamily: FONT, fontWeight: 900, fontSize: 132, lineHeight: 0.98, letterSpacing: "-0.045em", color: INK }}>
      Virtual
      <br />
      Assistant
      <br />
      <span style={{ background: INK, color: CREAM, padding: "0 0.12em" }}>Training</span>
    </div>
    <div style={{ position: "absolute", top: 520, right: 30, fontFamily: FONT, fontWeight: 900, fontSize: 620, lineHeight: 0.8, letterSpacing: "-0.08em" }}>
      <GoldText>11</GoldText>
    </div>
    <div style={{ position: "absolute", top: 640, left: 80, fontFamily: FONT, fontWeight: 900, fontSize: 120, letterSpacing: "-0.04em", color: INK }}>DEC</div>
    <Ticker t={0.3} text="SAN FERNANDO · PAMPANGA" top={1110} rot={-5} bg={INK} ink={CREAM} size={64} />
    <div style={{ position: "absolute", top: 1330, left: 80, display: "flex", alignItems: "center", gap: 30 }}>
      <div style={{ width: 170, height: 170, borderRadius: "50%", background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Logo size={124} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 80, color: GOLD }}>×</div>
      <div style={{ width: 170, height: 170, borderRadius: "50%", overflow: "hidden" }}>
        <Img src={staticFile("clasp.png")} style={{ width: 170, height: 170 }} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 1560, left: 80, fontFamily: FONT, fontWeight: 900, fontSize: 64, letterSpacing: "-0.02em", color: INK }}>
      Save the date.
    </div>
  </AbsoluteFill>
);
