# Mazak VQC20 LinuxCNC Retrofit Roadmap

## Project Goal

Retrofit the Mazak VQC20 to LinuxCNC while preserving as much usable factory hardware as practical, using Mesa I/O and clear documentation.

---

## Phase 1 — Project Organization

- [ ] Confirm GitHub repo structure
- [ ] Add README.md
- [ ] Add project status file
- [ ] Add wiring folder
- [ ] Add Mesa hardware folder
- [ ] Add LinuxCNC config folder
- [ ] Add photos folder
- [ ] Add BOM folder
- [ ] Archive old/reference documents separately

**Gate:** Repository is organized enough that every document has a clear home.

---

## Phase 2 — Existing Machine Survey

- [ ] Photograph electrical cabinet
- [ ] Photograph relay panel
- [ ] Photograph servo drives
- [ ] Photograph spindle drive
- [ ] Photograph limit/home switches
- [ ] Photograph lube, coolant, hydraulic, and safety circuits
- [ ] Identify all major power supplies
- [ ] Identify control voltages
- [ ] Identify unused, unknown, or questionable wires

**Gate:** No major cabinet component is unidentified.

---

## Phase 3 — Mesa Hardware Plan

- [ ] Confirm 7i97T role
- [ ] Confirm 7i84U role
- [ ] Confirm field power voltage
- [ ] Confirm encoder wiring plan
- [ ] Confirm analog servo command wiring
- [ ] Confirm spindle control wiring
- [ ] Confirm E-stop chain wiring
- [ ] Confirm relay outputs
- [ ] Confirm input mapping

**Gate:** Mesa hardware wiring is documented before final hookup.

---

## Phase 4 — Safety and Power

- [ ] Verify main disconnect
- [ ] Verify transformer wiring
- [ ] Verify control power
- [ ] Verify 24V field power
- [ ] Verify E-stop circuit
- [ ] Verify contactor logic
- [ ] Verify servo enable circuit
- [ ] Verify spindle inhibit / enable
- [ ] Verify limit switch behavior

**Gate:** E-stop reliably removes machine motion authority.

---

## Phase 5 — I/O Mapping

- [ ] Create master I/O list
- [ ] Assign Mesa input numbers
- [ ] Assign Mesa output numbers
- [ ] Label each wire
- [ ] Confirm normally-open / normally-closed behavior
- [ ] Test inputs one at a time
- [ ] Test outputs one at a time

**Gate:** Every LinuxCNC input/output has a known machine-side function.

---

## Phase 6 — Axis Motion

- [ ] Confirm X encoder feedback
- [ ] Confirm Y encoder feedback
- [ ] Confirm Z encoder feedback
- [ ] Confirm X analog command polarity
- [ ] Confirm Y analog command polarity
- [ ] Confirm Z analog command polarity
- [ ] Tune X axis
- [ ] Tune Y axis
- [ ] Tune Z axis
- [ ] Confirm soft limits
- [ ] Confirm home sequence

**Gate:** All axes jog, home, and stop safely.

---

## Phase 7 — Spindle

- [ ] Identify spindle drive inputs
- [ ] Confirm spindle enable
- [ ] Confirm forward/reverse command
- [ ] Confirm speed command
- [ ] Confirm spindle orientation requirements
- [ ] Confirm spindle-at-speed signal
- [ ] Test low-speed spindle operation
- [ ] Test commanded RPM accuracy

**Gate:** Spindle starts, stops, and follows commanded speed safely.

---

## Phase 8 — Tool Changer / ATC

- [ ] Document ATC mechanism
- [ ] Identify magazine motor
- [ ] Identify tool clamp/unclamp
- [ ] Identify drawbar logic
- [ ] Identify carousel position feedback
- [ ] Identify arm movement sensors
- [ ] Map all ATC inputs
- [ ] Map all ATC outputs
- [ ] Test manual ATC movements
- [ ] Build LinuxCNC ATC logic

**Gate:** ATC can complete a safe controlled tool change.

---

## Phase 9 — Machine Services

- [ ] Lube pump
- [ ] Coolant pump
- [ ] Hydraulic pump
- [ ] Air pressure switch
- [ ] Way lube alarm
- [ ] Spindle chiller / oil system
- [ ] Work light
- [ ] Door/interlock behavior

**Gate:** Support systems work and alarms are understood.

---

## Phase 10 — LinuxCNC Configuration

- [ ] Create base INI file
- [ ] Create base HAL file
- [ ] Add Mesa firmware/config notes
- [ ] Add axis scaling
- [ ] Add PID tuning values
- [ ] Add home/limit logic
- [ ] Add spindle logic
- [ ] Add E-stop logic
- [ ] Add coolant/lube/hydraulic logic
- [ ] Add ATC logic

**Gate:** LinuxCNC config matches the documented machine wiring.

---

## Phase 11 — Testing

- [ ] Power-on checklist
- [ ] E-stop test
- [ ] Input test
- [ ] Output test
- [ ] Axis jog test
- [ ] Homing test
- [ ] Spindle test
- [ ] Coolant/lube test
- [ ] Dry-run G-code test
- [ ] First controlled cut

**Gate:** Machine completes a dry run and first cut without unexpected behavior.

---

## Phase 12 — Final Documentation

- [ ] Final wiring map
- [ ] Final Mesa pinout
- [ ] Final LinuxCNC config notes
- [ ] Final BOM
- [ ] Backup config files
- [ ] Known issues list
- [ ] Maintenance notes
- [ ] Lessons learned

**Gate:** Project is documented well enough to troubleshoot later without relying on memory.
