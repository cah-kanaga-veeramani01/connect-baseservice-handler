const defaultConfigs = require('./default').default;

const configs = {
	...defaultConfigs
};

// Modify existing configs
configs.allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:8887'];

// always Export the configs as default
module.exports = configs;
