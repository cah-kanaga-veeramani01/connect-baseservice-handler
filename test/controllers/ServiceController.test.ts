import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import ServiceController from '../../src/controllers/ServiceController';
import db from '../../database/DBManager';
import { createServicesResponse, servicePayload } from '../TestData';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceTagMapping));
const serviceController = new ServiceController(serviceManager);

describe('Create a new service', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/',
			body: servicePayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.resolve(createServicesResponse);
		});
		await serviceController.createService(request, response, next);
		expect(response._getData()).toMatchObject(createServicesResponse);
	});
	test('should fail to create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceController.createService(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});
