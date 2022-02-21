const enums = require('./configEnums');

const configs = {
	allowedOrigins: null,
	supportedLanguages: [enums.language.en, enums.language.es],
	language: enums.language.en,
	defaultErrorMessage: 'Sorry, an error occurred',
	userEditRoles: ['Client Services', 'Clinical Services/QA'],
	userReadRoles: ['Finance', 'Director/Manager', 'Marketing', 'Network Performance', 'Patient Engagement Team', 'Program Performance', 'Provider Resources']
};
module.exports = configs;
