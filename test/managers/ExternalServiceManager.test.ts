import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import ExternalServiceManager from '../../src/managers/externalServiceManager';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import {describe, expect, jest, test } from '@jest/globals'

const serviceManager = new ExternalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig));

const mockServiceRepositoryNewDraft: Repository<Service> = {
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
},
mockServiceRepository: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			serviceName: 'Service A',
			globalServiceVersion: 1,
			validFrom: '2016-08-08T11:38:14.257Z',
			validTill: '2023-05-10T04:00:00.000Z',
			isPublished: 1,
			legacyTIPDetailID: 1817
		  });
	}).mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			serviceName: 'Service A',
			globalServiceVersion: 2,
			validFrom: '2023-05-10T04:00:00.000Z',
			validTill: null,
			isPublished: 1,
			legacyTIPDetailID: 1817
		  });
	}).mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			serviceName: 'Service A',
			globalServiceVersion: 3,
			validFrom: null,
			validTill: null,
			isPublished: 0,
			legacyTIPDetailID: 1817
		  });
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.reject({ serviceID: 1, serviceName: 'Service A', validFrom: null, validTill: null });
	})
};

describe('Update module Version', () => {
	test('service does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.addModuleConfig(1,1,1);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('Update module version', async () => {
		const updateSpy = jest.spyOn(mockServiceModuleConfigRepo, 'update');
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNewDraft,mockServiceModuleConfigRepo);
		db.query = () => {
			return [ { count: '1' } ];
		};
		await serviceManager.addModuleConfig(1, 2, 1);
		expect(updateSpy).toBeCalledTimes(0);
	});

	test('Create module version', async () => {
		const updateSpy = jest.spyOn(mockServiceModuleConfigRepoForInsert, 'create');
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNewDraft,mockServiceModuleConfigRepoForInsert);
		db.query = () => {
			return [ { count: '0' } ];
		};
		await serviceManager.addModuleConfig(2, 1, 1);
		expect(updateSpy).toBeCalledTimes(0);
	});
});

describe('getServiceAttributesDetails', () => {

	test('service does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.getServiceAttributesDetails(1,null,1,NaN,NaN,NaN,NaN);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('should retrun the active attributes version for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [ ];
		});
		try {
			await serviceManager.getServiceAttributesDetails(1, null,null,NaN,NaN,NaN,NaN);
		} catch (error: any) {
			expect(error.name).toBe('ActiveServiceVersionDoesntExist');
		}
	});


	test('should retrun the active attributes version for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [
				{
				  serviceID: 1,
				  legacyTIPDetailID: 1817,
				  globalServiceVersion: 2,
				  validFrom: '2023-05-10T04:00:00.000Z',
				  validTill: null,
				  status: 'ACTIVE'
				}
			  ];
		}).mockImplementationOnce(()=>[ { attributes: '[2,3,8,1]', serviceID: 1, globalServiceVersion: 2 } ]
		).mockImplementationOnce(()=>[
			{ name: 'TECHELIGIBLE', categoryName: 'Role' },
			{ name: 'AMP', categoryName: 'Class' },
			{ name: 'COSTALT', categoryName: 'Class' },
			{ name: 'LEGACY', categoryName: 'Group' }
		  ]) ;
		expect(await serviceManager.getServiceAttributesDetails(1, null,null,NaN,NaN,NaN,NaN)).toStrictEqual({"serviceAttributes": [
			{
				"serviceID": 1,
				"legacyTIPDetailID": 1817,
				"globalServiceVersion": 2,
				"validFrom": "2023-05-10T04:00:00.000Z",
				"validTill": null,
				"status": "ACTIVE",
				"attributes": {
					"Role": [
						"TECHELIGIBLE"
					],
					"Class": [
						"AMP",
						"COSTALT"
					],
					"Group": [
						"LEGACY"
					]
				}
			}
		],
		"totalServices": 1});

	});
	test('legacyID does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.getServiceAttributesDetails(null,1,null,"serviceID",'asc',0,10);
		} catch (error: any) {
			expect(error.name).toBe('LegacyTipIDDoesntExist');
		}
	});
	test('should retrun the active attributes version for legacyTipID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [ ];
		});
		try {
			await serviceManager.getServiceAttributesDetails(null, 1,null,"serviceID",'asc',0,10);
		} catch (error: any) {
			expect(error.name).toBe('ActiveServiceVersionDoesntExist');
		}
	});

	test('should retrun the active attributes deatils for leagacyTipID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  legacyTIPDetailID: 1817,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  status: 'ACTIVE'
					}
				  ];
			}).mockImplementationOnce(()=>[ { attributes: '[2,3,8,1]', serviceID: 1, globalServiceVersion: 2 } ]).mockImplementationOnce(()=>[
				{ name: 'TECHELIGIBLE', categoryName: 'Role' },
				{ name: 'AMP', categoryName: 'Class' },
				{ name: 'COSTALT', categoryName: 'Class' },
				{ name: 'LEGACY', categoryName: 'Group' }
			  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(null, 1,null,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
				{
					"serviceID": 1,
					"legacyTIPDetailID": 1817,
					"globalServiceVersion": 2,
					"validFrom": "2023-05-10T04:00:00.000Z",
					"validTill": null,
					"status": "ACTIVE",
					"attributes": {
						"Role": [
							"TECHELIGIBLE"
						],
						"Class": [
							"AMP",
							"COSTALT"
						],
						"Group": [
							"LEGACY"
						]
					}
				}
			], "totalServices": 1
		});
	});

	test('should retrun the empty attributes object for legacy ID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  legacyTIPDetailID: 1817,
					  globalServiceVersion: 1,
					  validFrom: '2014-12-08T16:23:47.850Z',
					  validTill: '2023-05-20T03:59:59.999Z',
					  status: 'ACTIVE'
					}
				  ];
			}).mockImplementationOnce(()=>[null]).mockImplementationOnce(()=>[
			{ name: 'TECHELIGIBLE', categoryName: 'Role' },
			{ name: 'COSTALT', categoryName: 'Class' },
			{ name: 'HIGHRISK', categoryName: 'Class' },
			{ name: 'MEDREC', categoryName: 'Group' },
			{ name: 'STAR', categoryName: 'Group' }
		  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(null, 1,null,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
				{
				  serviceID: 1,
				  legacyTIPDetailID: 1817,
				  globalServiceVersion: 1,
				  validFrom: '2014-12-08T16:23:47.850Z',
				  validTill: '2023-05-20T03:59:59.999Z',
				  status: 'ACTIVE',
				  attributes: {}
				}
			  ], "totalServices": 1});
	});
	test('should retrun the empty attributes object for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  legacyTIPDetailID: 1817,
					  globalServiceVersion: 1,
					  validFrom: '2014-12-08T16:23:47.850Z',
					  validTill: '2023-05-20T03:59:59.999Z',
					  status: 'ACTIVE'
					}
				  ];
			}).mockImplementationOnce(()=>[null]);
			expect(await serviceManager.getServiceAttributesDetails(1, null,null,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
				{
				  serviceID: 1,
				  legacyTIPDetailID: 1817,
				  globalServiceVersion: 1,
				  validFrom: '2014-12-08T16:23:47.850Z',
				  validTill: '2023-05-20T03:59:59.999Z',
				  status: 'ACTIVE',
				  attributes: {}
				}
			  ], "totalServices": 1});
	});

	test('should retrun the service deatails and  attributes for serviceID and version', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  legacyTIPDetailID: 1817,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  status: 'ACTIVE'
					}
				  ];
			}).mockImplementationOnce(()=>[ { attributes: '[2,3,8,1]', serviceID: 1, globalServiceVersion: 2 } ]).mockImplementationOnce(()=>[
				{ name: 'TECHELIGIBLE', categoryName: 'Role' },
				{ name: 'AMP', categoryName: 'Class' },
				{ name: 'COSTALT', categoryName: 'Class' },
				{ name: 'LEGACY', categoryName: 'Group' }
			  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(1, null,2,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
				{
					"serviceID": 1,
					"legacyTIPDetailID": 1817,
					"globalServiceVersion": 2,
					"validFrom": "2023-05-10T04:00:00.000Z",
					"validTill": null,
					"status": "ACTIVE",
					"attributes": {
						"Role": [
							"TECHELIGIBLE"
						],
						"Class": [
							"AMP",
							"COSTALT"
						],
						"Group": [
							"LEGACY"
						]
					}
				}
			], "totalServices": 1});
	});
	test('should retrun the service deatails and empty attributes for serviceID and version', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  legacyTIPDetailID: 1817,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  status: 'ACTIVE'
					}
				  ];
			}).mockImplementationOnce(()=>[ null ]);
			expect(await serviceManager.getServiceAttributesDetails(1, null,2,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
				{
					"serviceID": 1,
					"legacyTIPDetailID": 1817,
					"globalServiceVersion": 2,
					"validFrom": "2023-05-10T04:00:00.000Z",
					"validTill": null,
					"status": "ACTIVE",
					"attributes": {}
				}
			], "totalServices": 1});
	});


	test('should retrun all the service attributes details ', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'COSTALT',
					  categoryName: 'Class',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'LEGACY',
					  categoryName: 'Group',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'TECHELIGIBLE',
					  categoryName: 'Role',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'AMP',
					  categoryName: 'Class',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 2,
					  globalServiceVersion: 1,
					  validFrom: '2014-12-08T16:23:47.850Z',
					  validTill: '2023-05-20T03:59:59.999Z',
					  isPublished: 1,
					  legacyTIPDetailID: 32,
					  name: null,
					  categoryName: null,
					  sa_globalserviceversion: null,
					  status: 'ACTIVE'
					}
				]}).mockImplementationOnce(()=>[
					1,  2,  3,  4,  5,  6,
					7,  8, 10, 11, 12, 14,
				   15, 19, 20
				 ]);
			expect(await serviceManager.getServiceAttributesDetails(null, null,null,"serviceID",'asc',0,10)).toStrictEqual({"serviceAttributes": [
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
			"totalServices": 1
		});
	});

	test('should retrun all the service attributes details with sorBy and sortorder filters', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'COSTALT',
					  categoryName: 'Class',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'LEGACY',
					  categoryName: 'Group',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'TECHELIGIBLE',
					  categoryName: 'Role',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 1,
					  globalServiceVersion: 2,
					  validFrom: '2023-05-10T04:00:00.000Z',
					  validTill: null,
					  isPublished: 1,
					  legacyTIPDetailID: 31,
					  name: 'AMP',
					  categoryName: 'Class',
					  sa_globalserviceversion: 2,
					  status: 'ACTIVE'
					},
					{
					  serviceID: 2,
					  globalServiceVersion: 1,
					  validFrom: '2014-12-08T16:23:47.850Z',
					  validTill: '2023-05-20T03:59:59.999Z',
					  isPublished: 1,
					  legacyTIPDetailID: 32,
					  name: null,
					  categoryName: null,
					  sa_globalserviceversion: null,
					  status: 'ACTIVE'
					}
				]}).mockImplementationOnce(()=>[
					1,  2,  3,  4,  5,  6,
					7,  8, 10, 11, 12, 14,
				   15, 19, 20
				 ]);
			expect(await serviceManager.getServiceAttributesDetails(null, null,null,"legacyTIPDetailID",'desc',1,10)).toStrictEqual({"serviceAttributes": [
				{
					"serviceID": 2,
					"legacyTIPDetailID": 32,
					"globalServiceVersion": 1,
					"validFrom": "2014-12-08T16:23:47.850Z",
					"validTill": "2023-05-20T03:59:59.999Z",
					"status": "ACTIVE",
					"attributes": {}
				},
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
			],
			"totalServices": 1
		});
	});
	test('should retrun ServiceAttributesFetchError', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.transaction = () => {
			throw new Error();
		};
		try {
			await serviceManager.getServiceAttributesDetails(1, NaN,null,"serviceID",'asc',0,10);
		} catch (error: any) {
			expect(error.name).toBe('ServiceAttributesFetchError');
		}
	});
	
});

describe('getServiceDetails', () => {

	test('service does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.getServiceDetails(1,NaN);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});


	test('should retrun the active service details for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [
				{ serviceID: 1, globalServiceVersion: 2, legacyTIPDetailID: 1817 }
			  ];
		}).mockImplementationOnce(()=>[
			{
			  serviceType: 'TIP',
			  serviceID: 1,
			  serviceDisplayName: 'Adherence Monitoring (Antiretroviral - Protease Inhibitor)',
			  globalServiceVersion: 2,
			  validFrom: '2023-04-10T04:59:59.999Z',
			  validTill: '2025-04-10T04:59:59.999Z'
			}
		  ]);
		expect(await serviceManager.getServiceDetails(1, NaN)).toStrictEqual({
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
	test('legacyID does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.getServiceDetails(NaN,1);
		} catch (error: any) {
			expect(error.name).toBe('LegacyTipIDDoesntExist');
		}
	});
	test('should retrun the active service deatils for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [ ];
		});
		try {
			await serviceManager.getServiceDetails(NaN, 1);
		} catch (error: any) {
			expect(error.name).toBe('ActiveServiceVersionDoesntExist');
		}
	});

	test('should retrun the active service details for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [
				{ serviceID: 1, globalServiceVersion: 2, legacyTIPDetailID: 1817 }
			  ];
		}).mockImplementationOnce(()=>[
			{
			  serviceType: 'TIP',
			  serviceID: 1,
			  serviceDisplayName: 'Adherence Monitoring (Antiretroviral - Protease Inhibitor)',
			  globalServiceVersion: 2,
			  validFrom: '2023-04-10T04:59:59.999Z',
			  validTill: '2025-04-10T04:59:59.999Z'
			}
		  ]);
		expect(await serviceManager.getServiceDetails(NaN, 1)).toStrictEqual({
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
	test('should retrun ServiceDetailsFetchError', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.transaction = () => {
			throw new Error();
		};
		try {
			await serviceManager.getServiceDetails(1, NaN);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDetailsFetchError');
		}
	});
	
});
