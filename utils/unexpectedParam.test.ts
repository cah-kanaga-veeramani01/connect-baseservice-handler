import { validateFileName, validateList, validateRequest } from './unexpectedParam';
import { logger } from '../utils';

describe('Check for unexpected params', () => {
	test('test query string', () => {
		let queryString = '?policyID=1&=1';
		expect(validateRequest(queryString)).toBe(false);
	});

	test('throw error', () => {
		const spy = jest.spyOn(global, 'decodeURIComponent').mockImplementationOnce(() => {throw new Error();});
		const loggerSpy = jest.spyOn(logger.nonPhi, 'error');
		validateRequest('123')
		expect(loggerSpy).toHaveBeenCalled();
	});

	test('test validate filename', () => {
		let validFile = 'test.jpg';
		let invalidFile = 'test.123'
		let pattern = '^[a-zA-Z0-9]+[a-zA-Z0-9-.!@_$%^&*()+{}#|;:<>?, ~`]*(.jpg|.jpeg|.png|.bmp|.JPG|.JPEG|.PNG|.BMP)$'
		expect(validateFileName(validFile, pattern)).toBe(true);
		expect(validateFileName(invalidFile, pattern)).toBe(false);
	});

	test('throw error - 2', () => {
		const spy = jest.spyOn(global, 'RegExp').mockImplementationOnce(() => {throw new Error();});
		const loggerSpy = jest.spyOn(logger.nonPhi, 'error');
		validateFileName('test.jpg', 'test')
		expect(loggerSpy).toHaveBeenCalled();
	});

	test('test validate list', () => {
		let url = 'abc/policy/test';
		expect(validateList(url)).toBe(false);
	});

	test('throw error - 3', () => {
		const spy = jest.spyOn(global, 'RegExp').mockImplementationOnce(() => {throw new Error();});
		const loggerSpy = jest.spyOn(logger.nonPhi, 'error');
		validateList('test')
		expect(loggerSpy).toHaveBeenCalled();
	});

	// test('test validate pbp', () => {
	// 	let pbp = '123';
	// 	expect(validatePBP(pbp)).toBe(true);
	// });

});