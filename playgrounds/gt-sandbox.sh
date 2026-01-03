#!/usr/bin/env bash
set -euo pipefail

# Run gt against an isolated git repo under playgrounds/.gt-sandbox/.
# Usage:
#   pnpm gt:sandbox -- <gt-args...>
# Examples:
#   pnpm gt:sandbox -- --help
#   pnpm gt:sandbox -- nb main feature/test -y

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SANDBOX_ROOT="$ROOT_DIR/playgrounds/.gt-sandbox"
SANDBOX_DIR="$SANDBOX_ROOT/repo"
GT_BIN="$ROOT_DIR/packages/core/dist/index.mjs"

NO_BUILD=0
FRESH=0
CONFIG_SOURCE="__PLAYGROUNDS__"

# pnpm passes args to scripts as: <script> -- <args...>
# We treat a leading `--` as a no-op delimiter.
if [[ "${1-}" == "--" ]]; then
  shift
fi

pick_config_file() {
  local root="$1"
  local candidates=(
    "$root/gt.config.ts"
    "$root/gt.config.mts"
    "$root/gt.config.js"
    "$root/gt.config.mjs"
    "$root/gt.config.cjs"
    "$root/gt.config.json"
  )
  for f in "${candidates[@]}"; do
    if [[ -f "$f" ]]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

sync_config_into_sandbox() {
  local src="$1"
  local dest_dir="$2"

  if [[ -z "$src" ]]; then
    return 0
  fi

  if [[ ! -f "$src" ]]; then
    echo "gt config not found: $src" >&2
    exit 1
  fi

  local filename
  filename=$(basename "$src")
  # Ensure the file name stays gt.config.* at the sandbox root.
  if [[ "$filename" != gt.config.* ]]; then
    local ext="${filename##*.}"
    filename="gt.config.$ext"
  fi

  local dest="$dest_dir/$filename"
  if [[ -f "$dest" ]] && cmp -s "$src" "$dest"; then
    return 0
  fi

  cp -f "$src" "$dest"
}

remove_sandbox_config() {
  local dir="$1"
  shopt -s nullglob
  local files=("$dir"/gt.config.*)
  shopt -u nullglob

  if [[ ${#files[@]} -gt 0 ]]; then
    rm -f "${files[@]}"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build)
      NO_BUILD=1
      shift
      ;;
    --fresh)
      FRESH=1
      shift
      ;;
    --no-config)
      CONFIG_SOURCE=""
      shift
      ;;
    --config)
      if [[ $# -lt 2 ]]; then
        echo "--config requires a path" >&2
        exit 1
      fi
      CONFIG_SOURCE="$2"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -h|--help)
      cat <<'EOF'
Usage:
  pnpm gt:sandbox -- [--no-build] [--fresh] [--no-config|--config <path>] -- <gt-args...>

Options:
  --no-build   Skip building packages/core
  --fresh      Recreate sandbox repo before running
  --no-config  Skip copying config (by default playgrounds/gt.config.* is used if it exists)
  --config <path>     Copy the specified file into the sandbox as gt.config.* (path can be relative to repo root)

Notes:
  - Sandbox repo lives at playgrounds/.gt-sandbox/repo (gitignored)
  - Commands like `nb` will only affect the sandbox repo
EOF
      exit 0
      ;;
    *)
      break
      ;;
  esac

done

mkdir -p "$SANDBOX_ROOT"

if [[ $NO_BUILD -eq 0 ]]; then
  (cd "$ROOT_DIR" && pnpm --filter git-turbo build >/dev/null)
fi

if [[ ! -f "$GT_BIN" ]]; then
  echo "gt binary not found: $GT_BIN" >&2
  echo "Run: pnpm --filter git-turbo build" >&2
  exit 1
fi

if [[ $FRESH -eq 1 ]]; then
  rm -rf "$SANDBOX_DIR"
fi

mkdir -p "$SANDBOX_DIR"

if [[ ! -d "$SANDBOX_DIR/.git" ]]; then
  (
    cd "$SANDBOX_DIR"
    git init -b main >/dev/null
    git -c user.name=gt -c user.email=gt@example.com commit --allow-empty -m init >/dev/null
  )
fi

# Always avoid leaking config files inside the sandbox repo.
# - Clear any previous gt.config.* before this run.
# - Clean up gt.config.* after the run (even if gt errors).
remove_sandbox_config "$SANDBOX_DIR"
trap 'remove_sandbox_config "$SANDBOX_DIR"' EXIT

if [[ "$CONFIG_SOURCE" == "__PLAYGROUNDS__" ]]; then
  if src=$(pick_config_file "$ROOT_DIR/playgrounds"); then
    sync_config_into_sandbox "$src" "$SANDBOX_DIR"
  fi
elif [[ -n "$CONFIG_SOURCE" ]]; then
  src="$CONFIG_SOURCE"
  if [[ "$src" != /* ]]; then
    src="$ROOT_DIR/$src"
  fi
  sync_config_into_sandbox "$src" "$SANDBOX_DIR"
fi

(
  cd "$SANDBOX_DIR"
  node "$GT_BIN" "$@"
)
