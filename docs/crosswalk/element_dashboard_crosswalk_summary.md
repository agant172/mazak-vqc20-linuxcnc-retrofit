# Element list ↔ current I/O authority reconciliation

**Machine:** Mazak VQC 20/40, SN 060231 (Mazatrol M-2, ladder YM2V39L)

**Original comparison date:** 2026-07-27

**Reconciled:** 2026-08-07

`element_dashboard_crosswalk.csv` is a frozen discovery worksheet: 385 OEM PLC
elements were classified against the repository state that existed on
2026-07-27. Its suggested landings, `NET_*` identifiers, duplicate warnings,
and spare counts are historical evidence, not current wiring authority.

The current authority is [`../../mesa/current_pin_authority.csv`](../../mesa/current_pin_authority.csv),
the combined HAL files, and the generated dashboard. The dashboard now contains
128 authority rows. Pin allocation and HAL drift are enforced by
`scripts/validate_authority.py` and `scripts/validate_control_logic.py`.

## Historical element classification

These counts describe the OEM 385-row element list and remain useful only for
scope analysis:

| Category | Count |
|---|---:|
| NC internal (`.N`) | 106 |
| Option / fitment to verify | 91 |
| Panel button (`.B`) | 42 |
| NC-panel interface | 42 |
| Field output | 38 |
| Panel lamp (`.L`) | 33 |
| Field input | 30 |
| Unknown / illegible | 3 |
| **Total** | **385** |

## Former gap disposition

| OEM function | Current disposition |
|---|---|
| Y040/Y096 `HYD.M` hydraulic/head-lube pump | 7i84U-A TB3 OUT3 (`HYD_PUMP_ON`) |
| X073 `THR.M` + X07B `ONT.M` | Series NC alarm chain on 7i84U-A TB3 IN8 (`THERMAL_ALARM_CHAIN`); field proof pending |
| X078 `MPWS.M` | Dropped/deferred; no field-I/O row. Do not restore without a new authority allocation. |
| X003 `ORA1` orient arrival | 7i84U-A TB3 IN4 (`SPINDLE_ORIENT_ARRIVAL`) |
| X001 `SZS.M` zero speed | 7i84U-A TB3 IN5 (`SPINDLE_ZERO_SPEED`), distinct from speed-reach on IN13 |
| Y093 `ORCM1.M` orient command | 7i84U-A TB3 OUT4 (`SPINDLE_ORIENT_CMD`), dynamically gated in HAL |
| Y094 `CTL.M` low-gear orient assist | 7i84U-A TB3 OUT5 (`SPINDLE_ORIENT_LOGEAR`) |
| X052/X053 cover confirmations | 7i84U-A TB3 IN6/IN7 |
| Y095 `TCME.M` ATC barrier | 7i84U-B TB3 OUT6; device fitment on SN 060231 remains unverified |
| X01A manual unclamp | 7i84U-A TB3 IN9 and active in HAL |
| X01B manual clamp | 7i84U-A TB2 IN30, reserved but intentionally HAL-unbound until field verification |
| Y011 flood valve | 7i84U-B TB3 OUT7, separate from the flood-pump output on 7i84U-A OUT11 |
| X03F `SKIP1.M` probe | 7i84U-B TB3 IN15; bare 7i80HDT P3 GPIO is prohibited for 24 V field wiring |
| Y091 `OTR.M`, X02F `INHRLS`, Y023-Y025 M43-M45 | Dropped/deferred; no current authority landing |

Every landing above retains the status and qualification in the authority CSV;
most are still `PROPOSED` or `COMMISSIONING_PENDING`, not electrically proven.

## Capacity result

The two-card design uses 32 DI / 16 DO on 7i84U-A and 11 DI / 9 DO on
7i84U-B: 43 DI and 25 DO total, leaving 21 DI and 7 DO. A second 7i84U is
therefore required and already part of the active architecture; a third is not
required by the current authority. See
[`../io_capacity_reconciliation.md`](../io_capacity_reconciliation.md).

Any newly restored option or panel function must first receive a unique row and
terminal in `current_pin_authority.csv`; do not allocate from the old discovery
worksheet's spare suggestions.
