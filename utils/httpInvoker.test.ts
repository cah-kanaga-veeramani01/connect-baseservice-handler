import { invoke } from '.';

jest.mock('axios');
import axios from 'axios';

describe('Http invoker util', () => {
	test('should call APIs with Appropriate params', async () => {
		(axios.create as jest.Mock).mockReturnValue(Promise.resolve('axios call'));
		await invoke({ method: 'GET', url: 'http://example.com/' });
		expect(axios).toHaveBeenCalledWith({ method: 'GET', url: 'http://example.com/' });
	});
});
