import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import ServiceController from '../../src/controllers/ServiceController';
import db from '../../database/DBManager';
import { createServicesResponse, servicePayload } from '../TestData';
import { ServiceType } from '../../database/models/ServiceType';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import SNSServiceManager from '../../src/managers/SNSServiceManager';
import { Repository } from 'sequelize-mock';
import { describe, expect, jest, test } from '@jest/globals';

const mockGetServiceRepository: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: null,
				isPublished: 0
			});
		}),
		update: jest.fn().mockImplementation(() => {
			return Promise.resolve([
				1,
				[
					{
						serviceID: 1,
						globalServiceVersion: 2,
						serviceName: 'Test',
						isPublished: 1,
						validFrom: '2024-12-31T05:00:00.000Z',
						validTill: '2025-12-31T05:00:00.000Z',
						createdAt: '2022-06-22T07:59:25.463Z',
						createdBy: null,
						updatedAt: '2022-07-06T10:15:51.320Z',
						updatedBy: null
					}
				]
			]);
		})
	},
	mockGetServiceRepositoryNoService: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return null;
		})
	},
	mockGetServiceTypeRepository: Repository<ServiceType> = {
		findAll: jest.fn().mockImplementation(() => {
			return [];
		}),
		count: jest.fn().mockReturnValue(1)
	},
	mockGetServiceModuleConfigRepository: Repository<ServiceModuleConfig> = {
		findAll: jest.fn().mockImplementation(() => {
			return [];
		}),
		count: jest.fn().mockReturnValue(1)
	};

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType), db.getRepository(ServiceModuleConfig)),
	snsServiceObj = new SNSServiceManager();
const serviceController = new ServiceController(serviceManager, snsServiceObj);

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

describe('get list of services', () => {
	test('should return list of services', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.resolve({
				totalServices: 3,
				nonFilteredServicesCount: 3,
				services: [
					{
						serviceID: 1,
						serviceName: 'Automation Service 0001',
						serviceType: 'TIP',
						status: 'Active'
					},
					{
						serviceID: 2,
						serviceName: 'Automation Service 0002',
						serviceType: 'TIP',
						status: 'Inactive'
					},
					{
						serviceID: 3,
						serviceName: 'Automation Service 0003',
						serviceType: 'CMR',
						status: 'Inactive'
					}
				]
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					sortBy: 'serviceName',
					sortOrder: 'asc',
					from: 0,
					limit: 1,
					statusFilter: 'All',
					keyword: '',
					showInactive: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceController.getServiceList(req, res);
		expect(res._getData()).toMatchObject({
			totalServices: 3,
			nonFilteredServicesCount: 3,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					status: 'Active'
				},
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: 'TIP',
					status: 'Inactive'
				},
				{
					serviceID: 3,
					serviceName: 'Automation Service 0003',
					serviceType: 'CMR',
					status: 'Inactive'
				}
			]
		});
	});
	test('should return empty result', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.resolve({
				totalServices: 0,
				nonFilteredServicesCount: 0,
				services: []
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					from: 12,
					keyword: 'test'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		try {
			await serviceController.getServiceList(req, res);
		} catch (error) {}
		expect(res._getData()).toMatchObject({
			totalServices: 0,
			nonFilteredServicesCount: 0,
			services: []
		});
	});
	test('should return error', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					sortBy: 'serviceName',
					sortOrder: 'asc',
					from: '10',
					limit: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		try {
			await serviceController.getServiceList(req, res);
		} catch (error) {
			expect(error.code).toBe('SCE011');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});

describe('create draft', () => {
	test('return the draft version', async () => {
		jest.spyOn(snsServiceObj, 'parentPublishScheduleMessageToSNSTopic').mockImplementation(() => {
			return Promise.resolve({
				data: { ResponseMetadata: { RequestId: '84d7af89-1164-55d0-ad82-f3bb1699d425' }, MessageId: '7ea5e55e-aaf3-5552-a726-b96cad0e84a7', SequenceNumber: '10000000000000027000' },
				status: 200,
				statusText: 'Ok',
				headers: {},
				config: {}
			});
		});
		jest.spyOn(serviceManager, 'createDraft').mockImplementation(() => {
			return Promise.resolve({
				activeVersion: 1,
				scheduledVersion: null,
				draftVersion: 2,
				serviceID: 4,
				serviceName: 'Test 4'
			});
		});
		jest.spyOn(serviceManager, 'getDetails').mockImplementation(() => {
			return Promise.resolve({
				serviceID: 4,
				serviceName: 'Test',
				activeVersion: 1,
				scheduledVersion: 2,
				legacyTipDetailID: 123
			});
		});

		jest.spyOn(serviceManager, 'getActiveService').mockImplementation(() => {
			return Promise.resolve({
				serviceID: 4,
				serviceName: 'Test',
				activeVersion: 1,
				scheduledVersion: null,
				legacyTipDetailID: 123
			});
		});

		const req = mocks.createRequest({
				method: 'POST',
				url: '/draft',
				body: {
					serviceID: 4
				}
			}),
			res = mocks.createResponse();

		await serviceController.createDraft(req, res);
		expect(res._getJSONData()).toMatchObject({
			activeVersion: 1,
			scheduledVersion: null,
			draftVersion: 2,
			serviceID: 4,
			serviceName: 'Test 4'
		});
	});

	test('should return error', async () => {
		jest.spyOn(serviceManager, 'createDraft').mockRejectedValue(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/draft',
				body: {
					serviceID: 1
				}
			}),
			res = mocks.createResponse();

		try {
			await serviceController.createDraft(req, res);
		} catch (error) {
			expect(error.name).toBe('ServiceDraftFetchError');
		}
	});
});

describe('Update module version', () => {
	test('retun the module config version', async () => {
		jest.spyOn(serviceManager, 'addModuleConfig').mockImplementation((): any => {
			return Promise.resolve({
				modules: 1,
				moduleVersion: 1,
				message: 'Module Configuration updated successfully'
			});
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/:serviceID/modules',
				body: {
					moduleVersion: 1,
					modules: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.addModuleConfig(req, res);
		expect(res._getJSONData()).toMatchObject({
			modules: 1,
			moduleVersion: 1,
			message: 'Module Configuration updated successfully'
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

describe('Get module entries', () => {
	test('retun the missing modules', async () => {
		jest.spyOn(serviceManager, 'getMissingModules').mockImplementation((): any => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				missingModules: []
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/unmappedModules',
				query: {
					serviceID: 1,
					globalServiceVersion: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.getModuleEntries(req, res, next);
		expect(res._getData()).toMatchObject({
			serviceID: 1,
			globalServiceVersion: 1,
			missingModules: []
		});
	});

	test('should return error', async () => {
		jest.spyOn(serviceManager, 'getMissingModules').mockImplementation(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/unmappedModules',
				query: {
					serviceID: 1345,
					globalServiceVersion: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		try {
			await serviceController.getModuleEntries(req, res, next);
		} catch (error) {
			expect(error.name).toBe('ModuleConfigFetchError');
		}
	});
});

describe('Schedule Service', () => {
	test('return the scheduled Service', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepository, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository),
			serviceSNSObj: SNSServiceManager = new SNSServiceManager();
		jest.spyOn(serviceObj, 'schedule').mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				isPublished: 1,
				validFrom: '2022-12-31T05:00:00.000Z',
				validTill: null,
				createdAt: '2022-06-22T07:59:25.463Z',
				createdBy: null,
				updatedAt: '2022-07-05T06:49:36.447Z',
				updatedBy: null
			});
		});

		jest.spyOn(serviceObj, 'getActiveService').mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				serviceName: 'Test',
				activeVersion: 1,
				scheduledVersion: null,
				legacyTipDetailID: 123,
				validTill: '2029-10-10',
				validFrom: '2020-10-10',
				globalServiceVersion: 1
			});
		});

		jest.spyOn(serviceSNSObj, 'parentPublishScheduleMessageToSNSTopic').mockImplementation(() => {
			return Promise.resolve({
				data: { ResponseMetadata: { RequestId: '84d7af89-1164-55d0-ad82-f3bb1699d425' }, MessageId: '7ea5e55e-aaf3-5552-a726-b96cad0e84a7', SequenceNumber: '10000000000000027000' },
				status: 200,
				statusText: 'Ok',
				headers: {},
				config: {}
			});
		});
		const serviceControllerObj = new ServiceController(serviceObj, serviceSNSObj);

		const req = mocks.createRequest({
				method: 'PUT',
				url: '/service/internal/schedule',
				body: {
					serviceID: 1,
					globalServiceVersion: 1,
					startDate: '2025-01-01'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceControllerObj.schedule(req, res, next);
		expect(res._getData()).toMatchObject({
			serviceID: 1,
			globalServiceVersion: 1,
			serviceName: 'Test',
			isPublished: 1,
			validFrom: '2022-12-31T05:00:00.000Z',
			validTill: null,
			createdAt: '2022-06-22T07:59:25.463Z',
			createdBy: null,
			updatedAt: '2022-07-05T06:49:36.447Z',
			updatedBy: null
		});
	});

	test('throws error', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryNoService, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository),
			serviceSNSObj: SNSServiceManager = new SNSServiceManager();
		const serviceControllerObj = new ServiceController(serviceObj, serviceSNSObj);
		jest.spyOn(serviceObj, 'schedule').mockRejectedValue(new Error('error'));

		const req = mocks.createRequest({
				method: 'PUT',
				url: '/service/internal/schedule',
				body: {
					serviceID: 1,
					globalServiceVersion: 1,
					startDate: '2025-01-01'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceControllerObj.schedule(req, res, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});
describe('Get service details', () => {
	test('return the get service details', async () => {
		jest.spyOn(serviceManager, 'getDetails').mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: null,
				isPublished: 0
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/service/internal/details',
				query: {
					serviceID: '1'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceController.getDetails(req, res, next);
		expect(res._getData()).toMatchObject({
			serviceID: 1,
			globalServiceVersion: 1,
			serviceName: 'Test',
			validFrom: '2021-12-31T05:00:00.000Z',
			validTill: null,
			isPublished: 0
		});
	});

	test('throws error', async () => {
		jest.spyOn(serviceManager, 'getDetails').mockRejectedValue(new Error('error'));
		const req = mocks.createRequest({
				method: 'GET',
				url: '/service/internal/details',
				query: {
					serviceID: '1'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.getDetails(req, res, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});

describe('active service list', () => {
	test('return the get active service list', async () => {
		jest.spyOn(serviceManager, 'getActiveServices').mockImplementation(() => {
			return Promise.resolve([
				{
					serviceID: 10,
					legacyTIPDetailID: 62,
					globalServiceVersion: 1,
					validFrom: '2021-12-16T12:25:43.407Z',
					validTill: null,
					status: 'ACTIVE',
					serviceType: 'TIP',
					attributes: { Role: ['h'], Class: ['g'] }
				},
				{
					serviceID: 19,
					legacyTIPDetailID: 80,
					globalServiceVersion: 1,
					validFrom: '2022-12-05T10:23:39.757Z',
					validTill: null,
					status: 'ACTIVE',
					serviceType: 'TIP',
					attributes: {}
				}
			]);
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/service/internal/active-service',
				query: {}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceController.getActiveServices(req, res, next);
		expect(res._getData()).toMatchObject([
			{
				attributes: { Class: ['g'], Role: ['h'] },
				globalServiceVersion: 1,
				legacyTIPDetailID: 62,
				serviceID: 10,
				serviceType: 'TIP',
				status: 'ACTIVE',
				validFrom: '2021-12-16T12:25:43.407Z',
				validTill: null
			},
			{ attributes: {}, globalServiceVersion: 1, legacyTIPDetailID: 80, serviceID: 19, serviceType: 'TIP', status: 'ACTIVE', validFrom: '2022-12-05T10:23:39.757Z', validTill: null }
		]);
	});

	test('throws error', async () => {
		jest.spyOn(serviceManager, 'getActiveServices').mockRejectedValue(new Error('error'));
		const req = mocks.createRequest({
				method: 'GET',
				url: '/service/internal/details',
				query: {
					serviceID: '1'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();

		await serviceController.getDetails(req, res, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});
