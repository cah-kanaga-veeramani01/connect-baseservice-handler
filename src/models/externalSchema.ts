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
