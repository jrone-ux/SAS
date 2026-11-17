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
  Tile,
  WHITE,
  Words,
} from "./brand";

// Cue times (seconds) measured from the pauses in the voiceover.
export const REEL_SECONDS = 56;

// Fades a scene in and out; children get absolute time `t`.
const Scene: React.FC<{
  t: number;
  from: number;
  to: number;
  children: React.ReactNode;
  fadeIn?: boolean;
}> = ({ t, from, to, children, fadeIn = true }) => {
  if (t < from - 0.01 || t > to + 0.35) return null;
  const inP = fadeIn ? outCubic(prog(t, from, from + 0.35)) : 1;
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

// ---------------------------------------------------------------------------
// Cover / thumbnail. Also the first frame of the reel so the feed shows it.
// ---------------------------------------------------------------------------
const COVER_TILES = [
  { icon: "mail", x: 150, y: 1010, r: -10, badge: 17 },
  { icon: "calendar", x: 330, y: 930, r: 6 },
  { icon: "sheet", x: 520, y: 990, r: -4, badge: 5 },
  { icon: "phone", x: 720, y: 920, r: 9 },
  { icon: "filter", x: 860, y: 1050, r: -7, badge: 3 },
  { icon: "keyboard", x: 240, y: 1180, r: 5 },
  { icon: "message", x: 440, y: 1160, r: -8, badge: 9 },
  { icon: "bell", x: 640, y: 1150, r: 4 },
  { icon: "chart", x: 820, y: 1230, r: -5 },
];

export const Cover: React.FC<{ t?: number }> = ({ t = 0 }) => {
  const float = (i: number) => Math.sin(t * 2 + i) * 8;
  return (
    <AbsoluteFill>
      <Backdrop glowY={1080} glow={0.35} />
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center" }}>
        <Pill style={{ fontSize: 38, letterSpacing: "0.18em", fontWeight: 700, padding: "18px 40px" }}>
          <Gold>DID YOU KNOW?</Gold>
        </Pill>
      </div>
      <Headline top={380} size={100}>
        Busywork is costing your business <Gold>more than you think.</Gold>
      </Headline>
      {COVER_TILES.map((c, i) => (
        <Tile
          key={c.icon}
          icon={c.icon}
          badge={c.badge}
          size={150}
          style={{
            left: c.x - 75,
            top: c.y - 75 + float(i),
            transform: `rotate(${c.r}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 170,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Logo size={190} />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.22em",
            color: WHITE,
          }}
        >
          STRATEGIC ASSISTANT STAFFING
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 1.35 – 7.2  "Repeating the same admin tasks every week… more than you think."
const WeekLoop: React.FC<{ t: number }> = ({ t }) => {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const chips = ["mail", "calendar", "sheet"];
  const swap = prog(t, 4.3, 4.7);
  const spin = (t - 1.35) * 200;
  return (
    <>
      <Backdrop />
      <Headline top={250} style={{ opacity: 1 - swap }}>
        <Words t={t} at={1.4} span={1.6} text="Repeating the same admin tasks" />{" "}
        <Words t={t} at={3.3} span={0.8} text="every week" gold={["every", "week"]} />
      </Headline>
      <Headline top={250} style={{ opacity: swap }}>
        <Words t={t} at={4.4} span={1.2} text="could be costing your business" />{" "}
        <Words t={t} at={5.6} span={0.9} text="more than you think." gold={["more", "than", "you", "think"]} />
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 720,
          left: 90,
          right: 90,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {days.map((d, di) => (
          <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.12em",
                color: MUTED,
                ...appear(t, 1.5 + di * 0.08, 0.4),
              }}
            >
              {d}
            </div>
            {chips.map((c, ci) => {
              const at = 1.7 + di * 0.32 + ci * 0.1;
              const p = outBack(prog(t, at, at + 0.4));
              return (
                <div
                  key={c}
                  style={{
                    position: "relative",
                    width: 150,
                    height: 150,
                    opacity: clamp(p),
                    transform: `scale(${p})`,
                  }}
                >
                  <Tile icon={c} size={150} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Repeat badge */}
      <div
        style={{
          position: "absolute",
          top: 1380,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          ...appear(t, 2.6, 0.5),
        }}
      >
        <Pill>
          <span style={{ display: "inline-flex", transform: `rotate(${spin}deg)` }}>
            <Icon name="repeat" size={44} color={GOLD_LIGHT} stroke={2.2} />
          </span>
          Again. And again. And again.
        </Pill>
      </div>
      {/* Clock that fills as the cost line lands */}
      <div
        style={{
          position: "absolute",
          top: 1560,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: swap,
        }}
      >
        <svg width="190" height="190" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="6" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke={GOLD}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${276 * outCubic(prog(t, 4.6, 6.8))} 276`}
            transform="rotate(-90 50 50)"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke={WHITE}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${(t - 4.3) * 360} 50 50)`}
          />
          <circle cx="50" cy="50" r="4" fill={WHITE} />
        </svg>
      </div>
    </>
  );
};

// 7.2 – 15.5  "It's not just the time spent answering emails, …"
const TASKS = [
  { icon: "mail", label: "Answering emails", at: 9.3 },
  { icon: "calendar", label: "Scheduling appointments", at: 10.5 },
  { icon: "sheet", label: "Updating spreadsheets", at: 11.85 },
  { icon: "keyboard", label: "Entering data", at: 12.7 },
  { icon: "filter", label: "Following up with leads", at: 14.0 },
];

const TaskList: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Backdrop />
    <Headline top={230} size={76}>
      <Words t={t} at={7.3} span={1.4} text="It's not just the time spent on…" />
    </Headline>
    <div
      style={{
        position: "absolute",
        top: 560,
        left: 110,
        right: 110,
        display: "flex",
        flexDirection: "column",
        gap: 34,
      }}
    >
      {TASKS.map((task) => {
        const s = appear(t, task.at - 0.15, 0.45, 0);
        const x = (1 - outCubic(prog(t, task.at - 0.15, task.at + 0.3))) * -120;
        return (
          <div
            key={task.label}
            style={{
              ...s,
              transform: `translateX(${x}px)`,
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "26px 32px",
              borderRadius: 32,
              background: "rgba(255,255,255,0.035)",
              border: "1.5px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ position: "relative", width: 110, height: 110 }}>
              <Tile icon={task.icon} size={110} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 50, color: WHITE, letterSpacing: "-0.02em" }}>
              {task.label}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

// 15.5 – 20.2  "It's the time you're losing from the things that actually move your business forward."
const LostTime: React.FC<{ t: number }> = ({ t }) => {
  const draw = outCubic(prog(t, 16.2, 18.8));
  const W = 900;
  const potential = "M 0 520 C 220 480, 420 330, 900 40";
  const actual = "M 0 520 C 260 510, 520 470, 900 430";
  return (
    <>
      <Backdrop />
      <Headline top={230} size={78}>
        <Words t={t} at={15.6} span={1.6} text="It's the time you're losing" />{" "}
        <Words
          t={t}
          at={17.3}
          span={2.0}
          text="from what actually moves your business forward."
          gold={["forward"]}
        />
      </Headline>
      <svg
        width={W}
        height={600}
        viewBox="0 -20 900 600"
        style={{ position: "absolute", left: 90, top: 900, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="gap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.28" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="0" y1="560" x2="900" y2="560" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        <path
          d={`${potential} L 900 430 C 520 470, 260 510, 0 520 Z`}
          fill="url(#gap)"
          opacity={prog(t, 18.2, 19.0)}
        />
        <path
          d={potential}
          stroke={GOLD}
          strokeWidth="8"
          strokeDasharray="22 18"
          fill="none"
          pathLength={1000}
          style={{ strokeDashoffset: 0 }}
          opacity={0.9}
          clipPath="url(#reveal)"
        />
        <clipPath id="reveal">
          <rect x="-20" y="-40" width={940 * draw} height="660" />
        </clipPath>
        <path d={actual} stroke={MUTED} strokeWidth="8" fill="none" clipPath="url(#reveal)" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", top: 870, right: 110, fontFamily: FONT, fontSize: 34, fontWeight: 600, ...appear(t, 18.0, 0.4) }}>
        <Gold>Where you could be</Gold>
      </div>
      <div style={{ position: "absolute", top: 1410, right: 110, fontFamily: FONT, fontSize: 34, fontWeight: 600, color: MUTED, ...appear(t, 18.3, 0.4) }}>
        Where busywork keeps you
      </div>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", ...appear(t, 18.6, 0.4) }}>
        <Pill>
          <Icon name="clock" size={42} color={GOLD_LIGHT} stroke={2.2} />
          Time lost
        </Pill>
      </div>
    </>
  );
};

// 20.3 – 27.9  "When routine tasks keep landing on your plate, your attention gets divided…"
const PILE = [
  { icon: "mail", x: 360, y: 1060, r: -8 },
  { icon: "calendar", x: 540, y: 1050, r: 5 },
  { icon: "sheet", x: 720, y: 1065, r: -3 },
  { icon: "phone", x: 450, y: 925, r: 7 },
  { icon: "filter", x: 630, y: 920, r: -6 },
  { icon: "keyboard", x: 540, y: 790, r: 3 },
  { icon: "message", x: 380, y: 790, r: -9 },
  { icon: "bell", x: 700, y: 790, r: 8 },
];

const Plate: React.FC<{ t: number }> = ({ t }) => {
  const split = inOut(prog(t, 23.0, 23.6));
  const running = lerp(50, 22, outCubic(prog(t, 24.2, 27.0)));
  const keeping = 100 - running;
  return (
    <>
      <Backdrop glowY={1100} />
      <Headline top={230} size={78} style={{ opacity: 1 - split }}>
        <Words t={t} at={20.3} span={2.2} text="When routine tasks keep landing on your plate," gold={["plate"]} />
      </Headline>
      <Headline top={230} size={78} style={{ opacity: split }}>
        <Words t={t} at={23.0} span={1.4} text="your attention gets divided." gold={["divided"]} />
      </Headline>
      {/* Person */}
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: 1180,
          width: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          transform: `translateX(${split * 0}px)`,
        }}
      >
        <div style={{ width: 130, height: 130, borderRadius: "50%", background: "#E9E4DC" }} />
        <div style={{ width: 260, height: 140, borderRadius: "130px 130px 20px 20px", background: "#E9E4DC" }} />
      </div>
      {/* Tasks dropping onto the person */}
      {PILE.map((p, i) => {
        const at = 20.4 + i * 0.27;
        const fall = outBack(prog(t, at, at + 0.5));
        const y = lerp(-300, p.y, fall);
        const shake = Math.sin(t * 30 + i) * 3 * prog(t, 22.0, 23.0) * (1 - split);
        return (
          <Tile
            key={p.icon}
            icon={p.icon}
            size={150}
            style={{
              left: p.x - 75 + shake,
              top: y - 75 - split * 60,
              transform: `rotate(${p.r + shake}deg) scale(${1 - split * 0.15})`,
              opacity: t < at ? 0 : 1 - split * 0.35,
            }}
          />
        );
      })}
      {/* Attention meter */}
      <div
        style={{
          position: "absolute",
          top: 1520,
          left: 110,
          right: 110,
          opacity: split,
          display: "flex",
          flexDirection: "column",
          gap: 30,
          fontFamily: FONT,
        }}
      >
        {[
          { label: "Running the business", v: running, gold: true },
          { label: "Keeping up with it", v: keeping, gold: false },
        ].map((row, i) => (
          <div key={row.label} style={appear(t, 23.5 + i * 0.4, 0.45, 20)}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 600, color: row.gold ? WHITE : MUTED, marginBottom: 12 }}>
              <span>{row.label}</span>
              <span>{Math.round(row.v)}%</span>
            </div>
            <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${row.v}%`,
                  height: "100%",
                  borderRadius: 11,
                  background: row.gold ? GOLD_GRADIENT : "rgba(255,255,255,0.45)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// 28.0 – 31.1  "That's where Strategic Assistant Staffing can help."
const Help: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 28.6, 29.3));
  const ring = outCubic(prog(t, 28.6, 29.8));
  const sweep = prog(t, 29.4, 30.4);
  return (
    <>
      <Backdrop glowY={900} glow={0.5 * pop} />
      <Headline top={300} size={64} style={{ color: MUTED, fontWeight: 600 }}>
        <Words t={t} at={28.05} span={0.4} text="That's where" />
      </Headline>
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 900 - 300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `3px solid rgba(214,167,67,${0.6 * (1 - ring)})`,
          transform: `scale(${lerp(0.4, 1.5, ring)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 260,
          top: 900 - 260,
          width: 520,
          height: 520,
          transform: `scale(${pop})`,
          opacity: clamp(pop),
          overflow: "hidden",
          WebkitMaskImage: `url(${staticFile("sas-logo.png")})`,
          WebkitMaskSize: "contain",
        }}
      >
        <Logo size={520} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(110deg, transparent ${lerp(-40, 120, sweep) - 15}%, rgba(255,250,225,0.85) ${lerp(-40, 120, sweep)}%, transparent ${lerp(-40, 120, sweep) + 15}%)`,
          }}
        />
      </div>
      <Headline top={1270} size={74}>
        <Words t={t} at={28.6} span={1.0} text="Strategic Assistant Staffing" />
        <br />
        <Words t={t} at={29.9} span={0.5} text="can help." gold={["can", "help"]} />
      </Headline>
    </>
  );
};

// 31.15 – 35.2  "Our skilled Virtual Assistants can take ownership of recurring tasks,"
const Ownership: React.FC<{ t: number }> = ({ t }) => {
  const card = outCubic(prog(t, 31.2, 31.8));
  return (
    <>
      <Backdrop />
      <Headline top={210} size={74}>
        <Words t={t} at={31.2} span={1.3} text="Skilled Virtual Assistants" gold={["Virtual", "Assistants"]} />{" "}
        <Words t={t} at={32.6} span={1.6} text="take ownership of recurring tasks." />
      </Headline>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 640,
          borderRadius: 48,
          padding: "44px 44px 30px",
          background: "linear-gradient(170deg, #161616 0%, #090909 100%)",
          border: "1.5px solid rgba(214,167,67,0.3)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          opacity: card,
          transform: `translateY(${(1 - card) * 80}px)`,
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: GOLD_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 38,
              color: "#111",
            }}
          >
            VA
          </div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 700, color: WHITE }}>Your Virtual Assistant</div>
            <div style={{ fontSize: 30, color: MUTED, marginTop: 4 }}>Handling this week's recurring tasks</div>
          </div>
        </div>
        {TASKS.map((task, i) => {
          const at = 32.4 + i * 0.45;
          const done = outBack(prog(t, at, at + 0.35));
          return (
            <div
              key={task.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "22px 0",
                borderTop: "1.5px solid rgba(255,255,255,0.07)",
                ...appear(t, 31.6 + i * 0.12, 0.4, 20),
              }}
            >
              <Icon name={task.icon} size={44} color={MUTED} />
              <div style={{ flex: 1, fontSize: 40, fontWeight: 500, color: WHITE }}>{task.label}</div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: `3px solid ${done > 0.05 ? GOLD : "rgba(255,255,255,0.2)"}`,
                  background: done > 0.05 ? GOLD_GRADIENT : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ transform: `scale(${done})`, display: "flex" }}>
                  <Icon name="check" size={36} color="#111" stroke={3.2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// 35.25 – 42.6  "keep your processes moving, and give you back valuable time to focus on your clients, your strategy, and your growth."
const Focus: React.FC<{ t: number }> = ({ t }) => {
  const flow = (t - 35.2) * 0.6;
  const pills = [
    { icon: "users", label: "Your clients", at: 39.4 },
    { icon: "target", label: "Your strategy", at: 40.4 },
    { icon: "trend", label: "Your growth", at: 41.4 },
  ];
  return (
    <>
      <Backdrop />
      <Headline top={210} size={74}>
        <Words t={t} at={35.3} span={1.2} text="Keep your processes moving" gold={["moving"]} />
      </Headline>
      {/* Process line with moving dots */}
      <div style={{ position: "absolute", top: 470, left: 140, right: 140, height: 120, ...appear(t, 35.5, 0.5) }}>
        <div style={{ position: "absolute", top: 58, left: 0, right: 0, height: 4, background: "rgba(214,167,67,0.35)" }} />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 30,
              left: `calc(${(i / 3) * 100}% - 30px)`,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#0c0c0c",
              border: `3px solid ${GOLD}`,
            }}
          />
        ))}
        {[0, 0.33, 0.66].map((o) => {
          const p = (flow + o) % 1;
          return (
            <div
              key={o}
              style={{
                position: "absolute",
                top: 48,
                left: `calc(${p * 100}% - 12px)`,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: GOLD_LIGHT,
                boxShadow: `0 0 24px ${GOLD}`,
              }}
            />
          );
        })}
      </div>
      <Headline top={700} size={74}>
        <Words t={t} at={37.0} span={1.6} text="and get valuable time back" gold={["time", "back"]} />
      </Headline>
      <Headline top={900} size={46} style={{ color: MUTED, fontWeight: 500 }}>
        <Words t={t} at={38.7} span={0.7} text="to focus on" />
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 1030,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        {pills.map((p, i) => {
          const pop = outBack(prog(t, p.at, p.at + 0.45));
          return (
            <div key={p.label} style={{ opacity: clamp(pop * 1.5), transform: `scale(${lerp(0.6, 1, pop)})` }}>
              <Pill solid={i === 2} style={{ fontSize: 58, padding: "32px 64px", minWidth: 560, justifyContent: "center" }}>
                <Icon name={p.icon} size={56} color={i === 2 ? "#111" : GOLD_LIGHT} stroke={2.2} />
                {p.label}
              </Pill>
            </div>
          );
        })}
      </div>
    </>
  );
};

// 42.7 – 47.85  "Because your time should be spent growing your business, not getting buried in the busywork."
const Growing: React.FC<{ t: number }> = ({ t }) => {
  const draw = outCubic(prog(t, 42.9, 45.2));
  const strike = outCubic(prog(t, 46.6, 47.2));
  const path = "M 0 470 C 220 460, 380 380, 520 300 S 780 90, 900 20";
  return (
    <>
      <Backdrop />
      <Headline top={230} size={78}>
        <Words t={t} at={42.75} span={2.4} text="Your time should be spent growing your business," gold={["growing"]} />
      </Headline>
      <svg width="900" height="520" viewBox="0 -20 900 520" style={{ position: "absolute", left: 90, top: 640, overflow: "visible" }}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.3" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GOLD_LIGHT} />
            <stop offset="1" stopColor={GOLD} />
          </linearGradient>
          <clipPath id="grow">
            <rect x="-20" y="-40" width={940 * draw} height="600" />
          </clipPath>
        </defs>
        <g clipPath="url(#grow)">
          <path d={`${path} L 900 500 L 0 500 Z`} fill="url(#area)" />
          <path d={path} stroke="url(#stroke)" strokeWidth="10" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <Headline top={1300} size={70} style={{ fontWeight: 600 }}>
        <Words t={t} at={45.6} span={0.9} text="not buried in the" />{" "}
        <span style={{ position: "relative", display: "inline-block", ...appear(t, 46.3, 0.4, 24) }}>
          <span style={{ color: MUTED }}>busywork.</span>
          <span
            style={{
              position: "absolute",
              left: -6,
              top: "54%",
              height: 8,
              borderRadius: 4,
              width: `calc(${strike * 100}% + 12px)`,
              background: GOLD_GRADIENT,
            }}
          />
        </span>
      </Headline>
    </>
  );
};

// 47.9 – end  "Strategic Assistant Staffing. Your partner in growth, trust, and accountability."
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const pop = outBack(prog(t, 47.9, 48.6));
  const glow = 0.4 + 0.1 * Math.sin(t * 2);
  const name = "STRATEGIC ASSISTANT STAFFING";
  const words: { w: string; at: number; gold?: boolean }[] = [
    { w: "Your", at: 49.95 },
    { w: "partner", at: 50.15 },
    { w: "in", at: 50.4 },
    { w: "growth,", at: 50.6, gold: true },
    { w: "trust,", at: 51.0, gold: true },
    { w: "and", at: 51.55 },
    { w: "accountability.", at: 51.8, gold: true },
  ];
  return (
    <>
      <Backdrop glowY={780} glow={glow} />
      <div
        style={{
          position: "absolute",
          left: 540 - 270,
          top: 520,
          transform: `scale(${pop})`,
          opacity: clamp(pop),
        }}
      >
        <Logo size={540} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1090,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: "0.2em",
          color: WHITE,
        }}
      >
        {name.split("").map((c, i) => (
          <span key={i} style={{ opacity: prog(t, 48.2 + i * 0.03, 48.5 + i * 0.03) }}>
            {c}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1200,
          left: 100,
          right: 100,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 60,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: WHITE,
        }}
      >
        {words.map((x, i) => (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...appear(t, x.at - 0.1, 0.4, 24) }}>
            {x.gold ? <Gold>{x.w}</Gold> : x.w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1520, width: "100%", textAlign: "center", ...appear(t, 52.6, 0.5) }}>
        <Pill solid style={{ fontSize: 44, padding: "30px 70px" }}>
          strategic-assistant.com
        </Pill>
      </div>
    </>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Audio src={staticFile("voiceover.mp3")} />
      <Scene t={t} from={0} to={1.3} fadeIn={false}>
        <Cover t={t} />
      </Scene>
      <Scene t={t} from={1.35} to={6.95}>
        <WeekLoop t={t} />
      </Scene>
      <Scene t={t} from={7.2} to={15.15}>
        <TaskList t={t} />
      </Scene>
      <Scene t={t} from={15.5} to={19.8}>
        <LostTime t={t} />
      </Scene>
      <Scene t={t} from={20.2} to={27.5}>
        <Plate t={t} />
      </Scene>
      <Scene t={t} from={27.95} to={30.7}>
        <Help t={t} />
      </Scene>
      <Scene t={t} from={31.1} to={34.95}>
        <Ownership t={t} />
      </Scene>
      <Scene t={t} from={35.25} to={42.25}>
        <Focus t={t} />
      </Scene>
      <Scene t={t} from={42.65} to={47.4}>
        <Growing t={t} />
      </Scene>
      <Scene t={t} from={47.8} to={REEL_SECONDS + 1}>
        <EndCard t={t} />
      </Scene>
      {/* Fade to black at the very end */}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, REEL_SECONDS - 0.6, REEL_SECONDS) }} />
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Cover t={0} />
  </AbsoluteFill>
);
