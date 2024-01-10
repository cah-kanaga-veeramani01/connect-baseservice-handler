const fs= require('fs');

const line=fs.readFileSync('./cert/us-east-1-bundle.crt').toString();
console.log(line);

module.exports = function () {
	return {
		flywayArgs: {
			
			url: `jdbc:postgresql://cc-client-operations-program-configuration-dev.cluster-cukimq938igp.us-east-1.rds.amazonaws.com:5432/postgres?ssl=true&sslmode=verify-ca&sslcert=${line}`,
			//"jdbcProperties.sslcert":"./../../cert/us-east-1-bundle.crt",
			schemas: process.env.DB_SCHEMA,
			locations: 'filesystem:migration/flyway',
			user: process.env.DB_USERNAME_DDL,
			password: process.env.DB_PASSWORD_DDL,
			sqlMigrationSuffixes: '.sql',
			baselineOnMigrate: true,
			
		}
	};
};
//url: `jdbc:postgresql://${process.env.DB_HOST}:5432/${process.env.DB_NAME}?sslcert=./cert/us-east-1-bundle.crt`,
			
//url: `jdbc:postgresql://${process.env.DB_HOST}/${process.env.DB_NAME}?ssl=true`,