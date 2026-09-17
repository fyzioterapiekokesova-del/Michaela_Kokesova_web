#!/bin/sh
# Git credential helper — podá GitHubu token klientky z `.env.local`.
#
# Proč: do repa klientky se pushuje **vždy jejím účtem**, ne účtem
# vývojářky. Bez tohohle by Git sáhl po přihlášení uloženém ve Windows
# Credential Manageru a push by odešel pod cizím jménem.
#
# Token se nikdy nezapíše do `.git/config` ani do příkazové řádky — Git si
# ho vyžádá na standardní vstup až ve chvíli, kdy ho potřebuje.
#
# Zapojení (jen jednou, jen pro tohle repo):
#   git config --local credential.helper ""
#   git config --local --add credential.helper "!sh scripts/git-token.sh"

# Git volá helper se `get`, `store` nebo `erase`. Nic si neukládáme.
[ "$1" = "get" ] || exit 0

KOREN="$(cd "$(dirname "$0")/.." && pwd)"
ENV="$KOREN/.env.local"

[ -f "$ENV" ] || {
  echo "chybi $ENV — doplnte GITHUB_TOKEN" >&2
  exit 1
}

hodnota() {
  sed -n "s/^$1=//p" "$ENV" | head -1 | tr -d '"\r'
}

TOKEN="$(hodnota GITHUB_TOKEN)"
UZIVATEL="$(hodnota GITHUB_USER)"

[ -n "$TOKEN" ] || {
  echo "v $ENV chybi hodnota GITHUB_TOKEN" >&2
  exit 1
}

# Do GITHUB_USER se snadno omylem vloží adresa repa místo jména účtu.
# Cokoli, co nevypadá jako přihlašovací jméno, se zahodí — u tokenu na
# uživatelském jméně stejně nezáleží, GitHub se řídí jen heslem.
case "$UZIVATEL" in
  "" | *[!A-Za-z0-9-]*) UZIVATEL="x-access-token" ;;
esac

echo "username=$UZIVATEL"
echo "password=$TOKEN"
