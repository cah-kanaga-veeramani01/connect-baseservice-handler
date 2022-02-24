export interface IServiceTag {
	serviceTags: string[];
}

export interface IServiceType {
	serviceType: string;
}

export interface IService {
	serviceName: string;
	serviceDisplayName: string;
	serviceTypeID: number;
	serviceTagIDs: number[];
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
	serviceTagName: string[];
}
export interface ServiceListResponse {
	totalServices: number;
	nonFilteredServicesCount: number;
	services: ServiceResponse[];
}
