import { IService, IServiceTag, IServiceType } from '../src/interfaces/IServices';

export const servicePayload: IService = {
	serviceName: 'Service A',
	serviceDisplayName: 'Display A',
	serviceTypeID: 1,
	serviceTagIDs: [1]
};
export const createServicesResponse = {
	serviceID: 1,
	serviceName: 'Service A',
	serviceDisplayName: 'Display A',
	serviceTypeID: 1,
	globalServiceVersion: 1,
	validFrom: '2021-09-15T12:28:45.465Z',
	isPublished: true,
	validTill: null
};
export const serviceTagPayload: IServiceTag = {
	serviceTags: ['serviceTag A', 'serviceTag B']
};
export const serviceTagsResponse = [
	{
		createdAt: '2021-09-15T13:37:10.240Z',
		updatedAt: '2021-09-15T13:37:10.240Z',
		serviceTagID: 1,
		serviceTagName: 'serviceTag A',
		serviceTypeID: 1,
		createdBy: 'admin',
		updatedBy: null
	},
	{
		createdAt: '2021-09-15T13:37:10.240Z',
		updatedAt: '2021-09-15T13:37:10.240Z',
		serviceTagID: 2,
		serviceTagName: 'serviceTag B',
		serviceTypeID: 1,
		createdBy: 'admin',
		updatedBy: null
	}
];
export const serviceTypePayload: IServiceType = {
	serviceType: 'CMR'
};
export const createTypeResponse = {
	createdAt: '2021-09-15T13:38:48.270Z',
	updatedAt: '2021-09-15T13:38:48.270Z',
	serviceTypeID: 1,
	serviceType: 'CMR',
	createdBy: null,
	updatedBy: null
};
export const serviceTypesResponse = [
	{
		serviceTypeID: 1,
		serviceType: 'CMR',
		createdAt: '2021-09-15T07:29:40.642Z',
		createdBy: null,
		updatedAt: '2021-09-15T07:29:40.642Z',
		updatedBy: null
	},
	{
		serviceTypeID: 2,
		serviceType: 'CMR',
		createdAt: '2021-09-15T13:38:48.270Z',
		createdBy: null,
		updatedAt: '2021-09-15T13:38:48.270Z',
		updatedBy: null
	}
];
