import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { clamp, FONT, Gold, GOLD, GOLD_GRADIENT, GOLD_LIGHT, inOut, lerp, Logo, MUTED, outBack, outCubic, prog, WHITE } from "./brand";

// 16:9 pre-show motion graphic for SAS Empowerment Live.
// Cues are voiceover times (empowerment-vo.mp3 pauses); c() adds the lead-in.
const LEAD = 1.5;
const c = (a: number) => a + LEAD;
export const EMPOWER_SECONDS = 112;
export const W = 1920;
export const H = 1080;

const SERIF = '"Cormorant Garamond", Georgia, serif';
const INK = "#111111";

for (const weight of ["500", "600", "700"]) {
  for (const style of ["normal", "italic"]) {
    loadFont({
      family: "Cormorant Garamond",
      url: staticFile(`fonts/cormorant-garamond-latin-${weight}-${style}.woff2`),
      weight,
      style,
    });
  }
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------
const rise = (t: number, at: number, dur = 0.6, dist = 40): React.CSSProperties => {
  const p = outCubic(prog(t, at, at + dur));
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)`, filter: `blur(${(1 - p) * 8}px)` };
};

// Words that fade up one after another.
const Reveal: React.FC<{ t: number; at: number; span: number; text: string; gold?: string[]; italic?: boolean }> = ({ t, at, span, text, gold = [], italic }) => {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => {
        const s = at + (span * i) / words.length;
        const isGold = gold.includes(w.replace(/[.,:;?!…"“”]/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", fontStyle: italic ? "italic" : undefined, ...rise(t, s, 0.5, 20) }}>
            {isGold ? <Gold>{w}</Gold> : w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
};

const Scene: React.FC<{ t: number; from: number; to: number; children: React.ReactNode }> = ({ t, from, to, children }) => {
  if (t < from - 0.01 || t > to + 0.6) return null;
  const inP = outCubic(prog(t, from, from + 0.6));
  const outP = 1 - inOut(prog(t, to, to + 0.6));
  const o = Math.min(inP, outP);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${lerp(1.03, 1, inP) * lerp(1.04, 1, outP)})`, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

// Warm, slowly moving light: base glow, two drifting beams and bokeh.
const Atmosphere: React.FC<{ t: number }> = ({ t }) => {
  const gx = 960 + Math.sin(t * 0.15) * 260;
  const gy = 540 + Math.cos(t * 0.11) * 120;
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 900px 620px at ${gx}px ${gy}px, rgba(120,84,24,0.38) 0%, rgba(0,0,0,0) 70%)` }} />
      {[0, 1].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: -400 + k * 900 + Math.sin(t * 0.2 + k) * 120,
            top: -300,
            width: 420,
            height: 1800,
            background: "linear-gradient(90deg, rgba(247,215,116,0) 0%, rgba(247,215,116,0.07) 50%, rgba(247,215,116,0) 100%)",
            transform: `rotate(${28 + k * 6}deg)`,
            filter: "blur(20px)",
          }}
        />
      ))}
      {Array.from({ length: 34 }).map((_, i) => {
        const seed = Math.sin(i * 77.3) * 10000;
        const r = seed - Math.floor(seed);
        const x = (i * 211.7 + Math.sin(t * 0.3 + i) * 30) % W;
        const y = (H + ((r * H - t * (8 + r * 18)) % H)) % H;
        const s = 6 + r * 34;
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
              background: `radial-gradient(circle, rgba(247,215,116,${0.35 + r * 0.3}) 0%, rgba(247,215,116,0) 70%)`,
              opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * (0.4 + r * 0.6) + i)),
            }}
          />
        );
      })}
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

const LiveBadge: React.FC<{ t: number; size?: number }> = ({ t, size = 30 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999, background: "rgba(229,72,77,0.14)", border: "2px solid rgba(229,72,77,0.6)", fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: "0.2em", color: "#ff6b6f" }}>
    <span style={{ width: size * 0.5, height: size * 0.5, borderRadius: "50%", background: "#E5484D", boxShadow: `0 0 ${12 + 10 * Math.sin(t * 5)}px #E5484D`, opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 3)) }} />
    LIVE
  </div>
);

const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: "0.32em", color: GOLD, ...style }}>{children}</div>
);

const GLYPHS: Record<string, React.ReactNode> = {
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  book: <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />,
  headphones: <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />,
  sprout: <path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />,
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  eye: (
    <>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  hands: <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14M7 18l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 13l6 6" />,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
};

const Glyph: React.FC<{ name: string; size: number; color?: string; stroke?: number }> = ({ name, size, color = INK, stroke = 1.9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {GLYPHS[name]}
  </svg>
);

const GoldDisc: React.FC<{ icon: string; size: number; style?: React.CSSProperties }> = ({ icon, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(214,167,67,0.4)", flexShrink: 0, ...style }}>
    <Glyph name={icon} size={size * 0.48} color={INK} stroke={2} />
  </div>
);

// A soft cross of light.
const LightCross: React.FC<{ size: number; o: number }> = ({ size, o }) => (
  <div style={{ position: "relative", width: size, height: size * 1.3, opacity: o }}>
    <div style={{ position: "absolute", left: size * 0.44, top: 0, width: size * 0.12, height: size * 1.3, borderRadius: size * 0.06, background: "linear-gradient(180deg, #FFF6D8, #F7D774 60%, #D6A743)", boxShadow: `0 0 ${size * 0.4}px rgba(247,215,116,0.9)` }} />
    <div style={{ position: "absolute", left: size * 0.12, top: size * 0.32, width: size * 0.76, height: size * 0.12, borderRadius: size * 0.06, background: "linear-gradient(90deg, #F7D774, #FFF6D8 50%, #F7D774)", boxShadow: `0 0 ${size * 0.4}px rgba(247,215,116,0.9)` }} />
  </div>
);

const serifStyle = (size: number, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.12,
  color: WHITE,
  ...extra,
});

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

// 0 – c2.3  Welcome
const Welcome: React.FC<{ t: number }> = ({ t }) => {
  const ring = outCubic(prog(t, 0.1, 1.3));
  const logo = outBack(prog(t, 0.4, 1.2));
  const sweep = prog(t, 1.2, 2.4);
  const title = "SAS EMPOWERMENT";
  return (
    <>
      <div style={{ position: "absolute", left: 960 - 220, top: 120, width: 440, height: 440 }}>
        <svg width="440" height="440" viewBox="0 0 440 440" style={{ position: "absolute", inset: 0 }}>
          <circle cx="220" cy="220" r="200" stroke={GOLD} strokeWidth="3" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 220 220)" />
          <circle cx="220" cy="220" r="214" stroke="rgba(214,167,67,0.25)" strokeWidth="1.5" fill="none" />
        </svg>
        <div style={{ position: "absolute", inset: 60, transform: `scale(${logo})`, opacity: clamp(logo), overflow: "hidden", WebkitMaskImage: `url(${staticFile("sas-logo.png")})`, WebkitMaskSize: "contain" }}>
          <Logo size={320} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${lerp(-40, 140, sweep) - 15}%, rgba(255,250,225,0.9) ${lerp(-40, 140, sweep)}%, transparent ${lerp(-40, 140, sweep) + 15}%)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", ...serifStyle(52, { fontStyle: "italic", color: "#d9cdb4" }), ...rise(t, c(0), 0.6, 20) }}>Welcome to</div>
      <div style={{ position: "absolute", top: 680, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, letterSpacing: "0.12em", color: WHITE }}>
        {title.split("").map((ch, i) => (
          <span key={i} style={{ display: "inline-block", opacity: prog(t, c(0.4) + i * 0.035, c(0.7) + i * 0.035), transform: `translateY(${(1 - outCubic(prog(t, c(0.4) + i * 0.035, c(0.8) + i * 0.035))) * 30}px)` }}>
            {ch === " " ? " " : i < 3 ? <Gold>{ch}</Gold> : ch}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 830, width: "100%", display: "flex", justifyContent: "center", ...rise(t, c(1.4), 0.5, 20) }}>
        <LiveBadge t={t} size={32} />
      </div>
    </>
  );
};

// c2.86 – c10.73  Better at what we do / better in who we are
const Better: React.FC<{ t: number }> = ({ t }) => {
  const line = outCubic(prog(t, c(3.2), c(4.2)));
  const right = prog(t, c(7.99), c(8.6));
  return (
    <>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", ...rise(t, c(2.9)) }}>
        <Kicker>AT SAS, WE BELIEVE</Kicker>
      </div>
      <div style={{ position: "absolute", top: 170, left: 200, right: 200, textAlign: "center", ...serifStyle(64) }}>
        <Reveal t={t} at={c(3.0)} span={1.6} text="empowerment is not only about…" />
      </div>
      <div style={{ position: "absolute", left: 960 - 1.5, top: 380, width: 3, height: 560 * line, background: GOLD_GRADIENT }} />
      {/* left */}
      <div style={{ position: "absolute", left: 160, width: 680, top: 430, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, opacity: lerp(1, 0.45, right), ...rise(t, c(5.3), 0.7, 50) }}>
        <GoldDisc icon="briefcase" size={170} />
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: "0.24em", color: MUTED }}>WHAT WE DO</div>
        <div style={{ ...serifStyle(66), textAlign: "center" }}>Becoming better at what we do</div>
      </div>
      {/* right */}
      <div style={{ position: "absolute", right: 160, width: 680, top: 430, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, ...rise(t, c(8.0), 0.7, 50) }}>
        <GoldDisc icon="heart" size={170} style={{ boxShadow: `0 0 ${60 + 40 * right}px rgba(247,215,116,${0.4 + 0.3 * right})` }} />
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: "0.24em", color: GOLD }}>WHO WE ARE</div>
        <div style={{ ...serifStyle(66), textAlign: "center" }}>
          Becoming better in <Gold>who we are</Gold>
        </div>
      </div>
    </>
  );
};

// c11.30 – c16.95  Learn, reflect, encourage, grow in faith
const Together: React.FC<{ t: number }> = ({ t }) => {
  const nodes = [
    { label: "Learn", icon: "book", at: 12.9, a: -90 },
    { label: "Reflect", icon: "eye", at: 13.7, a: 0 },
    { label: "Encourage", icon: "hands", at: 14.5, a: 90 },
    { label: "Grow in faith", icon: "sprout", at: 15.8, a: 180 },
  ];
  const cx = 1270;
  const cy = 560;
  const R = 300;
  const spin = (t - c(11.3)) * 4;
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 300, width: 640 }}>
        <Kicker style={rise(t, c(11.3))}>WHY WE GATHER</Kicker>
        <div style={{ marginTop: 26, ...serifStyle(84) }}>
          <Reveal t={t} at={c(11.35)} span={1.4} text="That is why we come together." gold={["together."]} />
        </div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} stroke="rgba(214,167,67,0.35)" strokeWidth="2" fill="none" strokeDasharray="6 12" strokeDashoffset={-t * 20} />
        {nodes.map((n, i) => {
          const p = outCubic(prog(t, c(n.at), c(n.at) + 0.6));
          const a = ((n.a + spin) * Math.PI) / 180;
          return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R * p} y2={cy + Math.sin(a) * R * p} stroke={GOLD} strokeWidth="2" opacity={0.6} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: cx - 90, top: cy - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(247,215,116,0.55), rgba(214,167,67,0) 70%)", transform: `scale(${1 + 0.06 * Math.sin(t * 2)})` }} />
      <div style={{ position: "absolute", left: cx - 60, top: cy - 60, ...rise(t, c(11.6)) }}>
        <Logo size={120} />
      </div>
      {nodes.map((n) => {
        const p = outBack(prog(t, c(n.at), c(n.at) + 0.6));
        const a = ((n.a + spin) * Math.PI) / 180;
        return (
          <div key={n.label} style={{ position: "absolute", left: cx + Math.cos(a) * R - 150, top: cy + Math.sin(a) * R - 70, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: clamp(p), transform: `scale(${p})` }}>
            <GoldDisc icon={n.icon} size={96} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 10px #000" }}>{n.label}</div>
          </div>
        );
      })}
    </>
  );
};

// c17.53 – c24.08  Busy life clouds what truly matters
const Busy: React.FC<{ t: number }> = ({ t }) => {
  const labels = [
    { k: "Work", at: 17.9, x: 380, y: 300, r: -6 },
    { k: "Responsibilities", at: 18.9, x: 1380, y: 260, r: 5 },
    { k: "Everyday challenges", at: 20.2, x: 1300, y: 700, r: -4 },
  ];
  const clutter = prog(t, c(17.6), c(21.2));
  const focus = 1 - 0.75 * clutter;
  return (
    <>
      <div style={{ position: "absolute", left: 960 - 170, top: 540 - 170, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,240,200,${0.9 * focus}) 0%, rgba(214,167,67,${0.5 * focus}) 35%, rgba(0,0,0,0) 70%)`, filter: `blur(${clutter * 14}px)` }} />
      <div style={{ position: "absolute", top: 470, width: "100%", textAlign: "center", ...serifStyle(52, { fontStyle: "italic", color: INK }), opacity: focus * prog(t, c(17.6), c(18.2)), filter: `blur(${clutter * 6}px)` }}>what truly matters</div>
      {/* swirling clutter */}
      {Array.from({ length: 22 }).map((_, i) => {
        const at = c(17.6) + i * 0.15;
        const p = prog(t, at, at + 0.6);
        const a = i * 2.4 + t * (0.25 + (i % 5) * 0.05);
        const rr = 260 + (i % 6) * 70;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + Math.cos(a) * rr * 1.6 - 40,
              top: 540 + Math.sin(a) * rr * 0.75 - 40,
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(160deg, #1d1d1d, #0a0a0a)",
              border: "1.5px solid rgba(214,167,67,0.3)",
              opacity: p * 0.9,
              transform: `rotate(${a * 20}deg) scale(${p})`,
            }}
          />
        );
      })}
      {labels.map((l) => {
        const p = outBack(prog(t, c(l.at), c(l.at) + 0.5));
        return (
          <div key={l.k} style={{ position: "absolute", left: l.x - 260, top: l.y, width: 520, textAlign: "center", opacity: clamp(p), transform: `scale(${p}) rotate(${l.r + Math.sin(t * 3) * 1.5}deg)` }}>
            <span style={{ display: "inline-block", padding: "20px 40px", borderRadius: 20, background: "rgba(15,15,15,0.92)", border: "2px solid rgba(255,255,255,0.15)", fontFamily: FONT, fontWeight: 700, fontSize: 46, color: WHITE }}>{l.k}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 930, width: "100%", textAlign: "center", ...serifStyle(56) }}>
        <Reveal t={t} at={c(21.6)} span={1.8} text="it is easy to lose sight of what truly matters." gold={["truly", "matters."]} />
      </div>
    </>
  );
};

// c24.64 – c33.00  Colossians 3:23 on an open book
const Colossians: React.FC<{ t: number }> = ({ t }) => {
  const book = outCubic(prog(t, c(24.7), c(25.6)));
  const open = inOut(prog(t, c(25.4), c(26.6)));
  const glow = prog(t, c(26.2), c(28));
  return (
    <>
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", ...serifStyle(44, { fontStyle: "italic", color: "#d9cdb4" }) }}>
        <Reveal t={t} at={c(24.7)} span={1.4} text="But God's Word reminds us" italic />
      </div>
      <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", ...rise(t, c(26.5)) }}>
        <Kicker style={{ fontSize: 30 }}>COLOSSIANS 3:23</Kicker>
      </div>
      {/* verse */}
      <div style={{ position: "absolute", top: 240, left: 220, right: 220, textAlign: "center", ...serifStyle(76, { lineHeight: 1.18 }) }}>
        <Reveal t={t} at={c(28.36)} span={0.9} text="“Whatever you do," />{" "}
        <Reveal t={t} at={c(29.74)} span={1.5} text="work at it with all your heart," gold={["heart,"]} />
        <br />
        <Reveal t={t} at={c(31.75)} span={1.0} text="as working for the Lord.”" gold={["Lord.”"]} />
      </div>
      {/* open book */}
      <div style={{ position: "absolute", left: 960 - 420, top: 640, width: 840, height: 360, perspective: 1600, transform: `translateY(${(1 - book) * 300}px)`, opacity: book }}>
        <div style={{ position: "absolute", left: 420 - 400, top: 300, width: 800, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(247,215,116,${0.5 * glow}), rgba(0,0,0,0) 70%)` }} />
        <div style={{ position: "absolute", left: 420 - 160, top: -120, width: 320, height: 300, background: `radial-gradient(ellipse at 50% 100%, rgba(255,240,200,${0.55 * glow}), rgba(0,0,0,0) 70%)`, filter: "blur(10px)" }} />
        {[0, 1].map((side) => (
          <div
            key={side}
            style={{
              position: "absolute",
              left: side ? 420 : 40,
              top: 40,
              width: 380,
              height: 270,
              background: "linear-gradient(180deg, #f7f0df, #e6dac0)",
              borderRadius: side ? "6px 18px 18px 6px" : "18px 6px 6px 18px",
              transformOrigin: side ? "0% 50%" : "100% 50%",
              transform: `rotateY(${(side ? -1 : 1) * lerp(88, 14, open)}deg)`,
              boxShadow: "0 30px 50px rgba(0,0,0,0.6)",
              padding: "34px 36px",
              boxSizing: "border-box",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 7, borderRadius: 4, marginBottom: 18, width: `${i === 7 ? 55 : 100}%`, background: "rgba(90,70,40,0.25)" }} />
            ))}
          </div>
        ))}
        <div style={{ position: "absolute", left: 420 - 3, top: 40, width: 6, height: 270, background: "#9A6A1E", opacity: open }} />
      </div>
    </>
  );
};

// c33.73 – c42.07  Our work has purpose
const Purpose: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { k: "Every task", at: 35.9 },
    { k: "Every challenge", at: 37.0 },
    { k: "Every opportunity to serve", at: 38.2 },
  ];
  const honor = outBack(prog(t, c(40.0), c(40.7)));
  return (
    <>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", ...serifStyle(120, { fontWeight: 700 }) }}>
        <Reveal t={t} at={c(33.75)} span={1.0} text="Our work has purpose." gold={["purpose."]} />
      </div>
      <div style={{ position: "absolute", top: 440, left: 120, right: 120, display: "flex", justifyContent: "center", gap: 36 }}>
        {items.map((it, i) => {
          const p = outCubic(prog(t, c(it.at), c(it.at) + 0.6));
          return (
            <div key={it.k} style={{ flex: i === 2 ? 1.4 : 1, padding: "40px 30px", borderRadius: 28, background: "rgba(255,255,255,0.04)", border: "2px solid rgba(214,167,67,0.35)", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: WHITE, opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
              <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 700, lineHeight: 1, marginBottom: 14 }}>
                <Gold>{`0${i + 1}`}</Gold>
              </div>
              {it.k}
            </div>
          );
        })}
      </div>
      <svg width={W} height={200} style={{ position: "absolute", top: 640, left: 0 }}>
        {[480, 960, 1440].map((x, i) => (
          <path key={i} d={`M ${x} 0 C ${x} 100, 960 80, 960 180`} stroke={GOLD} strokeWidth="2" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - outCubic(prog(t, c(39.6), c(40.4)))} opacity={0.7} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 830, width: "100%", display: "flex", justifyContent: "center", opacity: clamp(honor), transform: `scale(${honor})` }}>
        <div style={{ padding: "26px 60px", borderRadius: 999, background: GOLD_GRADIENT, boxShadow: "0 0 80px rgba(214,167,67,0.5)", ...serifStyle(56, { color: INK, fontWeight: 700 }) }}>an opportunity to honor God</div>
      </div>
    </>
  );
};

// c42.63 – c48.23  Tired, uncertain, discouraged → never alone
const NeverAlone: React.FC<{ t: number }> = ({ t }) => {
  const words = [
    { k: "tired", at: 43.3, x: 360, y: 300 },
    { k: "uncertain", at: 44.1, x: 1460, y: 380 },
    { k: "discouraged", at: 44.9, x: 760, y: 720 },
  ];
  const light = outCubic(prog(t, c(46.0), c(47.4)));
  return (
    <>
      {/* rain that clears */}
      {Array.from({ length: 70 }).map((_, i) => {
        const x = (i * 97.3) % W;
        const sp = 900 + (i % 7) * 120;
        const y = ((t * sp + i * 137) % (H + 200)) - 200;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 2, height: 60, background: "linear-gradient(180deg, rgba(180,190,200,0), rgba(180,190,200,0.35))", transform: "rotate(12deg)", opacity: (1 - light) * prog(t, c(42.7), c(43.4)) }} />;
      })}
      <AbsoluteFill style={{ background: `rgba(10,14,20,${0.55 * (1 - light)})` }} />
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", ...serifStyle(52, { fontStyle: "italic", color: "#bfc6cf" }), opacity: 1 - light }}>
        <Reveal t={t} at={c(42.65)} span={0.6} text="And when we feel…" italic />
      </div>
      {words.map((w) => (
        <div key={w.k} style={{ position: "absolute", left: w.x - 300, top: w.y, width: 600, textAlign: "center", ...serifStyle(110, { color: "#8d96a1", fontStyle: "italic" }), ...rise(t, c(w.at), 0.6, 30), opacity: prog(t, c(w.at), c(w.at) + 0.6) * (1 - light) }}>
          {w.k}
        </div>
      ))}
      <div style={{ position: "absolute", left: 960 - 360 * light, top: 420 - 360 * light, width: 720 * light, height: 720 * light, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,244,214,0.95) 0%, rgba(247,215,116,0.55) 30%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", top: 800, width: "100%", textAlign: "center", ...serifStyle(92, { fontWeight: 700, textShadow: "0 4px 30px rgba(0,0,0,0.8)" }), opacity: prog(t, c(46.6), c(47.2)) }}>
        We are <Gold>never alone.</Gold>
      </div>
    </>
  );
};

// c48.80 – c56.00  Isaiah 41:10 over a sunrise
const Isaiah: React.FC<{ t: number }> = ({ t }) => {
  const sun = outCubic(prog(t, c(48.8), c(52.5)));
  return (
    <>
      <div style={{ position: "absolute", left: 960 - 520, top: lerp(1000, 640, sun), width: 1040, height: 1040, borderRadius: "50%", background: "radial-gradient(circle, #FFF3CF 0%, #F7D774 25%, rgba(214,167,67,0.5) 45%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: 960 - 1000, top: lerp(1000, 640, sun) + 520 - 1000, width: 2000, height: 2000, opacity: sun * 0.6, transform: `rotate(${t * 3}deg)`, background: "repeating-conic-gradient(from 0deg, rgba(247,215,116,0.18) 0deg 5deg, rgba(0,0,0,0) 5deg 15deg)", WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, height: 160, background: "linear-gradient(180deg, rgba(5,4,3,0), #050403 60%)" }} />
      <div style={{ position: "absolute", top: 100, width: "100%", textAlign: "center", ...rise(t, c(48.85)) }}>
        <Kicker style={{ fontSize: 30 }}>ISAIAH 41:10</Kicker>
      </div>
      <div style={{ position: "absolute", top: 200, left: 200, right: 200, textAlign: "center", ...serifStyle(92, { lineHeight: 1.15, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }) }}>
        <Reveal t={t} at={c(51.12)} span={0.6} text="“Do not fear," />{" "}
        <Reveal t={t} at={c(52.35)} span={0.9} text="for I am with you…" gold={["with", "you…"]} />
        <br />
        <span style={{ fontSize: 76 }}>
          <Reveal t={t} at={c(54.02)} span={1.4} text="I will strengthen you and help you.”" />
        </span>
      </div>
    </>
  );
};

// c56.67 – c68.25  Why SAS Empowerment exists: a growing tree
const Tree: React.FC<{ t: number }> = ({ t }) => {
  const grow = outCubic(prog(t, c(59.5), c(63.2)));
  const leaves = [
    { k: "Skills", at: 61.6, x: 1250, y: 650, gold: false },
    { k: "Careers", at: 62.6, x: 1660, y: 600, gold: false },
    { k: "Character", at: 64.6, x: 1180, y: 380, gold: true },
    { k: "Faith", at: 65.35, x: 1460, y: 200, gold: true },
    { k: "How we serve", at: 66.8, x: 1730, y: 380, gold: true },
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 130, top: 170, width: 860 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, ...rise(t, c(56.7)) }}>
          <Logo size={110} />
          <Kicker>WHY WE EXIST</Kicker>
        </div>
        <div style={{ marginTop: 30, ...serifStyle(76) }}>
          <Reveal t={t} at={c(56.7)} span={1.6} text="This is why SAS Empowerment exists." gold={["SAS", "Empowerment"]} />
        </div>
        <div style={{ marginTop: 40, ...serifStyle(48, { color: "#d9cdb4" }) }}>
          <Reveal t={t} at={c(59.55)} span={2.6} text="Growth is not just about our skills or our careers." />
        </div>
        <div style={{ marginTop: 26, ...serifStyle(48, { color: WHITE }) }}>
          <Reveal t={t} at={c(63.85)} span={3.0} text="It is also about our character, our faith, and the way we serve others." gold={["character,", "faith,", "serve"]} />
        </div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="trunk" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#9A6A1E" />
            <stop offset="1" stopColor="#F7D774" />
          </linearGradient>
        </defs>
        <ellipse cx="1460" cy="990" rx="320" ry="30" fill="rgba(214,167,67,0.18)" />
        {[
          "M 1460 990 C 1460 860, 1450 760, 1460 600",
          "M 1460 760 C 1380 720, 1300 690, 1250 650",
          "M 1460 720 C 1560 680, 1620 640, 1660 600",
          "M 1460 600 C 1380 520, 1230 460, 1180 380",
          "M 1460 600 C 1460 420, 1460 300, 1460 200",
          "M 1460 560 C 1560 500, 1690 450, 1730 380",
        ].map((d, i) => (
          <path key={i} d={d} stroke="url(#trunk)" strokeWidth={i === 0 ? 22 : 10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(grow * 1.6 - i * 0.12)} />
        ))}
      </svg>
      {leaves.map((l) => {
        const p = outBack(prog(t, c(l.at), c(l.at) + 0.6));
        return (
          <div key={l.k} style={{ position: "absolute", left: l.x - 130, top: l.y - 50, width: 260, display: "flex", justifyContent: "center", opacity: clamp(p), transform: `scale(${p})` }}>
            <div style={{ padding: "16px 30px", borderRadius: 999, background: l.gold ? GOLD_GRADIENT : "rgba(20,20,20,0.92)", border: l.gold ? "none" : "2px solid rgba(214,167,67,0.45)", boxShadow: l.gold ? "0 0 50px rgba(214,167,67,0.5)" : "none", fontFamily: FONT, fontWeight: 700, fontSize: 34, color: l.gold ? INK : WHITE, whiteSpace: "nowrap" }}>{l.k}</div>
          </div>
        );
      })}
    </>
  );
};

// c68.76 – c74.16  Learn / encourage / grow together
const OneAnother: React.FC<{ t: number }> = ({ t }) => {
  const merge = inOut(prog(t, c(72.0), c(73.2)));
  const circles = [
    { k: "We learn from one another", at: 68.76, x: 520 },
    { k: "We encourage one another", at: 70.38, x: 960 },
    { k: "Together, we grow", at: 72.0, x: 1400 },
  ];
  return (
    <>
      {circles.map((cc, i) => {
        const p = outBack(prog(t, c(cc.at), c(cc.at) + 0.6));
        const x = lerp(cc.x, 960 + (i - 1) * 110, merge);
        return (
          <div key={cc.k} style={{ position: "absolute", left: x - 230, top: 300 - 30 * merge, width: 460, height: 460, borderRadius: "50%", border: `3px solid ${GOLD}`, background: `rgba(214,167,67,${0.08 + 0.1 * merge})`, mixBlendMode: "screen", display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(p), transform: `scale(${p})` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: 1 - merge }}>
              <GoldDisc icon={["book", "hands", "sprout"][i]} size={110} />
              <div style={{ ...serifStyle(44), textAlign: "center", width: 340 }}>{cc.k}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 455, width: "100%", textAlign: "center", ...serifStyle(96, { fontWeight: 700 }), opacity: prog(t, c(72.6), c(73.2)) }}>
        <Gold>Together.</Gold>
      </div>
      <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", ...serifStyle(52, { color: "#d9cdb4" }) }}>
        <Reveal t={t} at={c(72.0)} span={1.6} text="And together, we continue to grow." gold={["grow."]} />
      </div>
    </>
  );
};

// c74.72 – c79.86  Pause and prepare your heart (breathing)
const Breathe: React.FC<{ t: number }> = ({ t }) => {
  const b = 0.5 - 0.5 * Math.cos(((t - c(74.7)) / 4.2) * Math.PI * 2);
  return (
    <>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", ...serifStyle(52, { fontStyle: "italic", color: "#d9cdb4" }) }}>
        <Reveal t={t} at={c(74.75)} span={1.8} text="As we prepare for today's empowerment," italic />
      </div>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", left: 960 - 200, top: 560 - 200, width: 400, height: 400, borderRadius: "50%", border: `2px solid rgba(214,167,67,${0.5 - k * 0.14})`, transform: `scale(${lerp(0.8, 1.35, b) + k * 0.25})` }} />
      ))}
      <div style={{ position: "absolute", left: 960 - 200, top: 560 - 200, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(247,215,116,0.5), rgba(214,167,67,0) 70%)", transform: `scale(${lerp(0.8, 1.25, b)})` }} />
      <div style={{ position: "absolute", left: 960 - 70, top: 560 - 70, transform: `scale(${lerp(0.9, 1.1, b)})`, ...rise(t, c(77.3)) }}>
        <Glyph name="heart" size={140} color={GOLD_LIGHT} stroke={1.4} />
      </div>
      <div style={{ position: "absolute", top: 870, width: "100%", textAlign: "center", ...serifStyle(66) }}>
        <Reveal t={t} at={c(77.3)} span={2.0} text="Take a moment to pause and prepare your heart." gold={["pause", "heart."]} />
      </div>
    </>
  );
};

// c80.39 – c89.51  Be ready … keep God at the center
const Ready: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { k: "to learn", icon: "book", at: 80.4 },
    { k: "to listen", icon: "headphones", at: 81.82 },
    { k: "to be encouraged", icon: "heart", at: 83.33 },
  ];
  const orbit = inOut(prog(t, c(85.5), c(86.8)));
  const cross = outCubic(prog(t, c(86.9), c(88.0)));
  const spin = (t - c(85.5)) * 0.35;
  return (
    <>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", ...serifStyle(56, { fontStyle: "italic", color: "#d9cdb4" }), opacity: 1 - orbit }}>
        <span style={rise(t, c(80.4))}>Be ready…</span>
      </div>
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", ...serifStyle(48, { fontStyle: "italic", color: "#d9cdb4" }), opacity: orbit }}>
        <Reveal t={t} at={c(85.55)} span={0.8} text="And most importantly," italic />
      </div>
      {items.map((it, i) => {
        const p = outBack(prog(t, c(it.at), c(it.at) + 0.6));
        const rowX = 380 + i * 580;
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2 + spin * orbit;
        const ox = 960 + Math.cos(a) * 380;
        const oy = 560 + Math.sin(a) * 300;
        const x = lerp(rowX, ox, orbit);
        const y = lerp(560, oy, orbit);
        return (
          <div key={it.k} style={{ position: "absolute", left: x - 220, top: y - 170, width: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: clamp(p), transform: `scale(${p * lerp(1, 0.62, orbit)})` }}>
            <GoldDisc icon={it.icon} size={170} />
            <div style={{ ...serifStyle(58), textAlign: "center" }}>
              <span style={{ color: MUTED, fontSize: 40, display: "block", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.2em" }}>BE READY</span>
              {it.k}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 960 - 260, top: 560 - 260, width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,244,214,${0.7 * cross}), rgba(214,167,67,0) 65%)` }} />
      <div style={{ position: "absolute", left: 960 - 70, top: 560 - 100, transform: `scale(${lerp(0.6, 1, cross)})` }}>
        <LightCross size={140} o={cross} />
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center", ...serifStyle(58) }}>
        <Reveal t={t} at={c(86.9)} span={2.0} text="Keep God at the center of everything you do." gold={["God", "center"]} />
      </div>
    </>
  );
};

// c90.10 – c100.38  A space to…
const Space: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    { k: "A space to learn.", at: 92.3, icon: "book" },
    { k: "A space to grow.", at: 93.7, icon: "sprout" },
    { k: "A space to be encouraged.", at: 95.17, icon: "hands" },
    { k: "A space to keep our faith at the heart of our work.", at: 97.31, icon: "flame" },
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 300, width: 600, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 30 }}>
        <div style={{ ...rise(t, c(90.1)), transform: `scale(${outBack(prog(t, c(90.1), c(90.8)))})`, transformOrigin: "0 50%" }}>
          <Logo size={220} />
        </div>
        <div style={serifStyle(84, { fontWeight: 700 })}>
          <Reveal t={t} at={c(90.15)} span={1.2} text="This is SAS Empowerment." gold={["Empowerment."]} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 800, top: 230, width: 1000, height: 640, borderLeft: "3px solid rgba(214,167,67,0.4)", paddingLeft: 70, display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 }}>
        {rows.map((r, i) => {
          const p = outCubic(prog(t, c(r.at), c(r.at) + 0.6));
          const last = i === rows.length - 1;
          return (
            <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 30, opacity: p, transform: `translateX(${(1 - p) * 80}px)` }}>
              <GoldDisc icon={r.icon} size={84} />
              <div style={serifStyle(last ? 52 : 60, { color: last ? GOLD_LIGHT : WHITE })}>{r.k}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// c100.94 – end  Live will begin shortly
const Shortly: React.FC<{ t: number }> = ({ t }) => {
  const logo = outBack(prog(t, c(100.9), c(101.7)));
  return (
    <>
      <div style={{ position: "absolute", left: 960 - 190, top: 120, width: 380, height: 380 }}>
        <svg width="380" height="380" viewBox="0 0 380 380" style={{ position: "absolute", inset: 0, transform: `rotate(${t * 120}deg)` }}>
          <circle cx="190" cy="190" r="176" stroke="rgba(214,167,67,0.18)" strokeWidth="6" fill="none" />
          <circle cx="190" cy="190" r="176" stroke={GOLD} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="200 906" />
        </svg>
        <div style={{ position: "absolute", left: 190 - 120, top: 190 - 120, transform: `scale(${logo})`, opacity: clamp(logo) }}>
          <Logo size={240} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 550, width: "100%", display: "flex", justifyContent: "center", ...rise(t, c(101.0)) }}>
        <LiveBadge t={t} size={30} />
      </div>
      <div style={{ position: "absolute", top: 630, width: "100%", textAlign: "center", ...serifStyle(84, { fontWeight: 700 }) }}>
        <Reveal t={t} at={c(100.95)} span={2.0} text="SAS Empowerment Live will begin shortly." gold={["begin", "shortly."]} />
      </div>
      <div style={{ position: "absolute", top: 790, width: "100%", textAlign: "center", ...serifStyle(58, { fontStyle: "italic", color: "#d9cdb4" }) }}>
        <Reveal t={t} at={c(103.75)} span={1.8} text="Stay with us, and let's grow together." italic />
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: "0.32em", color: MUTED, opacity: prog(t, c(106.3), c(107)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 1.6))) }}>
        STARTING SOON
      </div>
    </>
  );
};

export const EmpowermentLive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#050403", fontFamily: FONT }}>
      <Sequence from={Math.round(LEAD * fps)}>
        <Audio src={staticFile("empowerment-vo.mp3")} />
      </Sequence>
      <Atmosphere t={t} />
      <Scene t={t} from={0} to={c(2.35)}>
        <Welcome t={t} />
      </Scene>
      <Scene t={t} from={c(2.75)} to={c(10.75)}>
        <Better t={t} />
      </Scene>
      <Scene t={t} from={c(11.2)} to={c(16.9)}>
        <Together t={t} />
      </Scene>
      <Scene t={t} from={c(17.4)} to={c(24.1)}>
        <Busy t={t} />
      </Scene>
      <Scene t={t} from={c(24.55)} to={c(33.1)}>
        <Colossians t={t} />
      </Scene>
      <Scene t={t} from={c(33.6)} to={c(42.1)}>
        <Purpose t={t} />
      </Scene>
      <Scene t={t} from={c(42.55)} to={c(48.25)}>
        <NeverAlone t={t} />
      </Scene>
      <Scene t={t} from={c(48.7)} to={c(56.1)}>
        <Isaiah t={t} />
      </Scene>
      <Scene t={t} from={c(56.55)} to={c(68.3)}>
        <Tree t={t} />
      </Scene>
      <Scene t={t} from={c(68.7)} to={c(74.2)}>
        <OneAnother t={t} />
      </Scene>
      <Scene t={t} from={c(74.6)} to={c(79.9)}>
        <Breathe t={t} />
      </Scene>
      <Scene t={t} from={c(80.3)} to={c(89.55)}>
        <Ready t={t} />
      </Scene>
      <Scene t={t} from={c(90.0)} to={c(100.45)}>
        <Space t={t} />
      </Scene>
      <Scene t={t} from={c(100.85)} to={EMPOWER_SECONDS + 1}>
        <Shortly t={t} />
      </Scene>
    </AbsoluteFill>
  );
};
