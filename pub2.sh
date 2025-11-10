#!/usr/bin/env bash
# Publish a package to a Gitea npm registry.
# - validates name & semver
# - ensures you bumped vs the latest in the registry
# - builds (via your package.json), then npm publish

set -Eeuo pipefail

# -----------------------
# Config (edit EXPECTED_NAME; REGISTRY_URL can come from package.json)
# -----------------------
EXPECTED_NAME="@nsttc-d/riplee"
REGISTRY_URL="${NPM_REGISTRY_URL:-$(jq -r '.publishConfig.registry // empty' package.json)}"
# Provide one of these in the environment:
TOKEN="${NPM_TOKEN:-${GITEA_NPM_TOKEN:-}}"

# -----------------------
# Sanity checks
# -----------------------
command -v jq >/dev/null || { echo "jq required"; exit 1; }
command -v npm >/dev/null || { echo "npm required"; exit 1; }

if [[ -z "$REGISTRY_URL" ]]; then
  echo "publishConfig.registry is missing and NPM_REGISTRY_URL not set"; exit 1
fi
if [[ -z "$TOKEN" ]]; then
  echo "Set NPM_TOKEN (or GITEA_NPM_TOKEN) with a Gitea PAT that can write packages"; exit 1
fi

NAME="$(jq -r '.name' package.json)"
VERSION="$(jq -r '.version' package.json)"

if [[ "$NAME" != "$EXPECTED_NAME" ]]; then
  echo "Package name must be $EXPECTED_NAME (found $NAME)"; exit 1
fi
if ! [[ "$VERSION" =~ ^[0-9]+(\.[0-9]+){2}(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "Version must be SemVer (e.g. 0.1.0 or 1.2.3-beta.1)"; exit 1
fi

# derive @scope for npmrc routing
SCOPE="$(sed -E 's/^(@[^/]+)\/.*$/\1/' <<<"$NAME")"

# -----------------------
# Temp .npmrc for auth/routing (not committed)
# -----------------------
TMP_NPMRC="$(pwd)/.npmrc.publish.$$"
HOST_PATH="${REGISTRY_URL#https://}"; HOST_PATH="${HOST_PATH#http://}"

cat > "$TMP_NPMRC" <<EOF
${SCOPE}:registry=${REGISTRY_URL}
//${HOST_PATH}:_authToken=${TOKEN}
always-auth=true
EOF
export NPM_CONFIG_USERCONFIG="$TMP_NPMRC"

# -----------------------
# Check latest version in registry
# -----------------------
LATEST="$(npm view "$NAME" version 2>/dev/null || true)"
echo "Latest in registry: ${LATEST:-<none>}    Local: ${VERSION}"

to_nums () { IFS=. read -r a b c <<<"$1"; echo "${a:-0} ${b:-0} ${c:-0}"; }
if [[ -n "$LATEST" ]]; then
  read -r LMAJ LMIN LPAT < <(to_nums "$LATEST")
  read -r CMAJ CMIN CPAT < <(to_nums "$VERSION")
  if   (( CMAJ > LMAJ )); then : 
  elif (( CMAJ == LMAJ && CMIN > LMIN )); then : 
  elif (( CMAJ == LMAJ && CMIN == LMIN && CPAT > LPAT )); then : 
  else
    echo "Version $VERSION must be greater than latest $LATEST"
    rm -f "$TMP_NPMRC"; exit 1
  fi
fi

# -----------------------
# Build + Publish
# -----------------------
npm run build || true          # your prepublishOnly will run during publish
npm publish

echo "✅ Published ${NAME}@${VERSION} to ${REGISTRY_URL}"
rm -f "$TMP_NPMRC"
