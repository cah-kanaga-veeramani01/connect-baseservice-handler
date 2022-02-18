import { sortOrder, sortServiceListBy } from '../utils/constants';

/**
 * Validation schemas for request validation
 */

const definedSchema = 'http://json-schema.org/draft-07/schema#';

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
				},
				statusFilter: {
					type: 'string'
				}
			},
			required: []
		}
	},
	required: []
};
