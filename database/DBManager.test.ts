import sequelizeManager, {sequelizeAdmin} from './DBManager';
import { logger } from './../utils/logger';

describe('DB Manager', () => {
	test('logger info to work fine', async () => {
		const loggerInfoSpy = jest.spyOn(logger.nonPhi, 'info');
		sequelizeManager.log('test');
		expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
	});
	test('logger info to work fine - 2', async () => {
		const loggerInfoSpy = jest.spyOn(logger.nonPhi, 'info');
		sequelizeAdmin.log('test');
		expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
	});
});