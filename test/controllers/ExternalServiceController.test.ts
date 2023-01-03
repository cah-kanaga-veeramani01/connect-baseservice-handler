import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import externalServiceController from '../../src/controllers/externalServiceController';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import externalServiceManager from '../../src/managers/externalServiceManager';

const serviceManager = new externalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig));
const serviceController = new externalServiceController(serviceManager);

describe('Update module version', () => {
	test('retun the module config version', async () => {
		jest.spyOn(serviceManager, 'addModuleConfig').mockImplementation((): any => {
			return Promise.resolve({
				modules: 1,
				moduleVersion: 1,
				message: "Module Configuration updated successfully"
			});
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/:serviceID/modules',
				body: {
					"moduleVersion": 1,
					"modules": 1
				
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.addModuleConfig(req, res);
		expect(res._getJSONData()).toMatchObject({
			modules: 1,
			moduleVersion: 1,
			message: "Module Configuration updated successfully"
		});
	});

	test('should return error', async () => {
		jest.spyOn(serviceManager, 'addModuleConfig').mockImplementation(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/:serviceID/modules',
				body: {
					serviceID: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		try {
			await serviceController.addModuleConfig(req, res);
		} catch (error) {
			expect(error.name).toBe('ServiceModuleUpdateError');
		}
	});
});
