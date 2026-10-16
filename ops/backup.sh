#!/usr/bin/env bash
# Denní záloha databáze do R2. Spouští se přes: doppler run -- bash ops/backup.sh
set -euo pipefail
umask 077

cd "$(dirname "$0")/.."

STAMP=$(date -u +%Y%m%d-%H%M%S)
FILE="/tmp/plzenak-${STAMP}.sql.gz"
trap 'rm -f "$FILE"' EXIT

# rclone si konfiguraci bere z prostředí, na disku nevzniká žádný soubor s klíči
export RCLONE_CONFIG_R2_TYPE=s3 RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$BACKUP_R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$BACKUP_R2_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

# 1) výpis databáze, komprese
docker compose exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner | gzip > "$FILE"

# 2) kontrola, že soubor je platný a není prázdný
gzip -t "$FILE"
SIZE=$(stat -c %s "$FILE")
if [ "$SIZE" -lt 1024 ]; then
    echo "$(date -u +%FT%TZ) CHYBA: záloha je podezřele malá (${SIZE} B)" >&2
    exit 1
fi

# 3) nahrání a kontrola, že v bucketu je stejně velký soubor
REMOTE="R2:${BACKUP_R2_BUCKET}/db/plzenak-${STAMP}.sql.gz"
rclone copyto "$FILE" "$REMOTE"
REMOTE_SIZE=$(rclone lsf --format s "$REMOTE")
if [ "$REMOTE_SIZE" != "$SIZE" ]; then
    echo "$(date -u +%FT%TZ) CHYBA: velikost v bucketu (${REMOTE_SIZE}) se liší od lokální (${SIZE})" >&2
    exit 1
fi

echo "$(date -u +%FT%TZ) OK plzenak-${STAMP}.sql.gz ${SIZE} B"