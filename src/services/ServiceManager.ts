import { Repository } from 'sequelize-typescript';
import { Service } from '../../database/models/Service';
import { ServiceClass as ServiceClassModel } from '../../database/models/ServiceClass';
import { ServiceType } from '../../database/models/ServiceType';
import { IService, IServiceClass } from '../interfaces/IServices';

export default class ServiceManager {
	constructor(public serviceClassRepository: Repository<ServiceClassModel>, public serviceTypeRepository: Repository<ServiceType>, public serviceRepository: Repository<Service>) {}

	public async createServiceClass(serviceClassPayload: IServiceClass) {
		try {
			const serviceClassRecords = serviceClassPayload.serviceClassNames.map((item) => ({ serviceClassName: item, serviceTypeID: serviceClassPayload.serviceTypeID, createdBy: 'admin' }));
			this.serviceClassRepository.bulkCreate(serviceClassRecords);
		} catch (error) {
			throw error;
		}
	}

	public async getAllServiceClasses(serviceTypeID: number) {
		return await this.serviceClassRepository.findAll({ where: { serviceTypeID } });
	}

	public async getAllServiceTypes() {
		return await this.serviceTypeRepository.findAll();
	}

	public async createService(servicePayload: IService) {
		try {
			return await this.serviceRepository.create({
				serviceName: servicePayload.serviceName,
				serviceDisplayName: servicePayload.serviceDisplayName,
				serviceTypeID: servicePayload.serviceTypeID,
				globalServiceVersion: 1,
				validFrom: new Date(),
				isPublished: true
			});
		} catch (error) {
			throw error;
		}
	}
}
