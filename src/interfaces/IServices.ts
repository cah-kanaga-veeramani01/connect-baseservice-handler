export interface IServiceClass {
	serviceTypeID: number;
	serviceClassNames: string[];
}

export interface IServiceType {
	serviceType: string;
}

export interface IService {
	serviceName: string;
	serviceDisplayName: string;
	globalServiceVersion?: string;
	validFrom?: Date;
	validTill?: Date;
	isPublished?: boolean;
	serviceTypeID: number;
}

export interface ServiceResponse {
	serviceID: number;
	serviceName: string;
	serviceType: string;
	status: string;
	serviceTagName: string[];
}
export interface ServiceListResponse {
	totalServices: number;
	nonFilteredServicesCount: number;
	services: ServiceResponse[];
}
