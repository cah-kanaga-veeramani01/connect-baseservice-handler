const enums = require('./configEnums');
const defaultConfigs = require('./default');

const configs = {
	...defaultConfigs
	// add new configs
};

// Modify existing configs
configs.allowedOrigins = ['https://service-config-client.apps.np1.fuseapps.io/'];

// always Export the configs as default
module.exports = configs;
