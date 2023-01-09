import moment from 'moment-timezone';
import { CLIENT_TZ } from './constants';

export const startDateWithClientTZ = (startDate) => {
	return moment.tz(startDate, CLIENT_TZ);
};
export const endDateWithClientTZ = (endDate) => {
	return moment.tz(endDate, CLIENT_TZ).set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
};

export const utcToClientTZ = (date) => {
	if (date !== null) return moment.utc(date).tz(CLIENT_TZ);
	return null;
};

export const intervalsOverlap = (existing_start, existing_end, new_start, new_end) => {
	return (new_end === null || existing_start <= new_end) && (existing_end === null || existing_end >= new_start);
};
