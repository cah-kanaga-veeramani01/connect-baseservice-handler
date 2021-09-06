/**
 * This module is used to generate logs of different categories.
 * @module logger
 * @requires constants
 */

import log4js from 'log4js';
import { LOG_PAYLOAD } from '../utils/constants';
import jsonLayout from 'log4js-json-layout';
/**
 * Logger configuration for Phi & nonPhi.
 * Default is configured to nonPhi and Phi is configred as a seperate category.
 * This gives two files for both the appenders.
 */

log4js.addLayout('json', jsonLayout);
log4js.configure({
	appenders: {
		phi: {
			type: 'stdout',
			layout: {
				type: 'json',
				dynamic: {
					logID: function () {
						return LOG_PAYLOAD._logId;
					}
				}
			}
		},
		nonPhi: {
			type: 'stdout',
			layout: {
				type: 'json',
				dynamic: {
					logID: function () {
						return LOG_PAYLOAD._logId;
					}
				}
			}
		}
	},
	categories: {
		phi: { appenders: ['phi'], level: 'trace' },
		default: { appenders: ['nonPhi'], level: 'trace' }
	}
});

/**
 * @exports logger with phi and nonPhi options
 */
export const logger = {
	phi: log4js.getLogger('phi'),
	nonPhi: log4js.getLogger('nonPhi')
};
