import { HandleError, logger } from '../../utils';
import httpMocks from 'node-mocks-http';
import { errorHandler } from '../../src/middleware';
import {describe, expect, jest, test } from '@jest/globals'

describe('error Handler middleware', () => {
	test('should return provided error status', () => {
		const mockErr = new HandleError({
			name: 'mock Error name',
			message: 'this is a mock error message',
			stack: 'this is mock error stack',
			errorStatus: 404
		});

		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();

		const loggerSpy = jest.spyOn(logger, 'error');

		errorHandler(mockErr, mockReq, mockRes, mockNext);
		expect(loggerSpy).toHaveBeenCalledWith(mockErr.message, { _error: mockErr });
		expect(mockRes.statusCode).toBe(404);
		expect(mockRes._isJSON()).toBeTruthy();
	});

	test('should return default error status', () => {
		const mockErr = new Error();

		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();

		const loggerSpy = jest.spyOn(logger, 'error');

		errorHandler(mockErr, mockReq, mockRes, mockNext);
		expect(loggerSpy).toHaveBeenCalledWith(mockErr.message, { _error: mockErr });
		expect(mockRes.statusCode).toBe(500);
		expect(mockRes._isJSON()).toBeTruthy();
	});
});
