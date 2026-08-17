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
(both). `TT-A-11` is therefore the Z-axis **tach**; X and Y plates read `RT-…`,
which are resolvers. **The Z-axis resolver nameplate is still unread** — it was
not the plate transcribed on 2026-08-16. Read it and add it here.

Nameplates are also recorded, with the same devices' part-number analysis, in
[`docs/feedback_nameplate_survey_2026-08-15.md`](docs/feedback_nameplate_survey_2026-08-15.md).

DC resistance readings for these devices (CNA3/4/5, measured 2026-08-16) live in
[`docs/resolver_commissioning.md`](docs/resolver_commissioning.md#measured-dc-resistance-2026-08-16-cna345-nc-unit-rack),
together with the connector pinout now confirmed against Mitsubishi's own
detector wiring figure. This file is nameplate transcriptions only.