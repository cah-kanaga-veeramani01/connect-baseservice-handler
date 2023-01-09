import httpContext from 'express-http-context';
import httpMocks from 'node-mocks-http';
import { contextStore } from '../../src/middleware';
import { HandleError } from '../../utils';
import {describe, expect, jest, test } from '@jest/globals'

describe('Context Store', () => {
	test('should set http context with passed header', () => {
		const mockReq = httpMocks.createRequest({
			headers: {
				'accept-language': 'ES'
			}
		});
		const mockRes = httpMocks.createResponse();
		const nextMock = jest.fn();
		const contextSpy = jest.spyOn(httpContext, 'set');

		contextStore(mockReq, mockRes, nextMock);

		expect(contextSpy).toHaveBeenCalledWith('language', 'ES');
		expect(nextMock).toHaveBeenCalledWith();
	});

	test('should set http context with passed header based on supported type', () => {
		const mockReq = httpMocks.createRequest({
			headers: {
				'accept-language': 'en-gb'
			}
		});
		const mockRes = httpMocks.createResponse();
		const nextMock = jest.fn();
		const contextSpy = jest.spyOn(httpContext, 'set');

		contextStore(mockReq, mockRes, nextMock);

		expect(contextSpy).toHaveBeenCalledWith('language', 'EN');
		expect(nextMock).toHaveBeenCalledWith();
	});

	test('should set http context with default config', () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const nextMock = jest.fn();
		const contextSetSpy = jest.spyOn(httpContext, 'set');

		contextStore(mockReq, mockRes, nextMock);

		expect(contextSetSpy).toHaveBeenCalledWith('language', 'EN');
		expect(nextMock).toHaveBeenCalledWith();
	});

	test('should throw error and call next with error', () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const nextMock = jest.fn();
		const error = new Error();
		const mockHandleError = HandleError.generateHandleError(error);
		const contextSetSpy = jest.spyOn(httpContext, 'set');
		contextSetSpy.mockImplementation(() => {
			throw error;
		});

		contextStore(mockReq, mockRes, nextMock);

		expect(contextSetSpy).toHaveBeenCalledWith('language', 'EN');
		expect(nextMock).toHaveBeenCalledWith(mockHandleError);
	});
});
