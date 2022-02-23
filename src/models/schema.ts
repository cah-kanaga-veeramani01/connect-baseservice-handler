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
				serviceTagIDs: {
					type: 'array'
				},
				serviceTypeID: {
					type: 'number'
				}
			},
			required: ['serviceTypeID']
		}
	}
};
export const addServiceTags = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/add-service-tags',
	title: 'Add Service Tags Schema',
	description: 'This is the schema for adding service tags API',
	type: 'object',
	properties: {
		body: {
			type: 'object',
			properties: {
				serviceTags: {
					type: 'array'
				}
			},
			required: ['serviceTags']
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

export const getAllServiceTags = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/get-all-service-tags',
	title: 'Get All Service Tags Schema',
	description: 'This is the schema for getting all the service tags API',
	type: 'object'
};

export const getAllServiceTypes = {
	$schema: definedSchema,
	$id: 'http://cardinal-domain.com/schemas/service-config/get-all-service-types',
	title: 'Add Service Type Schema',
	description: 'This is the schema for adding service type API',
	type: 'object'
};
