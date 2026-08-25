# SSD firmware upgrade — pre-commissioning task

**Status: PLANNED, not done. Both drives are running shipping-era firmware.**
Owner decision 2026-08-23: complete before the machine is commissioned.

Neither step can be done from a remote session. Both require a person at the
OptiPlex with a USB stick, and the machine will be down for the duration.

---

## Why this is on the pre-commissioning list

Both drives carry firmware bugs whose symptoms are exactly the kind of fault
that is impossible to diagnose once the machine is cutting.

| Drive | Role | Now | Target | The fix that matters |
|---|---|---|---|---|
| Crucial MX500 `CT500MX500SSD1` | root / boot — LinuxCNC itself | `M3CR010` | `M3CR046` | "repairs a hang condition occurring under corner-case workloads" |
| SanDisk `SD8SN8U-256G-1006` (X400 OEM) | `/mnt/media` — the G-code backup | `X4120006` | `X4152012` | "drive lost during cold boot" |

`M3CR010` is the drive's launch firmware from 2017 — the MX500 is 36 revisions
past it. A storage hang on the disk running LinuxCNC does not present as a disk
problem; it presents as the control freezing mid-program.

The SanDisk bug is quieter and arguably worse for its job: a backup drive that
intermittently fails to appear at cold boot is a backup that silently stops
running. The hourly backup's `mountpoint` guard means it will log a loud
refusal rather than write to the wrong disk (`scripts/backup/README.md`), and
`nofail` in `/etc/fstab` means it cannot block boot — but the copies still stop
happening, and only the journal would say so.

### Known issue in the target firmware, accepted

`M3CR046` carries **CVE-2024-42642**, a buffer overflow reachable only by
sending crafted ATA packets from the host to the controller. An attacker who
can do that already has root on the control PC. Not a meaningful risk here, and
`M3CR010` is not the safer choice — it simply has different bugs, plus the hang.

---

## Order of operations

Sequence matters, because the safety net for flashing one drive lives on the other.

1. **Full image of the root disk → `/mnt/media`.** Firmware updates are meant to
   preserve data, and usually do. This is insurance against the case where they
   do not. Do this while the SanDisk is still on its old firmware — an image
   that exists is worth more than an image on ideal firmware.
2. **Flash the MX500 (root).** Riskiest step, done while a fresh image of it
   sits on the other drive.
3. **Boot, verify.** `smartctl -i /dev/sda` should report `M3CR046`; LinuxCNC
   should start; `netwatch` should show the new revision on the `/dev/sda` line.
4. **Flash the SanDisk (`/mnt/media`).** Only now, once root is known good. The
   root image on this drive is expendable at this point.
5. **Re-verify and re-run the backup.**
   `sudo systemctl start mazak-gcode-backup.service`

Do **not** flash both from one boot of the updater. Verify a working system
between them, or a failure leaves you unsure which flash caused it.

---

## Step 1 — image the root disk

25 GB in use on a 457 GB filesystem, so a filesystem-level copy is far faster
than imaging the whole block device, and restorable.

```bash
sudo mkdir -p /mnt/media/root-image
sudo rsync -aAXH --numeric-ids --info=progress2 \
    --exclude='/dev/*' --exclude='/proc/*' --exclude='/sys/*' \
    --exclude='/tmp/*' --exclude='/run/*' --exclude='/mnt/*' \
    --exclude='/media/*' --exclude='/lost+found' \
    / /mnt/media/root-image/
sudo cp /etc/fstab /mnt/media/root-image-fstab.txt
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID > /mnt/media/root-image-layout.txt
```

Also record the bootloader, since restoring needs it — this box is **legacy
BIOS on an MBR disk**, not UEFI:

```bash
sudo dd if=/dev/sda of=/mnt/media/root-image-mbr.bin bs=512 count=1
```

## Step 2 — MX500 firmware

Crucial ships a Windows tool (Storage Executive) and a **bootable ISO**. Windows
is gone from this box, so the ISO is the path.

1. On a Mac, download the MX500 firmware ISO from
   <https://www.crucial.com/support/ssd-support/mx500-support> (the download is a
   zip containing `M3CR046_ISO.iso`).
2. Write it to a USB stick.
3. Boot the OptiPlex from it (F12 at the Dell splash → USB).
4. Follow the prompts; flash `/dev/sda` only.
5. Power cycle fully — not a warm reboot — and confirm with
   `sudo smartctl -i /dev/sda | grep Firmware`.

**Known pitfall:** the Crucial ISO is reported not to boot reliably when written
with Balena Etcher; at least one write-up needed a manual GRUB boot, trying
`root=ram0` / `ram1` / `ram2`. If it will not boot, that is the reason — the
image is not corrupt. Verify the USB boots **with the target SSD disconnected
first** if you want to be careful about what the updater touches.

## Step 3 — SanDisk X400 firmware

Dell publishes this as an OptiPlex driver, package `hv8f3`
(<https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=hv8f3>),
covering X400 2.5" and M.2 2280 models in 128 GB / 256 GB / 512 GB / 1 TB to
revision `X4152012`.

**Open question — resolve before attempting.** The Dell package is a Windows
executable, supported on OptiPlex systems running Windows 7/8/8.1/10, and this
machine no longer has Windows. Before scheduling this step, determine which is
true:

- Dell also offers the update as a bootable/DUP format that runs outside Windows, **or**
- it must be run from Windows, in which case the practical route is to move the
  M.2 drive into another machine that has Windows, flash it there, and return it.

`SD8SN8U` is the **M.2 2280** OEM part number, so the drive is on the
OptiPlex's M.2 slot and is physically easy to move. That makes the second
option entirely workable and probably simpler than fighting a bootable image.

Sanity check the assumption against the hardware before ordering the work — the
form factor above is from the part number, not from someone having opened the
case and looked.

WD/SanDisk's own X400 KB article (`a_id/45870`) is dead as of 2026-08-23, so
Dell is the only current source found for this firmware.

---

## Verification, after both

```bash
sudo smartctl -i /dev/sda | grep -E "Device Model|Firmware"   # expect M3CR046
sudo smartctl -i /dev/sdb | grep -E "Device Model|Firmware"   # expect X4152012
sudo systemctl start mazak-smart-collect.service              # refresh the snapshot
netwatch | grep -A3 "this machine"                            # firmware shows on the disk lines
sudo systemctl start mazak-gcode-backup.service               # backup still works
journalctl -u mazak-gcode-backup -n 3 --no-pager
```

Then update the table at the top of this file with the date and the observed
revisions, and check the item off in `docs/project_status.md`.

---

## Separate, unrelated to firmware: the SATA cable on `/dev/sda`

`UDMA_CRC_Error_Count = 4` on the MX500. The flash is pristine — zero
reallocated sectors, zero uncorrectable, 92% life remaining — so this is the
SATA **link** dropping frames, which means a cable or a connector, not the
drive. Four is low and may be historical.

**Reseat both ends of that SATA cable while the case is open for the firmware
work.** A marginal SATA link on the disk running the control is worth
eliminating rather than monitoring. `netwatch` will keep showing the counter;
if it climbs after reseating, replace the cable.
