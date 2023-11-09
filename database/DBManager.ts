import { Sequelize } from 'sequelize-typescript';
import { logger } from '../utils/logger';
import { HandleError } from '../utils/HandleError';
const trackAll = require('sequelize-history').all;

let sequelizeAdmin, sequelizeManager;

try {
	console.log("inside db",process.env);
	sequelizeAdmin = new Sequelize({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		database: process.env.DB_NAME,
		define: {
			schema: process.env.DB_SCHEMA
		},
		dialect: 'postgres',
		dialectOptions: {
			ssl: String(process.env.DB_SSL).toLowerCase() === 'true',
			trustServerCertificate: true
		},
		username: process.env.DB_USERNAME_DDL,
		password: process.env.DB_PASSWORD_DDL,
		repositoryMode: true,
		models: [`${__dirname}/models`],
		logging: (logs: any) => logger.debug(logs)
	});

	trackAll(sequelizeAdmin);

	sequelizeManager = new Sequelize({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		database: process.env.DB_NAME,
		define: {
			schema: process.env.DB_SCHEMA
		},
		dialect: 'postgres',
		dialectOptions: {
			ssl: String(process.env.DB_SSL).toLowerCase() === 'true',
			trustServerCertificate: true,
		},
		username: process.env.DB_USERNAME_DML,
		password: process.env.DB_PASSWORD_DML,
		repositoryMode: true,
		models: [`${__dirname}/models`],
		logging: (logs: any) => logger.debug(logs)
	});

	sequelizeAdmin
		.sync()
		.then(() => {
			sequelizeAdmin.close();
		})
		.catch((error) => {
			logger.error('Error from Sequelize admin', { stack: error });
		});
} catch (error) {
	logger.error('Error from Sequelize admin', { stack: error });
	throw HandleError.generateHandleError(error);
}

export default sequelizeManager;
export { sequelizeAdmin };
