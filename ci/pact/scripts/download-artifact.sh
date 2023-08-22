set -ue

echo "Node Version: $(node --version)"
echo "NPM Version:  $(npm --version)"
echo "Project:      ${PROJECT_NAME}"

APP_VERSION=$(echo -n "console.log(require('./project/package').version)" | node | tr -d '\n')
APP_NAME=$(echo -n "console.log(require('./project/package').name)" | node | tr -d '\n')

echo "Deploying ${APP_NAME} version ${APP_VERSION} to ${NODE_ENV}"

{
  echo "@service-config:registry=$NPM_PUBLISH_REGISTRY_URL"
  echo "registry=https://registry.npmjs.org/"
  echo "email=$NPM_PUBLISH_EMAIL"
  echo "always-auth=true"
  echo "_auth=$(echo -n "$NPM_PUBLISH_USERNAME:$NPM_PUBLISH_PASSWORD" | base64 -w 0)"
} >> .npmrc

# Download the artifact
npm pack "${APP_NAME}@${APP_VERSION}"

#Extract the contents
tar -xzf ./*.tgz -C .

