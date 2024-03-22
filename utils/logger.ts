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
			level: 'silly',
			handleExceptions: true
		})
	],
	format: winston.format.combine(
		winston.format.metadata(),
		format((info) => {
			info['@timestamp'] = new Date().toISOString();
			info.logID = httpContext.get('logID');
			info.hl_meta = info?.metadata ? { ...info?.metadata } : {};
			delete info.metadata;
			return info;
		})(),
		winston.format.printf((info) => {
			return `${JSON.stringify(info)}`;
		})
	),

	defaultMeta: {
		logger: 'winston'
	}
});

/**
 * @exports logger with phi and nonPhi options
 */
export const logger = {
	phi: winstonLogger,
	nonPhi: winstonLogger,
	winstonLogger
};
