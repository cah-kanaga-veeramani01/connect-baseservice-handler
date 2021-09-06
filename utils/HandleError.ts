import { HTTP_STATUS_CODES, DEFAULT_ERROR_CODE } from '../utils/constants';
import fs from 'fs';
import jsYaml from 'js-yaml';
import httpContext from 'express-http-context';
import config from 'config';

/**
 * importing all the error types from the yaml file
 */
const errorTypes = Object(jsYaml.load(fs.readFileSync('src/errorTypes.yaml', 'utf8')));

/**
 * HandleError class defines the blueprint for error object
 * @class HandleError
 */
export class HandleError extends Error {
	code: string;
	status = HTTP_STATUS_CODES.internalServerError;
	applicationName = process.env.npm_package_name;

	/**
	 * Constructor for the HandleError class.
	 * @constructor
	 * @param {object} customError Custom error object.
	 */
	constructor(customError: { name: string; message: string; stack: string | undefined; errorStatus?: number; applicationName?: string }) {
		super();
		this.name = customError.name;
		this.message = errorTypes[customError.name] ? errorTypes[customError.name][httpContext.get('language') || config.get('language')].message : customError.message;
		this.stack = customError.stack;
		this.code = errorTypes[customError.name] ? errorTypes[customError.name].code : DEFAULT_ERROR_CODE;
		this.status = customError.errorStatus || this.status;
		this.applicationName = customError.applicationName || this.applicationName;
	}

	/**
	 * This method generates handle error type object.
	 * @param {object} error Error passed from the application.
	 * @param {number} errorStatus Error Status.
	 * @param {string} applicationName Application Name.
	 * @returns {HandleError} JSON error object.
	 */
	public static generateHandleError(error: Error, errorStatus?: number, applicationName?: string): HandleError {
		return error instanceof HandleError
			? error
			: new HandleError({
					name: error.name,
					message: error.message,
					stack: error.stack,
					errorStatus,
					applicationName
			  });
	}
}
