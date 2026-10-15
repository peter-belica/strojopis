#!/usr/bin/env bash
# Run only inside the trusted GitHub Actions main-branch build.
set -euo pipefail

: "${GITHUB_TOKEN:?GitHub Actions token is required}"
: "${GITHUB_REPOSITORY:?GitHub repository is required}"
: "${GITHUB_SHA:?Source commit is required}"
: "${RUNNER_TEMP:?GitHub Actions runner is required}"

source_dir="$(pwd)/dist"
test -s "$source_dir/index.html"
publish_dir="$(mktemp -d "$RUNNER_TEMP/strojopis-build.XXXXXX")"
git -C "$publish_dir" init --initial-branch=gh-pages
git -C "$publish_dir" remote add origin "https://github.com/$GITHUB_REPOSITORY.git"
git -C "$publish_dir" config user.name 'github-actions[bot]'
git -C "$publish_dir" config user.email '41898282+github-actions[bot]@users.noreply.github.com'

# Pass the job token through Git configuration, never through the remote URL.
auth_header="$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -C "$publish_dir" config http.https://github.com/.extraheader "AUTHORIZATION: basic $auth_header"
trap 'git -C "$publish_dir" config --unset-all http.https://github.com/.extraheader || true' EXIT

remote_ref="$(git -C "$publish_dir" ls-remote --heads origin gh-pages)"
if [[ -n "$remote_ref" ]]; then
  git -C "$publish_dir" fetch --depth=1 origin gh-pages
  git -C "$publish_dir" checkout -B gh-pages FETCH_HEAD
  git -C "$publish_dir" rm -r --ignore-unmatch .
fi

cp -R "$source_dir/." "$publish_dir/"
git -C "$publish_dir" add --all
if ! git -C "$publish_dir" diff --cached --quiet; then
  git -C "$publish_dir" commit -m "Build from $GITHUB_SHA"
  git -C "$publish_dir" push origin HEAD:refs/heads/gh-pages
fi
