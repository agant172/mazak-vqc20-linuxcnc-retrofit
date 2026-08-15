#!/bin/bash
# Install the two realtime components into the system module directory so that
# `loadrt` can find them. This is a SYSTEM change (writes root-owned .so files
# into /usr/lib/linuxcnc/modules/) and is deliberately a separate, explicit step
# rather than something run_tests.py does silently.
#
# Undo with:
#   sudo rm /usr/lib/linuxcnc/modules/mazak_atc.so \
#           /usr/lib/linuxcnc/modules/mazak_orient.so
#
# NOTE: one component per halcompile invocation. Passing both files at once
# fails with "Duplicate option name singleton" because halcompile does not reset
# its option table between files in a single run. That is a halcompile quirk,
# not a defect in these components.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPONENTS="$REPO/linuxcnc/components"

for comp in mazak_atc mazak_orient; do
    src="$COMPONENTS/$comp.comp"
    [ -f "$src" ] || { echo "missing $src" >&2; exit 1; }
    echo "installing $comp ..."
    sudo halcompile --install "$src"
done

echo
echo "installed:"
ls -l /usr/lib/linuxcnc/modules/mazak_*.so
