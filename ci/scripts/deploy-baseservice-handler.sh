set -ue

echo "Node Version: $(node --version)"
echo "NPM Version:  $(npm --version)"
echo "Project:      ${PROJECT_NAME}"

APP_VERSION=$(echo -n "console.log(require('./project/package').version)" | node | tr -d '\n')
APP_NAME=$(echo -n "console.log(require('./project/package').name)" | node | tr -d '\n')

echo "Deploying ${APP_NAME} version ${APP_VERSION} to ${NODE_ENV}"

{
  echo "@program-config:registry=$NPM_PUBLISH_REGISTRY_URL"
  echo "registry=$NPM_PUBLISH_REGISTRY_URL"
  echo "email=$NPM_PUBLISH_EMAIL"
  echo "always-auth=true"
  echo "_auth=$(echo -n "$NPM_PUBLISH_USERNAME:$NPM_PUBLISH_PASSWORD" | base64 -w 0)"
} >> .npmrc

# Download the artifact
npm pack "${APP_NAME}@${APP_VERSION}"

#Extract the contents
tar -xzf ./*.tgz -C .

# Move manifest for the environment.
cp "./project/manifest-${NODE_ENV}.yml" package/manifest.yml

# Add a Staticfile (to point to the build dir)
# see also: https://github.com/cloudfoundry/staticfile-buildpack/tree/master/fixtures/alternate_root
cat <<EOF > ./package/Staticfile
root: build/static
pushstate: enabled
EOF