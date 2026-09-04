#!/bin/bash
# Parse every remap/*.ngc with LinuxCNC's standalone interpreter against the
# machine INI. Catches interpreter-level errors that the HAL harness cannot see:
# nested parentheses in comments (NCE_NESTED_COMMENT_FOUND - found 2026-09-04,
# the M6 remap could not have loaded), bad O-word nesting, unknown named
# parameters, malformed #<_ini[...]> references. Runs on the LinuxCNC box only
# (needs the rs274 binary). No HAL, no motion: M66 waits are not exercised.
#
#   bash tests/ngc/rs274_check.sh          # all remap files
set -uo pipefail
cd "$(dirname "$0")/../../linuxcnc" || exit 2
command -v rs274 >/dev/null || { echo "rs274 not found - run on the LinuxCNC box"; exit 2; }
fail=0
for f in remap/*.ngc; do
  out="$(rs274 -i mazak_vqc_20_40.ini -g "$f" 2>&1)"; rc=$?
  if [ $rc -ne 0 ]; then
    fail=1; echo "FAIL $f (exit $rc)"
    printf '%s\n' "$out" | grep -v '^ *[0-9]* N\|^executing' | head -5
  else
    echo "ok   $f"
  fi
done
exit $fail
