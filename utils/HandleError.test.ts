import { HandleError } from './HandleError';
import httpContext from 'express-http-context';

describe('Handler Error Class', () => {
	test('should create Handle error object', () => {
		const err = new Error('This is a custom test error'),
			handlerErrObj = HandleError.generateHandleError(err);
		expect(handlerErrObj).toBeInstanceOf(HandleError);
	});

	test('should create Handle error object with custom error type', () => {
		let spyHttpContext = jest.spyOn(httpContext, 'get').mockImplementation(() => 'ES');
		const err = new HandleError({ name: 'NotFound', message: 'This is a custom test error', stack: '' }),
			handlerErrObj = HandleError.generateHandleError(err);
		expect(handlerErrObj).toBeInstanceOf(HandleError);
		expect(handlerErrObj.name).toEqual('NotFound');
		expect(handlerErrObj.code).toEqual('SCE002');
		expect(spyHttpContext).toHaveBeenCalledTimes(1);
		expect(spyHttpContext).toHaveBeenCalledWith('language');
	});

	test('should not create but match the HandleError obj', () => {
		const err = new Error('This is a custom test error'),
			handlerErrObj = HandleError.generateHandleError(err, 404, 'testApplication'),
			resultObj = HandleError.generateHandleError(handlerErrObj);
		expect(resultObj).toBeInstanceOf(HandleError);
	});
});
