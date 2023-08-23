import { Verifier, VerifierOptions } from '@pact-foundation/pact';
import { ServiceRoute } from './service-mock';
import express from 'express';
import bodyParser from 'body-parser';
import { errorHandler, generateLogId, requestLogger } from '../src/middleware';
import { logger } from '../utils';
const packageJson = require('../package.json');
const app = express();
app.disable('x-powered-by');
bodyParser.urlencoded({ extended: false });
app.use(requestLogger);
app.use(express.json());
app.use(generateLogId);
app.use(errorHandler);
app.use('/service/external', ServiceRoute);
const server = app.listen('8080'),
	opts: VerifierOptions = {
		providerBaseUrl: 'http://localhost:8080',
		provider: process.env.PACT_PROVIDER,
		providerVersion: packageJson.version,
		pactBrokerUrl: process.env.PACT_BROKER_URL,
		pactBrokerUsername: process.env.PACT_USERNAME,
		pactBrokerPassword: process.env.PACT_PASSWORD,
		publishVerificationResult: true,
		consumerVersionTags: process.env.PACT_CONSUMER_VERSION_TAGS,
		providerVersionTag: process.env.PACT_PROVIDER_TAG,
		enablePending: true
	};

new Verifier(opts)
	.verifyProvider()
	.then(() => {
		logger.nonPhi.info('pact verification done successfully');
	})
	.catch((error) => {
		logger.nonPhi.error('Error while verifying the pacts.' + error);
		throw error;
	})
	.finally(() => {
		server.close();
	});
