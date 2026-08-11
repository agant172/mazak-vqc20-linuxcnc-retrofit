# Mesa/PCW inquiry — Efinix 7i49 resolver bitfile for the 7i80HDT stack

**Purpose.** Confirm, *before ordering the remaining boards*, that Mesa/PCW has
(or will build) a bitfile for this exact card combination that exposes resolver
feedback + analog out on the 7i49. The 7i80HDT is an **Efinix**-FPGA host;
pre-built resolver bitfiles are common on the older Xilinx Mesa boards but less
so on the Efinix generation, so availability is the one open item that could
force a host-board change. This is the gate — see
[`project_status.md`](project_status.md) TODO.

This is **not** a claim the stack is unsupported: the 7i49 is Mesa's resolver
interface and HostMot2 has a Resolver module. The only question is whether the
specific Efinix build for *this* P1/P2 layout exists or can be built.

---

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
