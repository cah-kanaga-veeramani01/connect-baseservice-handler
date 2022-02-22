export interface IServiceTag {
	serviceTags: string[];
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
	serviceTagIDs: number[];
}
