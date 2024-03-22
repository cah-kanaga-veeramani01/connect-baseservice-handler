import { logger, HandleError } from '../../utils';
import { HEADERS, LOG_ID } from '../../utils/constants';
import httpMocks from 'node-mocks-http';
import faker from 'faker';
import { generateLogId } from '../../src/middleware';
import {describe, expect, jest, test } from '@jest/globals'

describe('generateLogId', () => {
	test('should generate and attach logId to response and log context', () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();

		generateLogId(mockReq, mockRes, mockNext);

		expect(mockRes.getHeader(HEADERS.LOG_ID)).toHaveLength(32);
		expect(mockNext).toHaveBeenCalledWith();
	});

	test('should reuse request logId for response and log context', () => {
		const mockReq = httpMocks.createRequest({
			headers: {
				[HEADERS.LOG_ID]: faker.random.alphaNumeric(32)
			}
		});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();

		generateLogId(mockReq, mockRes, mockNext);

		expect(mockRes.getHeader(HEADERS.LOG_ID)).toHaveLength(32);
		expect(mockNext).toHaveBeenCalled();
	});

	test('should throw an error and call next with error', () => {
		const mockReq = httpMocks.createRequest({});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		const error = new Error();
		const mockHandleError = HandleError.generateHandleError(error);
		
		const nonPhiLoggerSpy = jest.spyOn(logger.nonPhi, 'debug');
		nonPhiLoggerSpy.mockImplementation(() => {
			throw error;
		});

		generateLogId(mockReq, mockRes, mockNext);
		expect(mockNext).toHaveBeenCalledWith(mockHandleError);
	});
});
