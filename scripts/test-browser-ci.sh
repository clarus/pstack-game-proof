#!/usr/bin/env bash
set -euo pipefail

audio_dir=$(mktemp -d "${TMPDIR:-/tmp}/proof-quest-audio.XXXXXX")
export PULSE_RUNTIME_PATH="$audio_dir"
export PULSE_STATE_PATH="$audio_dir"
export PULSE_SERVER="unix:$audio_dir/native"
export PULSE_SINK=proof_quest

cleanup() {
  pactl exit >/dev/null 2>&1 || true
  rm -rf "$audio_dir"
}
trap cleanup EXIT

# Keep this server off the desktop session bus as well as its audio socket.
DBUS_SESSION_BUS_ADDRESS="unix:path=$audio_dir/no-session-bus" \
  pulseaudio --daemonize=yes --exit-idle-time=-1 --log-target=stderr -n \
  --load="module-native-protocol-unix socket=$audio_dir/native" \
  --load="module-null-sink sink_name=proof_quest rate=48000"
pactl info
pactl list short sinks

npm run test:browser -- "$@"
