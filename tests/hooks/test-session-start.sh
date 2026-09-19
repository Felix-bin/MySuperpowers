#!/usr/bin/env bash
# 旧安装即使继续调用此入口，也不得注入会话指令。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
for platform in CLAUDE_PLUGIN_ROOT CURSOR_PLUGIN_ROOT MUSE_PLUGIN_ROOT COPILOT_CLI; do
  output=$(env "$platform=local-test" bash "$ROOT/hooks/session-start")
  [ "$output" = '{}' ] || { echo "FAIL: context injected for $platform"; exit 1; }
done
echo 'PASS: legacy entry emits no context on all platforms'
