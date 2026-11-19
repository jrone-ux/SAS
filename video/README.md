# SAS video reels

Source projects and finished renders for the SAS social reels.

| Folder | What's in it |
| --- | --- |
| `remotion/` | Remotion project with every Remotion reel (see `src/Root.tsx` for the composition list) |
| `hyperframes/filipino-talent/` | "Why I believe in Filipino talent" (HyperFrames version) |
| `hyperframes/founders-2027/` | Founders Meeting · 2027 Planning reel |
| `hyperframes/day3-operations/` | Day 3 · Operations Team · 2027 Planning (2:13); `tools/` holds the edit list and scene builder |
| `renders/` | Finished MP4s and thumbnails |

## Reels

| Render | Project |
| --- | --- |
| `sas-admin-tasks-reel.mp4` | Remotion `AdminTasksReel` |
| `sas-careers-how-to-apply-reel.mp4` | Remotion `CareersReel` |
| `sas-benefits-reel.mp4` | Remotion `BenefitsReel` |
| `sas-va-training-pampanga-reel*.mp4` | Remotion `TrainingReel` (v1), `TrainingReelV2`, `TrainingReelV3` |
| `sas-empowerment-live-intro-16x9.mp4` | Remotion `EmpowermentLive` (1920×1080) |
| `sas-why-i-recommend-sas-reel*.mp4` | Remotion `TestimonialReel` (v3 has sound effects) |
| `sas-filipino-talent-remotion.mp4` | Remotion `FilipinoReel` |
| `sas-filipino-talent-hyperframes.mp4` | `hyperframes/filipino-talent` |
| `sas-cover-workmate-task-reel.mp4` | Remotion `CoverTaskReel` |
| `sas-founders-meeting-2027.mp4` | `hyperframes/founders-2027` |
| `sas-day3-operations-2027.mp4` | `hyperframes/day3-operations` |

Music and sound effects are original and synthesized in code (no licensing), except the Day 3 video, which uses the supplied Stock-Waves "Relaxed Corporate" track.

## Rendering

Remotion:

```bash
cd video/remotion
npm install
npx remotion render <CompositionId> out/<name>.mp4
```

`remotion.config.ts` points at the cloud session's headless Chrome; remove the
`setBrowserExecutable` line to use Remotion's own browser locally.

HyperFrames:

```bash
cd video/hyperframes/<project>
npx hyperframes preview          # edit in the browser
npx hyperframes render -q delivery -o out.mp4
```

GSAP is vendored in each project's `vendor/` folder so renders work offline.
