import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT, Gold, GOLD, GOLD_GRADIENT, GOLD_LIGHT, Icon, lerp, Logo, outBack, outCubic, prog, WHITE } from "./brand";
import { FIL_GROUPS } from "./filipino-words";

// "Why I believe in Filipino talent" — Remotion build of the same storyboard
// as the HyperFrames version in sas-hf/filipino-talent. Times are video
// seconds (the clip starts at 0, no intro card: frame 0 is the hook).
export const FILIPINO_SECONDS = 34.5;
const VIDEO_END = 32.7;
const OUTRO_AT = 30.9;
const INK = "#111111";

// Show a block between a and b with a fade/rise in and a fade out.
const win = (t: number, a: number, b: number) => {
  const i = outCubic(prog(t, a, a + 0.4));
  const o = 1 - prog(t, b - 0.35, b);
  return { o: Math.min(i, o), i };
};

const Card: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; top?: number }> = ({ t, a, b, children, top = 220 }) => {
  const { o, i } = win(t, a, b);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        padding: "38px 40px 40px",
        borderRadius: 40,
        background: "rgba(15,16,22,0.78)",
        backdropFilter: "blur(22px)",
        border: "2px solid rgba(214,167,67,0.55)",
        color: WHITE,
        fontFamily: FONT,
        opacity: o,
        transform: `translateY(${(1 - i) * -40}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: "0.22em", color: GOLD }}>{children}</div>
);

const popIn = (t: number, at: number): React.CSSProperties => {
  const p = outBack(prog(t, at, at + 0.45));
  return { opacity: clamp(p * 1.5), transform: `scale(${lerp(0.7, 1, clamp(p))})` };
};
const slideIn = (t: number, at: number): React.CSSProperties => {
  const p = outCubic(prog(t, at, at + 0.45));
  return { opacity: p, transform: `translateX(${(1 - p) * -50}px)` };
};

const Sun: React.FC<{ size: number; rot: number; color?: string }> = ({ size, rot }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120">
    <defs>
      <linearGradient id="fil-sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F7D774" />
        <stop offset="0.55" stopColor="#D6A743" />
        <stop offset="1" stopColor="#9A6A1E" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${rot})`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <polygon key={i} points="0,-58 7,-26 -7,-26" fill="url(#fil-sun)" transform={`rotate(${i * 45})`} />
      ))}
    </g>
    <circle cx="0" cy="0" r="21" fill="url(#fil-sun)" />
  </svg>
);

const Chip: React.FC<{ t: number; at: number; icon: string; label: string; wide?: boolean }> = ({ t, at, icon, label, wide }) => (
  <div style={{ gridColumn: wide ? "span 2" : undefined, display: "flex", alignItems: "center", gap: 16, padding: "22px 24px", borderRadius: 26, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(214,167,67,0.45)", fontWeight: 700, fontSize: 33, whiteSpace: "nowrap", ...popIn(t, at) }}>
    <span style={{ width: 52, height: 52, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={30} color={INK} stroke={2.6} />
    </span>
    {label}
  </div>
);

const Cards: React.FC<{ t: number }> = ({ t }) => {
  const globe = prog(t, 12, 17.3);
  return (
    <>
      {/* Hook — visible from frame 0 */}
      {t < 3.6 ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 220, padding: "40px 44px 44px", borderRadius: 40, background: "rgba(15,16,22,0.78)", backdropFilter: "blur(22px)", border: "2px solid rgba(214,167,67,0.55)", textAlign: "center", fontFamily: FONT, color: WHITE, opacity: 1 - prog(t, 3.25, 3.55) }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Sun size={150} rot={t * 25} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: "0.24em" }}>WHY I BELIEVE IN</div>
          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: "-0.03em", transform: `scale(${lerp(1.06, 1, outCubic(prog(t, 0, 0.6)))})` }}>
            <Gold>FILIPINO</Gold>
            <br />
            TALENT
          </div>
          <div style={{ marginTop: 22, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: GOLD_LIGHT, ...slideIn(t, 1.0) }}>Regine · CEO &amp; Founder, SAS</div>
        </div>
      ) : null}

      {/* More than skills */}
      <Card t={t} a={3.6} b={6.6}>
        <Kicker>FILIPINO VAs BRING</Kicker>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 34px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 46, ...popIn(t, 4.6) }}>
            <Icon name="check" size={40} color={WHITE} stroke={3} />
            Skills
          </div>
          <div style={{ fontWeight: 900, fontSize: 56, letterSpacing: "-0.02em", ...slideIn(t, 5.05) }}>
            <Gold>+ so much more</Gold>
          </div>
        </div>
      </Card>

      {/* Traits */}
      <Card t={t} a={6.6} b={11.9}>
        <Kicker>THEY BRING</Kicker>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}>
          <Chip t={t} at={7.28} icon="target" label="Dedication" />
          <Chip t={t} at={8.02} icon="trend" label="Creativity" />
          <Chip t={t} at={8.77} icon="sheet" label="Resourcefulness" wide />
          <Chip t={t} at={10.4} icon="chart" label="Willingness to learn & grow" wide />
        </div>
      </Card>

      {/* Global workforce */}
      <Card t={t} a={12.0} b={17.3}>
        <Kicker>I'VE MET FILIPINOS WHO ARE</Kicker>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 18 }}>
          <svg width="230" height="230" viewBox="-60 -60 120 120" style={{ flexShrink: 0 }}>
            <circle cx="0" cy="0" r="54" fill="rgba(214,167,67,0.08)" stroke={GOLD} strokeWidth="2.5" />
            <g fill="none" stroke="rgba(214,167,67,0.6)" strokeWidth="1.6">
              <ellipse cx="0" cy="0" rx={lerp(18, 52, globe)} ry="54" />
              <ellipse cx="0" cy="0" rx={lerp(38, 6, globe)} ry="54" />
            </g>
            <g fill="none" stroke="rgba(214,167,67,0.45)" strokeWidth="1.4">
              <line x1="-54" y1="0" x2="54" y2="0" />
              <path d="M -47 -27 Q 0 -20 47 -27" />
              <path d="M -47 27 Q 0 20 47 27" />
            </g>
            <g style={{ opacity: clamp(outBack(prog(t, 14.0, 14.45)) * 1.5) }} transform={`translate(0 ${(1 - clamp(prog(t, 14.0, 14.45))) * -14})`}>
              <path d="M 26 -6 C 26 -6, 16 -18, 16 -25 A 10 10 0 0 1 36 -25 C 36 -18, 26 -6, 26 -6 Z" fill={GOLD_LIGHT} />
              <circle cx="26" cy="-25" r="4" fill={INK} />
            </g>
          </svg>
          <div style={{ fontWeight: 800, fontSize: 50, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            <div style={slideIn(t, 13.6)}>
              Just as <Gold>skilled</Gold> &amp; <Gold>experienced</Gold>
            </div>
            <div style={{ marginTop: 12, fontSize: 40, fontWeight: 700, color: "#d9d9d9", ...slideIn(t, 15.15) }}>as anyone in the global workforce</div>
          </div>
        </div>
      </Card>

      {/* Right opportunity */}
      <Card t={t} a={17.4} b={22.75}>
        <Kicker>SOMETIMES ALL THEY NEED IS</Kicker>
        {[
          { n: "1", at: 19.1, body: <>The <Gold>right opportunity</Gold></> },
          { n: "2", at: 20.15, body: <>A client willing to give them <Gold>a chance</Gold></> },
        ].map((s) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 22, fontWeight: 800, fontSize: 46, lineHeight: 1.12, ...slideIn(t, s.at) }}>
            <span style={{ width: 70, height: 70, borderRadius: 20, background: GOLD_GRADIENT, color: INK, fontWeight: 900, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</span>
            <span>{s.body}</span>
          </div>
        ))}
      </Card>

      {/* Founder */}
      <Card t={t} a={22.6} b={25.5}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ width: 210, height: 210, borderRadius: "50%", background: "#0a0a0a", border: `5px solid ${GOLD}`, boxShadow: "0 0 60px rgba(214,167,67,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${lerp(0.3, 1, clamp(outBack(prog(t, 23.7, 24.3))))}) rotate(${lerp(-90, 0, outCubic(prog(t, 23.7, 24.3)))}deg)` }}>
            <Logo size={160} />
          </div>
          <div>
            <Kicker>THAT'S WHY I STARTED</Kicker>
            <div style={{ marginTop: 8, fontWeight: 900, fontSize: 54, lineHeight: 1.05, letterSpacing: "-0.02em", ...slideIn(t, 23.8) }}>
              Strategic Assistant <Gold>Staffing</Gold>
            </div>
            <div style={{ marginTop: 14, fontWeight: 700, fontSize: 28, color: GOLD_LIGHT, letterSpacing: "0.04em", ...slideIn(t, 24.0) }}>Regine · CEO &amp; Founder</div>
          </div>
        </div>
      </Card>

      {/* Seen, trusted, shine */}
      <Card t={t} a={25.55} b={31.0} top={200}>
        <div style={{ position: "relative", textAlign: "center" }}>
          <svg width="640" height="640" viewBox="-100 -100 200 200" style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -320, marginTop: -320, opacity: outCubic(prog(t, 30.5, 31.1)), transform: `scale(${lerp(0.3, 1, outCubic(prog(t, 30.5, 31.1)))}) rotate(${(t - 30.5) * 40}deg)`, pointerEvents: "none" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <polygon key={i} points="0,-98 6,-30 -6,-30" fill="rgba(247,215,116,0.35)" transform={`rotate(${i * 45})`} />
            ))}
          </svg>
          <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", ...slideIn(t, 25.6) }}>FILIPINO TALENT DESERVES TO BE</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 18, fontWeight: 900, fontSize: 86, letterSpacing: "-0.03em" }}>
            {[
              { w: "SEEN.", at: 28.0 },
              { w: "TRUSTED.", at: 28.7 },
            ].map((x) => {
              const p = outCubic(prog(t, x.at, x.at + 0.35));
              return (
                <span key={x.w} style={{ opacity: p, transform: `scale(${lerp(1.8, 1, p)})` }}>
                  {x.w}
                </span>
              );
            })}
          </div>
          <div style={{ position: "relative", marginTop: 6, fontWeight: 900, fontSize: 128, letterSpacing: "-0.03em", lineHeight: 1, ...popIn(t, 30.5) }}>
            <Gold>SHINE.</Gold>
          </div>
        </div>
      </Card>
    </>
  );
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const gi = FIL_GROUPS.findIndex((g, i) => {
    const start = Math.max(0.1, g[0].start - 0.05);
    const next = FIL_GROUPS[i + 1];
    const end = next && next[0].start - 0.05 - g[g.length - 1].end < 0.6 ? next[0].start - 0.05 : g[g.length - 1].end + 0.3;
    return t >= start && t < end;
  });
  if (gi < 0 || t >= OUTRO_AT) return null;
  const g = FIL_GROUPS[gi];
  const p = outCubic(prog(t, g[0].start - 0.05, g[0].start + 0.09));
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1235, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 20, maxWidth: 860, opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
        {g.map((w, i) => {
          const active = t >= w.start && t < w.end;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: "-0.01em", textTransform: "uppercase", color: w.gold ? GOLD_LIGHT : WHITE, WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: "0 6px 18px rgba(0,0,0,0.6)", transform: `scale(${active ? 1.08 : 1}) translateY(${active ? -4 : 0}px)` }}>
              {w.text.replace(/,$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const f = t - OUTRO_AT;
  return (
    <AbsoluteFill style={{ opacity: outCubic(prog(f, 0, 0.5)), background: "radial-gradient(circle at 540px 760px, rgba(42,32,16,0.72) 0%, rgba(5,5,5,0.86) 62%)", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 320, top: 330, transform: `scale(${lerp(0.5, 1, clamp(outBack(prog(f, 0.2, 0.8))))})`, opacity: prog(f, 0.2, 0.5) }}>
        <Img src={staticFile("sas-logo.png")} style={{ width: 440, height: 440, objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", top: 800, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 34, letterSpacing: "0.22em", color: WHITE, opacity: prog(f, 0.6, 1.0) }}>STRATEGIC ASSISTANT STAFFING</div>
      <div style={{ position: "absolute", top: 880, left: 80, right: 80, textAlign: "center", fontWeight: 900, fontSize: 84, lineHeight: 1.06, letterSpacing: "-0.03em", color: WHITE, opacity: prog(f, 0.8, 1.3), transform: `translateY(${(1 - outCubic(prog(f, 0.8, 1.3))) * 30}px)` }}>
        Filipino talent deserves <Gold>to shine.</Gold>
      </div>
      <div style={{ position: "absolute", top: 1150, width: "100%", textAlign: "center", opacity: prog(f, 1.3, 1.75) }}>
        <span style={{ display: "inline-block", padding: "26px 56px", borderRadius: 999, background: GOLD_GRADIENT, color: INK, fontWeight: 700, fontSize: 42 }}>strategic-assistant.com</span>
      </div>
    </AbsoluteFill>
  );
};

// Footage effects: black-and-white beats that snap back to colour on the
// payoff word, a quick blur-whip on each card change, and a blurred,
// darkened plate behind the outro.
const BW: [number, number][] = [
  [17.45, 19.1], // "Sometimes all they need is" → colour on "the right opportunity"
  [25.5, 27.95], // "Filipino talent deserves to be" → colour on "seen"
];
const WHIPS = [3.6, 6.6, 12.0, 17.4, 22.6, 25.55];

const footageFilter = (t: number) => {
  let gray = 0;
  for (const [a, b] of BW) gray = Math.max(gray, Math.min(prog(t, a, a + 0.35), 1 - prog(t, b, b + 0.15)));
  let blur = 0;
  for (const at of WHIPS) blur = Math.max(blur, 14 * (1 - clamp(Math.abs(t - at) / 0.2)));
  const out = outCubic(prog(t, OUTRO_AT, OUTRO_AT + 0.6));
  blur = Math.max(blur, 22 * out);
  const bright = lerp(1, 0.55, out);
  const contrast = 1;
  return { filter: `grayscale(${gray}) contrast(${contrast}) brightness(${bright}) blur(${blur}px)`, whip: blur / 14 };
};

// Jump-cut punch-ins, matching the HyperFrames version.
const PUNCHES: [number, number][] = [
  [0, 1],
  [3.6, 1.12],
  [6.55, 1],
  [12.15, 1.12],
  [17.5, 1],
  [22.8, 1.12],
  [25.5, 1],
  [28.65, 1.15],
];

export const FilipinoReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const zoom = [...PUNCHES].reverse().find(([at]) => t >= at)?.[1] ?? 1;
  const fx = footageFilter(t);
  const plate = { transform: `scale(${zoom * (1 + 0.04 * Math.min(1, fx.whip))})`, transformOrigin: "50% 52%", filter: fx.filter };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < VIDEO_END ? (
        <AbsoluteFill style={plate}>
          <OffthreadVideo src={staticFile("filipino-hq.mp4")} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={plate}>
          <Img src={staticFile("filipino-last.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {t < 31.2 ? (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.1) 100%)" }} />
      ) : null}
      <Cards t={t} />
      <Captions t={t} />
      {t >= OUTRO_AT ? <Outro t={t} /> : null}
    </AbsoluteFill>
  );
};
