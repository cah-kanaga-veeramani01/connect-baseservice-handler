import { sortServiceListBy, sortOrder } from '../interfaces/IServices';

/**
 * Validation schemas for request validation
 */

const definedSchema = 'http://json-schema.org/draft-07/schema#';

export const updateModuleConfig = {
	$schema: definedSchema,
	$id: 'https://cardinal-domain.com/schemas/service-config/updateModuleConfig-external-service-docs.json',
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
				},
				moduleID: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			},
			additionalProperties: false,
			required: ['serviceID', 'moduleID']
		},
		body: {
			type: 'object',
			properties: {
				moduleVersion: {
					type: 'number'
				}
			},
			required: ['moduleVersion']
		}
	},
	required: ['body']
};

export const getServiceAttributesSchema = {
	$schema: definedSchema,
	$id: 'https://cardinal-domain.com/schema/service-config/getModuleVersionDetails.json',
	title: 'Request Parameters to get latest version for a module API',
	description: 'This is a schema to get latest version for a module api.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				legacyTIPDetailID: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				globalServiceVersion: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
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
				}
			},
			additionalProperties: false
		}
	}
};

export const getServiceDetailsSchema = {
	$schema: definedSchema,
	$id: 'https://cardinal-domain.com/schema/service-config/getBaseServiceDetails.json',
	title: 'Request Parameters to get the service detaials API',
	description: 'This is a schema to get service details api.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				serviceID: {
					type: 'string',
					pattern: '^[0-9]+$'
				},
				legacyTIPDetailID: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			}
		}
	},
	required: ['query']
};

export const getAllActiveAndScheduledServices = {
	$schema: definedSchema,
	$id: 'https://cardinal-domain.com/schemas/program-config/getAllActiveAndScheduledServices.json',
	title: 'Request Parameters to refresh all SNS messages for given ack system - for external teams',
	description: 'This is a schema to refresh all SNS messages for given ack system - for external teams.',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				requestingApplication: {
					type: 'string'
				}
			},
			required: ['requestingApplication']
		}
	}
};
