/**
 * This module is used to generate logs of different categories.
 * @module logger
 * @requires constants
 */

import winston, { format } from 'winston';
import httpContext from 'express-http-context';

const winstonLogger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			level: process.env.LOG_LEVEL
		})
	],
	format: winston.format.combine(
		winston.format.metadata(),
		format((log) => {
			log['@timestamp'] = new Date().toISOString();
			log.logID = httpContext.get('logID');
			log.hl_meta = log?.metadata ? { ...log?.metadata } : {};
			delete log.metadata;
			return log;
		})(),
		winston.format.printf((log) => {
			return `${JSON.stringify(log)}`;
		})
	)
});

export const logger = winstonLogger;
