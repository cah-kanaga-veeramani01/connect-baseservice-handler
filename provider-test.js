const { Verifier } = require('@pact-foundation/pact');
const axios = require('axios');
const qs = require('qs');
const packageJson = require('./package.json');
const data = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': process.env.KEYCLOAK_CLIENT_ID,
    'client_secret': process.env.KEYCLOAK_CLIENT_SECRET
});
const config = {
    method: 'post',
    url: process.env.KEYCLOAK_TOKEN_URL,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
};

let opts = {
    providerBaseUrl: process.env.PACT_PROVIDER_BASE_URL,
    provider: process.env.PACT_PROVIDER,
    //pactUrls: [path.resolve(process.cwd(), 'pacts')],
    pactBrokerUrl: process.env.PACT_BROKER_URL,
    pactBrokerUsername: process.env.PACT_USERNAME,
    pactBrokerPassword: process.env.PACT_PASSWORD,
    publishVerificationResult: true,
    providerVersion: packageJson.version,
    timeout: 1000 * 60 * 5,
    requestFilter: async (req, res, next) => {
        const keycloakResponse = await axios(config);
        req.headers["authorization"] = `Bearer ${keycloakResponse && keycloakResponse.data && keycloakResponse.data.access_token}`;
        next()
    },
};

new Verifier().verifyProvider(opts).then(() => {
    console.log("Pacts successfully verified!...");
});