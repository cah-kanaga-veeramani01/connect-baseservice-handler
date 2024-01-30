import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import { count } from 'console';
import { describe, expect, jest, test } from '@jest/globals';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType), db.getRepository(ServiceModuleConfig));

const mockServiceTypeRepository: Repository<ServiceType> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceTypeID: 1 });
	})
};

const mockServiceRepository: Repository<Service> = {
	count: jest.fn().mockReturnValue(1),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			serviceName: 'Test',
			serviceTypeID: 1,
			globalServiceVersion: 1,
			validFrom: '2021-12-31T05:00:00.000Z',
			validTill: null,
			isPublished: 1
		});
	})
};

const mockServiceRepository_error: Repository<Service> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};

const mockService_duplicate_error_repo: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceID: 1, serviceName: 'Service A' });
	})
};

const mockServiceRepositoryNewDraft: Repository<Service> = {
	count: jest.fn().mockReturnValue(1),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceID: 1, serviceName: 'Service A' });
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.reject({ serviceID: 1, serviceName: 'Service A', validFrom: null, validTill: null });
	})
};

const mockServiceRepositoryNoService: Repository<Service> = {
	count: jest.fn().mockReturnValue(0),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve();
	})
};

const mockServiceModuleConfigRepo: Repository<ServiceModuleConfig> = {
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve('');
	}),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			moduleID: 1,
			moduleVersion: 1
		});
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			moduleID: 1,
			moduleVersion: 1
		});
	}),
	update: jest.fn().mockImplementation(() => {
		return Promise.resolve(1);
	})
};

const mockServiceModuleConfigRepoForInsert: Repository<ServiceModuleConfig> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve(null);
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			moduleID: 1,
			moduleVersion: 1
		});
	})
};

const mockGetNoServiceRepository: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return null;
	})
};
const mockGetServiceRepository: Repository<Service> = {
		findAll: jest.fn().mockImplementation(() => {
			return [];
		}),
		findOne: jest.fn().mockImplementation(() => {
			return {
				isPublished: 1
			};
		}),
		update: jest.fn().mockImplementation(() => {
			return [];
		}),
		count: jest.fn().mockReturnValue(0)
	},
	mockGetServiceRepositoryDetails: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: null,
				isPublished: 1
			});
		})
	},
	mockGetServiceRepositoryForUpdate: Repository<Service> = {
		count: jest.fn().mockReturnValue(1).mockReturnValueOnce(1).mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValueOnce(0),
		findByPk: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: '2027-12-31T05:00:00.000Z',
				isPublished: 1
			});
		}),
		update: jest.fn().mockImplementation(() => {
			return Promise.resolve('');
		})
	},
	mockGetServiceRepositoryWithoutEndDate: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: '2027-12-31T05:00:00.000Z',
				isPublished: 1
			});
		})
	},
	mockGetServiceRepositoryActiveServiceWithEndDate: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 1,
				serviceName: 'Test',
				validFrom: '2021-12-31T05:00:00.000Z',
				validTill: '2025-12-31T05:00:00.000Z',
				isPublished: 1
			});
		})
	},
	mockGetServiceRepositoryExpiredService: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				globalServiceVersion: 2,
				serviceName: 'Test',
				validFrom: '2020-12-31T05:00:00.000Z',
				validTill: '2021-12-31T05:00:00.000Z',
				isPublished: 1
			});
		})
	},
	mockGetServiceRepositoryDraftService: Repository<Service> = {
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
						globalServiceVersion: 1,
						serviceName: 'Test',
						isPublished: 1,
						validFrom: '2024-12-31T05:00:00.000Z',
						validTill: null,
						createdAt: '2022-06-22T07:59:25.463Z',
						createdBy: null,
						updatedAt: '2022-07-06T10:15:51.320Z',
						updatedBy: null
					}
				]
			]);
		})
	},
	mockGetServiceRepositoryDraftServiceOnTopOfActive: Repository<Service> = {
		count: jest.fn().mockReturnValue(1),
		findOne: jest.fn().mockImplementation(() => {
			return Promise.resolve({
				serviceID: 1,
				programName: 'Test',
				clientID: 1,
				market: 'Test',
				programType: 'Test',
				globalServiceVersion: 2,
				validFrom: null,
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

describe('Create Service', () => {
	// test('should create a service successfully ', async () => {
	// 	const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTypeRepository);
	// 	expect(await serviceManager.createService(servicePayload)).toMatchObject(createServicesResponse);
	// });

	test('should fail to create a service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE005');
			expect(error.name).toBe('CreateServiceError');
		}
	});

	test('should fail to create a duplicate service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockService_duplicate_error_repo, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE008');
			expect(error.name).toBe('ServiceAlreadyExistsError');
		}
	});
});

describe('get list of services', () => {
	test('should return list of services without inactive and filter', async () => {
		db.query = jest
			.fn()
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2907,
						status: 'ACTIVE',
						metadata: { attributes: [Array] }
					},
					{
						serviceID: 1140,
						servicename: '(Star Task) Needs Refill - Biguanide',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2898,
						status: 'ACTIVE',
						metadata: { attributes: [1] }
					},
					{
						serviceID: 1140,
						servicename: '(Star Task) Needs Refill - Biguanide',
						validFrom: null,
						validTill: null,
						isPublished: 0,
						servicetype: 'TIP',
						globalServiceVersion: 3,
						legacytipdetailid: 2898,
						status: 'DRAFT',
						metadata: null
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						attributesDefinitionID: 1,
						name: 'DIABETES (ALL CLASS) ADHERENCE',
						description: 'Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 93,
						name: 'HYPERTENSION (RASA) ADHERENCE',
						description: 'Hypertension program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 94,
						name: 'STATIN USE IN DIABETES (SUPD)',
						description: 'Statin in Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [{ count: '1233' }];
			});
		expect(await serviceManager.getNonInActiveServicesList('serviceName', 'asc', 0, 1, '')).toMatchObject({
			totalServices: 1233,
			nonFilteredServicesCount: 1233,
			services: [
				{
					serviceID: 1149,
					servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2907,
					status: 'ACTIVE',
					metadata: {
						attributes: [Array]
					},
					serviceid: 1149,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
							serviceType: 'TIP',
							legacyTIPDetailID: 2907,
							globalServiceVersion: 2,
							attributes: []
						}
					],
					attributes: []
				},
				{
					serviceID: 1140,
					servicename: '(Star Task) Needs Refill - Biguanide',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2898,
					status: 'ACTIVE',
					metadata: {
						attributes: [1]
					},
					serviceid: 1140,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 2,
							attributes: ['DIABETES (ALL CLASS) ADHERENCE']
						},
						{
							status: 'DRAFT',
							validFrom: null,
							validTill: null,
							isPublished: 0,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 3,
							attributes: []
						}
					],
					attributes: ['DIABETES (ALL CLASS) ADHERENCE']
				}
			]
		});
	});
	test('should return list of services without inactive and  with filter', async () => {
		db.query = jest
			.fn()
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2907,
						status: 'ACTIVE',
						metadata: { attributes: [Array] }
					},
					{
						serviceID: 1140,
						servicename: '(Star Task) Needs Refill - Biguanide',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2898,
						status: 'ACTIVE',
						metadata: { attributes: [1] }
					},
					{
						serviceID: 1140,
						servicename: '(Star Task) Needs Refill - Biguanide',
						validFrom: null,
						validTill: null,
						isPublished: 0,
						servicetype: 'TIP',
						globalServiceVersion: 3,
						legacytipdetailid: 2898,
						status: 'DRAFT',
						metadata: null
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						attributesDefinitionID: 1,
						name: 'DIABETES (ALL CLASS) ADHERENCE',
						description: 'Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 93,
						name: 'HYPERTENSION (RASA) ADHERENCE',
						description: 'Hypertension program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 94,
						name: 'STATIN USE IN DIABETES (SUPD)',
						description: 'Statin in Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [{ count: '1233' }];
			}).mockImplementationOnce(() => {
				return [{ count: '2' }];
			});
		expect(await serviceManager.getNonInActiveServicesList('serviceName', 'asc', 0, 1, 'dru')).toMatchObject({
			totalServices: 2,
			nonFilteredServicesCount: 1233,
			services: [
				{
					serviceID: 1149,
					servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2907,
					status: 'ACTIVE',
					metadata: {
						attributes: [Array]
					},
					serviceid: 1149,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
							serviceType: 'TIP',
							legacyTIPDetailID: 2907,
							globalServiceVersion: 2,
							attributes: []
						}
					],
					attributes: []
				},
				{
					serviceID: 1140,
					servicename: '(Star Task) Needs Refill - Biguanide',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2898,
					status: 'ACTIVE',
					metadata: {
						attributes: [1]
					},
					serviceid: 1140,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 2,
							attributes: ['DIABETES (ALL CLASS) ADHERENCE']
						},
						{
							status: 'DRAFT',
							validFrom: null,
							validTill: null,
							isPublished: 0,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 3,
							attributes: []
						}
					],
					attributes: ['DIABETES (ALL CLASS) ADHERENCE']
				}
			]
		});
	});
	test('should return list of services with inactive and without filter', async () => {
		db.query = jest
			.fn()
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2907,
						status: 'ACTIVE',
						metadata: '{"attributes":[56,31,41,62]}'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2898,
						status: 'ACTIVE',
						metadata: '{"attributes":[56,59,1,31,62]}'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide',
						validFrom: null,
						validTill: null,
						isPublished: 0,
						servicetype: 'TIP',
						globalServiceVersion: 3,
						legacytipdetailid: 2898,
						status: 'DRAFT',
						metadata: null
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						attributesDefinitionID: 1,
						name: 'DIABETES (ALL CLASS) ADHERENCE',
						description: 'Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 93,
						name: 'HYPERTENSION (RASA) ADHERENCE',
						description: 'Hypertension program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 94,
						name: 'STATIN USE IN DIABETES (SUPD)',
						description: 'Statin in Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [{ count: '1233' }];
			});
		expect(await serviceManager.getAllServicesList('serviceName', 'asc', 0, 1, '')).toMatchObject({
			totalServices: 1233,
			nonFilteredServicesCount: 1233,
			services: [
				{
					serviceID: 1149,
					servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2907,
					status: 'ACTIVE',
					metadata: {
						"attributes": [56,31,41,62 ],
					},
					serviceid: 1149,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
							serviceType: 'TIP',
							legacyTIPDetailID: 2907,
							globalServiceVersion: 2,
							attributes: []
						}
					],
					attributes: []
				},
				{
					serviceID: 1140,
					servicename: '(Star Task) Needs Refill - Biguanide',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2898,
					status: 'ACTIVE',
					metadata: {
						"attributes": [56,59,1,31,62 ],
					},
					serviceid: 1140,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 2,
							attributes: ['DIABETES (ALL CLASS) ADHERENCE']
						},
						{
							status: 'DRAFT',
							validFrom: null,
							validTill: null,
							isPublished: 0,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 3,
							attributes: []
						}
					],
					attributes: ['DIABETES (ALL CLASS) ADHERENCE']
				}
			]
		});
	});
	test('should return list of services with inactive and with filter', async () => {
		db.query = jest
			.fn()
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						serviceID: 1149,
						serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2907,
						status: 'ACTIVE',
						metadata: '{"attributes":[56,31,41,62]}'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide',
						validFrom: '2024-01-01T05:00:00.000Z',
						validTill: null,
						isPublished: 1,
						servicetype: 'TIP',
						globalServiceVersion: 2,
						legacytipdetailid: 2898,
						status: 'ACTIVE',
						metadata: '{"attributes":[56,59,1,31,62]}'
					},
					{
						serviceID: 1140,
						serviceName: '(Star Task) Needs Refill - Biguanide',
						validFrom: null,
						validTill: null,
						isPublished: 0,
						servicetype: 'TIP',
						globalServiceVersion: 3,
						legacytipdetailid: 2898,
						status: 'DRAFT',
						metadata: null
					}
				];
			})
			.mockImplementationOnce(() => {
				return [
					{
						attributesDefinitionID: 1,
						name: 'DIABETES (ALL CLASS) ADHERENCE',
						description: 'Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 93,
						name: 'HYPERTENSION (RASA) ADHERENCE',
						description: 'Hypertension program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					},
					{
						attributesDefinitionID: 94,
						name: 'STATIN USE IN DIABETES (SUPD)',
						description: 'Statin in Diabetes program support',
						createdAt: '2023-11-13T07:17:20.194Z',
						updatedAt: null,
						categoryName: 'Quality Measures'
					}
				];
			})
			.mockImplementationOnce(() => {
				return [{ count: '1233' }];
			})
			.mockImplementationOnce(() => {
				return [{ count: '2' }];
			});
		expect(await serviceManager.getAllServicesList('serviceName', 'asc', 0, 1, 'dru')).toMatchObject({
			totalServices: 2,
			nonFilteredServicesCount: 1233,
			services: [
				{
					serviceID: 1149,
					servicename: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2907,
					status: 'ACTIVE',
					metadata: {
						"attributes": [56,31,41,62 ],
					},
					serviceid: 1149,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Drug Therapy - Statin (Diabetes)',
							serviceType: 'TIP',
							legacyTIPDetailID: 2907,
							globalServiceVersion: 2,
							attributes: []
						}
					],
					attributes: []
				},
				{
					serviceID: 1140,
					servicename: '(Star Task) Needs Refill - Biguanide',
					validFrom: '2024-01-01T05:00:00.000Z',
					validTill: null,
					isPublished: 1,
					servicetype: 'TIP',
					globalServiceVersion: 2,
					legacytipdetailid: 2898,
					status: 'ACTIVE',
					metadata: {
						"attributes": [56,59,1,31,62 ],
					},
					serviceid: 1140,
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2024-01-01T05:00:00.000Z',
							validTill: null,
							isPublished: 1,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 2,
							attributes: ['DIABETES (ALL CLASS) ADHERENCE']
						},
						{
							status: 'DRAFT',
							validFrom: null,
							validTill: null,
							isPublished: 0,
							serviceName: '(Star Task) Needs Refill - Biguanide',
							serviceType: 'TIP',
							legacyTIPDetailID: 2898,
							globalServiceVersion: 3,
							attributes: []
						}
					],
					attributes: ['DIABETES (ALL CLASS) ADHERENCE']
				}
			]
		});
	});
	test('should throw error with inactive', async () => {
		db.query = () => {
			throw new Error();
		};
		try {
			await serviceManager.getAllServicesList('serviceName', 'asc', 12, 1, '');
		} catch (error) {
			expect(error.code).toBe('SCE011');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
	test('should throw error without inactive', async () => {
		db.query = () => {
			throw new Error();
		};
		try {
			await serviceManager.getNonInActiveServicesList('serviceName', 'asc', 12, 1, '');
		} catch (error) {
			expect(error.code).toBe('SCE001');
			expect(error.name).toBe('NonInActiveServicesListFetchError');
		}
	});
});

describe('Create draft', () => {
	test('service version does not exist for schedule', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockGetNoServiceRepository, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			jest.spyOn(serviceManager, 'getDetails').mockImplementation(() => {
				return Promise.resolve({ activeVersion: 1, scheduledVersion: 2, draftVersion: null, isExpired: false });
			});
			await serviceManager.createDraft(1);
		} catch (error: any) {
			expect(error.name).toBe('ServicVersionNotFound');
		}
	});

	test('draft already exists', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			db.query = () => {
				return [
					{
						activeVersion: 1,
						draftVersion: 2,
						scheduledVersion: null
					}
				];
			};
			expect(serviceManager.createDraft(1)).toMatchObject({
				serviceID: 1,
				serviceName: 'Service A',
				activeVersion: 1,
				draftVersion: 2,
				scheduledVersion: null
			});
		} catch (error: any) {}
	});

	test('return the service details - draft details', async () => {
		const baseService: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			jest.spyOn(baseService, 'getDetails').mockImplementation(() => {
				return Promise.resolve({ activeVersion: 1, scheduledVersion: 2, draftVersion: null, isExpired: false });
			});
			await baseService.createDraft(1);
		} catch (error: any) {}
	});

	test('Select service details', async () => {
		const baseService: ServiceManager = new ServiceManager(mockGetNoServiceRepository, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			jest.spyOn(baseService, 'getDetails').mockImplementation(() => {
				return Promise.resolve({ activeVersion: 1, scheduledVersion: null, draftVersion: null, isExpired: false });
			});
			await baseService.createDraft(1);
		} catch (error: any) {
			expect(error.name).toBe('ServicVersionNotFound');
		}
	});

	test('create draft version', async () => {
		const baseService: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			jest.spyOn(baseService, 'getDetails').mockImplementation(() => {
				return Promise.resolve({ activeVersion: 1, scheduledVersion: null, draftVersion: null, isExpired: false });
			});
			await baseService.createDraft(1);
		} catch (error: any) {}
	});

	test('throw error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		db.query = () => {
			{
				throw new Error();
			}
		};
		try {
			await serviceManager.createDraft(11);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDetailFetchError');
		}
	});
});

describe('Update module Version', () => {
	test('service does not exist error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNoService, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			await serviceManager.addModuleConfig(1, 1, 1);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('Update module version', async () => {
		const updateSpy = jest.spyOn(mockServiceModuleConfigRepo, 'update');
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		db.query = () => {
			return [{ count: '1' }];
		};
		await serviceManager.addModuleConfig(1, 2, 1);
		expect(updateSpy).toBeCalledTimes(0);
	});

	test('Create module version', async () => {
		const updateSpy = jest.spyOn(mockServiceModuleConfigRepoForInsert, 'create');
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository, mockServiceModuleConfigRepoForInsert);
		db.query = () => {
			return [{ count: '0' }];
		};
		await serviceManager.addModuleConfig(2, 1, 1);
		expect(updateSpy).toBeCalledTimes(0);
	});
});

describe('Get module entries', () => {
	test('service does not exist error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNoService, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			await serviceManager.getMissingModules(1, 1);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('should return empty result', async () => {
		db.query = () => {
			return [{ globalServiceVersion: 1 }];
		};
		expect(await serviceManager.getMissingModules(1, 1)).toMatchObject({
			serviceID: 1,
			globalServiceVersion: 1,
			missingModules: []
		});
	});

	test('should return missing modules', async () => {
		try {
			db.query = () => {
				return [];
			};
			expect(serviceManager.getMissingModules(1, 1)).toMatchObject({
				serviceID: 1345,
				globalServiceVersion: 1,
				missingModules: [
					{
						moduleID: 1,
						moduleName: 'Base Service Info                                                                                   '
					}
				]
			});
		} catch (error: any) {}
	});

	test('Program module update error', async () => {
		let obj = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository, mockServiceModuleConfigRepoForInsert);
		db.query = () => {
			{
				throw new Error();
			}
		};

		try {
			expect(await obj.getMissingModules(1, 1));
		} catch (error: any) {
			expect(error.name).toEqual('ModuleConfigFetchError');
		}
	});
});

describe('Schedule service', () => {
	test('service does not exist error', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetNoServiceRepository, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);
		try {
			await serviceObj.schedule(1, 1, '2025-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('service schedule error', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryForUpdate, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);
		try {
			await serviceObj.schedule(1, 1, '2025-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('ServiceScheduleError');
		}
	});

	test('Invalid start date provided', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepository, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);

		try {
			await serviceObj.schedule(1, 1, '2020-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('InvalidStartDate');
		}
	});

	test('Invalid end date provided', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepository, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);

		try {
			await serviceObj.schedule(1, 1, '2025-01-01', '2020-01-01');
		} catch (error: any) {
			expect(error.name).toBe('InvalidEndDate');
		}
	});

	test('service cannot be scheduled - active service without end date', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryWithoutEndDate, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);

		try {
			await serviceObj.schedule(1, 1, '2025-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('ServiceIsActive');
		}
	});

	test('service cannot be scheduled - active service with end date', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryActiveServiceWithEndDate, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);

		try {
			await serviceObj.schedule(1, 1, '2025-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('ServiceIsActive');
		}
	});

	test('service cannot be scheduled - expired service', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryExpiredService, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);

		try {
			await serviceObj.schedule(1, 1, '2025-01-01', null);
		} catch (error: any) {
			expect(error.name).toBe('ServiceIsExpired');
		}
	});

	test('service scheduled - draft service with version 1', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryDraftService, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);
		db.query = () => {
			return null;
		};
		expect(await serviceObj.schedule(1, 1, '2025-01-01', null)).toMatchObject({
			serviceID: 1,
			globalServiceVersion: 1,
			serviceName: 'Test',
			isPublished: 1,
			validFrom: '2024-12-31T05:00:00.000Z',
			validTill: null,
			createdAt: '2022-06-22T07:59:25.463Z',
			createdBy: null,
			updatedAt: '2022-07-06T10:15:51.320Z',
			updatedBy: null
		});
	});

	test('service scheduled on top of active service', async () => {
		const serviceObj: ServiceManager = new ServiceManager(mockGetServiceRepositoryDraftServiceOnTopOfActive, mockGetServiceTypeRepository, mockGetServiceModuleConfigRepository);
		db.query = () => {
			return [
				{
					globalServiceVersion: 2
				}
			];
		};
		expect(await serviceObj.schedule(1, 2, '2025-01-01', '2026-01-01')).toMatchObject({
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
		});
	}, 10000);
});

describe('Get service details', () => {
	test('service does not exist error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNoService, mockServiceTypeRepository, mockServiceModuleConfigRepo);
		try {
			await serviceManager.getDetails(1);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});
});

describe('Active service block', () => {
	test('should able to get list of service', async () => {
		db.query = () => {
			return [
				{
					serviceID: 10,
					globalServiceVersion: 1,
					validFrom: '2021-12-16T12:25:43.407Z',
					validTill: null,
					isPublished: 1,
					legacyTIPDetailID: 62,
					name: 'TECHELIGIBLE',
					categoryName: 'Role',
					sa_globalserviceversion: 1,
					status: 'ACTIVE',
					serviceType: 'TIP'
				},
				{
					serviceID: 10,
					globalServiceVersion: 1,
					validFrom: '2021-12-16T12:25:43.407Z',
					validTill: null,
					isPublished: 1,
					legacyTIPDetailID: 62,
					name: 'AMP',
					categoryName: 'Class',
					sa_globalserviceversion: 1,
					status: 'ACTIVE',
					serviceType: 'TIP'
				},
				{
					serviceID: 19,
					globalServiceVersion: 1,
					validFrom: '2022-12-05T10:23:39.757Z',
					validTill: null,
					isPublished: 1,
					legacyTIPDetailID: 80,
					name: null,
					categoryName: null,
					sa_globalserviceversion: 1,
					status: 'ACTIVE',
					serviceType: 'TIP'
				}
			];
		};

		let res = await serviceManager.getActiveServices();
		expect(res.length).toBe(2);
	});
	test('should able to throw error', async () => {
		db.query = () => {
			throw 'err';
		};
		try {
			let res = await serviceManager.getActiveServices();
		} catch (error) {
			expect(error.name).toBe('ServiceDetailFetchError');
		}
	});
});
