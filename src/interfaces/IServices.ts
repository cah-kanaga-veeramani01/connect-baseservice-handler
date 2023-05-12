export interface IServiceType {
	serviceType: string;
}

export interface IService {
	serviceName: string;
	serviceDisplayName: string;
	serviceTypeID: number;
	// globalServiceVersion?: string;
	// validFrom?: Date;
	// validTill?: Date;
	// isPublished?: boolean;
}

export interface ServiceResponse {
	serviceID: number;
	serviceName: string;
	serviceType: string;
	status: string;
}
export interface ServiceListResponse {
	totalServices: number;
	nonFilteredServicesCount: number;
	services: ServiceResponse[];
}

export const sortServiceListBy = {
	serviceID: 'serviceID',
	legacyTIPDetailID: 'legacyTIPDetailID'
};

export const sortOrder = {
	asc: 'asc',
	desc: 'desc'
};
