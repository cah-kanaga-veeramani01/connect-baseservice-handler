const defaultConfigs = require('./default').default;

const configs = {
	...defaultConfigs
};

// Modify existing configs
configs.allowedOrigins = 'https://staging.outcomesmtm.com';

// always Export the configs as default
module.exports = configs;