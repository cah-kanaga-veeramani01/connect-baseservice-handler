import { errorHandler, validateRequest } from '.';
import httpMocks from 'node-mocks-http';
import faker from 'faker';

const mockSchema = {
	$schema: 'test',
	$id: 'test',
	title: 'Test',
	description: 'Test',
	type: 'object',
	properties: {
		query: {
			type: 'object',
			properties: {
				keyword: {
					type: 'string'
				},
				limit: {
					type: 'string',
					pattern: '^[0-9]+$'
				}
			},
			required: ['keyword', 'limit']
		},
		body: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						name: {
							type: 'string'
						},
						age: {
							type: 'integer'
						}
					},
					required: ['name', 'age']
				}
			},
			required: ['data']
		},
		headers: {
			type: 'object',
			properties: {
				authorization: {
					type: 'string'
				}
			},
			required: ['authorization']
		}
	},
	required: []
};

describe('validateRequest', () => {
	test('should validate req against provided schema', () => {
		const mockReq = httpMocks.createRequest({
			query: {
				keyword: 'search Key',
				limit: '10'
			},
			body: {
				data: {
					name: 'Joe',
					age: 26
				}
			},
			headers: {
				authorization: faker.random.alphaNumeric(32)
			}
		});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();

		const validate = validateRequest(mockSchema);
		validate(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalledWith();
	});

	test('should return 400 on bad req validation', () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn((err) => errorHandler(err, mockReq, mockRes, mockNext));

		const validate = validateRequest(mockSchema);
		validate(mockReq, mockRes, mockNext);

		expect(mockNext).not.toHaveBeenCalledWith();
		expect(mockRes.statusCode).toBe(400);
	});

	test('should throw 400 on req validation failure', () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn((err) => errorHandler(err, mockReq, mockRes, mockNext));

		const validate = validateRequest({});
		validate(mockReq, mockRes, mockNext);
		expect(mockRes.statusCode).toBe(400);
	});
});
