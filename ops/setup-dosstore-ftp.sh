#!/usr/bin/env bash
set -euo pipefail

# ERS GROUP FTP store mapping setup.
# Run on the FTP VPS as root or with sudo:
#   sudo bash ops/setup-dosstore-ftp.sh
#
# This script intentionally does not set passwords. Use passwd manually after
# review so the password is never stored in git, shell history, or logs.

FTP_GROUP="${FTP_GROUP:-beksarftp}"
STATUS_USER="${STATUS_USER:-postftp}"
DOSSTORE_USER="${DOSSTORE_USER:-dosftp}"
STATUS_HOME="${STATUS_HOME:-/home/postftp}"
DOSSTORE_HOME="${DOSSTORE_HOME:-/home/dosftp}"
WORKER_USER="${WORKER_USER:-}"
CONFIG_DIR="${CONFIG_DIR:-/etc/ers-group}"
MAPPING_FILE="${MAPPING_FILE:-$CONFIG_DIR/ftp-store-map.json}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root or with sudo." >&2
  exit 1
fi

ensure_group() {
  if ! getent group "$FTP_GROUP" >/dev/null; then
    groupadd --system "$FTP_GROUP"
  fi
}

ensure_user() {
  local user="$1"
  local home="$2"

  if id "$user" >/dev/null 2>&1; then
    usermod -d "$home" -g "$FTP_GROUP" "$user"
  else
    useradd --home-dir "$home" --create-home --gid "$FTP_GROUP" --shell /usr/sbin/nologin "$user"
  fi
}

ensure_home() {
  local user="$1"
  local home="$2"

  install -d -o "$user" -g "$FTP_GROUP" -m 0750 "$home"
  install -d -o "$user" -g "$FTP_GROUP" -m 0750 "$home/processed"
  install -d -o "$user" -g "$FTP_GROUP" -m 0750 "$home/failed"
}

verify_writable() {
  local user="$1"
  local home="$2"
  local probe="$home/.write-test-$(date +%s)"

  sudo -u "$user" sh -c "touch '$probe' && rm '$probe'"
  sudo -u "$user" sh -c "touch '$home/processed/.write-test' && rm '$home/processed/.write-test'"
  sudo -u "$user" sh -c "touch '$home/failed/.write-test' && rm '$home/failed/.write-test'"
}

ensure_group
ensure_user "$STATUS_USER" "$STATUS_HOME"
ensure_user "$DOSSTORE_USER" "$DOSSTORE_HOME"
ensure_home "$STATUS_USER" "$STATUS_HOME"
ensure_home "$DOSSTORE_USER" "$DOSSTORE_HOME"

if [[ -n "$WORKER_USER" ]] && id "$WORKER_USER" >/dev/null 2>&1; then
  usermod -a -G "$FTP_GROUP" "$WORKER_USER"
fi

install -d -o root -g root -m 0755 "$CONFIG_DIR"
cat > "$MAPPING_FILE" <<JSON
{
  "stores": [
    {
      "storeId": 2,
      "storeName": "Status",
      "ftpUser": "$STATUS_USER",
      "path": "$STATUS_HOME",
      "processedPath": "$STATUS_HOME/processed",
      "failedPath": "$STATUS_HOME/failed"
    },
    {
      "storeId": 1,
      "storeName": "Dosstore",
      "ftpUser": "$DOSSTORE_USER",
      "path": "$DOSSTORE_HOME",
      "processedPath": "$DOSSTORE_HOME/processed",
      "failedPath": "$DOSSTORE_HOME/failed"
    }
  ]
}
JSON
chmod 0644 "$MAPPING_FILE"

verify_writable "$STATUS_USER" "$STATUS_HOME"
verify_writable "$DOSSTORE_USER" "$DOSSTORE_HOME"

cat <<EOF
FTP folder setup complete.

Store mapping:
  $STATUS_HOME -> storeId=2 (Status)
  $DOSSTORE_HOME -> storeId=1 (Dosstore)

Processed/failed folders:
  $STATUS_HOME/processed
  $STATUS_HOME/failed
  $DOSSTORE_HOME/processed
  $DOSSTORE_HOME/failed

Mapping file written:
  $MAPPING_FILE

Manual password step still required:
  sudo passwd $DOSSTORE_USER
EOF
