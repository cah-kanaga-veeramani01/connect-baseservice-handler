import { Repository } from 'sequelize-mock';
import { ServiceClass } from '../../database/models/ServiceClass';
import ServiceClassManager from './ServiceClassManager';

describe('Service Class Test', () => {
	test('Create Service class', async () => {
		const mockServiceClass: Repository<ServiceClass> = {
			bulkCreate: jest.fn().mockImplementation(() => {
				return Promise.resolve([
					{
						createdAt: '2021-09-15T06:39:38.527Z',
						updatedAt: '2021-09-15T06:39:38.527Z',
						serviceClassID: 3,
						serviceClassName: 'test',
						serviceTypeID: 1,
						createdBy: 'admin',
						updatedBy: null
					}
				]);
			})
		};
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClass);

		const res = await serviceClassManager.createServiceClass({
			serviceTypeID: 1,
			serviceClassNames: ['test']
		});
		expect(res.length).toBe(1);
		expect(res[0]?.serviceClassName).toBe('test');
		expect(res[0]?.serviceTypeID).toBe(1);
	});

	test('Should Fail to create create classes', async () => {
		const mockServiceClass: Repository<ServiceClass> = {
			bulkCreate: jest.fn().mockImplementation(() => {
				return Promise.reject('failed');
			})
		};
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClass);

		try {
			const res = await serviceClassManager.createServiceClass({
				serviceTypeID: 1,
				serviceClassNames: ['test']
			});
		} catch (error) {
			expect(error?.code).toEqual('SCE003');
		}
	});

	test('Should return class list', async () => {
		const mockServiceClass: Repository<ServiceClass> = {
			findAll: jest.fn().mockImplementation(() => {
				return Promise.resolve([
					{
						createdAt: '2021-09-15T06:39:38.527Z',
						updatedAt: '2021-09-15T06:39:38.527Z',
						serviceClassID: 3,
						serviceClassName: 'test',
						serviceTypeID: 1,
						createdBy: 'admin',
						updatedBy: null
					}
				]);
			})
		};
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClass);
		try {
			const res = await serviceClassManager.getAllServiceClasses(1);
			expect(res.length).toEqual(1);
		} catch (error) {}
	});

	test('Should fail to fetch the list', async () => {
		const mockServiceClass: Repository<ServiceClass> = {
			findAll: jest.fn().mockImplementation(() => {
				return Promise.reject('failed');
			})
		};
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClass);
		try {
			const res = await serviceClassManager.getAllServiceClasses(1);
			expect(res.length).toEqual(1);
		} catch (error) {
			expect(error.code).toEqual('SCE007');
		}
	});
});
