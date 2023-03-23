import { startDateWithClientTZ, endDateWithClientTZ, intervalsOverlap, utcToClientTZ } from './tzFormatter'
import moment from 'moment';

describe('date overlap validator', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('Should return true if dates are overlapped', () => {
		const existingStart = startDateWithClientTZ('2021-12-11');
		const existingEnd = endDateWithClientTZ('2021-12-12');
		expect(intervalsOverlap(existingStart, existingEnd, startDateWithClientTZ('2021-12-10'), endDateWithClientTZ('2021-12-11'))).toEqual(true);
		expect(intervalsOverlap(existingStart, existingEnd, existingStart, existingEnd)).toEqual(true);
		expect(intervalsOverlap(existingStart, existingEnd, startDateWithClientTZ('2021-12-12'), null)).toEqual(true);
	});

	test('Should return false if dates are not overlapped', () => {
		const existingStart = startDateWithClientTZ('2021-12-11');
		const existingEnd = endDateWithClientTZ('2021-12-12');
		expect(startDateWithClientTZ(existingStart)).toBeInstanceOf(moment);
		expect(intervalsOverlap(existingStart, existingEnd, startDateWithClientTZ('2021-12-09'), endDateWithClientTZ('2021-12-10'))).toEqual(false);
		expect(intervalsOverlap(existingStart, existingEnd, startDateWithClientTZ('2021-12-13'), null)).toEqual(false);
	});
});

describe('utcToClientTZ converter', () => {
	test('Should return the date in speciific timezone', () => {
		expect(utcToClientTZ("2021-12-09T23:59:99.999Z")).toBeInstanceOf(moment);
		expect(utcToClientTZ(null)).toBeNull();
	});
});
