export const LOG_PAYLOAD = {
	_logId: '',
	_jwt: ''
};
export const LOG_ID = {
	LENGTH: 32,
	HEADER_NAME: 'log-id',
	NAME: 'logId'
};

export const HEADERS = {
	LOG_ID: LOG_ID.HEADER_NAME
};
export const DEFAULT_ERROR_CODE = 'PCE001';
export const HTTP_STATUS_CODES = {
	ok: 200,
	created: 201,
	noContent: 204,
	notModified: 304,
	badRequest: 400,
	internalServerError: 500,
	notFound: 404,
	conflict: 409,
	unauthenticated: 401,
	unauthorized: 403,
	gatewayTimeout: 504
};
