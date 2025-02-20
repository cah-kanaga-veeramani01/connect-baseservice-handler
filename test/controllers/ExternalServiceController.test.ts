import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ExternalServiceController from '../../src/controllers/externalServiceController';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import ExternalServiceManager from '../../src/managers/externalServiceManager';
import {describe, expect, jest, test } from '@jest/globals'

const serviceManager = new ExternalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig));
const serviceController = new ExternalServiceController(serviceManager);

describe('Update module version', () => {
	test('retun the module config version', async () => {
		jest.spyOn(serviceManager, 'addModuleConfig').mockImplementation((): any => {
			return Promise.resolve({
				moduleID: 1,
				moduleVersion: 1,
				message: "Module Configuration updated successfully"
			});
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/:serviceID/module/:moduleID',
				body: {
					"moduleVersion": 1				
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.addModuleConfig(req, res, next);
		expect(res._getJSONData()).toMatchObject({
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
				url: '/:serviceID/module/:moduleID',
				body: {
					"moduleVersion": 1				
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		try {
			await serviceController.addModuleConfig(req, res, next);
		} catch (error) {
			expect(error.name).toBe('ServiceModuleUpdateError');
		}
	});
});

describe('getServiceAttributesDetails', () => {
		test('should return error', async () => {
			jest.spyOn(serviceManager, 'getServiceAttributesDetails').mockImplementation(() => {
				return Promise.reject(new Error());
			});
			const req = mocks.createRequest({
				method: 'GET',
				url: '/service/external/serviceAttributes',
				query: {
					serviceID: 1,
					legacyTIPDetailID: 1,
					globalServiceVersion: 1,
					sortBy: 'serviceID',
					sortOrder: 'asc',
					offset: 0,
					limit: 10
				}
			}),
				res = mocks.createResponse(),
				next = jest.fn();
	
			try {
				await serviceController.getServiceAttributesDetails(req, res, next);
			} catch (error) {
				expect(error.name).toBe('ServiceAttributesFetchError');
			}
		});

		test('should retrun all the service attributes details with sorBy and sortorder filters', async () => {
			jest.spyOn(serviceManager, 'getServiceAttributesDetails').mockImplementation(() => {
				return Promise.resolve({
					"serviceAttributes": [
						{
							"serviceID": 1,
							"legacyTIPDetailID": 31,
							"globalServiceVersion": 2,
							"validFrom": "2023-05-10T04:00:00.000Z",
							"validTill": null,
							"status": "ACTIVE",
							"attributes": {
								"Class": [
									"COSTALT",
									"AMP"
								],
								"Group": [
									"LEGACY"
								],
								"Role": [
									"TECHELIGIBLE"
								]
							}
						},
						{
							"serviceID": 2,
							"legacyTIPDetailID": 32,
							"globalServiceVersion": 1,
							"validFrom": "2014-12-08T16:23:47.850Z",
							"validTill": "2023-05-20T03:59:59.999Z",
							"status": "ACTIVE",
							"attributes": {}
						}
					],
					"totalServices": 15
				});
			});
			const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
							serviceID: 1,
							legacyTIPDetailID: 1,
							globalServiceVersion: 1,
							sortBy: 'serviceID',
							sortOrder: 'asc',
							offset: 0,
							limit: 2
						}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceController.getServiceAttributesDetails(req, res, next);
		expect(res._getData()).toMatchObject({
			"serviceAttributes": [
				{
					"serviceID": 1,
					"legacyTIPDetailID": 31,
					"globalServiceVersion": 2,
					"validFrom": "2023-05-10T04:00:00.000Z",
					"validTill": null,
					"status": "ACTIVE",
					"attributes": {
						"Class": [
							"COSTALT",
							"AMP"
						],
						"Group": [
							"LEGACY"
						],
						"Role": [
							"TECHELIGIBLE"
						]
					}
				},
				{
					"serviceID": 2,
					"legacyTIPDetailID": 32,
					"globalServiceVersion": 1,
					"validFrom": "2014-12-08T16:23:47.850Z",
					"validTill": "2023-05-20T03:59:59.999Z",
					"status": "ACTIVE",
					"attributes": {}
				}
			],
			"totalServices": 15
		});
		});
	});

	describe('getServiceDetails for serviceID and TipID', () => {
		test('retun the service deatils for serviceID or TipID', async () => {
			jest.spyOn(serviceManager, 'getServiceDetails').mockImplementation((): any => {
				return Promise.resolve({
					"serviceDetails": [
						{
							"serviceType": "TIP",
							"serviceID": 1,
							"serviceDisplayName": "Adherence Monitoring (Antiretroviral - Protease Inhibitor)",
							"globalServiceVersion": 2,
							"validFrom": "2023-04-10T04:59:59.999Z",
							"validTill": "2025-04-10T04:59:59.999Z"
						}
					]
				});
			});
			const req = mocks.createRequest({
					method: 'GET',
					url: '/service/external/serviceDetails',
					body: {
						serviceID: 1,
						legacyTIPDetailID: 1,
					
					}
				}),
				res = mocks.createResponse(),
				next = jest.fn();
	
			await serviceController.getServiceDetails(req, res, next);
			expect(res._getData()).toMatchObject({
				"serviceDetails": [
					{
						"serviceType": "TIP",
						"serviceID": 1,
						"serviceDisplayName": "Adherence Monitoring (Antiretroviral - Protease Inhibitor)",
						"globalServiceVersion": 2,
						"validFrom": "2023-04-10T04:59:59.999Z",
						"validTill": "2025-04-10T04:59:59.999Z"
					}
				]
			});
		});

		test('should return error', async () => {
			jest.spyOn(serviceManager, 'getServiceDetails').mockImplementation(() => {
				return Promise.reject(new Error());
			});
			const req = mocks.createRequest({
				method: 'GET',
				url: '/service/external/serviceDetails',
				query: {
					serviceID: 1,
					legacyTIPDetailID: 1,
				
				}
			}),
				res = mocks.createResponse(),
				next = jest.fn();
	
			try {
				await serviceController.getServiceDetails(req, res, next);
			} catch (error) {
				expect(error.name).toBe('ServiceDetailsFetchError');
			}
		});
	});

