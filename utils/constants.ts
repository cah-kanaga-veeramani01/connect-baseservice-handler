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
export const DEFAULT_ERROR_CODE = 'SCE001';
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

export const sortOrder = {
	asc: 'asc',
	desc: 'desc'
};

export const sortServiceListBy = {
	serviceName: 'serviceName',
	// status: 'status',
	type: 'serviceType',
	serviceID: 'serviceID'
};

export const serviceList = {
	defaultSortBy: 'serviceName',
	defaultSortOrder: 'asc',
	defaultFrom: 0,
	defaultLimit: 10,
	defaultFilterBy: 'All',
	matchAll: '%'
};

export const EMPTY_STRING = '';

export const CLIENT_TZ = 'America/New_York';

export const SERVICE_SCHEDULE_EVENT = 'SCHEDULE';

export const SERVICE_CHANGE_EVENT = 'CHANGE';
