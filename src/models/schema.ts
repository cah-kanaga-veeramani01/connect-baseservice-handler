import { sortOrder, sortServiceListBy } from '../../utils/constants';
/**
 * Validation schemas for request validation
 */

const definedSchema = 'http://json-schema.org/draft-07/schema#';

export const addService = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/add-service',
	title: 'Add Service Schema',
	description: 'This is the schema for adding a new base service API',
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				serviceName: {
					type: 'string'
				},
				serviceDisplayName: {
					type: 'string'
				},
				serviceTypeID: {
					type: 'number'
				}
			},
			required: ['serviceName', 'serviceDisplayName', 'serviceTypeID']
		}
	}
};

export const addServiceType = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/add-service-type',
	title: 'Add Service Type Schema',
	description: 'This is the schema for adding service type API',
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				serviceType: {
					type: 'string'
				}
			},
			required: ['serviceType']
		}
	}
};

export const getAllServiceTypes = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/get-all-service-types',
	title: 'Add Service Type Schema',
	description: 'This is the schema for adding service type API',
	type: 'object'
};

export const getServiceListSchema = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/service-list.json',
	title: 'Request Parameters of get service list API',
	description: 'This is a schema for service list request API.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				sortBy: {
					type: 'string',
					enum: Object.values(sortServiceListBy)
				},
				sortOrder: {
					type: 'string',
					enum: Object.values(sortOrder)
				},
				from: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				limit: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				keyword: {
					type: 'string'
				}
			},
			required: []
		}
	},
	required: []
};

export const createDraft = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/draft.json',
	title: 'Request Parameters for create draft API',
	description: 'This is a schema for creating draft of service.',
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'number',
					pattern: '^[0-9]+$'
				}
			},
			additionalProperties: false,
			required: ['serviceID']
		}
	},
	required: ['body']
};

export const updateModuleconfig = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/updateModuleConfig-service-docs.json',
	title: 'Request Parameters to update the moduleID and moduleVersion of the service',
	description: 'This is a schema for updating the moduleID and version of service.',
	type: 'object',
	properties: {
		params: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			},
			additionalProperties: false,
			required: ['serviceID']
		},
		body: {
			type: 'object',
			properties: {
				moduleVersion: {
					type: 'number'
				},
				modules: {
					type: 'number'
				}
			},
			required: ['modules']
		}
	},
	required: ['body']
};
export const getModuleEntriesSchema = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schema/service-config/get-missingModuleEntry-details.json',
	title: 'Request Parameters for get module entries detail API',
	description: 'This is a schema for get module entries detail request api.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				globalServiceVersion: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			},
			additionalProperties: false,
			required: ['serviceID', 'globalServiceVersion']
		}
	}
};
export const scheduleService = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/schedule-service.json',
	title: 'Request Parameters for schedule service API',
	description: 'This is a schema for schedule service api request.',
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'number'
				},
				globalServiceVersion: {
					type: 'number'
				},
				startDate: {
					type: 'string',
					//format: "date"
					pattern: '^[1-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]$'
				},
				endDate: {
					type: 'string'
					//format: "date"
				}
			},
			additionalProperties: false,
			required: ['serviceID', 'globalServiceVersion', 'startDate']
		}
	},
	required: ['body']
};

export const getServiceDetails = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/get-service-details.json',
	title: 'Request Parameters for get service details API',
	description: 'This is a schema for get service details request api.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			},
			additionalProperties: false,
			required: ['serviceID']
		}
	},
	required: ['query']
};
