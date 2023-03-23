import mocks from 'node-mocks-http';
import db from '../../database/DBManager';
import { serviceTypesResponse, serviceTypePayload } from '../TestData';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceTypeManager from '../../src/managers/ServiceTypeManager';
import ServiceTypeController from '../../src/controllers/ServiceTypeController';
import {describe, expect, jest, test } from '@jest/globals'

const serviceTypeManager = new ServiceTypeManager(db.getRepository(ServiceType));
const serviceTypeController = new ServiceTypeController(serviceTypeManager);

describe('Create service type', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/types',
			body: serviceTypePayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create service type', async () => {
		jest.spyOn(serviceTypeManager, 'createServiceType').mockImplementation((): any => {
			return Promise.resolve(serviceTypesResponse);
		});
		await serviceTypeController.createServiceType(request, response);
		expect(response._getData()).toMatchObject(serviceTypesResponse);
	});
	test('should fail to create service type', async () => {
		jest.spyOn(serviceTypeManager, 'createServiceType').mockImplementation((): any => {
			return Promise.reject();
		});
		try {
			await serviceTypeController.createServiceType(request, response);
		} catch (error) {
			expect(error.code).toBe('CreateServiceTypeError');
		}
	});
});

describe('GET all service types', () => {
	const request = mocks.createRequest({
			method: 'GET',
			url: '/types'
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should return all service types', async () => {
		jest.spyOn(serviceTypeManager, 'getAllServiceTypes').mockImplementation((): any => {
			return Promise.resolve(serviceTypesResponse);
		});
		await serviceTypeController.getAllServiceTypes(request, response, next);
		expect(response._getData()).toMatchObject(serviceTypesResponse);
	});
	test('should throw error', async () => {
		jest.spyOn(serviceTypeManager, 'getAllServiceTypes').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceTypeController.getAllServiceTypes(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});
