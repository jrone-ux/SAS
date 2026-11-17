import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  appear,
  Backdrop,
  clamp,
  FONT,
  Gold,
  GOLD,
  GOLD_GRADIENT,
  GOLD_LIGHT,
  Headline,
  Icon,
  inOut,
  lerp,
  Logo,
  MUTED,
  outBack,
  outCubic,
  Pill,
  prog,
  WHITE,
  Words,
} from "./brand";

// The voiceover starts after a 2 s silent hook. Cue times below are video
// time: the pause timings measured in training-vo.mp3 plus VO_START.
const VO_START = 2;
export const TRAINING_SECONDS = 73;
const INK = "#111111";
const PAPER = "#F6F3EE";

type Kind = "fade" | "zoom" | "slide" | "rise";

// Scene with a choice of entrance/exit so transitions vary through the reel.
export const Scene: React.FC<{ t: number; from: number; to: number; kind?: Kind; children: React.ReactNode }> = ({
  t,
  from,
  to,
  kind = "fade",
  children,
}) => {
  if (t < from - 0.01 || t > to + 0.45) return null;
  const inP = outCubic(prog(t, from, from + 0.45));
  const outP = 1 - inOut(prog(t, to, to + 0.45));
  const o = Math.min(inP, outP);
  let transform = "";
  if (kind === "zoom") transform = `scale(${lerp(0.82, 1, inP) * lerp(1.35, 1, outP)})`;
  if (kind === "slide") transform = `translateX(${(1 - inP) * 1080 - (1 - outP) * 1080}px)`;
  if (kind === "rise") transform = `translateY(${(1 - inP) * 400 - (1 - outP) * 400}px)`;
  if (kind === "fade") transform = `scale(${lerp(1.05, 1, inP)})`;
  return (
    <AbsoluteFill style={{ opacity: o, transform, filter: o < 1 ? `blur(${(1 - o) * 14}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

// A gold light-leak that sweeps across at scene changes.
export const LightSweep: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = prog(t, at - 0.35, at + 0.45);
  if (p <= 0 || p >= 1) return null;
  const x = lerp(-60, 160, p);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(105deg, transparent ${x - 30}%, rgba(247,215,116,0.22) ${x - 8}%, rgba(255,245,215,0.38) ${x}%, rgba(247,215,116,0.22) ${x + 8}%, transparent ${x + 30}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// Slow drifting gold dust; deterministic so every render matches.
export const Dust: React.FC<{ t: number; n?: number; o?: number }> = ({ t, n = 40, o = 0.6 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const seed = Math.sin(i * 91.7) * 10000;
      const r = seed - Math.floor(seed);
      const x = (i * 137.5) % 1080;
      const y = (1920 + ((r * 1920 - t * (20 + r * 40)) % 1920)) % 1920;
      const s = 3 + r * 6;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: s,
            height: s,
            borderRadius: "50%",
            background: GOLD_LIGHT,
            opacity: o * (0.25 + 0.75 * Math.abs(Math.sin(t * (0.8 + r) + i))),
            boxShadow: `0 0 ${s * 3}px ${GOLD}`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// Burst of sparkles radiating from a point.
export const Sparkle: React.FC<{ t: number; at: number; x: number; y: number; n?: number; r?: number }> = ({ t, at, x, y, n = 18, r = 380 }) => {
  const p = prog(t, at, at + 1.2);
  if (p <= 0 || p >= 1) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = outCubic(p) * r * (0.6 + 0.4 * ((i * 7) % 5) / 5);
        const s = 10 * (1 - p) + 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - s / 2,
              top: y + Math.sin(a) * d - s / 2,
              width: s,
              height: s,
              transform: "rotate(45deg)",
              background: i % 3 ? GOLD_LIGHT : WHITE,
              opacity: 1 - p,
              boxShadow: `0 0 12px ${GOLD}`,
            }}
          />
        );
      })}
    </>
  );
};

// Wall calendar page.
export const CalendarPage: React.FC<{ month: string; year?: string; circle?: number; circleP?: number; style?: React.CSSProperties }> = ({
  month,
  year = "2026",
  circle,
  circleP = 0,
  style,
}) => {
  // December 2026 starts on a Tuesday; November 2026 on a Sunday; October on a Thursday.
  const firstDay = month === "DECEMBER" ? 2 : month === "NOVEMBER" ? 0 : 4;
  const days = month === "NOVEMBER" ? 30 : 31;
  return (
    <div
      style={{
        position: "absolute",
        width: 760,
        height: 860,
        borderRadius: 40,
        background: PAPER,
        overflow: "hidden",
        boxShadow: "0 60px 120px rgba(0,0,0,0.75)",
        fontFamily: FONT,
        ...style,
      }}
    >
      <div style={{ height: 230, background: "linear-gradient(160deg, #1d1d1d, #070707)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: `6px solid ${GOLD}` }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.3em", color: MUTED }}>{year}</div>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: "0.06em" }}>
          <Gold>{month}</Gold>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, padding: "26px 34px" }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: "#8a8580" }}>
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const isC = circle === d;
          return (
            <div key={d} style={{ position: "relative", height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: isC && circleP > 0.5 ? 900 : 600, color: isC && circleP > 0.5 ? "#9A6A1E" : INK }}>
              {d}
              {isC ? (
                <svg width="110" height="100" viewBox="0 0 110 100" style={{ position: "absolute", left: -8, top: -12, overflow: "visible" }}>
                  <path
                    d="M 70 12 C 30 0, 2 30, 10 58 C 18 90, 90 96, 102 56 C 110 28, 80 6, 48 10"
                    stroke={GOLD}
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1 - circleP}
                  />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// The event ticket, built in pieces.
export const Ticket: React.FC<{ t: number; at: number; date?: string; style?: React.CSSProperties }> = ({ t, at, date = "DECEMBER 2026", style }) => {
  const a = (k: number) => appear(t, at + k, 0.45, 30);
  const body = outBack(prog(t, at, at + 0.6));
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: 920,
        height: 520,
        borderRadius: 44,
        background: "linear-gradient(135deg, #2a2112 0%, #0d0b07 55%, #1c160c 100%)",
        border: `3px solid ${GOLD}`,
        boxShadow: "0 60px 120px rgba(0,0,0,0.8), 0 0 120px rgba(214,167,67,0.25)",
        fontFamily: FONT,
        transform: `scale(${lerp(0.6, 1, clamp(body))}) rotate(${lerp(-10, 0, clamp(body))}deg)`,
        opacity: clamp(body * 1.6),
        overflow: "hidden",
        ...style,
      }}
    >
      {/* perforation */}
      <div style={{ position: "absolute", left: 650, top: 0, bottom: 0, borderLeft: "4px dashed rgba(214,167,67,0.45)" }} />
      <div style={{ position: "absolute", left: 650 - 30, top: -30, width: 60, height: 60, borderRadius: "50%", background: "#000" }} />
      <div style={{ position: "absolute", left: 650 - 30, bottom: -30, width: 60, height: 60, borderRadius: "50%", background: "#000" }} />
      <div style={{ position: "absolute", left: 52, top: 50, right: 300 }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.22em", color: GOLD, ...a(0.3) }}>COMMUNITY EVENT</div>
        <div style={{ fontSize: 74, fontWeight: 900, color: WHITE, lineHeight: 1.02, marginTop: 18, letterSpacing: "-0.02em", ...a(0.6) }}>
          Virtual Assistant <Gold>Training</Gold>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30, fontSize: 32, fontWeight: 600, color: "#e8dfcf", ...a(1.0) }}>
          <Icon name="calendar" size={36} color={GOLD_LIGHT} stroke={2.2} /> {date}
        </div>
      </div>
      <div style={{ position: "absolute", left: 690, top: 60, right: 40, bottom: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, ...a(0.8) }}>
        <Logo size={160} />
        <div style={{ fontSize: 22, fontWeight: 700, color: MUTED, letterSpacing: "0.12em", textAlign: "center" }}>
          ADMIT
          <br />
          ONE
        </div>
      </div>
    </div>
  );
};

const Pin: React.FC<{ size?: number }> = ({ size = 160 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <defs>
      <linearGradient id="pinG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={GOLD_LIGHT} />
        <stop offset="0.5" stopColor={GOLD} />
        <stop offset="1" stopColor="#9A6A1E" />
      </linearGradient>
    </defs>
    <path d="M50 128 C 50 128, 6 76, 6 46 A 44 44 0 0 1 94 46 C 94 76, 50 128, 50 128 Z" fill="url(#pinG)" />
    <circle cx="50" cy="46" r="17" fill="#111" />
  </svg>
);

export const LogoDisc: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, #1d1a14, #050505)",
      border: `4px solid ${GOLD}`,
      boxShadow: "0 0 80px rgba(214,167,67,0.35), 0 40px 80px rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// 0 – 6.1  Silent hook: October tears away → November; "something special"
// ---------------------------------------------------------------------------
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const enter = outCubic(prog(t, 0, 0.7));
  const tear = prog(t, 1.0, 1.9);
  const zoom = lerp(1.18, 1, enter) * (1 + 0.04 * prog(t, 2, 6));
  const glow = prog(t, 3.7, 4.4);
  return (
    <>
      <Backdrop glowY={1000} glow={0.35 + glow * 0.25} />
      <Dust t={t} o={0.5} />
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", ...appear(t, 0.2, 0.5) }}>
        <Pill style={{ fontSize: 34, letterSpacing: "0.22em", fontWeight: 700, padding: "16px 36px" }}>
          <Gold>SOMETHING SPECIAL</Gold>
        </Pill>
      </div>
      <Headline top={330} size={92} style={{ opacity: prog(t, 2.0, 2.3) }}>
        <Words t={t} at={2.0} span={1.2} text="November is here," gold={["November"]} />
      </Headline>
      <Headline top={450} size={60} style={{ fontWeight: 600, color: MUTED }}>
        <Words t={t} at={3.6} span={2.0} text="and we're starting the month with something special." gold={["special."]} />
      </Headline>
      <div style={{ position: "absolute", inset: 0, perspective: 2400, transform: `scale(${zoom})` }}>
        <CalendarPage month="NOVEMBER" style={{ left: 160, top: 760 }} />
        {/* October tears off and falls */}
        {tear < 1 ? (
          <CalendarPage
            month="OCTOBER"
            style={{
              left: 160,
              top: 760,
              transformOrigin: "50% 0%",
              transform: `translateY(${inOut(tear) * 1500}px) rotateX(${tear * 50}deg) rotate(${tear * 18}deg)`,
              opacity: 1 - prog(t, 1.6, 1.9),
            }}
          />
        ) : null}
        {/* rings */}
        {[0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: 140 + k * 600, top: 730, width: 200, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 34, height: 80, borderRadius: 17, background: GOLD_GRADIENT, boxShadow: "0 6px 20px rgba(0,0,0,0.6)" }} />
          </div>
        ))}
      </div>
      <Sparkle t={t} at={1.65} x={540} y={900} n={22} r={520} />
      <Sparkle t={t} at={4.2} x={540} y={1200} n={16} r={420} />
    </>
  );
};

// ---------------------------------------------------------------------------
// 6.6 – 13  "This December, SAS is bringing VA Training to San Fernando, Pampanga."
// ---------------------------------------------------------------------------
export const Announce: React.FC<{ t: number }> = ({ t }) => {
  const pin = prog(t, 11.3, 11.8);
  const mapIn = outCubic(prog(t, 10.6, 11.3));
  return (
    <>
      <Backdrop glowY={1000} glow={0.4} />
      <Dust t={t} n={24} o={0.35} />
      <Headline top={220} size={80}>
        <Words t={t} at={6.6} span={0.7} text="This December," gold={["December,"]} />{" "}
        <Words t={t} at={7.6} span={1.6} text="SAS is bringing" />
      </Headline>
      <Ticket t={t} at={8.3} style={{ top: 540 }} />
      {/* Map tile with pin */}
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 1170,
          height: 400,
          borderRadius: 40,
          overflow: "hidden",
          border: "2px solid rgba(214,167,67,0.35)",
          background: "#0c0c0c",
          opacity: mapIn,
          transform: `translateY(${(1 - mapIn) * 200}px)`,
        }}
      >
        <svg width="800" height="400" viewBox="0 0 800 400" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50 + 30} stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          ))}
          <path d="M -20 260 C 160 220, 300 320, 460 250 S 700 160, 820 210" stroke="rgba(214,167,67,0.35)" strokeWidth="14" fill="none" />
          <path d="M 220 -20 C 260 120, 330 200, 300 420" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
          <path d="M 560 -20 C 520 120, 600 260, 640 420" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
        </svg>
        <div style={{ position: "absolute", left: 400 - 60, top: lerp(-260, 70, outBack(pin)), opacity: pin > 0 ? 1 : 0 }}>
          <Pin size={120} />
        </div>
        <div style={{ position: "absolute", left: 400 - 60, top: 230, width: 120, height: 30, borderRadius: "50%", background: "rgba(214,167,67,0.3)", transform: `scale(${pin})` }} />
        <div style={{ position: "absolute", bottom: 26, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: WHITE, ...appear(t, 11.6, 0.4, 20) }}>
          San Fernando, <Gold>Pampanga</Gold>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 13.4 – 26.3  Partnership with CLASP → digital skills
// ---------------------------------------------------------------------------
const SKILLS = ["Email management", "Scheduling", "Social media", "Customer support", "Online tools", "Data organization"];

export const Partnership: React.FC<{ t: number }> = ({ t }) => {
  const meet = outCubic(prog(t, 13.5, 14.5));
  const hand = outBack(prog(t, 14.6, 15.1));
  const toSkills = inOut(prog(t, 17.1, 17.7));
  const lap = outCubic(prog(t, 17.4, 18.2));
  const world = inOut(prog(t, 22.4, 23.2));
  return (
    <>
      <Backdrop glowY={1000} glow={0.4} />
      <Dust t={t} n={30} o={0.35} />
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", opacity: 1 - toSkills }}>
        <div style={appear(t, 13.5, 0.4)}>
          <Pill style={{ fontSize: 32, letterSpacing: "0.2em", fontWeight: 700, padding: "14px 34px" }}>
            <Gold>IN PARTNERSHIP WITH</Gold>
          </Pill>
        </div>
      </div>
      <Headline top={330} size={66} style={{ opacity: 1 - toSkills }}>
        <Words t={t} at={13.7} span={2.2} text="Church Leaders Association Serving Pampanga" gold={["Pampanga"]} />
      </Headline>
      {/* Logos slide in from both sides and meet */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toSkills, transform: `scale(${1 - toSkills * 0.2})` }}>
        <LogoDisc size={360} style={{ left: lerp(-400, 110, meet), top: 820 }}>
          <Logo size={260} />
        </LogoDisc>
        <LogoDisc size={360} style={{ left: lerp(1100, 610, meet), top: 820, background: WHITE }}>
          <Img src={staticFile("clasp.png")} style={{ width: 340, height: 340 }} />
        </LogoDisc>
        <div
          style={{
            position: "absolute",
            left: 540 - 60,
            top: 940,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: GOLD_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 60px rgba(214,167,67,0.6)",
            transform: `scale(${hand})`,
            fontFamily: FONT,
            fontWeight: 300,
            fontSize: 90,
            color: INK,
            lineHeight: 1,
          }}
        >
          ×
        </div>
        <div style={{ position: "absolute", top: 1260, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 700, letterSpacing: "0.16em", color: WHITE, ...appear(t, 15.0, 0.5) }}>
          SAS <span style={{ color: GOLD }}>×</span> CLASP
        </div>
        <Sparkle t={t} at={14.5} x={540} y={1000} n={20} r={460} />
      </div>
      {/* Skills from a laptop */}
      <Headline top={230} size={70} style={{ opacity: toSkills * (1 - world) }}>
        <Words t={t} at={17.4} span={1.4} text="Creating an opportunity to learn" />{" "}
        <Words t={t} at={19.0} span={1.2} text="practical digital skills" gold={["practical", "digital", "skills"]} />
      </Headline>
      <Headline top={230} size={70} style={{ opacity: world }}>
        <Words t={t} at={22.5} span={1.8} text="and discover new possibilities in the world of virtual assistance." gold={["new", "possibilities"]} />
      </Headline>
      <div style={{ position: "absolute", inset: 0, opacity: toSkills, transform: `scale(${lerp(1, 0.78, world)}) translateY(${world * 180}px)` }}>
        <div style={{ position: "absolute", left: 200, top: 1150, width: 680, transform: `translateY(${(1 - lap) * 500}px)` }}>
          <div style={{ height: 420, borderRadius: "26px 26px 8px 8px", padding: 16, background: "linear-gradient(160deg, #2e2e2e, #0c0c0c)", boxShadow: "0 0 0 2px rgba(214,167,67,0.3), 0 0 100px rgba(214,167,67,0.15)" }}>
            <div style={{ height: "100%", borderRadius: 12, background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
              <Logo size={140} />
              <div style={{ width: 380, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: `${outCubic(prog(t, 18.2, 22.0)) * 100}%`, height: "100%", borderRadius: 7, background: GOLD_GRADIENT }} />
              </div>
              <div style={{ fontFamily: FONT, fontSize: 24, color: MUTED, fontWeight: 600 }}>Learning in progress…</div>
            </div>
          </div>
          <div style={{ width: 760, marginLeft: -40, height: 26, borderRadius: "0 0 30px 30px", background: "linear-gradient(180deg, #3a3a3a, #151515)" }} />
        </div>
        {SKILLS.map((s, i) => {
          const at = 18.6 + i * 0.45;
          const p = outCubic(prog(t, at, at + 0.7));
          const left = i % 2 === 0;
          const row = Math.floor(i / 2);
          const tx = left ? 90 : 560;
          const ty = 560 + row * 170;
          return (
            <div
              key={s}
              style={{
                position: "absolute",
                left: lerp(540 - 200, tx, p),
                top: lerp(1300, ty, p),
                opacity: clamp(p * 2),
                transform: `scale(${lerp(0.4, 1, p)}) rotate(${(1 - p) * (left ? -20 : 20)}deg)`,
              }}
            >
              <Pill style={{ fontSize: 36, padding: "20px 34px", background: "rgba(10,10,10,0.9)" }}>
                <span style={{ width: 14, height: 14, borderRadius: 7, background: GOLD, display: "inline-block" }} />
                {s}
              </Pill>
            </div>
          );
        })}
      </div>
      {/* "World of virtual assistance" orbit */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: world }}>
        <ellipse cx="540" cy="1150" rx="470" ry="560" stroke="rgba(214,167,67,0.35)" strokeWidth="3" fill="none" strokeDasharray="12 16" strokeDashoffset={-t * 40} />
      </svg>
    </>
  );
};

// ---------------------------------------------------------------------------
// 26.7 – 31.5  Mission goes beyond virtual staffing
// ---------------------------------------------------------------------------
export const Beyond: React.FC<{ t: number }> = ({ t }) => {
  const push = outCubic(prog(t, 29.0, 31.2));
  return (
    <>
      <Backdrop glowY={1050} glow={0.35 + push * 0.2} />
      <Headline top={250} size={78}>
        <Words t={t} at={26.8} span={0.9} text="At SAS, our mission goes" gold={["SAS,"]} />{" "}
        <span style={{ display: "inline-block", ...appear(t, 28.2, 0.4, 24), transform: `scale(${1 + 0.15 * Math.sin(Math.PI * prog(t, 28.2, 28.9))})` }}>
          <Gold>beyond</Gold>
        </span>
      </Headline>
      {/* Expanding rings: staffing at the centre, mission reaching outwards */}
      {[0, 1, 2, 3].map((k) => {
        const p = prog(t, 28.4 + k * 0.35, 30.4 + k * 0.35);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 540 - 200,
              top: 1080 - 200,
              width: 400,
              height: 400,
              borderRadius: "50%",
              border: `3px solid rgba(214,167,67,${0.7 * (1 - p)})`,
              transform: `scale(${lerp(1, 2.8, outCubic(p))})`,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", top: 1040, width: "100%", textAlign: "center", ...appear(t, 27.6, 0.5), transform: `scale(${lerp(1, 0.75, push)})` }}>
        <Pill style={{ fontSize: 44, padding: "26px 46px" }}>
          <Icon name="users" size={46} color={GOLD_LIGHT} stroke={2.2} />
          Virtual staffing solutions
        </Pill>
      </div>
      <div style={{ position: "absolute", top: 1480, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 46, fontWeight: 700, color: WHITE, ...appear(t, 30.0, 0.5) }}>
        …and into the <Gold>community.</Gold>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 31.9 – 39.9  Empowering, opportunities, impact
// ---------------------------------------------------------------------------
export const Pillars: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { icon: "trend", label: "Empowering people through skills", at: 32.0 },
    { icon: "target", label: "Creating opportunities", at: 34.8 },
    { icon: "users", label: "Making a meaningful impact in our communities", at: 36.7 },
  ];
  return (
    <>
      <Backdrop glowY={1100} glow={0.4} />
      <Dust t={t} n={20} o={0.3} />
      <Headline top={230} size={84}>
        <Words t={t} at={31.95} span={0.8} text="We believe in" />
      </Headline>
      <div style={{ position: "absolute", top: 520, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 40 }}>
        {items.map((it, i) => {
          const p = outBack(prog(t, it.at, it.at + 0.55));
          return (
            <div
              key={it.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                padding: "40px 40px",
                borderRadius: 40,
                background: "linear-gradient(170deg, #171717 0%, #0a0a0a 100%)",
                border: `2px solid ${GOLD}`,
                boxShadow: "0 0 50px rgba(214,167,67,0.15)",
                fontFamily: FONT,
                fontSize: 50,
                fontWeight: 700,
                lineHeight: 1.15,
                color: WHITE,
                opacity: clamp(p * 1.5),
                transform: `translateX(${(1 - clamp(p)) * (i % 2 ? 700 : -700)}px) rotate(${(1 - clamp(p)) * (i % 2 ? 6 : -6)}deg)`,
              }}
            >
              <div style={{ width: 130, height: 130, borderRadius: 34, background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={it.icon} size={70} color={INK} stroke={2.2} />
              </div>
              {it.label}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 40.4 – 44  Mission into action (switch)
// ---------------------------------------------------------------------------
export const Action: React.FC<{ t: number }> = ({ t }) => {
  const on = inOut(prog(t, 42.4, 42.9));
  return (
    <>
      <Backdrop glowY={1050} glow={0.3 + on * 0.35} />
      <Headline top={300} size={80}>
        <Words t={t} at={40.45} span={1.6} text="One of the ways we're putting that mission into" />{" "}
        <span style={{ display: "inline-block", ...appear(t, 42.4, 0.3, 24) }}>
          <Gold>action.</Gold>
        </span>
      </Headline>
      <div style={{ position: "absolute", left: 540 - 300, top: 940, width: 600, height: 260, borderRadius: 130, background: on > 0.5 ? GOLD_GRADIENT : "#1a1a1a", border: "3px solid rgba(214,167,67,0.5)", boxShadow: `0 0 ${on * 140}px rgba(214,167,67,${on * 0.6})` }}>
        <div
          style={{
            position: "absolute",
            top: 20,
            left: lerp(20, 600 - 240, on),
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: on > 0.5 ? "#0b0b0b" : GOLD_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {on > 0.5 ? <Logo size={150} /> : <Icon name="target" size={100} color={INK} stroke={2} />}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 250px", fontFamily: FONT, fontSize: 42, fontWeight: 800, letterSpacing: "0.12em" }}>
        <span style={{ color: on > 0.5 ? MUTED : WHITE }}>MISSION</span>
        <span style={{ color: on > 0.5 ? GOLD : MUTED }}>ACTION</span>
      </div>
      <Sparkle t={t} at={42.8} x={540} y={1070} n={24} r={520} />
    </>
  );
};

// ---------------------------------------------------------------------------
// 44.5 – 51.6  December 11, San Fernando, venue soon
// ---------------------------------------------------------------------------
export const Dec11: React.FC<{ t: number }> = ({ t }) => {
  const cal = outCubic(prog(t, 44.5, 45.2));
  const circle = outCubic(prog(t, 45.0, 45.9));
  const venue = inOut(prog(t, 49.8, 50.3));
  const zoom = lerp(1, 1.12, inOut(prog(t, 45.0, 46.0))) * lerp(1, 0.8, venue);
  return (
    <>
      <Backdrop glowY={1050} glow={0.4} />
      <Headline top={210} size={80} style={{ opacity: 1 - venue }}>
        <Words t={t} at={44.55} span={0.8} text="On December 11," gold={["December", "11,"]} />
        <div style={{ fontSize: 54, color: MUTED, fontWeight: 600, marginTop: 10 }}>
          <Words t={t} at={45.7} span={2.0} text="VA Training comes to San Fernando, Pampanga." gold={["San", "Fernando,", "Pampanga."]} />
        </div>
      </Headline>
      <Headline top={230} size={84} style={{ opacity: venue }}>
        <Words t={t} at={49.95} span={1.2} text="The venue will be announced soon." gold={["announced", "soon."]} />
      </Headline>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom}) translateY(${(1 - cal) * 900}px)`, transformOrigin: "540px 1150px" }}>
        <CalendarPage month="DECEMBER" circle={11} circleP={circle} style={{ left: 160, top: 690, transform: `rotate(${lerp(6, -2, cal)}deg)` }} />
      </div>
      {/* Venue card slides over the calendar */}
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          top: 1180,
          padding: "40px 44px",
          borderRadius: 40,
          background: "linear-gradient(170deg, #1a1a1a 0%, #0a0a0a 100%)",
          border: `3px solid ${GOLD}`,
          boxShadow: "0 50px 100px rgba(0,0,0,0.85)",
          fontFamily: FONT,
          display: "flex",
          alignItems: "center",
          gap: 34,
          opacity: venue,
          transform: `translateX(${(1 - venue) * 900}px)`,
        }}
      >
        <Pin size={110} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.18em", color: GOLD }}>VENUE</div>
          <div style={{ position: "relative", fontSize: 50, fontWeight: 800, color: WHITE, marginTop: 6 }}>
            Announcing soon<span style={{ opacity: Math.floor(t * 2) % 2 ? 0.2 : 1 }}>…</span>
          </div>
          <div style={{ fontSize: 32, color: MUTED, fontWeight: 600, marginTop: 8 }}>San Fernando, Pampanga</div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 52.1 – 61.2  Is this your opportunity?
// ---------------------------------------------------------------------------
export const Opportunity: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { icon: "trend", label: "Learn a new skill", at: 52.6 },
    { icon: "chart", label: "Grow professionally", at: 55.1 },
    { icon: "target", label: "Explore virtual assistance", at: 56.6 },
  ];
  const merge = inOut(prog(t, 59.3, 60.0));
  const spot = outBack(prog(t, 59.7, 60.4));
  return (
    <>
      <Backdrop glowY={1100} glow={0.35 + merge * 0.3} />
      <Dust t={t} n={30} o={0.4} />
      <Headline top={230} size={70} style={{ opacity: 1 - merge }}>
        <Words t={t} at={52.15} span={1.6} text="Looking for an opportunity to…" />
      </Headline>
      <Headline top={260} size={96} style={{ opacity: merge }}>
        <Words t={t} at={59.45} span={1.0} text="This could be your opportunity." gold={["your", "opportunity."]} />
      </Headline>
      {items.map((it, i) => {
        const p = outBack(prog(t, it.at, it.at + 0.5));
        const y = lerp(560 + i * 220, 1100, merge);
        return (
          <div
            key={it.label}
            style={{
              position: "absolute",
              left: 110,
              right: 110,
              top: y,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "34px 36px",
              borderRadius: 36,
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(214,167,67,0.35)",
              fontFamily: FONT,
              fontSize: 52,
              fontWeight: 700,
              color: WHITE,
              opacity: clamp(p) * (1 - merge),
              transform: `scale(${lerp(0.6, 1, clamp(p)) * lerp(1, 0.6, merge)})`,
            }}
          >
            <div style={{ width: 110, height: 110, borderRadius: 30, background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={it.icon} size={60} color={INK} stroke={2.2} />
            </div>
            {it.label}
          </div>
        );
      })}
      {/* Spotlight + doorway of light */}
      <div style={{ position: "absolute", left: 540 - 220, top: 760, width: 440, height: 720, borderRadius: "220px 220px 30px 30px", background: "linear-gradient(180deg, rgba(255,240,200,0.95), rgba(214,167,67,0.7) 60%, rgba(214,167,67,0.15))", boxShadow: "0 0 160px rgba(214,167,67,0.6)", opacity: clamp(spot), transform: `scaleY(${clamp(spot)})`, transformOrigin: "50% 100%" }} />
      <div style={{ position: "absolute", left: 540 - 90, top: 1060, opacity: clamp(spot), transform: `scale(${spot})` }}>
        <svg width="180" height="300" viewBox="0 0 180 300">
          <circle cx="90" cy="60" r="50" fill="#0b0b0b" />
          <path d="M 10 300 C 10 180, 40 130, 90 130 C 140 130, 170 180, 170 300 Z" fill="#0b0b0b" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, height: 100, background: "radial-gradient(ellipse at center, rgba(214,167,67,0.45), transparent 70%)", opacity: clamp(spot) }} />
    </>
  );
};

// ---------------------------------------------------------------------------
// 61.6 – 66  Save the date
// ---------------------------------------------------------------------------
export const SaveDate: React.FC<{ t: number }> = ({ t }) => {
  const stamp = prog(t, 61.7, 62.05);
  const date = prog(t, 62.85, 63.15);
  const shake = date > 0 && date < 1 ? Math.sin(t * 90) * 10 * (1 - date) : 0;
  return (
    <>
      <Backdrop glowY={1000} glow={0.5} />
      <Dust t={t} n={40} o={0.6} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <div
          style={{
            position: "absolute",
            top: 330,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 120,
            letterSpacing: "0.04em",
            color: WHITE,
            opacity: stamp,
            transform: `scale(${lerp(2.6, 1, outCubic(stamp))}) rotate(-4deg)`,
          }}
        >
          SAVE THE DATE
        </div>
        <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", opacity: date, transform: `scale(${lerp(3, 1, outCubic(date))})` }}>
          <div style={{ width: 600, borderRadius: 50, overflow: "hidden", boxShadow: "0 0 160px rgba(214,167,67,0.55), 0 60px 120px rgba(0,0,0,0.8)", fontFamily: FONT, textAlign: "center" }}>
            <div style={{ background: GOLD_GRADIENT, padding: "26px 0", fontSize: 64, fontWeight: 900, letterSpacing: "0.2em", color: INK }}>DEC</div>
            <div style={{ background: PAPER, padding: "10px 0 30px", fontSize: 330, fontWeight: 900, lineHeight: 1, color: INK, letterSpacing: "-0.04em" }}>11</div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", ...appear(t, 63.9, 0.5, 60) }}>
          <Pill solid style={{ fontSize: 50, padding: "30px 56px" }}>
            <Icon name="target" size={50} color={INK} stroke={2.4} />
            San Fernando, Pampanga
          </Pill>
        </div>
        <div style={{ position: "absolute", top: 1520, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 36, fontWeight: 600, color: MUTED, ...appear(t, 64.6, 0.5) }}>
          Virtual Assistant Training · Venue to be announced
        </div>
      </div>
      <Sparkle t={t} at={62.95} x={540} y={900} n={28} r={620} />
    </>
  );
};

// ---------------------------------------------------------------------------
// 66.2 – end  Closing with both partners
// ---------------------------------------------------------------------------
export const Closing: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 66.2, 66.9));
  return (
    <>
      <Backdrop glowY={800} glow={0.4 + 0.1 * Math.sin(t * 2)} />
      <Dust t={t} n={30} o={0.45} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 1.04, prog(t, 66, 73))})` }}>
        <LogoDisc size={300} style={{ left: 150, top: 480, transform: `scale(${pop})` }}>
          <Logo size={220} />
        </LogoDisc>
        <LogoDisc size={300} style={{ left: 630, top: 480, background: WHITE, transform: `scale(${pop})` }}>
          <Img src={staticFile("clasp.png")} style={{ width: 284, height: 284 }} />
        </LogoDisc>
        <div style={{ position: "absolute", left: 540 - 40, top: 590, fontFamily: FONT, fontSize: 80, fontWeight: 300, color: GOLD, opacity: clamp(pop) }}>×</div>
        <Headline top={900} size={76}>
          <Words t={t} at={66.25} span={1.6} text="We're excited to learn, grow, and serve the community with you." gold={["learn,", "grow,", "serve"]} />
        </Headline>
        <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", ...appear(t, 68.8, 0.5) }}>
          <Pill style={{ fontSize: 38, padding: "22px 44px" }}>
            <Icon name="calendar" size={42} color={GOLD_LIGHT} stroke={2.2} />
            <span>
              <Gold>Dec 11</Gold> · San Fernando, Pampanga
            </span>
          </Pill>
        </div>
        <div style={{ position: "absolute", top: 1480, width: "100%", textAlign: "center", ...appear(t, 69.4, 0.5) }}>
          <Pill solid style={{ fontSize: 40, padding: "26px 56px" }}>
            strategic-assistant.com
          </Pill>
        </div>
        <div style={{ position: "absolute", top: 1640, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 600, color: MUTED, ...appear(t, 70.0, 0.5) }}>
          Follow us for the venue announcement
        </div>
      </div>
    </>
  );
};

export const TrainingReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Sequence from={VO_START * fps}>
        <Audio src={staticFile("training-vo.mp3")} />
      </Sequence>
      <Scene t={t} from={0} to={6.1} kind="fade">
        <Hook t={t} />
      </Scene>
      <Scene t={t} from={6.55} to={12.9} kind="zoom">
        <Announce t={t} />
      </Scene>
      <Scene t={t} from={13.4} to={26.2} kind="slide">
        <Partnership t={t} />
      </Scene>
      <Scene t={t} from={26.7} to={31.45} kind="zoom">
        <Beyond t={t} />
      </Scene>
      <Scene t={t} from={31.85} to={39.85} kind="rise">
        <Pillars t={t} />
      </Scene>
      <Scene t={t} from={40.35} to={44.0} kind="fade">
        <Action t={t} />
      </Scene>
      <Scene t={t} from={44.45} to={51.6} kind="slide">
        <Dec11 t={t} />
      </Scene>
      <Scene t={t} from={52.05} to={61.15} kind="zoom">
        <Opportunity t={t} />
      </Scene>
      <Scene t={t} from={61.6} to={65.8} kind="zoom">
        <SaveDate t={t} />
      </Scene>
      <Scene t={t} from={66.15} to={TRAINING_SECONDS + 1} kind="fade">
        <Closing t={t} />
      </Scene>
      {[6.55, 13.4, 26.7, 31.85, 44.45, 52.05, 61.6, 66.15].map((at) => (
        <LightSweep key={at} t={t} at={at} />
      ))}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, TRAINING_SECONDS - 0.6, TRAINING_SECONDS) }} />
    </AbsoluteFill>
  );
};

export const TrainingThumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Backdrop glowY={1000} glow={0.5} />
    <Dust t={3} n={40} o={0.6} />
    <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center" }}>
      <Pill style={{ fontSize: 34, letterSpacing: "0.2em", fontWeight: 700, padding: "16px 36px" }}>
        <Gold>SAVE THE DATE</Gold>
      </Pill>
    </div>
    <Headline top={290} size={100}>
      VA Training <Gold>in Pampanga</Gold>
    </Headline>
    <div style={{ position: "absolute", top: 720, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 520, borderRadius: 46, overflow: "hidden", boxShadow: "0 0 160px rgba(214,167,67,0.55), 0 60px 120px rgba(0,0,0,0.8)", fontFamily: FONT, textAlign: "center", transform: "rotate(-4deg)" }}>
        <div style={{ background: GOLD_GRADIENT, padding: "22px 0", fontSize: 56, fontWeight: 900, letterSpacing: "0.2em", color: INK }}>DEC</div>
        <div style={{ background: PAPER, padding: "6px 0 24px", fontSize: 290, fontWeight: 900, lineHeight: 1, color: INK, letterSpacing: "-0.04em" }}>11</div>
      </div>
    </div>
    <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center" }}>
      <Pill solid style={{ fontSize: 44, padding: "26px 50px" }}>
        San Fernando, Pampanga
      </Pill>
    </div>
    <div style={{ position: "absolute", bottom: 110, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
      <Logo size={130} />
      <div style={{ fontFamily: FONT, fontSize: 60, fontWeight: 300, color: GOLD }}>×</div>
      <div style={{ width: 130, height: 130, borderRadius: "50%", overflow: "hidden", background: WHITE, border: `3px solid ${GOLD}` }}>
        <Img src={staticFile("clasp.png")} style={{ width: 124, height: 124 }} />
      </div>
    </div>
  </AbsoluteFill>
);
