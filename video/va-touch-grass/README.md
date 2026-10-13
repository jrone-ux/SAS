# VA Touches Grass — 30 s vertical short

`va-touch-grass.mp4` is a 1080x1920 (9:16) video at 30 fps for TikTok, Instagram Reels and Facebook Reels. It runs exactly 30 seconds and is encoded as H.264 with AAC audio.

The whole thing is a real-time 3D scene built in code with Three.js. Every frame is rendered deterministically, so you can re-render any frame and get the same picture.

## Storyboard

| Time | Shot |
|---|---|
| 0–7 s | **Day 847 of working from home.** She types furiously at three monitors (inbox at 2,847, a spreadsheet, chat pings) with a laptop task list, a headset, a "graveyard" of empty mugs and a dead plant. She has tired eye bags, sips coffee without looking, and her eye twitches. Notification bubbles pop around her. |
| 7–13 s | A clock close-up ticks to **5:00 PM**, then *DING*. Her eyes sparkle. She takes off the headset, stands, does a huge yawn stretch (*crack*) and bounces to the front door in bunny slippers. |
| 13–19 s | The door opens and sunlight floods in to a choir "aaah". She squints and shields her eyes, then toe-tests the doorstep. A POV pan shows the garden: grass, flowers, trees, sky and butterflies. Close-up: her eyes grow huge with star sparkles, and she squishes her cheeks. |
| 19–25 s | She kneels and puts **both hands in the grass and soil**. She wiggles her fingers, then stares at her dirt-speckled hands in disbelief (tear of joy, lip quiver, head shake). She pats the ground again. A butterfly flies past her nose and she goes cross-eyed. |
| 25–30 s | *DING* plus a record scratch. She snaps around to look back at the house. The laptop shows **"URGENT: Just one quick task 😂"**. Her smile drains to a frown over a sad trombone, and she pats the grass goodbye. She sprints back inside and the door slams. Caption: "VA life." |

All key action stays in the center of the frame, clear of the TikTok/Reels UI at the bottom and right edge.

## Re-render

```bash
npm install                      # three.js
node render.mjs --workers 2      # 900 PNG frames -> frames/
python3 audio.py                 # synthesized music + SFX -> audio.wav
ffmpeg -framerate 30 -i frames/f_%04d.png -i audio.wav -c:v libx264 -pix_fmt yuv420p \
  -crf 18 -preset slow -c:a aac -b:a 192k -shortest -movflags +faststart va-touch-grass.mp4
```

Preview single moments with `node render.mjs --stills 4.5,18,26`.

Files:
- `scene.js` holds the sets, character rig, poses, cameras and timeline.
- `scene.html` holds the page and text overlays.
- `render.mjs` is the headless frame renderer.
- `audio.py` generates the soundtrack.
