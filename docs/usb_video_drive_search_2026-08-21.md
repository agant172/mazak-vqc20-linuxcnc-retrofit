<!-- Search of the USB Video Drive for the missing M-2 parameter-screen video, 2026-08-21. -->

> **ROLE: REFERENCE** — closes the last unsearched location for the M-2 parameter
> video, and dates the resolver borescope material. See
> [../INSTALL_SPINE.md](../INSTALL_SPINE.md).

# USB Video Drive search — 2026-08-21

Searched over Tailscale from the iMac; the drive was mounted on the MacBook.
Frames were sampled remotely with `ffmpeg` so only small files crossed the link.

Folder: **`/Volumes/USB Video Drive/Equipment & Machine Tools/Mazak`** — not the
drive root. The drive was reorganised into five category folders on 2026-08-16;
`~/.claude/shop-projects.md` documents the current layout and is accurate.

## Result: the parameter video is not here

`background/parameter_recovery.md` and
[`diagnosis_screens_2025-06-27.md`](diagnosis_screens_2025-06-27.md) record that
Andy recalls filming all the M-2 parameter screens as a record, and that the video
had not been found on either Mac, in Drive, in OneDrive or in the Photos libraries.
This drive was the last catalogued place to look.

| | |
|---|---|
| Files in the folder | 99 (49 clips, 49 stills, 1 subfolder) |
| Clips **longer than 5 seconds** | **1** |
| That one clip | `Resolver (2018)/VID_001.AVI`, 27 s, 1280×720 MJPEG |
| Everything else | 48 × `IMG_nnnn.mov`, ~2 s each |

The 48 short clips are **Live Photo motion components**, each paired with an
`IMG_nnnn.JPG` still of the same number — not footage. Several carry the CRT
numbers (`IMG_0304`–`0310`, `IMG_0355`, `IMG_0362`, `IMG_0373`–`0380`), so they are
the motion halves of parameter-screen stills already held in `07_Reference`, about
two seconds each and showing the same page.

**No `MACH CONSTANT PAR NO.1` or `NO.3` capture exists on this drive.**
**The iPhone camera roll is the only remaining place to look.**

## The resolver borescope material is 2018, and that is confirmed

`Resolver (2018)/` holds `IMG_001`–`IMG_015` plus `VID_001.AVI`. The video carries
a burned-in timestamp of **2018-05-09 22:34**; the stills carry no EXIF and no
visible overlay.

`~/.claude/shop-projects.md` records this folder as "older documentation of a
Seiki Co. Ltd resolver … shot years before the main restoration push. **Confirmed
by Andy 2026-08-17**", previously an orphaned `Mazak Resolver` folder at the drive
root. So the 2018 date is real, not an unset camera clock.

**This matters for citation.** The fifteen borescope frames now in
`03_Motors_Feedback/IMG_001`–`IMG_015` are the same files, and should be cited as
**`2018-05-09/IMG_001`** and so on — *not* as part of the 2026-08-15 feedback
session. [`feedback_nameplate_survey_2026-08-15.md`](feedback_nameplate_survey_2026-08-15.md)
rates the Z-pickup row "poor (borescope frames, glare)"; if that row rests on these
frames, it rests on **eight-year-old imagery**, which is worth knowing when
weighing it.

`VID_001.AVI` was sampled at 2-second intervals across all 27 seconds: heavily
motion-blurred, out of focus, mostly corroded surfaces. **No legible nameplate in
any frame.** Consistent with the owner's finding that coolant has destroyed the
stamp ink. It is not committed (repo photo policy) and adds nothing the stills
do not already show.

## Five stills recovered

Of 65 stills on the drive, hash comparison against Drive found 59 already held and
**6 new**. Five were filed; one was not:

| File | Filed to | Subject |
|---|---|---|
| `IMG_0584.HEIC` | `05_Machine` | machine in the shop |
| `IMG_0880.JPG` | `02_Drives` | logic board, IC detail |
| `IMG_0885.JPG` | `02_Drives` | card rack, ribbon cabling |
| `IMG_0888.JPG` | `02_Drives` | board with battery |
| `IMG_0898.JPG` | `02_Drives` | card rack, `FX84`/`FX31`/`FX01` slots |
| `IMG_2314.heic` | **not filed** | a hunting photograph — not this project |

Drive now holds **913 files**.

## Note on tooling

`shop-search` searches Whisper transcripts, i.e. **speech**. Screen footage is
silent visual content, so transcribing these clips would have matched nothing.
Frame sampling is the right instrument for finding a screen in video, and it is
what was used here.
