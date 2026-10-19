#!/usr/bin/env bash
# Nasazení jedné konkrétní verze (SHA commitu z origin/main) na server.
# Použití: ./ops/deploy.sh <40znakové SHA>
# Při zavolání přes SSH s vynuceným příkazem přijde SHA v SSH_ORIGINAL_COMMAND.
set -euo pipefail

cd "$(dirname "$0")/.."

# Dvě nasazení najednou nesmí běžet
exec 9>/tmp/plzenak-deploy.lock
flock -n 9 || { echo "Nasazení už běží"; exit 1; }

# SHA je text od klienta, proto se povolí jen přesný tvar
SHA="${1:-${SSH_ORIGINAL_COMMAND:-}}"
if [[ ! "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
    echo "Chybí nebo je neplatné SHA (40 hex znaků)" >&2
    exit 1
fi

# Jde nasadit jen to, co prošlo přes main
git fetch origin main
if ! git merge-base --is-ancestor "$SHA" origin/main; then
    echo "SHA $SHA není v origin/main" >&2
    exit 1
fi

# Adresa pro kontrolu po nasazení, pro test návratu jde přepsat z prostředí
HEALTH_URL="${HEALTH_URL:-https://plzenak.eu/api/health}"

PREVIOUS=$(git rev-parse HEAD)

# Návrat na předchozí verzi. Musí být nastavený dřív, než se cokoli změní.
# Migrace se nevrací, proto mají být zpětně kompatibilní.
rollback() {
    trap - ERR
    echo "Nasazení selhalo, vracím $PREVIOUS" >&2
    git switch --detach "$PREVIOUS"
    doppler run -- docker compose up -d --build
}
trap rollback ERR

git switch --detach "$SHA"

# Migrace proběhnou v novém image dřív, než se přepnou kontejnery
doppler run -- docker compose build
doppler run -- docker compose run --rm -T backend npm run migrate
doppler run -- docker compose up -d

# Backend potřebuje po startu pár sekund
for i in $(seq 1 30); do
    if curl -fsS -m 5 "$HEALTH_URL" > /dev/null; then
        echo "Nasazeno: $SHA"
        exit 0
    fi
    sleep 2
done

echo "Web po nasazení neodpovídá" >&2
rollback
exit 1
