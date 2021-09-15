import { Repository } from 'sequelize-mock';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceTypeManager from './ServiceTypeManager';

describe('Service Type Test', () => {
	test('Create Service Type', async () => {
		const mockServiceClass: Repository<ServiceType> = {
			create: jest.fn().mockImplementation(() => {
				return Promise.resolve({
					serviceType: 'test',
					serviceTypeID: 1
				});
			})
		};
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceClass);

		const res = await serviceTypeManager.createServiceType({ serviceType: 'test' });
		// expect(res).toBe(1);
		expect(res?.serviceType).toBe('test');
		expect(res?.serviceTypeID).toBe(1);
	});

	test('Should Fail to create create service type', async () => {
		const mockServiceClass: Repository<ServiceType> = {
			bulkCreate: jest.fn().mockImplementation(() => {
				return Promise.reject('failed');
			})
		};
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceClass);

		try {
			const res = await serviceTypeManager.createServiceType({ serviceType: 'test' });
		} catch (error) {
			expect(error?.code).toEqual('SCE004');
		}
	});

	test('Should return type list', async () => {
		const mockServiceClass: Repository<ServiceType> = {
			findAll: jest.fn().mockImplementation(() => {
				return Promise.resolve([
					{
						serviceType: 'test',
						serviceTypeID: 1
					}
				]);
			})
		};
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceClass);
		const res = await serviceTypeManager.getAllServiceTypes();
		expect(res.length).toEqual(1);
	});

	test('Should Fail to fetch list', async () => {
		const mockServiceClass: Repository<ServiceType> = {
			findAll: jest.fn().mockImplementation(() => {
				return Promise.reject('failed');
			})
		};
		try {
			const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceClass);
			const res = await serviceTypeManager.getAllServiceTypes();
		} catch (error) {
			expect(error?.code).toEqual('SCE006');
		}
	});
});
