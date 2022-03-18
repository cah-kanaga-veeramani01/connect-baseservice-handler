import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import ServiceController from '../../src/controllers/ServiceController';
import db from '../../database/DBManager';
import { createServicesResponse, servicePayload } from '../TestData';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { ServiceType } from '../../database/models/ServiceType';
import { ServiceTag } from '../../database/models/ServiceTag';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceTagMapping), db.getRepository(ServiceType), db.getRepository(ServiceTag));
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
		await serviceController.createService(request, response);
		expect(response._getData()).not.toBe(null);
	});
	test('should fail to create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.reject(new Error());
		});
		try {
			await serviceController.createService(request, response);
		} catch (error) {
			expect(error.code).toBe('CreateServiceError');
		}
	});
});
