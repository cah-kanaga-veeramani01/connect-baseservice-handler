import httpMocks from 'node-mocks-http';
import { logger } from '../../utils';
import EventEmitter from 'events';
import { requestLogger } from '../../src/middleware';

describe('requestLogger', () => {
	test('should log info regarding request', () => {
		const mockReq = httpMocks.createRequest({
			method: 'GET',
			originalUrl: 'http://localhost:1234'
		});
		const mockRes = httpMocks.createResponse({
			eventEmitter: EventEmitter
		});
		const mockNext = jest.fn();
		const loggerSpy = jest.spyOn(logger.nonPhi, 'info');

		requestLogger(mockReq, mockRes, mockNext);
		mockRes.emit('finish');

		expect(loggerSpy).toHaveBeenCalledTimes(2);
		expect(mockNext).toHaveBeenCalledWith();
	});

	test('should throw error to next middleware', () => {
		const mockReq = httpMocks.createRequest({
			method: 'GET',
			originalUrl: 'http://localhost:1234'
		});
		const mockRes = httpMocks.createResponse({});
		const mockNext = jest.fn();
		const loggerSpy = jest.spyOn(logger.nonPhi, 'info');
		loggerSpy.mockImplementation(() => {
			throw new Error();
		});

		requestLogger(mockReq, mockRes, mockNext);

		expect(mockNext).not.toHaveBeenCalledWith();
	});
});
