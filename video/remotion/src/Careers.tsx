import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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

// Cue times (seconds) come from the pauses in careers-vo.mp3.
export const CAREERS_SECONDS = 88;
const EMAIL = "career@strategic-assistant.com";
const INK = "#111111";
const PAPER = "#F6F3EE";

const Scene: React.FC<{
  t: number;
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ t, from, to, children }) => {
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

// Swaps between headlines in the same spot.
const Swap: React.FC<{ t: number; at: number; until?: number; children: React.ReactNode; top?: number; size?: number }> = ({
  t,
  at,
  until = 999,
  children,
  top = 200,
  size = 70,
}) => {
  if (t < at - 0.05 || t > until + 0.3) return null;
  const o = 1 - prog(t, until, until + 0.3);
  return (
    <Headline top={top} size={size} style={{ opacity: o, filter: `blur(${(1 - o) * 10}px)` }}>
      {children}
    </Headline>
  );
};

const typed = (text: string, t: number, a: number, b: number) =>
  text.slice(0, Math.round(text.length * prog(t, a, b)));

const Caret: React.FC<{ t: number; on: boolean }> = ({ t, on }) =>
  on ? (
    <span style={{ display: "inline-block", width: 3, height: "1em", marginLeft: 2, verticalAlign: "-0.12em", background: GOLD, opacity: Math.floor(t * 2.5) % 2 ? 0 : 1 }} />
  ) : null;

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------
const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      width: 560,
      height: 1140,
      borderRadius: 88,
      padding: 18,
      background: "linear-gradient(145deg, #3a3a3a 0%, #121212 40%, #050505 100%)",
      boxShadow: `0 0 0 2px rgba(214,167,67,0.35), 0 60px 120px rgba(0,0,0,0.8), 0 0 140px rgba(214,167,67,0.12)`,
      ...style,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 72, overflow: "hidden", background: PAPER }}>
      {children}
      <div style={{ position: "absolute", top: 20, left: "50%", marginLeft: -80, width: 160, height: 46, borderRadius: 23, background: "#000" }} />
    </div>
  </div>
);

const Laptop: React.FC<{ t: number; open: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ open, children, style }) => (
  <div style={{ position: "absolute", left: 40, width: 1000, perspective: 2400, ...style }}>
    <div
      style={{
        width: 1000,
        height: 660,
        borderRadius: "34px 34px 10px 10px",
        padding: 22,
        background: "linear-gradient(160deg, #2e2e2e 0%, #0c0c0c 60%)",
        boxShadow: "0 0 0 2px rgba(214,167,67,0.3), 0 0 120px rgba(214,167,67,0.12)",
        transformOrigin: "50% 100%",
        transform: `rotateX(${lerp(-95, 0, open)}deg)`,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 14, overflow: "hidden", background: "#0B0B0B" }}>
        {children}
      </div>
    </div>
    <div
      style={{
        width: 1080,
        marginLeft: -40,
        height: 34,
        borderRadius: "0 0 40px 40px",
        background: "linear-gradient(180deg, #3a3a3a 0%, #151515 100%)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
      }}
    >
      <div style={{ width: 180, height: 10, margin: "0 auto", borderRadius: "0 0 10px 10px", background: "#0a0a0a" }} />
    </div>
  </div>
);

const Avatar: React.FC<{ size: number; label?: string; gold?: boolean; style?: React.CSSProperties }> = ({ size, label = "", gold, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: gold ? GOLD_GRADIENT : "#2a2a2a",
      border: gold ? "none" : "2px solid rgba(255,255,255,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size * 0.32,
      color: gold ? INK : MUTED,
      flexShrink: 0,
      ...style,
    }}
  >
    {label}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: boolean }> = ({ children, style, glow }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 24,
      background: "linear-gradient(170deg, #1a1a1a 0%, #101010 100%)",
      border: `2px solid ${glow ? GOLD : "rgba(255,255,255,0.08)"}`,
      boxShadow: glow ? "0 0 50px rgba(214,167,67,0.35)" : "0 20px 40px rgba(0,0,0,0.5)",
      fontFamily: FONT,
      color: WHITE,
      ...style,
    }}
  >
    {children}
  </div>
);

const Lines: React.FC<{ n: number; fill?: number; width?: number }> = ({ n, fill = 1, width = 100 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 12,
          borderRadius: 6,
          width: `${(i === n - 1 ? 60 : width) * clamp(fill * n - i)}%`,
          background: "rgba(255,255,255,0.14)",
        }}
      />
    ))}
  </div>
);

const NoSign: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, margin: "auto" }}>
    <circle cx="50" cy="50" r="44" stroke="#E5484D" strokeWidth="8" fill="none" strokeDasharray={`${277 * p} 277`} transform="rotate(-90 50 50)" />
    <line x1="19" y1="19" x2={lerp(19, 81, clamp(p * 2 - 1))} y2={lerp(19, 81, clamp(p * 2 - 1))} stroke="#E5484D" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// 0 – 7  Intro
// ---------------------------------------------------------------------------
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 0.0, 0.7));
  const road = outCubic(prog(t, 0.6, 3.0));
  const steps = ["Apply", "Review", "Interview", "Hired"];
  const swap = prog(t, 3.4, 3.8);
  return (
    <>
      <Backdrop glowY={820} glow={0.45} />
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", opacity: 1 - swap }}>
        <Pill style={{ fontSize: 34, letterSpacing: "0.2em", fontWeight: 700, padding: "16px 36px" }}>
          <Gold>WE'RE HIRING</Gold>
        </Pill>
      </div>
      <Headline top={350} size={84} style={{ opacity: 1 - swap }}>
        <span style={appear(t, 0, 0.01)}>Ready to start your journey with</span>{" "}
        <Words t={t} at={1.5} span={1.2} text="Strategic Assistant Staffing?" gold={["Strategic", "Assistant", "Staffing"]} />
      </Headline>
      <Headline top={330} size={84} style={{ opacity: swap }}>
        <Words t={t} at={3.6} span={1.6} text="Here's how our application & hiring process works." gold={["works"]} />
      </Headline>
      {/* Journey road: a gold path with milestones */}
      <svg width="1080" height="900" viewBox="0 0 1080 900" style={{ position: "absolute", top: 860, left: 0 }}>
        <defs>
          <clipPath id="roadclip">
            <rect x="0" y={900 - 900 * road} width="1080" height="900" />
          </clipPath>
        </defs>
        <path
          d="M 540 880 C 540 760, 260 720, 260 600 S 820 480, 820 340 S 540 200, 540 60"
          stroke="rgba(214,167,67,0.18)"
          strokeWidth="70"
          fill="none"
          strokeLinecap="round"
          clipPath="url(#roadclip)"
        />
        <path
          d="M 540 880 C 540 760, 260 720, 260 600 S 820 480, 820 340 S 540 200, 540 60"
          stroke={GOLD}
          strokeWidth="6"
          strokeDasharray="26 20"
          strokeDashoffset={-t * 60}
          fill="none"
          clipPath="url(#roadclip)"
        />
      </svg>
      {steps.map((s, i) => {
        const pos = [
          [540, 1700],
          [270, 1440],
          [810, 1220],
          [540, 940],
        ][i];
        const p = outBack(prog(t, 1.0 + i * 0.5, 1.5 + i * 0.5));
        const last = i === 3;
        return (
          <div
            key={s}
            style={{
              position: "absolute",
              left: pos[0] - 150,
              top: pos[1] - 50,
              width: 300,
              display: "flex",
              justifyContent: "center",
              transform: `scale(${p})`,
              opacity: clamp(p),
            }}
          >
            <Pill solid={last} style={{ fontSize: 36, padding: "18px 34px" }}>
              <span style={{ fontWeight: 700, color: last ? INK : GOLD }}>{`0${i + 1}`}</span>
              {s}
            </Pill>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 540 - 60, top: 760, transform: `scale(${pop * (0.9 + 0.1 * outCubic(prog(t, 3, 4)))})` }}>
        <Logo size={120} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 7 – 28.9  Apply by email (phone)
// ---------------------------------------------------------------------------
const MailScreen: React.FC<{ t: number }> = ({ t }) => {
  const to = typed(EMAIL, t, 8.0, 11.2);
  const subjPrefix = "Application for ";
  const subjRole = "“The role you're applying for”";
  const sPre = typed(subjPrefix, t, 15.95, 16.7);
  const sRole = typed(subjRole, t, 16.7, 18.2);
  const attach = outBack(prog(t, 11.6, 12.1));
  const sent = prog(t, 24.3, 24.8);
  const fly = inOut(prog(t, 24.3, 25.0));
  const label: React.CSSProperties = { color: "#8a8580", fontWeight: 500, marginRight: 12 };
  const row: React.CSSProperties = {
    padding: "26px 34px",
    borderBottom: "1.5px solid #E2DDD5",
    fontSize: 27,
    color: INK,
    fontFamily: FONT,
    minHeight: 40,
    lineHeight: 1.35,
  };
  return (
    <>
      {/* Compose sheet */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: 96,
          transform: `translateY(${-fly * 1200}px) scale(${1 - fly * 0.4})`,
          opacity: 1 - sent * 0.4,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 34px 22px", fontFamily: FONT }}>
          <span style={{ fontSize: 28, color: "#8a8580" }}>Cancel</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: INK }}>New Message</span>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: GOLD_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + 0.25 * Math.sin(Math.PI * prog(t, 23.9, 24.3))})`,
              boxShadow: t > 23.5 ? "0 0 30px rgba(214,167,67,0.8)" : "none",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
        </div>
        <div style={row}>
          <span style={label}>To:</span>
          {to ? (
            <span style={{ background: "rgba(214,167,67,0.18)", borderRadius: 10, padding: "4px 10px", fontWeight: 600, color: "#7a5413" }}>{to}</span>
          ) : null}
          <Caret t={t} on={t > 7.6 && t < 11.4} />
        </div>
        <div style={{ ...row, background: t > 13.3 && t < 18.9 ? "rgba(214,167,67,0.12)" : "transparent" }}>
          <span style={label}>Subject:</span>
          <span style={{ fontWeight: 600 }}>{sPre}</span>
          <span style={{ fontWeight: 700, color: "#9A6A1E" }}>{sRole}</span>
          <Caret t={t} on={t > 15.6 && t < 18.6} />
        </div>
        <div style={{ ...row, borderBottom: "none", color: "#55504a", ...appear(t, 11.3, 0.4, 10) }}>
          Hi SAS Team,
          <br />
          <br />
          Please find my updated CV attached.
        </div>
        <div
          style={{
            margin: "6px 34px",
            padding: "22px 26px",
            borderRadius: 22,
            background: WHITE,
            border: "1.5px solid #E2DDD5",
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontFamily: FONT,
            transform: `scale(${attach})`,
            opacity: clamp(attach),
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ width: 70, height: 84, borderRadius: 12, background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: INK }}>
            PDF
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: INK }}>Updated_CV.pdf</div>
            <div style={{ fontSize: 22, color: "#8a8580", marginTop: 4 }}>Attached</div>
          </div>
        </div>
      </div>
      {/* Sent / under review state */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          fontFamily: FONT,
          opacity: prog(t, 24.8, 25.2),
          background: PAPER,
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: GOLD_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${outBack(prog(t, 24.9, 25.5))})`,
            boxShadow: "0 20px 50px rgba(214,167,67,0.5)",
          }}
        >
          <Icon name="check" size={96} color={INK} stroke={3} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, color: INK }}>Application sent</div>
        <div
          style={{
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "20px 30px",
            borderRadius: 999,
            background: WHITE,
            border: "1.5px solid #E2DDD5",
            fontSize: 28,
            fontWeight: 600,
            color: "#55504a",
            ...appear(t, 25.8, 0.4, 20),
          }}
        >
          <svg width="34" height="34" viewBox="0 0 50 50" style={{ transform: `rotate(${t * 300}deg)` }}>
            <circle cx="25" cy="25" r="20" stroke="#E2DDD5" strokeWidth="6" fill="none" />
            <circle cx="25" cy="25" r="20" stroke={GOLD} strokeWidth="6" fill="none" strokeDasharray="40 126" strokeLinecap="round" />
          </svg>
          CV under review
        </div>
      </div>
      {/* Notification banner */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: lerp(-200, 84, outBack(prog(t, 27.2, 27.7))),
          padding: "22px 24px",
          borderRadius: 34,
          background: "rgba(20,20,20,0.92)",
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: FONT,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: 18, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Logo size={66} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: WHITE }}>SAS Careers</div>
          <div style={{ fontSize: 23, color: "#cfcfcf", marginTop: 2 }}>Thanks for applying! We'll contact you soon.</div>
        </div>
      </div>
    </>
  );
};

const Apply: React.FC<{ t: number }> = ({ t }) => {
  const enter = outCubic(prog(t, 7.0, 7.9));
  const zoom = inOut(prog(t, 13.3, 14.0)) * (1 - inOut(prog(t, 18.7, 19.3)));
  const side = inOut(prog(t, 18.9, 19.5)) * (1 - inOut(prog(t, 23.6, 24.1)));
  const float = Math.sin(t * 1.4) * 8;
  return (
    <>
      <Backdrop glowY={1150} glow={0.4} />
      <Swap t={t} at={7.0} until={13.1}>
        <Words t={t} at={7.05} span={0.4} text="First," />{" "}
        <Words t={t} at={7.85} span={1.8} text="send your updated CV to" />
        <div style={{ fontSize: 56, marginTop: 10, ...appear(t, 9.6, 0.5) }}>
          <Gold>{EMAIL}</Gold>
        </div>
      </Swap>
      <Swap t={t} at={13.35} until={18.7}>
        <Words t={t} at={13.4} span={1.4} text="For a job posting, use the subject:" />
      </Swap>
      <Swap t={t} at={18.95} until={23.8}>
        <Words t={t} at={19.0} span={1.0} text="Apply via email only." gold={["email", "only."]} />
        <div style={{ fontSize: 58, color: MUTED, fontWeight: 600, marginTop: 14 }}>
          <Words t={t} at={21.3} span={1.2} text="No DM or PM applications." />
        </div>
      </Swap>
      <Swap t={t} at={24.1} until={28.7}>
        <Words t={t} at={24.15} span={1.4} text="After you apply," />{" "}
        <Words t={t} at={25.6} span={2.4} text="wait for our team to review your CV and contact you." gold={["contact", "you."]} />
      </Swap>
      {/* Phone, with a zoom onto the subject line */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 2200,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "540px 760px",
            transform: `translateY(${(1 - enter) * 900 + float}px) translateX(${-side * 170}px) rotateY(${lerp(-28, 0, enter) + side * 12}deg) rotateX(${lerp(14, 0, enter)}deg) scale(${1 + zoom * 0.55}) translateY(${zoom * 140}px)`,
          }}
        >
          <Phone style={{ left: 540 - 280, top: 600 }}>
            <MailScreen t={t} />
          </Phone>
        </div>
      </div>
      {/* "No DM / PM" chat bubbles beside the phone */}
      {[
        { label: "DM", top: 880, at: 21.3 },
        { label: "PM", top: 1190, at: 21.9 },
      ].map((b) => {
        const p = outBack(prog(t, b.at, b.at + 0.45));
        const x = prog(t, b.at + 0.35, b.at + 1.1);
        return (
          <div
            key={b.label}
            style={{
              position: "absolute",
              left: 690,
              top: b.top,
              width: 300,
              height: 300,
              opacity: clamp(p) * side,
              transform: `scale(${p})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 40,
                borderRadius: "50% 50% 50% 12%",
                background: "linear-gradient(160deg, #1e1e1e, #0b0b0b)",
                border: "2px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 70,
                color: MUTED,
              }}
            >
              {b.label}
            </div>
            <NoSign p={x} size={300} />
          </div>
        );
      })}
      {/* Gold "email only" badge */}
      <div
        style={{
          position: "absolute",
          left: 730,
          top: 600,
          opacity: side,
          transform: `scale(${outBack(prog(t, 19.2, 19.7))})`,
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 56,
            background: GOLD_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 80px rgba(214,167,67,0.45)",
          }}
        >
          <Icon name="mail" size={120} color={INK} stroke={2} />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 29.2 – 71.3  The hiring process (laptop dashboard)
// ---------------------------------------------------------------------------
type Step = { at: number; title: string; gold: string[]; label: string };
const STEPS: Step[] = [
  { at: 31.07, title: "We receive the client's hiring request and prepare the job posting.", gold: ["job", "posting."], label: "Request" },
  { at: 35.11, title: "We post the position and begin candidate sourcing.", gold: ["candidate", "sourcing."], label: "Sourcing" },
  { at: 38.39, title: "We screen resumes and shortlist qualified candidates.", gold: ["shortlist"], label: "Screening" },
  { at: 42.84, title: "Initial phone interview, then a client matching interview.", gold: ["client", "matching"], label: "Interviews" },
  { at: 48.63, title: "Assessments and profile completion, depending on the role.", gold: ["Assessments", "profile", "completion,"], label: "Assessment" },
  { at: 54.05, title: "Qualified candidates are endorsed to the client.", gold: ["endorsed"], label: "Endorsed" },
  { at: 57.46, title: "We coordinate the client interview and scheduling.", gold: ["client", "interview"], label: "Scheduling" },
  { at: 60.4, title: "If selected, we confirm your hiring and hand off to Admin & HR.", gold: ["confirm", "your", "hiring"], label: "Hired" },
  { at: 66.89, title: "Not selected? You may stay in our candidate pool for future roles.", gold: ["candidate", "pool"], label: "Talent pool" },
];

const stepIndex = (t: number) => {
  let idx = -1;
  STEPS.forEach((s, i) => {
    if (t >= s.at - 0.2) idx = i;
  });
  return idx;
};

const ScreenStep: React.FC<{ t: number; i: number; children: React.ReactNode }> = ({ t, i, children }) => {
  const start = STEPS[i].at - 0.2;
  const end = i + 1 < STEPS.length ? STEPS[i + 1].at - 0.2 : 99;
  if (t < start || t > end + 0.3) return null;
  const inP = outCubic(prog(t, start, start + 0.4));
  const outP = 1 - prog(t, end, end + 0.3);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 96,
        bottom: 0,
        opacity: Math.min(inP, outP),
        transform: `translateX(${(1 - inP) * 80 - (1 - outP) * 80}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Dashboard: React.FC<{ t: number }> = ({ t }) => {
  const idx = stepIndex(t);
  const s = (i: number) => STEPS[i].at;
  return (
    <>
      {/* Top bar with the stage rail */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 96, borderBottom: "1.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 30px", gap: 18, fontFamily: FONT }}>
        <Logo size={56} />
        <div style={{ fontSize: 24, fontWeight: 700, color: WHITE, marginRight: 20 }}>Hiring Pipeline</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          {STEPS.map((st, i) => (
            <div
              key={st.label}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                background: i < idx ? GOLD : i === idx ? GOLD_LIGHT : "rgba(255,255,255,0.1)",
                boxShadow: i === idx ? `0 0 16px ${GOLD}` : "none",
              }}
            />
          ))}
        </div>
      </div>
      {idx < 0 ? (
        <div style={{ position: "absolute", inset: "96px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", ...appear(t, 29.8, 0.5) }}>
          <Logo size={240} />
        </div>
      ) : null}

      {/* 1 Request -> posting */}
      <ScreenStep t={t} i={0}>
        <Card style={{ left: 50, top: 70, width: 320, padding: 28, transform: `translateX(${(1 - outCubic(prog(t, s(0), s(0) + 0.5))) * -200}px)` }}>
          <div style={{ fontSize: 20, color: MUTED, fontWeight: 600, letterSpacing: "0.1em" }}>CLIENT</div>
          <div style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 20px" }}>Hiring request</div>
          <Lines n={4} />
        </Card>
        <svg width="120" height="60" style={{ position: "absolute", left: 385, top: 200, opacity: prog(t, s(0) + 0.6, s(0) + 1) }}>
          <path d="M 0 30 H 100 M 80 10 L 104 30 L 80 50" stroke={GOLD} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Card glow style={{ left: 520, top: 40, width: 380, padding: 30, ...appear(t, s(0) + 1.2, 0.5) }}>
          <div style={{ fontSize: 20, color: GOLD, fontWeight: 700, letterSpacing: "0.1em" }}>JOB POSTING</div>
          <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 20px" }}>Virtual Assistant</div>
          <Lines n={5} fill={prog(t, s(0) + 1.5, s(0) + 3.3)} />
        </Card>
      </ScreenStep>

      {/* 2 Post + source */}
      <ScreenStep t={t} i={1}>
        <Card glow style={{ left: 290, top: 120, width: 380, padding: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 20, color: GOLD, fontWeight: 700, letterSpacing: "0.1em" }}>JOB POSTING</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: INK, background: GOLD_GRADIENT, padding: "6px 14px", borderRadius: 999, opacity: 0.6 + 0.4 * Math.sin(t * 6) }}>LIVE</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 18px" }}>Virtual Assistant</div>
          <div style={{ fontSize: 26, color: MUTED }}>
            Applicants <span style={{ color: WHITE, fontWeight: 800 }}>{Math.round(48 * outCubic(prog(t, s(1) + 0.4, s(1) + 2.6)))}</span>
          </div>
        </Card>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const p = prog(t, s(1) + 0.3 + i * 0.2, s(1) + 1.1 + i * 0.2);
          const r = lerp(520, 140, outCubic(p));
          return (
            <Avatar
              key={i}
              size={64}
              style={{
                position: "absolute",
                left: 480 + Math.cos(a) * r - 32,
                top: 230 + Math.sin(a) * r * 0.55 - 32,
                opacity: p > 0 && p < 1 ? 1 - p * 0.6 : 0,
              }}
            />
          );
        })}
      </ScreenStep>

      {/* 3 Screen + shortlist */}
      <ScreenStep t={t} i={2}>
        {Array.from({ length: 6 }).map((_, i) => {
          const pick = [0, 2, 4].includes(i);
          const sel = prog(t, s(2) + 1.6 + i * 0.15, s(2) + 2.0 + i * 0.15);
          return (
            <Card
              key={i}
              glow={pick && sel > 0.5}
              style={{
                left: 50 + (i % 3) * 300,
                top: 30 + Math.floor(i / 3) * 230,
                width: 260,
                height: 200,
                padding: 22,
                boxSizing: "border-box",
                opacity: pick ? 1 : 1 - sel * 0.65,
                transform: `scale(${pick ? 1 + sel * 0.04 : 1 - sel * 0.06})`,
                ...appear(t, s(2) + i * 0.1, 0.4, 20),
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                <Avatar size={52} gold={pick && sel > 0.5} />
                <div style={{ fontSize: 22, fontWeight: 700 }}>Resume</div>
              </div>
              <Lines n={3} />
              {pick ? (
                <div style={{ position: "absolute", top: 16, right: 16, transform: `scale(${outBack(sel)})` }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill={GOLD} stroke="none">
                    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                  </svg>
                </div>
              ) : null}
            </Card>
          );
        })}
      </ScreenStep>

      {/* 4 Interviews */}
      <ScreenStep t={t} i={3}>
        <Card glow={t < s(3) + 2.7} style={{ left: 50, top: 50, width: 400, height: 380, padding: 30, boxSizing: "border-box", textAlign: "center" }}>
          <div style={{ position: "relative", width: 150, height: 150, margin: "10px auto 26px" }}>
            {[0, 1].map((k) => {
              const r = ((t * 1.2 + k * 0.5) % 1);
              return <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${GOLD}`, transform: `scale(${1 + r * 0.7})`, opacity: (1 - r) * (t < s(3) + 2.7 ? 1 : 0) }} />;
            })}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t * 25) * (t < s(3) + 2.7 ? 8 : 0)}deg)` }}>
              <Icon name="phone" size={72} color={INK} stroke={2.2} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>Initial phone interview</div>
          <div style={{ fontSize: 22, color: t > s(3) + 2.7 ? GOLD : MUTED, marginTop: 10, fontWeight: 600 }}>{t > s(3) + 2.7 ? "✓ Completed" : "Calling…"}</div>
        </Card>
        <Card glow={t > s(3) + 2.7} style={{ left: 500, top: 50, width: 400, height: 380, padding: 30, boxSizing: "border-box", textAlign: "center", ...appear(t, s(3) + 2.5, 0.5) }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0 36px", height: 130 }}>
            <Avatar size={120} label="YOU" gold />
            <div style={{ width: 70, height: 4, background: GOLD, transform: `scaleX(${prog(t, s(3) + 3, s(3) + 3.6)})` }} />
            <Avatar size={120} label="CLIENT" style={{ fontSize: 26, color: WHITE }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>Client matching interview</div>
        </Card>
      </ScreenStep>

      {/* 5 Assessments + profile */}
      <ScreenStep t={t} i={4}>
        <Card style={{ left: 50, top: 50, width: 520, height: 380, padding: 34, boxSizing: "border-box" }}>
          {[
            { k: "Skills assessment", a: 1.0 },
            { k: "Role-specific test", a: 1.8 },
            { k: "Profile details", a: 2.6 },
          ].map((r) => {
            const p = outCubic(prog(t, s(4) + r.a, s(4) + r.a + 1.0));
            return (
              <div key={r.k} style={{ marginBottom: 34 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
                  <span>{r.k}</span>
                  <span style={{ color: p >= 1 ? GOLD : MUTED }}>{p >= 1 ? "✓" : `${Math.round(p * 100)}%`}</span>
                </div>
                <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 8, background: GOLD_GRADIENT }} />
                </div>
              </div>
            );
          })}
        </Card>
        <Card glow={prog(t, s(4) + 1, s(4) + 4.5) >= 1} style={{ left: 610, top: 50, width: 290, height: 380, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {(() => {
            const p = outCubic(prog(t, s(4) + 1, s(4) + 4.5));
            return (
              <>
                <svg width="190" height="190" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke={GOLD} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${264 * p} 264`} transform="rotate(-90 50 50)" />
                  <text x="50" y="57" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="22" fill={WHITE}>{`${Math.round(p * 100)}%`}</text>
                </svg>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Profile complete</div>
              </>
            );
          })()}
        </Card>
      </ScreenStep>

      {/* 6 Endorsed */}
      <ScreenStep t={t} i={5}>
        <Card style={{ left: 170, top: 50, width: 620, height: 380, padding: 36, boxSizing: "border-box" }}>
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 30 }}>
            <Avatar size={120} label="YOU" gold />
            <div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>Qualified candidate</div>
              <div style={{ fontSize: 24, color: MUTED, marginTop: 6 }}>Ready for client review</div>
            </div>
          </div>
          <Lines n={3} />
        </Card>
        {(() => {
          const p = prog(t, s(5) + 0.8, s(5) + 1.2);
          return (
            <div
              style={{
                position: "absolute",
                left: 560,
                top: 260,
                padding: "16px 36px",
                border: `6px solid ${GOLD}`,
                borderRadius: 18,
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 52,
                letterSpacing: "0.12em",
                color: GOLD,
                background: "rgba(0,0,0,0.6)",
                transform: `rotate(-12deg) scale(${lerp(2.6, 1, outCubic(p))})`,
                opacity: p,
              }}
            >
              ENDORSED
            </div>
          );
        })()}
      </ScreenStep>

      {/* 7 Client interview scheduling */}
      <ScreenStep t={t} i={6}>
        <Card style={{ left: 50, top: 40, width: 860, height: 400, padding: 30, boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>Client interview</div>
            <Icon name="calendar" size={36} color={GOLD} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {["MON", "TUE", "WED", "THU", "FRI"].map((d) => (
              <div key={d} style={{ fontSize: 20, color: MUTED, fontWeight: 600, textAlign: "center" }}>{d}</div>
            ))}
            {Array.from({ length: 15 }).map((_, i) => {
              const chosen = i === 8;
              const p = prog(t, s(6) + 1.2, s(6) + 1.6);
              return (
                <div
                  key={i}
                  style={{
                    height: 70,
                    borderRadius: 14,
                    background: chosen && p > 0 ? GOLD_GRADIENT : "rgba(255,255,255,0.05)",
                    transform: chosen ? `scale(${1 + 0.12 * Math.sin(Math.PI * p)})` : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: chosen && p > 0 ? INK : "rgba(255,255,255,0.3)",
                  }}
                >
                  {["9:00", "11:00", "2:00"][Math.floor(i / 5)]}
                </div>
              );
            })}
          </div>
        </Card>
      </ScreenStep>

      {/* 8 Hired + handoff */}
      <ScreenStep t={t} i={7}>
        {(() => {
          const pop = outBack(prog(t, s(7) + 0.3, s(7) + 0.9));
          const hand = inOut(prog(t, s(7) + 3.2, s(7) + 4.2));
          return (
            <>
              {Array.from({ length: 24 }).map((_, i) => {
                const p = prog(t, s(7) + 0.5, s(7) + 2.6);
                const a = (i / 24) * Math.PI * 2;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 250 + Math.cos(a) * 260 * outCubic(p),
                      top: 220 + Math.sin(a) * 200 * outCubic(p) + p * p * 120,
                      width: 14,
                      height: 22,
                      borderRadius: 4,
                      background: i % 3 ? GOLD : WHITE,
                      transform: `rotate(${i * 40 + p * 400}deg)`,
                      opacity: p > 0 ? 1 - p : 0,
                    }}
                  />
                );
              })}
              <Card glow style={{ left: lerp(70, 50, hand), top: 90, width: 360, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${pop})` }}>
                <Avatar size={110} label="YOU" gold />
                <div style={{ fontSize: 40, fontWeight: 900, marginTop: 20 }}>
                  <Gold>You're hired!</Gold>
                </div>
              </Card>
              <svg width="120" height="60" style={{ position: "absolute", left: 430, top: 210, opacity: hand }}>
                <path d="M 0 30 H 100 M 80 10 L 104 30 L 80 50" stroke={GOLD} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Card style={{ left: 560, top: 90, width: 340, height: 300, padding: 30, boxSizing: "border-box", opacity: hand, transform: `translateX(${(1 - hand) * 80}px)` }}>
                <div style={{ fontSize: 20, color: GOLD, fontWeight: 700, letterSpacing: "0.1em" }}>PRE-ONBOARDING</div>
                <div style={{ fontSize: 32, fontWeight: 800, margin: "10px 0 24px" }}>Admin & HR team</div>
                <div style={{ display: "flex" }}>
                  {[0, 1, 2].map((k) => (
                    <Avatar key={k} size={64} style={{ marginLeft: k ? -16 : 0 }} />
                  ))}
                </div>
              </Card>
            </>
          );
        })()}
      </ScreenStep>

      {/* 9 Candidate pool */}
      <ScreenStep t={t} i={8}>
        {(() => {
          const move = inOut(prog(t, s(8) + 1.4, s(8) + 2.6));
          return (
            <>
              <Card style={{ left: 380, top: 30, width: 520, height: 400, padding: 30, boxSizing: "border-box" }}>
                <div style={{ fontSize: 20, color: GOLD, fontWeight: 700, letterSpacing: "0.1em" }}>CANDIDATE POOL</div>
                <div style={{ fontSize: 30, fontWeight: 800, margin: "8px 0 24px" }}>Future opportunities</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 64px)", gap: 18 }}>
                  {Array.from({ length: 9 }).map((_, k) => (
                    <Avatar key={k} size={64} />
                  ))}
                  <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px dashed ${GOLD}`, opacity: 1 - move }} />
                </div>
              </Card>
              <div
                style={{
                  position: "absolute",
                  left: lerp(80, 380 + 30 + 4 * 82, move),
                  top: lerp(150, 30 + 30 + 24 + 36 + 24 + 82, move),
                  transform: `scale(${lerp(2.2, 1, move)})`,
                  transformOrigin: "0 0",
                }}
              >
                <Avatar size={64} label="YOU" gold style={{ boxShadow: `0 0 30px ${GOLD}` }} />
              </div>
            </>
          );
        })()}
      </ScreenStep>
    </>
  );
};

const Process: React.FC<{ t: number }> = ({ t }) => {
  const open = outCubic(prog(t, 29.4, 30.6));
  const idx = stepIndex(t);
  return (
    <>
      <Backdrop glowY={1100} glow={0.35} />
      <Swap t={t} at={29.26} until={30.9} top={300} size={88}>
        <Words t={t} at={29.3} span={1.0} text="Here's what happens next." gold={["next."]} />
      </Swap>
      {STEPS.map((st, i) => {
        const end = i + 1 < STEPS.length ? STEPS[i + 1].at - 0.25 : 71.0;
        if (t < st.at - 0.25 || t > end + 0.3) return null;
        const o = 1 - prog(t, end, end + 0.25);
        return (
          <div key={st.label} style={{ position: "absolute", inset: 0, opacity: o }}>
            <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", ...appear(t, st.at - 0.2, 0.4, 20) }}>
              <Pill style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.14em", padding: "14px 32px" }}>
                <Gold>{`STEP ${String(i + 1).padStart(2, "0")}`}</Gold>
                <span style={{ color: MUTED }}>·</span>
                <span style={{ color: WHITE, letterSpacing: "0.04em" }}>{st.label.toUpperCase()}</span>
              </Pill>
            </div>
            <Headline top={330} size={66}>
              <Words t={t} at={st.at} span={1.4} text={st.title} gold={st.gold} />
            </Headline>
          </div>
        );
      })}
      <Laptop t={t} open={open} style={{ top: 780 }}>
        <Dashboard t={t} />
      </Laptop>
      {/* Step counter under the laptop */}
      <div style={{ position: "absolute", top: 1560, width: "100%", display: "flex", justifyContent: "center", gap: 16, opacity: open }}>
        {STEPS.map((st, i) => (
          <div
            key={st.label}
            style={{
              width: i === idx ? 54 : 18,
              height: 18,
              borderRadius: 9,
              background: i <= idx ? GOLD : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// 71.7 – 88  Call to action + end card
// ---------------------------------------------------------------------------
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { icon: "mail", text: <>Send your CV to <Gold>{EMAIL}</Gold></>, at: 73.85 },
    { icon: "check", text: <>Follow the application instructions</>, at: 78.6 },
    { icon: "clock", text: <>Wait for our team to contact you</>, at: 80.4 },
  ];
  return (
    <>
      <Backdrop glowY={1000} glow={0.4} />
      <Headline top={300} size={90}>
        <Words t={t} at={71.8} span={1.2} text="Ready for your next opportunity?" gold={["next", "opportunity?"]} />
      </Headline>
      <div style={{ position: "absolute", top: 760, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 34 }}>
        {items.map((it, i) => {
          const done = outBack(prog(t, it.at + 1.0, it.at + 1.4));
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "34px 36px",
                borderRadius: 36,
                background: "linear-gradient(170deg, #161616 0%, #0b0b0b 100%)",
                border: "2px solid rgba(214,167,67,0.3)",
                fontFamily: FONT,
                fontSize: i === 0 ? 38 : 44,
                fontWeight: 600,
                color: WHITE,
                lineHeight: 1.25,
                ...appear(t, it.at, 0.5, 40),
              }}
            >
              <div style={{ width: 96, height: 96, borderRadius: 26, background: GOLD_GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={it.icon} size={52} color={INK} stroke={2.4} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, color: MUTED, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 6 }}>{`STEP ${i + 1}`}</div>
                {it.text}
              </div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", border: `3px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ transform: `scale(${done})`, display: "flex" }}>
                  <Icon name="check" size={32} color={GOLD} stroke={3.4} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 82.5, 83.2));
  return (
    <>
      <Backdrop glowY={760} glow={0.4 + 0.1 * Math.sin(t * 2)} />
      <div style={{ position: "absolute", left: 540 - 250, top: 460, transform: `scale(${pop})`, opacity: clamp(pop) }}>
        <Logo size={500} />
      </div>
      <Headline top={1010} size={56} style={{ fontWeight: 600, color: MUTED }}>
        <Words t={t} at={82.6} span={1.4} text="We look forward to having you join" />
      </Headline>
      <Headline top={1090} size={74}>
        <Words t={t} at={84.2} span={1.2} text="Strategic Assistant Staffing." gold={["Strategic", "Assistant", "Staffing."]} />
      </Headline>
      <div style={{ position: "absolute", top: 1400, width: "100%", textAlign: "center", ...appear(t, 84.8, 0.5) }}>
        <Pill solid style={{ fontSize: 42, padding: "30px 60px" }}>
          <Icon name="mail" size={44} color={INK} stroke={2.4} />
          {EMAIL}
        </Pill>
      </div>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 600, color: MUTED, ...appear(t, 85.4, 0.5) }}>
        Email applications only · No DM or PM
      </div>
    </>
  );
};

export const CareersReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Audio src={staticFile("careers-vo.mp3")} />
      <Scene t={t} from={0} to={6.7}>
        <Intro t={t} />
      </Scene>
      <Scene t={t} from={6.95} to={28.75}>
        <Apply t={t} />
      </Scene>
      <Scene t={t} from={29.15} to={71.25}>
        <Process t={t} />
      </Scene>
      <Scene t={t} from={71.65} to={82.2}>
        <Cta t={t} />
      </Scene>
      <Scene t={t} from={82.45} to={CAREERS_SECONDS + 1}>
        <EndCard t={t} />
      </Scene>
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, CAREERS_SECONDS - 0.6, CAREERS_SECONDS) }} />
    </AbsoluteFill>
  );
};

// Cover for the feed: the phone mid-application.
export const CareersThumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Backdrop glowY={1150} glow={0.45} />
    <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center" }}>
      <Pill style={{ fontSize: 36, letterSpacing: "0.2em", fontWeight: 700, padding: "16px 36px" }}>
        <Gold>WE'RE HIRING</Gold>
      </Pill>
    </div>
    <Headline top={290} size={96}>
      How to apply at <Gold>SAS</Gold>
    </Headline>
    <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
      <div style={{ position: "absolute", inset: 0, transform: "rotateY(-14deg) rotateX(6deg) translateY(-20px)" }}>
        <Phone style={{ left: 540 - 280, top: 560 }}>
          <MailScreen t={20} />
        </Phone>
      </div>
    </div>
    <div style={{ position: "absolute", left: 40, top: 1500, transform: "rotate(-6deg)" }}>
      <Pill solid style={{ fontSize: 34, padding: "22px 38px" }}>
        <Icon name="mail" size={38} color={INK} stroke={2.4} />
        Email only
      </Pill>
    </div>
    <div style={{ position: "absolute", right: 40, top: 1380, transform: "rotate(5deg)" }}>
      <Pill style={{ fontSize: 34, padding: "22px 38px", background: "rgba(10,10,10,0.9)" }}>
        <Gold>9-step</Gold> hiring process
      </Pill>
    </div>
    <div style={{ position: "absolute", bottom: 90, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Logo size={110} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, letterSpacing: "0.2em", color: WHITE }}>STRATEGIC ASSISTANT STAFFING</div>
    </div>
  </AbsoluteFill>
);

