#!/usr/bin/env bash
# publish a package to a private npm registry (Gitea or GitLab)
# - validates name & semver
# - verifies you bumped version vs latest in the registry
# - builds via your package.json scripts (prepublishOnly will also run)

set -Eeuo pipefail

# -----------------------
# Config (edit these)
# -----------------------
EXPECTED_NAME="@nsttc-d/riplee"                     # your package name
REGISTRY_URL="${NPM_REGISTRY_URL:-$(jq -r '.publishConfig.registry // empty' package.json)}"
# Provide one of these in the environment:
TOKEN="${NPM_TOKEN:-${GITEA_NPM_TOKEN:-${GITLAB_NPM_TOKEN:-}}}"

# -----------------------
# Sanity checks
# -----------------------
command -v jq >/dev/null || { echo "jq required"; exit 1; }
command -v npm >/dev/null || { echo "npm required"; exit 1; }

if [[ -z "$REGISTRY_URL" ]]; then
  echo "publishConfig.registry is missing and NPM_REGISTRY_URL not set"; exit 1
fi
if [[ -z "$TOKEN" ]]; then
  echo "Set NPM_TOKEN (or GITEA_NPM_TOKEN/GITLAB_NPM_TOKEN)"; exit 1
fi

NAME="$(jq -r '.name' package.json)"
VERSION="$(jq -r '.version' package.json)"

if [[ "$NAME" != "$EXPECTED_NAME" ]]; then
  echo "Package name must be $EXPECTED_NAME (found $NAME)"; exit 1
fi
if ! [[ "$VERSION" =~ ^[0-9]+(\.[0-9]+){2}(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "Version must be SemVer (e.g. 0.1.0 or 1.2.3-beta.1)"; exit 1
fi

# Derive @scope for npmrc routing, e.g. @nsttc-d
SCOPE="$(sed -E 's/^(@[^/]+)\/.*$/\1/' <<<"$NAME")"

# -----------------------
# Temporary .npmrc for auth (DO NOT COMMIT TOKENS)
# -----------------------
TMP_NPMRC="$(pwd)/.npmrc.publish.$$"
HOST_PATH="${REGISTRY_URL#https://}"; HOST_PATH="${HOST_PATH#http://}"  # strip scheme

cat > "$TMP_NPMRC" <<EOF
${SCOPE}:registry=${REGISTRY_URL}
//${HOST_PATH}:_authToken=${TOKEN}
always-auth=true
EOF

export NPM_CONFIG_USERCONFIG="$TMP_NPMRC"

# -----------------------
# Compare with latest published version
# -----------------------
LATEST="$(npm view "$NAME" version 2>/dev/null || true)"
echo "Latest in registry: ${LATEST:-<none>}    Local: ${VERSION}"

# Simple SemVer compare (major/minor/patch only)
to_nums () { IFS=. read -r a b c <<<"$1"; echo "${a:-0} ${b:-0} ${c:-0}"; }
if [[ -n "$LATEST" ]]; then
  read -r LMAJ LMIN LPAT < <(to_nums "$LATEST")
  read -r CMAJ CMIN CPAT < <(to_nums "$VERSION")

  if   (( CMAJ > LMAJ )); then : # ok (major bump)
  elif (( CMAJ == LMAJ && CMIN > LMIN )); then : # ok (minor bump)
  elif (( CMAJ == LMAJ && CMIN == LMIN && CPAT > LPAT )); then : # ok (patch bump)
  else
    echo "Version $VERSION must be greater than latest $LATEST"; rm -f "$TMP_NPMRC"; exit 1
  fi
fi

# -----------------------
# Build + Publish
# -----------------------
# If your package.json has "prepublishOnly": it will run automatically during npm publish.
npm run build || true
npm publish

echo "✅ Published ${NAME}@${VERSION} to ${REGISTRY_URL}"
rm -f "$TMP_NPMRC"
