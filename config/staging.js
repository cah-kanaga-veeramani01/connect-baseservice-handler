const defaultConfigs = require('./default').default;

const configs = {
	...defaultConfigs
};

// Modify existing configs
configs.allowedOrigins = ['http://localhost:3000'];

// always Export the configs as default
module.exports = configs;