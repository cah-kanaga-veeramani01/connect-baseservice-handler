import httpContext from 'express-http-context';
import httpMocks from 'node-mocks-http';
import { isAuthorized } from '../../src/middleware';
import { Subject, UserAction } from '../../src/models/defineAbility';

describe('isAuthorized middleware', () => {
	test('should not Authorise empty userRoles', async () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		const contextGetSpy = jest.spyOn(httpContext, 'get').mockReturnValue([]);

		const isAuthorizedInstance = isAuthorized(UserAction.create, Subject.policy);
		isAuthorizedInstance(mockReq, mockRes, mockNext);

		expect(contextGetSpy).toHaveBeenCalledWith('userRoles');
		expect(mockNext).not.toHaveBeenCalledWith();
	});

	test('should not Authorise Unidentified userRoles', async () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		const contextGetSpy = jest.spyOn(httpContext, 'get').mockReturnValue(['EN']);

		const isAuthorizedInstance = isAuthorized(UserAction.create, Subject.policy);
		isAuthorizedInstance(mockReq, mockRes, mockNext);

		expect(contextGetSpy).toHaveBeenCalledWith('userRoles');
		expect(mockNext).not.toHaveBeenCalledWith();
	});

	test('should fail for missing userRoles in config', async () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		const contextGetSpy = jest.spyOn(httpContext, 'get').mockReturnValue(['Missing user role']);

		const isAuthorizedInstance = isAuthorized(UserAction.create, Subject.policy);
		isAuthorizedInstance(mockReq, mockRes, mockNext);

		expect(contextGetSpy).toHaveBeenCalledWith('userRoles');
		expect(mockNext).not.toHaveBeenCalledWith();
	});

	test('should authorise userRoles', async () => {
		const mockReq = httpMocks.createRequest();
		const mockRes = httpMocks.createResponse();
		const mockNext = jest.fn();
		const contextGetSpy = jest.spyOn(httpContext, 'get').mockReturnValue(['Read Role']);

		const isAuthorizedInstance = isAuthorized(UserAction.read, Subject.policy);
		isAuthorizedInstance(mockReq, mockRes, mockNext);

		expect(contextGetSpy).toHaveBeenCalledWith('userRoles');
		expect(mockNext).toHaveBeenCalledWith();
	});
});
