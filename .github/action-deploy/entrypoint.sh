#!/bin/bash -e

STAGE_DIR=${GITHUB_WORKSPACE}/stage
GHPAGES_BRANCH=gh-pages
TARGET_REPO_URL="https://${GITHUB_TOKEN}@github.com:${GITHUB_REPOSITORY}.git"

if [ -z "$RENDER_BRANCH" ]; then
    echo "Set the RENDER_BRANCH env variable."
    exit 1
fi

git submodule init
git submodule update --remote --recursive
echo "cloned the repo"

npm install --silent
npx gatsby build --prefix-paths
echo "built with gatsby"

mv public /tmp

cd /tmp/public

if [ -n "$CNAME" ]; then
    echo "$CNAME" > CNAME
fi
git init
git remote add deploy $TARGET_REPO_URL
git checkout --orphan $GHPAGES_BRANCH 
git add .
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
git commit -q -m "Automated deployment to GitHub Pages"
git push deploy $GHPAGES_BRANCH --force
echo "deployed to gh pages"
