import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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

// Cue times (seconds) come from the pauses in benefits-vo.mp3.
export const BENEFITS_SECONDS = 72;
const INK = "#111111";
const PAPER = "#F6F3EE";

const Scene: React.FC<{ t: number; from: number; to: number; children: React.ReactNode }> = ({ t, from, to, children }) => {
  if (t < from - 0.01 || t > to + 0.35) return null;
  const inP = outCubic(prog(t, from, from + 0.35));
  const outP = 1 - prog(t, to, to + 0.35);
  const o = Math.min(inP, outP);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        transform: `scale(${lerp(1.04, 1, inP) * lerp(0.97, 1, outP)})`,
        filter: o < 1 ? `blur(${(1 - o) * 12}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Icons not in the shared set.
const GLYPHS: Record<string, React.ReactNode> = {
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  shieldCheck: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4" />,
  piggy: <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5zM2 9v1c0 1.1.9 2 2 2h1M16 11h.01" />,
  house: <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  cross: <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />,
  star: <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  handshake: <path d="m11 17 2 2a1 1 0 1 0 3-3M14 14l2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4M21 3l1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8" />,
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  sprout: <path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
};

const Glyph: React.FC<{ name: string; size?: number; color?: string; stroke?: number }> = ({ name, size = 48, color = WHITE, stroke = 1.9 }) =>
  GLYPHS[name] ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {GLYPHS[name]}
    </svg>
  ) : (
    <Icon name={name} size={size} color={color} stroke={stroke} />
  );

const GoldTile: React.FC<{ icon: string; size: number; style?: React.CSSProperties; dark?: boolean }> = ({ icon, size, style, dark }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: dark ? "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 100%)" : GOLD_GRADIENT,
      border: dark ? "2px solid rgba(214,167,67,0.35)" : "none",
      boxShadow: dark ? "0 20px 40px rgba(0,0,0,0.6)" : "0 0 60px rgba(214,167,67,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style,
    }}
  >
    <Glyph name={icon} size={size * 0.5} color={dark ? GOLD_LIGHT : INK} stroke={2.1} />
  </div>
);

// White card holding an agency logo, so the logos stay true to their colours.
const LogoCard: React.FC<{ src: string; name: string; w: number; h: number; style?: React.CSSProperties }> = ({ src, name, w, h, style }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: h,
      borderRadius: 36,
      background: WHITE,
      boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 3px rgba(214,167,67,0.55)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      padding: 30,
      boxSizing: "border-box",
      ...style,
    }}
  >
    <Img src={staticFile(src)} alt={name} style={{ maxWidth: w - 70, maxHeight: h - 70, objectFit: "contain" }} />
  </div>
);

const Avatar: React.FC<{ size: number; label?: string; gold?: boolean; style?: React.CSSProperties }> = ({ size, label = "", gold, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: gold ? GOLD_GRADIENT : "linear-gradient(160deg, #2c2c2c, #151515)",
      border: gold ? "none" : "2px solid rgba(214,167,67,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.3,
      color: gold ? INK : GOLD_LIGHT,
      ...style,
    }}
  >
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// 0 – 10.4  Hook: not just a job / a company that cares
// ---------------------------------------------------------------------------
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const swap = prog(t, 3.9, 4.3);
  const strike = outCubic(prog(t, 2.7, 3.3));
  const cares = [
    { icon: "sprout", label: "Your future", at: 6.1, a: -150 },
    { icon: "heart", label: "Your health", at: 7.85, a: -30 },
    { icon: "smile", label: "Your well-being", at: 8.75, a: 90 },
  ];
  return (
    <>
      <Backdrop glowY={1050} glow={0.4} />
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", opacity: 1 - swap }}>
        <Pill style={{ fontSize: 34, letterSpacing: "0.2em", fontWeight: 700, padding: "16px 36px" }}>
          <Gold>LIFE AT SAS</Gold>
        </Pill>
      </div>
      <Headline top={350} size={90} style={{ opacity: 1 - swap }}>
        <span style={appear(t, 0, 0.01)}>Being a VA is not just about</span>{" "}
        <span style={{ position: "relative", display: "inline-block", ...appear(t, 1.6, 0.4, 24) }}>
          having a job.
          <span style={{ position: "absolute", left: -6, top: "54%", height: 10, borderRadius: 5, width: `calc(${strike * 100}% + 12px)`, background: GOLD_GRADIENT }} />
        </span>
      </Headline>
      <Headline top={300} size={74} style={{ opacity: swap }}>
        <Words t={t} at={4.15} span={1.6} text="It's having a company that cares about" gold={["cares"]} />
      </Headline>
      {/* Job offer letter that gets upgraded */}
      <div
        style={{
          position: "absolute",
          left: 540 - 230,
          top: 900,
          width: 460,
          height: 560,
          borderRadius: 30,
          background: PAPER,
          boxShadow: "0 50px 100px rgba(0,0,0,0.7)",
          padding: 44,
          boxSizing: "border-box",
          fontFamily: FONT,
          transform: `translateY(${(1 - outCubic(prog(t, 0.2, 1.0))) * 500 + swap * 900}px) rotate(${lerp(-8, -3, prog(t, 0.2, 1))}deg)`,
          opacity: 1 - swap,
        }}
      >
        <GoldTile icon="briefcase" size={100} />
        <div style={{ fontSize: 44, fontWeight: 800, color: INK, margin: "30px 0 26px" }}>Job offer</div>
        {[100, 92, 96, 60].map((w, i) => (
          <div key={i} style={{ height: 16, width: `${w}%`, borderRadius: 8, background: "#DDD6CB", marginBottom: 18 }} />
        ))}
      </div>
      {/* "Cares about" orbit around the SAS logo */}
      <div style={{ position: "absolute", left: 540 - 150, top: 1000, opacity: swap, transform: `scale(${outBack(prog(t, 4.2, 4.9))})` }}>
        <Logo size={300} />
      </div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: swap }}>
        <circle cx="540" cy="1150" r="330" stroke="rgba(214,167,67,0.25)" strokeWidth="3" fill="none" strokeDasharray="10 14" strokeDashoffset={-t * 30} />
      </svg>
      {cares.map((c) => {
        const p = outBack(prog(t, c.at - 0.15, c.at + 0.35));
        const a = ((c.a + (t - 6) * 6) * Math.PI) / 180;
        const x = 540 + Math.cos(a) * 330;
        const y = 1150 + Math.sin(a) * 330;
        return (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: x - 140,
              top: y - 90,
              width: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              opacity: clamp(p),
              transform: `scale(${p})`,
            }}
          >
            <GoldTile icon={c.icon} size={130} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: WHITE, whiteSpace: "nowrap" }}>{c.label}</div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// 10.5 – 15.7  More than just a paycheck (payslip)
// ---------------------------------------------------------------------------
const Paycheck: React.FC<{ t: number }> = ({ t }) => {
  const slip = outCubic(prog(t, 10.6, 11.4));
  const extra = [
    { k: "Government benefits", at: 13.2 },
    { k: "HMO coverage*", at: 13.8 },
    { k: "A team that cares", at: 14.4 },
  ];
  return (
    <>
      <Backdrop glowY={1100} glow={0.4} />
      <Headline top={250} size={78}>
        <Words t={t} at={10.55} span={1.6} text="At SAS, our VAs deserve" gold={["SAS,"]} />{" "}
        <Words t={t} at={12.4} span={1.2} text="more than just a paycheck." gold={["more"]} />
      </Headline>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 700,
          borderRadius: 34,
          background: PAPER,
          padding: "44px 48px",
          fontFamily: FONT,
          color: INK,
          boxShadow: "0 60px 120px rgba(0,0,0,0.75), 0 0 0 3px rgba(214,167,67,0.4)",
          transform: `translateY(${(1 - slip) * 700}px) rotate(${lerp(6, 0, slip)}deg)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#8a8580", letterSpacing: "0.14em" }}>PAYSLIP</div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>SAS Team Member</div>
          </div>
          <div style={{ background: INK, borderRadius: 20, padding: 10 }}>
            <Logo size={80} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "24px 0", borderTop: "2px solid #E2DDD5", fontSize: 36, fontWeight: 600 }}>
          <span>Paycheck</span>
          <Icon name="check" size={44} color="#9A6A1E" stroke={3} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#9A6A1E", letterSpacing: "0.14em", margin: "20px 0 6px", ...appear(t, 12.9, 0.4, 10) }}>
          + MORE
        </div>
        {extra.map((e) => (
          <div
            key={e.k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "22px 0",
              borderTop: "2px solid #E2DDD5",
              fontSize: 36,
              fontWeight: 600,
              ...appear(t, e.at, 0.4, 16),
            }}
          >
            <span>{e.k}</span>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${outBack(prog(t, e.at + 0.2, e.at + 0.6))})` }}>
              <Icon name="check" size={34} color={INK} stroke={3.2} />
            </div>
          </div>
        ))}
        <div style={{ fontSize: 22, color: "#8a8580", marginTop: 10, ...appear(t, 14.6, 0.4, 10) }}>*After one year, for eligible team members</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 16.3 – 23.5  SSS, PhilHealth, Pag-IBIG cards
// ---------------------------------------------------------------------------
const AGENCIES = [
  { src: "sss.png", name: "SSS", at: 20.6, x: 540, rot: -7, dx: -340 },
  { src: "philhealth.png", name: "PhilHealth", at: 21.6, x: 540, rot: 0, dx: 0 },
  { src: "pagibig.png", name: "Pag-IBIG", at: 22.5, x: 540, rot: 7, dx: 340 },
];

const Agencies: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Backdrop glowY={1150} glow={0.45} />
    <Headline top={230} size={74}>
      <Words t={t} at={16.3} span={2.2} text="Our team members have access to important" />{" "}
      <Words t={t} at={18.6} span={1.2} text="government benefits," gold={["government", "benefits,"]} />
    </Headline>
    <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 44, fontWeight: 600, color: MUTED, ...appear(t, 20.2, 0.4) }}>
      including
    </div>
    {AGENCIES.map((a, i) => {
      const p = outBack(prog(t, a.at - 0.1, a.at + 0.5));
      const fan = inOut(prog(t, 22.9, 23.4));
      return (
        <LogoCard
          key={a.name}
          src={a.src}
          name={a.name}
          w={320}
          h={400}
          style={{
            left: 540 - 160 + a.dx * lerp(1, 0.95, fan),
            top: 900 + (i === 1 ? -40 : 30),
            zIndex: i === 1 ? 2 : 1,
            opacity: clamp(p * 1.5),
            transform: `translateY(${(1 - clamp(p)) * 600}px) rotate(${a.rot * clamp(p)}deg) scale(${lerp(0.7, 1, clamp(p))})`,
          }}
        />
      );
    })}
  </>
);

// ---------------------------------------------------------------------------
// 24.2 – 31.9  Areas of life
// ---------------------------------------------------------------------------
const AREAS = [
  { icon: "shieldCheck", label: "Social security", logo: "sss.png", at: 28.0 },
  { icon: "cross", label: "Healthcare", logo: "philhealth.png", at: 29.0 },
  { icon: "piggy", label: "Savings", logo: "pagibig.png", at: 30.1 },
  { icon: "house", label: "Housing", logo: "pagibig.png", at: 30.9 },
];

const Areas: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Backdrop />
    <Headline top={230} size={74}>
      <Words t={t} at={24.2} span={2.0} text="Support for different areas of life" gold={["areas", "of", "life"]} />
    </Headline>
    <div style={{ position: "absolute", top: 640, left: 90, right: 90, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      {AREAS.map((a) => {
        const p = outBack(prog(t, a.at - 0.15, a.at + 0.35));
        return (
          <div
            key={a.label}
            style={{
              position: "relative",
              height: 420,
              borderRadius: 40,
              background: "linear-gradient(170deg, #171717 0%, #0a0a0a 100%)",
              border: "2px solid rgba(214,167,67,0.35)",
              boxShadow: p > 0.9 ? "0 0 60px rgba(214,167,67,0.18)" : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 30,
              opacity: clamp(p * 1.4),
              transform: `scale(${lerp(0.7, 1, p)}) rotateY(${(1 - clamp(p)) * 70}deg)`,
            }}
          >
            <GoldTile icon={a.icon} size={150} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 42, color: WHITE }}>{a.label}</div>
            <div style={{ position: "absolute", top: 22, right: 22, width: 86, height: 86, borderRadius: 20, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", padding: 8, boxSizing: "border-box" }}>
              <Img src={staticFile(a.logo)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
          </div>
        );
      })}
    </div>
  </>
);

// ---------------------------------------------------------------------------
// 32.4 – 40.1  We don't stop there → 1 year → HMO card
// ---------------------------------------------------------------------------
const Hmo: React.FC<{ t: number }> = ({ t }) => {
  const year = outCubic(prog(t, 34.6, 36.4));
  const toCard = inOut(prog(t, 36.6, 37.3));
  const card = outBack(prog(t, 37.0, 37.8));
  const flip = lerp(-90, 0, outCubic(prog(t, 37.0, 37.9)));
  const shine = prog(t, 38.3, 39.4);
  return (
    <>
      <Backdrop glowY={1100} glow={0.45} />
      <Headline top={300} size={100} style={{ opacity: 1 - prog(t, 34.2, 34.5) }}>
        <Words t={t} at={32.45} span={1.2} text="And we don't stop there." gold={["stop", "there."]} />
      </Headline>
      <Headline top={230} size={70} style={{ opacity: prog(t, 34.4, 34.7) * (1 - toCard) }}>
        <Words t={t} at={34.5} span={1.6} text="After completing one year with SAS," gold={["one", "year"]} />
      </Headline>
      <Headline top={230} size={70} style={{ opacity: toCard }}>
        <Words t={t} at={36.8} span={1.4} text="eligible team members can receive" />{" "}
        <Words t={t} at={38.6} span={0.9} text="HMO coverage." gold={["HMO", "coverage."]} />
      </Headline>
      {/* Benefits stack with a gold "+" for what's next */}
      <div style={{ position: "absolute", top: 760, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 24, opacity: 1 - prog(t, 34.2, 34.5) }}>
        {["sss.png", "philhealth.png", "pagibig.png"].map((src, i) => (
          <div key={src} style={{ width: 190, height: 190, borderRadius: 36, background: WHITE, padding: 20, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", ...appear(t, 32.5 + i * 0.12, 0.4, 30) }}>
            <Img src={staticFile(src)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 540 - 110, top: 1080, opacity: 1 - prog(t, 34.2, 34.5), transform: `scale(${outBack(prog(t, 33.2, 33.7)) * (1 + 0.05 * Math.sin(t * 8))})` }}>
        <div style={{ width: 220, height: 220, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 80px rgba(214,167,67,0.5)", fontFamily: FONT, fontWeight: 300, fontSize: 200, lineHeight: 1, color: INK, paddingBottom: 18, boxSizing: "border-box" }}>+</div>
      </div>
      {/* 12-month ring */}
      <div style={{ position: "absolute", left: 540 - 300, top: 760, width: 600, height: 600, opacity: prog(t, 34.4, 34.8) * (1 - toCard), transform: `scale(${1 - toCard * 0.3})` }}>
        <svg width="600" height="600" viewBox="0 0 600 600">
          {Array.from({ length: 12 }).map((_, i) => {
            const on = year * 12 > i;
            const a0 = ((i * 30 - 90 + 2) * Math.PI) / 180;
            const a1 = (((i + 1) * 30 - 90 - 2) * Math.PI) / 180;
            const r = 260;
            return (
              <path
                key={i}
                d={`M ${300 + Math.cos(a0) * r} ${300 + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${300 + Math.cos(a1) * r} ${300 + Math.sin(a1) * r}`}
                stroke={on ? GOLD : "rgba(255,255,255,0.1)"}
                strokeWidth="34"
                fill="none"
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
          <div style={{ fontSize: 180, fontWeight: 800, color: WHITE, lineHeight: 1 }}>{Math.max(1, Math.ceil(year * 12))}</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: MUTED, marginTop: 10 }}>{year >= 1 ? <Gold>1 year with SAS</Gold> : "months"}</div>
        </div>
      </div>
      {/* HMO membership card */}
      <div style={{ position: "absolute", inset: 0, perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 820,
            width: 880,
            height: 540,
            borderRadius: 44,
            overflow: "hidden",
            background: "linear-gradient(135deg, #2a2112 0%, #0d0b07 55%, #1c160c 100%)",
            border: `3px solid ${GOLD}`,
            boxShadow: "0 60px 120px rgba(0,0,0,0.8), 0 0 120px rgba(214,167,67,0.3)",
            fontFamily: FONT,
            padding: 50,
            boxSizing: "border-box",
            opacity: clamp(card * 1.5),
            transform: `rotateY(${flip}deg) rotateX(${Math.sin(t * 1.2) * 4}deg) scale(${lerp(0.8, 1, clamp(card))})`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.2em", color: GOLD }}>HEALTH CARD</div>
              <div style={{ fontSize: 76, fontWeight: 900, color: WHITE, marginTop: 8 }}>HMO</div>
              <div style={{ fontSize: 34, fontWeight: 600, color: "#d8cdb8" }}>Coverage</div>
            </div>
            <Logo size={150} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 60, alignItems: "center" }}>
            <GoldTile icon="heart" size={90} />
            <div>
              <div style={{ fontSize: 24, color: MUTED, fontWeight: 600, letterSpacing: "0.12em" }}>MEMBER</div>
              <div style={{ fontSize: 36, color: WHITE, fontWeight: 700 }}>SAS Team Member</div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(110deg, transparent ${lerp(-30, 130, shine) - 12}%, rgba(255,240,200,0.35) ${lerp(-30, 130, shine)}%, transparent ${lerp(-30, 130, shine) + 12}%)`,
            }}
          />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 30, color: MUTED, fontWeight: 500, ...appear(t, 38.8, 0.4) }}>
        For eligible team members after one year
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 40.5 – 49  You take care of clients… we take care of your health
// ---------------------------------------------------------------------------
const CareForYou: React.FC<{ t: number }> = ({ t }) => {
  const swap = inOut(prog(t, 45.7, 46.2));
  const tasks = [
    { icon: "users", label: "Taking care of clients", at: 41.0 },
    { icon: "clock", label: "Meeting deadlines", at: 42.9 },
    { icon: "trend", label: "Helping businesses grow", at: 44.1 },
  ];
  const heart = outBack(prog(t, 46.2, 46.9));
  const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 7));
  return (
    <>
      <Backdrop glowY={1150} glow={0.35 + swap * 0.2} />
      <Headline top={230} size={74} style={{ opacity: 1 - swap }}>
        <Words t={t} at={40.6} span={1.0} text="When you're busy…" />
      </Headline>
      <Headline top={230} size={74} style={{ opacity: swap }}>
        <Words t={t} at={46.05} span={1.6} text="you deserve support for your own health too." gold={["your", "own", "health"]} />
      </Headline>
      {/* VA at the centre of their workload */}
      <div style={{ position: "absolute", left: 540 - 110, top: 1180, transform: `scale(${1 - swap * 0.1})` }}>
        <Avatar size={220} label="VA" gold />
      </div>
      {tasks.map((task, i) => {
        const p = outCubic(prog(t, task.at - 0.1, task.at + 0.4));
        return (
          <div
            key={task.label}
            style={{
              position: "absolute",
              left: 110,
              right: 110,
              top: 520 + i * 170,
              display: "flex",
              alignItems: "center",
              gap: 28,
              padding: "26px 32px",
              borderRadius: 32,
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.08)",
              fontFamily: FONT,
              fontSize: 44,
              fontWeight: 600,
              color: WHITE,
              opacity: p * (1 - swap),
              transform: `translateX(${(1 - p) * (i % 2 ? 140 : -140)}px)`,
            }}
          >
            <GoldTile icon={task.icon} size={90} dark />
            {task.label}
          </div>
        );
      })}
      {/* Heart shield wraps the VA */}
      <div style={{ position: "absolute", left: 540 - 260, top: 1290 - 260 - 30, width: 520, height: 520, opacity: clamp(heart), transform: `scale(${heart * beat})` }}>
        <svg width="520" height="520" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="0.5" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" fill="rgba(214,167,67,0.08)" />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 540 - 70, top: 840, opacity: clamp(heart), transform: `scale(${heart * beat})` }}>
        <GoldTile icon="heart" size={140} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 49.7 – 58.3  Secure, supported, valued → SAS family
// ---------------------------------------------------------------------------
const Family: React.FC<{ t: number }> = ({ t }) => {
  const values = [
    { icon: "lock", label: "Secure", at: 52.1 },
    { icon: "handshake", label: "Supported", at: 52.9 },
    { icon: "star", label: "Valued", at: 53.7 },
  ];
  const fam = inOut(prog(t, 54.9, 55.5));
  const ring = outCubic(prog(t, 56.4, 57.6));
  return (
    <>
      <Backdrop glowY={1100} glow={0.4} />
      <Headline top={230} size={74} style={{ opacity: 1 - fam }}>
        <Words t={t} at={49.75} span={2.0} text="At SAS, we want our VAs to feel" gold={["SAS,"]} />
      </Headline>
      <Headline top={230} size={74} style={{ opacity: fam }}>
        <Words t={t} at={54.95} span={1.2} text="Not just as employees," />{" "}
        <Words t={t} at={56.45} span={1.5} text="but as part of the SAS family." gold={["SAS", "family."]} />
      </Headline>
      <div style={{ position: "absolute", top: 640, left: 90, right: 90, display: "flex", justifyContent: "space-between", opacity: 1 - fam }}>
        {values.map((v) => {
          const p = outBack(prog(t, v.at - 0.15, v.at + 0.35));
          return (
            <div key={v.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: clamp(p), transform: `scale(${p}) translateY(${(1 - clamp(p)) * 60}px)` }}>
              <GoldTile icon={v.icon} size={220} />
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: WHITE }}>{v.label}</div>
            </div>
          );
        })}
      </div>
      {/* Employee badge that becomes a family circle */}
      <div
        style={{
          position: "absolute",
          left: 540 - 220,
          top: 1120,
          width: 440,
          padding: "26px 0",
          borderRadius: 999,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: "0.1em",
          color: MUTED,
          border: "2px solid rgba(255,255,255,0.2)",
          opacity: fam * (1 - ring),
        }}
      >
        <span style={{ position: "relative" }}>
          EMPLOYEE #0427
          <span style={{ position: "absolute", left: -8, top: "50%", height: 6, borderRadius: 3, width: `calc(${outCubic(prog(t, 55.9, 56.4)) * 100}% + 16px)`, background: GOLD_GRADIENT }} />
        </span>
      </div>
      <div style={{ position: "absolute", left: 540 - 150, top: 1020, width: 300, height: 300, opacity: ring, transform: `scale(${lerp(0.5, 1, ring)})` }}>
        <Logo size={300} />
      </div>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + t * 0.15;
        const r = lerp(0, 370, ring);
        return (
          <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 60, top: 1170 + Math.sin(a) * r - 60, opacity: ring }}>
            <Avatar size={120} gold={i === 0} label={i === 0 ? "YOU" : ""} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// 58.9 – 66.1  Your work matters, your well-being matters too
// ---------------------------------------------------------------------------
const Matters: React.FC<{ t: number }> = ({ t }) => {
  const balance = Math.sin(clamp((t - 62.4) / 1.2) * Math.PI * 2) * (1 - prog(t, 62.4, 63.8)) * 8;
  const swap = inOut(prog(t, 64.3, 64.7));
  const rows = [
    { icon: "briefcase", label: "Your work", at: 61.0 },
    { icon: "heart", label: "Your well-being", at: 62.5 },
  ];
  return (
    <>
      <Backdrop glowY={1100} glow={0.4} />
      <Headline top={230} size={72} style={{ opacity: 1 - swap }}>
        <Words t={t} at={58.95} span={1.8} text="Looking for a VA career where" />
      </Headline>
      <Headline top={260} size={96} style={{ opacity: swap }}>
        <Words t={t} at={64.45} span={1.2} text="SAS may be the place for you." gold={["place", "for", "you."]} />
      </Headline>
      {/* Balance scale */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
        <div style={{ position: "absolute", left: 540 - 8, top: 900, width: 16, height: 520, borderRadius: 8, background: GOLD_GRADIENT }} />
        <div style={{ position: "absolute", left: 540 - 140, top: 1400, width: 280, height: 26, borderRadius: 13, background: GOLD_GRADIENT }} />
        <div style={{ position: "absolute", left: 140, top: 880, width: 800, height: 16, borderRadius: 8, background: GOLD_GRADIENT, transform: `rotate(${balance}deg)` }} />
        {rows.map((r, i) => {
          const p = outBack(prog(t, r.at - 0.1, r.at + 0.4));
          const side = i === 0 ? -1 : 1;
          const dy = side * Math.sin((balance * Math.PI) / 180) * 400;
          return (
            <div
              key={r.label}
              style={{
                position: "absolute",
                left: 540 + side * 280 - 170,
                top: 960 + dy,
                width: 340,
                padding: "34px 0",
                borderRadius: 40,
                background: "linear-gradient(170deg, #171717 0%, #0a0a0a 100%)",
                border: `2px solid ${GOLD}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                fontFamily: FONT,
                opacity: clamp(p),
                transform: `scale(${p})`,
              }}
            >
              <GoldTile icon={r.icon} size={130} />
              <div style={{ fontSize: 40, fontWeight: 700, color: WHITE }}>{r.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                <Gold>{i === 0 ? "matters" : "matters too"}</Gold>
              </div>
            </div>
          );
        })}
      </div>
      {/* Logo spotlight for "the place for you" */}
      <div style={{ position: "absolute", left: 540 - 260, top: 820, opacity: swap, transform: `scale(${outBack(prog(t, 64.4, 65.1))})` }}>
        <Logo size={520} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 66.5 – end  Join the SAS family
// ---------------------------------------------------------------------------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 66.5, 67.2));
  return (
    <>
      <Backdrop glowY={760} glow={0.4 + 0.1 * Math.sin(t * 2)} />
      <div style={{ position: "absolute", left: 540 - 240, top: 440, transform: `scale(${pop})`, opacity: clamp(pop) }}>
        <Logo size={480} />
      </div>
      <div style={{ position: "absolute", top: 960, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 36, letterSpacing: "0.2em", color: WHITE, ...appear(t, 66.7, 0.5) }}>
        STRATEGIC ASSISTANT STAFFING
      </div>
      <Headline top={1060} size={86}>
        <Words t={t} at={66.6} span={1.2} text="Join the SAS family" gold={["SAS", "family"]} />
        <br />
        <Words t={t} at={68.0} span={0.8} text="and grow with us." />
      </Headline>
      <div style={{ position: "absolute", top: 1360, width: "100%", display: "flex", justifyContent: "center", gap: 22, ...appear(t, 68.6, 0.5) }}>
        {["sss.png", "philhealth.png", "pagibig.png"].map((s) => (
          <div key={s} style={{ width: 120, height: 120, borderRadius: 26, background: WHITE, padding: 14, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(s)} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ))}
        <div style={{ width: 120, height: 120, borderRadius: 26, background: GOLD_GRADIENT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 32, color: INK }}>
          HMO
        </div>
      </div>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", ...appear(t, 69.0, 0.5) }}>
        <Pill solid style={{ fontSize: 42, padding: "28px 60px" }}>
          strategic-assistant.com
        </Pill>
      </div>
    </>
  );
};

export const BenefitsReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Audio src={staticFile("benefits-vo.mp3")} />
      <Scene t={t} from={0} to={10.2}>
        <Hook t={t} />
      </Scene>
      <Scene t={t} from={10.45} to={15.65}>
        <Paycheck t={t} />
      </Scene>
      <Scene t={t} from={16.2} to={23.6}>
        <Agencies t={t} />
      </Scene>
      <Scene t={t} from={24.1} to={31.95}>
        <Areas t={t} />
      </Scene>
      <Scene t={t} from={32.35} to={40.1}>
        <Hmo t={t} />
      </Scene>
      <Scene t={t} from={40.5} to={48.9}>
        <CareForYou t={t} />
      </Scene>
      <Scene t={t} from={49.6} to={58.3}>
        <Family t={t} />
      </Scene>
      <Scene t={t} from={58.85} to={66.1}>
        <Matters t={t} />
      </Scene>
      <Scene t={t} from={66.5} to={BENEFITS_SECONDS + 1}>
        <EndCard t={t} />
      </Scene>
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, BENEFITS_SECONDS - 0.6, BENEFITS_SECONDS) }} />
    </AbsoluteFill>
  );
};

export const BenefitsThumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Backdrop glowY={1150} glow={0.5} />
    <div style={{ position: "absolute", top: 180, width: "100%", textAlign: "center" }}>
      <Pill style={{ fontSize: 36, letterSpacing: "0.2em", fontWeight: 700, padding: "16px 36px" }}>
        <Gold>LIFE AT SAS</Gold>
      </Pill>
    </div>
    <Headline top={300} size={104}>
      More than <Gold>just a paycheck.</Gold>
    </Headline>
    {AGENCIES.map((a, i) => (
      <LogoCard
        key={a.name}
        src={a.src}
        name={a.name}
        w={320}
        h={400}
        style={{ left: 540 - 160 + a.dx, top: 800 + (i === 1 ? -40 : 30), zIndex: i === 1 ? 2 : 1, transform: `rotate(${a.rot}deg)` }}
      />
    ))}
    <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", zIndex: 3 }}>
      <Pill solid style={{ fontSize: 48, padding: "28px 56px", transform: "rotate(-3deg)" }}>
        <Glyph name="heart" size={48} color={INK} stroke={2.4} />+ HMO after 1 year
      </Pill>
    </div>
    <div style={{ position: "absolute", bottom: 110, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Logo size={110} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, letterSpacing: "0.2em", color: WHITE }}>STRATEGIC ASSISTANT STAFFING</div>
    </div>
  </AbsoluteFill>
);
