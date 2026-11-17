import React from "react";
import { Img, staticFile } from "remotion";

// SAS brand tokens (from SAS-DESIGN-GUIDE.md and the outro).
export const GOLD = "#D6A743";
export const GOLD_LIGHT = "#F7D774";
export const GOLD_DEEP = "#9A6A1E";
export const WHITE = "#FFFFFF";
export const MUTED = "#AAAAAA";
export const CARD = "#0E0E0E";
export const FONT = '"Inter", Arial, Helvetica, sans-serif';
export const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DEEP} 100%)`;

export const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const inOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const outBack = (x: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

// Rise-and-unblur entrance used for every text/element reveal.
export const appear = (
  t: number,
  at: number,
  dur = 0.5,
  dist = 40,
): React.CSSProperties => {
  const p = outCubic(prog(t, at, at + dur));
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * dist}px)`,
    filter: `blur(${(1 - p) * 10}px)`,
  };
};

export const Gold: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      background: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </span>
);

// Words fade/rise in one after another between `at` and `at + span`.
export const Words: React.FC<{
  t: number;
  at: number;
  span: number;
  text: string;
  gold?: string[];
}> = ({ t, at, span, text, gold = [] }) => {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => {
        const start = at + (span * i) / words.length;
        const isGold = gold.includes(w.replace(/[.,?]/g, ""));
        return (
          <span
            key={i}
            style={{ display: "inline-block", whiteSpace: "pre", ...appear(t, start, 0.4, 24) }}
          >
            {isGold ? <Gold>{w}</Gold> : w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
};

export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  top?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 84, top = 260, style }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 80,
      right: 80,
      textAlign: "center",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.12,
      letterSpacing: "-0.03em",
      color: WHITE,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <Img
    src={staticFile("sas-logo.png")}
    style={{ width: size, height: size, objectFit: "contain", ...style }}
  />
);

// Black stage with a faint warm glow, as in the outro.
export const Backdrop: React.FC<{ glowY?: number; glow?: number }> = ({
  glowY = 900,
  glow = 0.28,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(circle at 540px ${glowY}px, rgba(70,48,12,${glow}) 0%, rgba(0,0,0,0) 900px), #000`,
    }}
  />
);

const ICONS: Record<string, React.ReactNode> = {
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  sheet: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  chart: <path d="M3 3v18h18M19 9l-5 5-4-4-3 3" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  repeat: <path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />,
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  trend: <path d="M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6" />,
};

export const Icon: React.FC<{
  name: keyof typeof ICONS | string;
  size?: number;
  color?: string;
  stroke?: number;
}> = ({ name, size = 48, color = WHITE, stroke = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {ICONS[name]}
  </svg>
);

// Rounded dark tile with a gold hairline, the dark-mode take on the
// white app tiles from the last reel.
export const Tile: React.FC<{
  icon: string;
  size?: number;
  badge?: number;
  style?: React.CSSProperties;
}> = ({ icon, size = 120, badge, style }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 100%)",
      border: "1.5px solid rgba(214,167,67,0.28)",
      boxShadow: "0 18px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <Icon name={icon} size={size * 0.44} color={GOLD_LIGHT} />
    {badge ? (
      <div
        style={{
          position: "absolute",
          top: -size * 0.1,
          right: -size * 0.1,
          minWidth: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          background: "#E5484D",
          color: WHITE,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: size * 0.17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6px",
          border: "3px solid #000",
        }}
      >
        {badge}
      </div>
    ) : null}
  </div>
);

export const Pill: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  solid?: boolean;
}> = ({ children, style, solid }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 18,
      padding: "22px 40px",
      borderRadius: 999,
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 40,
      color: solid ? "#111" : WHITE,
      background: solid ? GOLD_GRADIENT : "rgba(255,255,255,0.04)",
      border: solid ? "none" : "1.5px solid rgba(214,167,67,0.35)",
      boxShadow: solid ? "0 0 60px rgba(214,167,67,0.35)" : "none",
      ...style,
    }}
  >
    {children}
  </div>
);
