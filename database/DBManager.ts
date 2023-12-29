import { Sequelize } from 'sequelize-typescript';
import { logger } from '../utils/logger';
import { HandleError } from '../utils/HandleError';
import fs from 'fs';
const trackAll = require('sequelize-history').all;

let sequelizeAdmin, sequelizeManager;
try {
	sequelizeAdmin = new Sequelize({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		database: process.env.DB_NAME,
		define: {
			schema: process.env.DB_SCHEMA
		},
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
				ca: fs.readFileSync('cert/us-east-1-bundle.crt').toString()
			}
		},
		username: process.env.DB_USERNAME_DDL,
		password: process.env.DB_PASSWORD_DDL,
		repositoryMode: true,
		models: [`${__dirname}/models`],
		logging: (logs: any) => logger.nonPhi.debug(logs)
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
			//ssl: String(process.env.DB_SSL).toLowerCase() === 'true'
			ssl: {
				require: true,
				rejectUnauthorized: false,
				ca: fs.readFileSync('cert/us-east-1-bundle.crt').toString()
			}
		},
		username: process.env.DB_USERNAME_DML,
		password: process.env.DB_PASSWORD_DML,
		repositoryMode: true,
		models: [`${__dirname}/models`],
		logging: (logs: any) => logger.nonPhi.debug(logs)
	});

	sequelizeManager
		.authenticate()
		.then(() => {
			logger.nonPhi.info('connected from manager');
		})
		.catch((error) => {
			logger.nonPhi.error('Error from Sequelize Admin manager', { stack: error });
		});

	sequelizeAdmin
		.sync()
		.then(() => {
			logger.nonPhi.info('connected');
			sequelizeAdmin.close();
		})
		.catch((error) => {
			logger.nonPhi.error('Error from Sequelize Admin', { stack: error });
		});
} catch (error) {
	logger.nonPhi.error('Error from Sequelize admin', { stack: error });
	throw HandleError.generateHandleError(error);
}

export default sequelizeManager;
export { sequelizeAdmin };
