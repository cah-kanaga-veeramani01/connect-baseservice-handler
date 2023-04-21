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
			validTill: '2023-04-10T04:59:59.999Z',
			isPublished: 1,
			legacyTIPDetailID: 1817
		  });
	}).mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			serviceName: 'Service A',
			globalServiceVersion: 2,
			validFrom: null,
			validTill: null,
			isPublished: 1,
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
			await serviceManager.getServiceAttributesDetails(1,NaN);
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
			await serviceManager.getServiceAttributesDetails(1, null);
		} catch (error: any) {
			expect(error.name).toBe('ActiveServiceVersionDoesntExist');
		}
	});


	test('should retrun the active attributes version for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [ { globalServiceVersion: 1 } ];
		}).mockImplementationOnce(()=>[ { attributes: '[1,3,4,9,10]' } 
	]).mockImplementationOnce(()=>[
		{ name: 'TECHELIGIBLE', categoryName: 'Role' },
		{ name: 'COSTALT', categoryName: 'Class' },
		{ name: 'HIGHRISK', categoryName: 'Class' },
		{ name: 'MEDREC', categoryName: 'Group' },
		{ name: 'STAR', categoryName: 'Group' }
	  ]) ;
		expect(await serviceManager.getServiceAttributesDetails(1, NaN)).toStrictEqual({"ServiceAttributes": [{
			"serviceID": 1,
			"legacyTIPDetailID": undefined,
			"Attributes": 
			{ Role: [ 'TECHELIGIBLE' ] ,
			Class: [ 'COSTALT', 'HIGHRISK' ] ,
			Group: [ 'MEDREC', 'STAR' ] 
			}
			
		}]});

	});
	test('legacyID does not exist error', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepositoryNoService,mockServiceModuleConfigRepo);
		try {
			await serviceManager.getServiceAttributesDetails(NaN,1);
		} catch (error: any) {
			expect(error.name).toBe('LegacyTipIDDoesntExist');
		}
	});
	test('should retrun the active attributes version for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.query = jest.fn().mockImplementationOnce(()=>{
			return [ ];
		});
		try {
			await serviceManager.getServiceAttributesDetails(NaN, 1);
		} catch (error: any) {
			expect(error.name).toBe('ActiveServiceVersionDoesntExist');
		}
	});

	test('should retrun the active attributes deatils for leagacyTipID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [ { globalServiceVersion: 1 } ];
			}).mockImplementationOnce(()=>[ { attributes: '[1,3,4,9,10]' } 
		]).mockImplementationOnce(()=>[
			{ name: 'TECHELIGIBLE', categoryName: 'Role' },
			{ name: 'COSTALT', categoryName: 'Class' },
			{ name: 'HIGHRISK', categoryName: 'Class' },
			{ name: 'MEDREC', categoryName: 'Group' },
			{ name: 'STAR', categoryName: 'Group' }
		  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(NaN, 1)).toStrictEqual({"ServiceAttributes": [{
				"serviceID": undefined,
				"legacyTIPDetailID": 1,
				"Attributes": 
				{ Role: [ 'TECHELIGIBLE' ] ,
				Class: [ 'COSTALT', 'HIGHRISK' ] ,
				Group: [ 'MEDREC', 'STAR' ] 
				}
				
			}]});
	});

	test('should retrun the empty ettributes object for legacy ID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [ { globalServiceVersion: 1 } ];
			}).mockImplementationOnce(()=>[ 
		]).mockImplementationOnce(()=>[
			{ name: 'TECHELIGIBLE', categoryName: 'Role' },
			{ name: 'COSTALT', categoryName: 'Class' },
			{ name: 'HIGHRISK', categoryName: 'Class' },
			{ name: 'MEDREC', categoryName: 'Group' },
			{ name: 'STAR', categoryName: 'Group' }
		  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(NaN, 1)).toStrictEqual({"ServiceAttributes": [{
				"serviceID": undefined,
				"legacyTIPDetailID": 1,
				"Attributes": 
				{ }
				
			}]});
	});
	test('should retrun the empty ettributes object for serviceID', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
			db.query = jest.fn().mockImplementationOnce(()=>{
				return [ { globalServiceVersion: 1 } ];
			}).mockImplementationOnce(()=>[ 
		]).mockImplementationOnce(()=>[
			{ name: 'TECHELIGIBLE', categoryName: 'Role' },
			{ name: 'COSTALT', categoryName: 'Class' },
			{ name: 'HIGHRISK', categoryName: 'Class' },
			{ name: 'MEDREC', categoryName: 'Group' },
			{ name: 'STAR', categoryName: 'Group' }
		  ]) ;
			expect(await serviceManager.getServiceAttributesDetails(1, NaN)).toStrictEqual({"ServiceAttributes": [{
				"serviceID": 1,
				"legacyTIPDetailID": undefined,
				"Attributes": 
				{ }
				
			}]});
	});
	test('should retrun ServiceAttributesFetchError', async () => {
		const serviceManager: ExternalServiceManager = new ExternalServiceManager(mockServiceRepository,mockServiceModuleConfigRepo);
		db.transaction = () => {
			throw new Error();
		};
		try {
			await serviceManager.getServiceAttributesDetails(1, NaN);
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
