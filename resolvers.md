Y- RT 5 X 8- 1  
BKO-NC6062A 
A 6986 
TS2014N 25 E 3-1

X-  RT - 5 X 
BKO - NC6062
A  7003 
TS2014N 25 E 8 1

Z - Brushless DC Generator
Type TT-A-11
Spec. No. BKO-NC6075
Ser NO23868
Part No. TS3033n 4 E2

Spindle - 
Optical Shaft encoder 
512 counts turn DC 15V
Type TS1526N55
Ser. No. A6022

---

**The Z plate above is a tachogenerator, not a resolver.** Per Table 14.3-1 of
the `MELDAS Series M2 Maintenance Manual` (p. 249), Mitsubishi's detector family
splits into **RT** (multi-polar resolver, ball-screw-tip *position* detector),
**TT** (brushless tachogenerator, motor-axis *speed* detector) and **RST**
(both). `TT-A-11` is therefore the Z-axis **tach**. Z carries a resolver *as
well*, and its plate is below.

## Z resolver — Tamagawa pickup unit (partial, 2026-08-16)

Photographed at the machine 2026-08-16 with a borescope camera (`JLDV AC54`);
serial read directly off the plate by Andy, the ink being too faded to
photograph. Plate form no. `N5399`.

```
TAMAGAWA SEIKI CO., LTD., JAPAN
… PICKUP UNIT
TYPE       □X□-□□        ← boxes not readable
SPEC. NO.  BKO-NC6062A
PARTS NO.  TS2014N□□E□-□ ← boxes not readable
SER. NO.   7028
DATE       198…
```

**Z is the same pickup family and spec as X and Y** — `BKO-NC6062A`, identical to
Y (X is `BKO-NC6062`), part number in the same `TS2014N…E…` series. The serials
place all three in one batch: **X 7003, Y 6986, Z 7028**, a spread of 42.

The stamped type and suffix digits remain unread on **all three** axes. Full
survey, legibility notes, why the borescope keeps failing on them, and how to
reshoot: [`docs/feedback_nameplate_survey_2026-08-15.md`](docs/feedback_nameplate_survey_2026-08-15.md).

Photographs are **not committed** (media rule, [`CLAUDE.md`](CLAUDE.md)). They
carry **no EXIF timestamp** — the camera writes none — and are numbered
`IMG_001…015`, which collides with earlier batches, so file them in Drive as
`2026-08-16/IMG_nnn` per [`docs/README_photo_sorting.md`](docs/README_photo_sorting.md)
before citing them.

Nameplates are also recorded, with the same devices' part-number analysis, in
[`docs/feedback_nameplate_survey_2026-08-15.md`](docs/feedback_nameplate_survey_2026-08-15.md).

DC resistance readings for these devices (CNA3/4/5, measured 2026-08-16) live in
[`docs/resolver_commissioning.md`](docs/resolver_commissioning.md#measured-dc-resistance-2026-08-16-cna345-nc-unit-rack),
together with the connector pinout now confirmed against Mitsubishi's own
detector wiring figure. This file is nameplate transcriptions only.