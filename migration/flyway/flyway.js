module.exports = function () {
	return {
		flywayArgs: {
			
			url: `jdbc:postgresql://${process.env.DB_HOST}:5432/${process.env.DB_NAME}`,
			schemas: process.env.DB_SCHEMA,
			locations: 'filesystem:migration/flyway',
			user: process.env.DB_USERNAME_DDL,
			password: process.env.DB_PASSWORD_DDL,
			sqlMigrationSuffixes: '.sql',
			baselineOnMigrate: true,
			"ssl":true,
			"dialectOptions":{
				"ssl":{
					"require":true
				}
			}
		}
	};
};
//url: `jdbc:postgresql://${process.env.DB_HOST}/${process.env.DB_NAME}?ssl=true`,