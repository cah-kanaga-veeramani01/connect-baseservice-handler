const defaultConfigs = require('./default').default;

const configs = {
	...defaultConfigs
};

// Modify existing configs
configs.allowedOrigins = ['http://localhost:3000'];
configs.userEditRoles = ['Edit Role'];
configs.userReadRoles = ['Read Role'];

// always Export the configs as default
module.exports = configs;
