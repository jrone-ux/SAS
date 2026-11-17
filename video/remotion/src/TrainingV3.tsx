import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, clamp, FONT, Gold, GOLD, GOLD_LIGHT, Headline, inOut, lerp, Logo, MUTED, outBack, outCubic, Pill, prog, Words } from "./brand";
import {
  Action,
  Announce,
  Beyond,
  CalendarPage,
  Closing,
  Dec11,
  Dust,
  LightSweep,
  Opportunity,
  Partnership,
  Pillars,
  SaveDate,
  Scene,
  Sparkle,
} from "./Training";

// Black-and-gold training reel with the voiceover split after its first
// sentence: line one, a 2 s motion graphic, then the rest of the VO.
// The later scenes come from Training.tsx, whose cues assume the VO starts
// at 2 s; here it resumes 0.3 s later, so those scenes get t - SHIFT.
const LEAD = 0.3;
const SPLIT = 4.3; // audio time after "...something special."
const GAP = 2;
const SHIFT = LEAD + GAP - 2;
const STING = SPLIT + LEAD; // 4.6
const RESUME = STING + GAP; // 6.6
export const TRAINING3_SECONDS = 74;

// 0 – 4.6  October tears away as she says "November is here"
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const tear = prog(t, 0.25, 1.05);
  const zoom = lerp(1.12, 1, outCubic(prog(t, 0, 0.6))) * (1 + 0.05 * prog(t, 1, 4.6));
  const out = inOut(prog(t, 4.2, 4.6));
  return (
    <>
      <Backdrop glowY={1000} glow={0.35 + 0.25 * prog(t, 3.4, 4)} />
      <Dust t={t} o={0.5} />
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center" }}>
        <Pill style={{ fontSize: 34, letterSpacing: "0.22em", fontWeight: 700, padding: "16px 36px" }}>
          <Gold>SAS NEWS · NOVEMBER</Gold>
        </Pill>
      </div>
      <Headline top={330} size={92}>
        <Words t={t} at={0.35} span={1.0} text="November is here," gold={["November"]} />
      </Headline>
      <Headline top={450} size={60} style={{ fontWeight: 600, color: MUTED }}>
        <Words t={t} at={1.9} span={2.0} text="and we're starting the month with something special." gold={["special."]} />
      </Headline>
      <div style={{ position: "absolute", inset: 0, perspective: 2400, transform: `scale(${zoom * lerp(1, 2.2, out)})`, opacity: 1 - out, transformOrigin: "540px 1190px" }}>
        <CalendarPage month="NOVEMBER" style={{ left: 160, top: 760 }} />
        {tear < 1 ? (
          <CalendarPage
            month="OCTOBER"
            style={{
              left: 160,
              top: 760,
              transformOrigin: "50% 0%",
              transform: `translateY(${inOut(tear) * 1500}px) rotateX(${tear * 50}deg) rotate(${tear * 18}deg)`,
              opacity: 1 - prog(t, 0.8, 1.05),
            }}
          />
        ) : null}
        {[0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: 140 + k * 600, top: 730, width: 200, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 34, height: 80, borderRadius: 17, background: "linear-gradient(135deg, #F7D774, #D6A743 50%, #9A6A1E)" }} />
          </div>
        ))}
      </div>
      <Sparkle t={t} at={0.9} x={540} y={900} n={22} r={520} />
      <Sparkle t={t} at={3.6} x={540} y={560} n={16} r={360} />
    </>
  );
};

// 4.6 – 6.6  Silent motion graphic: light rays, gift-box burst, logo reveal.
const Sting: React.FC<{ t: number }> = ({ t }) => {
  const s = t - STING;
  const rays = outCubic(prog(s, 0, 0.5));
  const lid = inOut(prog(s, 0.35, 0.75));
  const logo = outBack(prog(s, 0.6, 1.1));
  const label = prog(s, 0.9, 1.4);
  const out = inOut(prog(s, 1.65, 2.0));
  return (
    <AbsoluteFill style={{ transform: `scale(${lerp(1, 1.6, out)})`, opacity: 1 - out * 0.9 }}>
      <AbsoluteFill style={{ background: "#000" }} />
      {/* rotating light rays */}
      <AbsoluteFill style={{ opacity: rays * 0.9, transform: `rotate(${s * 40}deg) scale(${lerp(0.4, 1.4, rays)})` }}>
        <div
          style={{
            position: "absolute",
            left: 540 - 1100,
            top: 960 - 1100,
            width: 2200,
            height: 2200,
            borderRadius: "50%",
            background: `repeating-conic-gradient(from 0deg, rgba(214,167,67,0.28) 0deg 7deg, rgba(0,0,0,0) 7deg 20deg)`,
            WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 65%)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 540px 960px, rgba(247,215,116,${0.55 * rays}) 0%, rgba(0,0,0,0) 45%)` }} />
      {/* gift box: lid pops off, light pours out */}
      <div style={{ position: "absolute", left: 540 - 210, top: 1080, width: 420, height: 330, borderRadius: 26, background: "linear-gradient(160deg, #1d1a14, #070707)", border: `4px solid ${GOLD}`, transform: `translateY(${lid * 700}px)`, opacity: 1 - lid }}>
        <div style={{ position: "absolute", left: 180, top: 0, bottom: 0, width: 60, background: "linear-gradient(135deg, #F7D774, #D6A743 50%, #9A6A1E)" }} />
      </div>
      <div style={{ position: "absolute", left: 540 - 240, top: 1010, width: 480, height: 90, borderRadius: 20, background: "linear-gradient(135deg, #F7D774, #D6A743 50%, #9A6A1E)", transform: `translate(${lid * 300}px, ${-lid * 900}px) rotate(${lid * 70}deg)`, opacity: 1 - lid }} />
      {/* logo disc rises out of the light */}
      <div
        style={{
          position: "absolute",
          left: 540 - 230,
          top: 960 - 230 + (1 - clamp(logo)) * 200,
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #23201a, #050505)",
          border: `5px solid ${GOLD}`,
          boxShadow: `0 0 ${140 * clamp(logo)}px rgba(214,167,67,0.7)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logo}) rotateY(${lerp(180, 0, clamp(logo))}deg)`,
          opacity: clamp(logo * 2),
        }}
      >
        <Logo size={340} />
      </div>
      <Sparkle t={s} at={0.65} x={540} y={960} n={30} r={640} />
      <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: `${lerp(0.6, 0.22, outCubic(label))}em`, color: GOLD_LIGHT, opacity: label }}>
        COMING THIS DECEMBER
      </div>
    </AbsoluteFill>
  );
};

export const TrainingReelV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const u = t - SHIFT; // time for the scenes borrowed from Training.tsx
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Sequence from={Math.round(LEAD * fps)} durationInFrames={Math.round(SPLIT * fps)}>
        <Audio src={staticFile("training-vo.mp3")} />
      </Sequence>
      <Sequence from={Math.round(RESUME * fps)}>
        <Audio src={staticFile("training-vo.mp3")} trimBefore={Math.round(SPLIT * fps)} />
      </Sequence>

      {t < STING ? <Hook t={t} /> : null}
      {t >= STING && t < RESUME + 0.2 ? <Sting t={t} /> : null}

      <Scene t={u} from={6.25} to={12.9} kind="zoom">
        <Announce t={u} />
      </Scene>
      <Scene t={u} from={13.4} to={26.2} kind="slide">
        <Partnership t={u} />
      </Scene>
      <Scene t={u} from={26.7} to={31.45} kind="zoom">
        <Beyond t={u} />
      </Scene>
      <Scene t={u} from={31.85} to={39.85} kind="rise">
        <Pillars t={u} />
      </Scene>
      <Scene t={u} from={40.35} to={44.0} kind="fade">
        <Action t={u} />
      </Scene>
      <Scene t={u} from={44.45} to={51.6} kind="slide">
        <Dec11 t={u} />
      </Scene>
      <Scene t={u} from={52.05} to={61.15} kind="zoom">
        <Opportunity t={u} />
      </Scene>
      <Scene t={u} from={61.6} to={65.8} kind="zoom">
        <SaveDate t={u} />
      </Scene>
      <Scene t={u} from={66.15} to={TRAINING3_SECONDS + 1} kind="fade">
        <Closing t={u} />
      </Scene>
      {[13.4, 26.7, 31.85, 44.45, 52.05, 61.6, 66.15].map((at) => (
        <LightSweep key={at} t={u} at={at} />
      ))}
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, TRAINING3_SECONDS - 0.6, TRAINING3_SECONDS) }} />
    </AbsoluteFill>
  );
};
