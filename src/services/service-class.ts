import { Repository } from 'sequelize-typescript';
import { ServiceClass as ServiceClassModal } from '../../database/models/ServiceClass';

export default class CLassService {
	constructor(public serviceClassRepository: Repository<ServiceClassModal>) {}

	public async createServiceClass(serviceClassName: string) {
		try {
			const data = this.serviceClassRepository.create({
				serviceClassName,
				createdBy: 'tye'
			});
			console.log(serviceClassName);
		} catch (error) {
			throw error;
		}
	}
}
