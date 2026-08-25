# Mesa/PCW inquiry — Efinix 7i49 resolver bitfile for the 7i80HDT stack

> **Address note (2026-08-23):** the Mesa control subnet moved from `192.168.1.0/24` to `10.10.10.0/24` (host `10.10.10.1`, board `10.10.10.121`) because the old range collided with the workshop LAN. Addresses below are kept as-recorded and are correct for the date shown.

> **ROLE: BACKGROUND** — moved from `docs/` 2026-08-15; historical — the bitfile was received, verified, and committed. Index: [README.md](README.md).


**Purpose.** Confirm, *before ordering the remaining boards*, that Mesa/PCW has
(or will build) a bitfile for this exact card combination that exposes resolver
feedback + analog out on the 7i49. The 7i80HDT is an **Efinix**-FPGA host;
pre-built resolver bitfiles are common on the older Xilinx Mesa boards but less
so on the Efinix generation, so availability is the one open item that could
force a host-board change. This is the gate — see
[`project_status.md`](../docs/project_status.md) TODO.

This is **not** a claim the stack is unsupported: the 7i49 is Mesa's resolver
interface and HostMot2 has a Resolver module. The only question is whether the
specific Efinix build for *this* P1/P2 layout exists or can be built.

---

> **Correction, 2026-08-13 — the P1/P2 layout described below is wrong.**
> This page is a historical record of an inquiry sent *before* the board was
> flashed and read back, so the email text is quoted verbatim and deliberately
> **not** edited. `mesaflash --readhmid` against the delivered firmware
> (`7i80hdt_rmsvss6_8.bin`, read 2026-08-11, re-confirmed 2026-08-13 and
> 2026-08-14) shows the actual layout is **7i49 on P1**, **7i44 on P3**, and
> **P2 unused/bare GPIO** — the opposite of what was asked for below. The
> delivered bitfile is correct and in use; only this request's assumption was
> mistaken. See [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md)
> for the evidence trail, and treat `../mesa/current_pin_authority.csv` as
> authoritative.

## Draft email (copy, fill the two blanks, send)

> **To:** Mesa Electronics — Peter Wallace / sales+support (`pcw@mesanet.com`, `sales@mesanet.com`)
> **Subject:** Efinix bitfile availability — 7i80HDT + 7i44 (sserial) + 7i49 (resolver + analog)
>
> Hello,
>
> I'm retrofitting a 1984 Mazak VQC 20/40 vertical machining center to LinuxCNC
> 2.9.10 (`hm2_eth`) and want to confirm firmware availability **before I finish
> ordering** the following Mesa stack:
>
> - **7i80HDT** — Ethernet FPGA host (Efinix), planned at 192.168.1.121.
> - **7i44 on P1** — RS-422 smart-serial, driving **two 7i84U** remotes on
>   sserial channels 0 and 1 (general field I/O + limits/homes/enables).
> - **7i49 on P2** (plain, not HV) — I need **3 resolver channels** (X/Y/Z) and
>   **4 analog ±10 V outputs** (X/Z/Y servo velocity + one spindle speed ref).
> - **P3** — unused/spare.
>
> The axis feedback is **resolver, not encoder**: Tamagawa **TS2014N** (2:1,
> K≈0.5), which I plan to excite around 5 kHz.
>
> My questions:
>
> 1. Do you have — or can you build — an **Efinix bitfile for the 7i80HDT** that
>    provides **7i44 smart-serial on P1** and the **7i49 resolver + analog on
>    P2** in a single configuration? If so, what is the exact `.bit` filename?
> 2. Does that build expose at least **3 resolver channels**, **4 PWM/analog
>    outputs**, and **smart-serial on P1** (2+ channels for the two 7i84U)? Is
>    P3 left as GPIO?
> 3. What **resolver excitation frequencies** are selectable (2.5 / 5 / 10 kHz),
>    and is 5 kHz appropriate for a TS2014N (nameplate ~4.5 kHz)? Any drive-level
>    or transformation-ratio considerations for a 2:1 resolver on the plain 7i49?
> 4. Can you provide the **`.bit` file plus a source/build reference** (Efinity
>    build or release tag) so I can record its SHA-256 and archive it? I want to
>    verify it against `readhmid` on the running board.
> 5. What is the **lead time / how is it supplied** (download, email, or flashed
>    at the factory)? Anything I should specify on the **7i80HDT order** so it
>    ships with the correct firmware?
>
> The 7i49 and one 7i84U are already on hand; I'm about to order the 7i80HDT,
> 7i44, and the second 7i84U, and would rather confirm the resolver firmware
> path first.
>
> Thank you,
> **[ your name ]**
> **[ your phone / order reference, if any ]**

---

## What a good answer looks like (acceptance)

- A named `.bit` (or a "yes, we'll build it") that includes **resolver + analog on
  the 7i49 (P2)** and **smart-serial on the 7i44 (P1)** for the 7i80HDT.
- Confirmation of **≥3 resolver** and **≥4 analog** channels.
- A way to obtain the binary **with provenance** (so `mesa/firmware/` can hold the
  file + SHA-256 + build reference per
  [`../mesa/mesa_firmware_checklist.md`](../mesa/mesa_firmware_checklist.md)).

## If the answer is "no Efinix resolver build"

Not expected, but the fallback keeps the interface work intact: move to a
**Xilinx-based Mesa Ethernet host** with a proven 7i49 resolver bitfile, keeping
the **7i49 and both 7i84U cards unchanged**. That is a host-board swap, not a
redesign of the BBIA-1 interface plane or the I/O authority. Record the outcome
here and update the architecture decision if the host changes.

## Log the outcome

When PCW replies, record: date, the confirmed `.bit` name, channel counts, how
it's supplied, and lead time — here and in `mesa/mesa_firmware_checklist.md`
(Bitfile provenance). Then the D3 firmware-package deliverable can proceed.

## Outcome (2026-08-11)

**A bitfile exists for this stack.** Received `7i80hdt_rmsvss6_8.bin` (678,650
bytes) plus its pin-mapping source `PIN_RMSVSS6_8_72.vhd` — committed under
`mesa/firmware/` with SHA-256 in `mesa/firmware/SHA256SUMS`. This clears the
"no Efinix resolver build" risk this doc existed to gate — no host-board swap
needed.

What the VHD source confirms directly (static check, no board involved):
- **6 PWM/analog instances** (`x"00"`-`x"05"`, `PWMAOutPin`/`PWMBDirPin` pairs)
  — exactly matches the expected AOUT0-5 (X/Y/Z velocity + spindle speed +
  2 spare).
- **Resolver module present** — SPI-based channel-select scheme
  (`ResModChan0/1/2Pin` + shared `ResModSPIDI0/1`/`SPIClk`/`SPICS` bus), not a
  simple repeated-pin block like PWM, so the exact resolver channel *count*
  isn't directly countable from this file the way PWM's is. The `rmsvss6_8`
  filename and the checklist's "6 resolver channels" expectation are
  consistent with this, but only the live `readhmid` dump proves it.
- **Smart-serial present**, multiple RX/TX channel pins visible (RX0-4+,
  TX0-3+) — consistent with the 7i44's 8-channel breakout.

**Not yet done:** the exact correspondence with PCW/Mesa (date, who replied,
order reference) isn't recorded — fill that in above if you have the email.
The live-board acceptance checks (`readhmid`, HAL pin dump per
`mesa_firmware_checklist.md` step 1) are still open; the board was left
unpowered as of this update. Until that runs, treat this as "bitfile in hand
and statically plausible," not "field-verified."
