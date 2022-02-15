module.exports = function () {
	return {
		flywayArgs: {
			url: `jdbc:postgresql://${process.env.DB_HOST}/${process.env.DB_NAME}`,
			schemas: process.env.DB_SCHEMA,
			locations: 'filesystem:migration/flyway',
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			sqlMigrationSuffixes: '.sql',
			baselineOnMigrate: true
		}
	};
};