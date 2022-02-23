import { Repository } from 'sequelize-mock';
import { ServiceTag } from '../../database/models/ServiceTag';
import { serviceTagsResponse, serviceTagPayload } from '../TestData';
import ServiceTagManager from '../../src/managers/ServiceTagManager';

const mockServiceTagRepository: Repository<ServiceTag> = {
	bulkCreate: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceTagsResponse);
	}),
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceTagsResponse);
	})
};

const mockServiceTagRepository_reject: Repository<ServiceTag> = {
	bulkCreate: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	}),
	findAll: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};

describe('Service Tages - Test', () => {
	test('should create service tages', async () => {
		const serviceTagManager: ServiceTagManager = new ServiceTagManager(mockServiceTagRepository);
		expect(await serviceTagManager.createServiceTags(serviceTagPayload)).toMatchObject(serviceTagsResponse);
	});
	test('should throw error', async () => {
		const serviceTagManager: ServiceTagManager = new ServiceTagManager(mockServiceTagRepository_reject);
		try {
			await serviceTagManager.createServiceTags(serviceTagPayload);
		} catch (error) {
			expect(error.code).toEqual('SCE003');
			expect(error.name).toEqual('CreateServiceTagsError');
		}
	});
	test('should return tags list', async () => {
		const serviceTagManager: ServiceTagManager = new ServiceTagManager(mockServiceTagRepository);
		expect(await serviceTagManager.getAllServiceTags()).toMatchObject(serviceTagsResponse);
	});

	test('should fail to fetch the list', async () => {
		const serviceTagManager: ServiceTagManager = new ServiceTagManager(mockServiceTagRepository_reject);
		try {
			await serviceTagManager.getAllServiceTags();
		} catch (error) {
			expect(error.code).toEqual('SCE007');
			expect(error.name).toEqual('ServiceTagsFetchError');
		}
	});
});
