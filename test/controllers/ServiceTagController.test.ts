import mocks from 'node-mocks-http';
import db from '../../database/DBManager';
import { serviceTagsResponse, serviceTagPayload } from '../TestData';
import { ServiceTag } from '../../database/models/ServiceTag';
import ServiceClassManager from '../../src/managers/ServiceTagManager';
import ServiceTagController from '../../src/controllers/ServiceTagController';
import ServiceTagManager from '../../src/managers/ServiceTagManager';

const serviceTagManager = new ServiceTagManager(db.getRepository(ServiceTag));
const serviceTagController = new ServiceTagController(serviceTagManager);

describe('Create service tags', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/tags',
			body: serviceTagPayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create service tags', async () => {
		jest.spyOn(serviceTagManager, 'createServiceTags').mockImplementation((): any => {
			return Promise.resolve(serviceTagsResponse);
		});
		await serviceTagController.createServiceTags(request, response, next);
		expect(response._getData()).toMatchObject(serviceTagsResponse);
	});
	test('should fail to create service tags', async () => {
		jest.spyOn(serviceTagManager, 'createServiceTags').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceTagController.createServiceTags(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});

describe('GET all service tags', () => {
	const request = mocks.createRequest({
			method: 'GET',
			url: '/tags',
			query: {
				serviceType: 1
			}
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should return all service types', async () => {
		jest.spyOn(serviceTagManager, 'getAllServiceTags').mockImplementation((): any => {
			return Promise.resolve(serviceTagsResponse);
		});
		await serviceTagController.getAllServiceTags(request, response);
		expect(response._getData()).toMatchObject(serviceTagsResponse);
	});
	test('should throw error', async () => {
		jest.spyOn(serviceTagManager, 'getAllServiceTags').mockImplementation((): any => {
			return Promise.reject();
		});
		try {
			await serviceTagController.getAllServiceTags(request, response);
		} catch (error) {
			expect(error.code).toBe('ServiceTypeFetchError');
		}
	});
});
