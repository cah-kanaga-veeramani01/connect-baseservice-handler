import httpMocks from 'node-mocks-http';
import httpContext from 'express-http-context';
import {auth} from '../../src/middleware/auth';
import {describe, expect, jest, test } from '@jest/globals'

jest.mock('../../utils');
import { invoke } from '../../utils';

describe('Authentication middleware', () => {
	test('should not authenticate on API result for non 200', async () => {
		const mockReq = httpMocks.createRequest({
			headers: { cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		(invoke as jest.Mock).mockReturnValue(Promise.resolve({ status: 500 }));
		const contextSetSpy = jest.spyOn(httpContext, 'set');

		await auth(mockReq, mockRes, mockNext);

		expect(invoke).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.any(String),
			headers: { cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		expect(contextSetSpy).not.toHaveBeenCalled();
		expect(mockNext).not.toHaveBeenCalledWith();
	});

	test('should throw error on API result Failure', async () => {
		const mockReq = httpMocks.createRequest({
			headers: { cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		(invoke as jest.Mock).mockImplementation(() => {
			throw new Error();
		});
		const contextSetSpy = jest.spyOn(httpContext, 'set');

		await auth(mockReq, mockRes, mockNext);

		expect(invoke).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.any(String),
			headers: { cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		expect(contextSetSpy).not.toHaveBeenCalled();
		expect(mockNext).not.toHaveBeenCalledWith();
	});

	test('should authenticate and set context on 200 from api', async () => {
		const mockReq = httpMocks.createRequest({
      headers : {cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		(invoke as jest.Mock).mockReturnValue(Promise.resolve({ status: 200, data: { userId: 1453.0, userRoles: ['Doctor', 'Lawyer', 'Business Executive'] } }));
		const contextSetSpy = jest.spyOn(httpContext, 'set');

		await auth(mockReq, mockRes, mockNext);

		expect(invoke).toHaveBeenCalledWith({
			method: 'GET',
			url: expect.any(String),
			headers: { cookie: 'CFID=26354;CFTOKEN=buncha-jibberish;AWSALBCORS=jibrish;AWSALB=jibrish' }
		});
		expect(contextSetSpy).toHaveBeenCalledTimes(2);
		expect(mockNext).toHaveBeenCalledWith();
	});
});