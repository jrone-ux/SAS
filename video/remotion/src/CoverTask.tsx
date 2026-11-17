import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, FONT, Gold, GOLD, Icon, lerp, outBack, outCubic, prog, WHITE } from "./brand";

// "When your manager tells you to cover your workmate's task" meme edit.
// Original audio removed; original upbeat music (joy-music.wav) and a
// message ping just before he stands; SAS logo end card.
const CLIP_END = 13.73;
const END_CARD = 2.8;
export const COVER_SECONDS = CLIP_END + END_CARD;
const PING_AT = 1.0;

const Caption: React.FC<{ t: number }> = ({ t }) => {
  const out = prog(t, CLIP_END - 0.25, CLIP_END);
  return (
    <div style={{ position: "absolute", top: 210, left: 70, right: 70, display: "flex", justifyContent: "center", opacity: 1 - out }}>
      <div
        style={{
          padding: "26px 36px 30px",
          borderRadius: 30,
          background: WHITE,
          boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          color: "#111",
          textAlign: "center",
        }}
      >
        When your manager tells you to cover your workmate's task
      </div>
    </div>
  );
};

// Phone-style notification bubble that pops with the ping.
const Notification: React.FC<{ t: number }> = ({ t }) => {
  const p = outBack(prog(t, PING_AT, PING_AT + 0.35));
  const o = Math.min(clamp(p * 1.5), 1 - prog(t, PING_AT + 1.4, PING_AT + 1.7));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 600, left: 120, right: 120, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - clamp(p)) * -40}px) scale(${lerp(0.85, 1, clamp(p))})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 28px", borderRadius: 30, background: "rgba(20,20,22,0.88)", backdropFilter: "blur(14px)", fontFamily: FONT, color: WHITE, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="message" size={40} color={WHITE} stroke={2.4} /></div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 30 }}>Manager</div>
          <div style={{ fontWeight: 500, fontSize: 28, color: "#d0d0d0" }}>Can you cover their task?</div>
        </div>
      </div>
    </div>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const f = t - CLIP_END;
  const inP = outCubic(prog(f, 0, 0.35));
  const logo = outBack(prog(f, 0.15, 0.75));
  return (
    <AbsoluteFill style={{ opacity: inP, background: "radial-gradient(circle at 540px 860px, #2a2010 0%, #050505 65%)", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 540 - 250, top: 560, transform: `scale(${logo}) rotate(${lerp(-12, 0, clamp(logo))}deg)`, opacity: clamp(logo * 1.5) }}>
        <Img src={staticFile("sas-logo.png")} style={{ width: 500, height: 500, objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", top: 1100, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 36, letterSpacing: "0.22em", color: WHITE, opacity: prog(f, 0.5, 0.9) }}>
        STRATEGIC ASSISTANT STAFFING
      </div>
      <div style={{ position: "absolute", top: 1170, width: "100%", textAlign: "center", fontWeight: 600, fontSize: 40, color: "#d9d9d9", opacity: prog(f, 0.8, 1.2) }}>
        Your partner in <Gold>growth.</Gold>
      </div>
      <div style={{ position: "absolute", top: 1250, left: 390, width: 300, height: 4, borderRadius: 2, background: GOLD, transform: `scaleX(${outCubic(prog(f, 0.9, 1.4))})` }} />
    </AbsoluteFill>
  );
};

export const CoverTaskReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // small zoom-through into the end card
  const push = lerp(1, 1.15, outCubic(prog(t, CLIP_END - 0.35, CLIP_END)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < CLIP_END ? (
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <OffthreadVideo src={staticFile("cover-task.mp4")} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      {t < CLIP_END ? <Caption t={t} /> : null}
      <Notification t={t} />
      {t >= CLIP_END ? <EndCard t={t} /> : null}
      <Audio src={staticFile("joy-music.wav")} volume={(f) => {
        const s = f / fps;
        // fade out across the end card
        return 0.8 * (1 - prog(s, COVER_SECONDS - 1.2, COVER_SECONDS));
      }} />
      <Sequence from={Math.round(PING_AT * fps)} durationInFrames={Math.round(1 * fps)}>
        <Audio src={staticFile("sfx/message.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
