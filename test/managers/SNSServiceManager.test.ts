import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import SNSServiceManager from './../../src/managers/SNSServiceManager';
import axios from 'axios';

jest.mock('axios');
const mAxios = axios as jest.MockedFunction<typeof axios>;
beforeEach(() => {
	mAxios.mockReset();
});
describe('publish topic publish service to SNS topic', () => {
	test('should able publish topic', async () => {
		mAxios.post.mockResolvedValue({
			data: { ResponseMetadata: { RequestId: '84d7af89-1164-55d0-ad82-f3bb1699d425' }, MessageId: '7ea5e55e-aaf3-5552-a726-b96cad0e84a7', SequenceNumber: '10000000000000027000' },
			status: 200,
			statusText: 'Ok',
			headers: {},
			config: {}
		});
		const snsServiceManagerObj = new SNSServiceManager();
		const res = await snsServiceManagerObj.parentPublishScheduleMessageToSNSTopic(1, 2, '2025-01-01', '', {});
		expect(res).toMatchObject({
			ResponseMetadata: { RequestId: '84d7af89-1164-55d0-ad82-f3bb1699d425' },
			MessageId: '7ea5e55e-aaf3-5552-a726-b96cad0e84a7',
			SequenceNumber: '10000000000000027000'
		});
	});
	test('should throw error', async () => {
		mAxios.post.mockRejectedValue({});
		try {
			const snsServiceManagerObj = new SNSServiceManager();
			const res = await snsServiceManagerObj.parentPublishScheduleMessageToSNSTopic(1, 2, '2025-01-01', '', {});
		} catch (error) {
			expect(error.name).toBe('ParentPublishToSNSTopicError');
		}
	});
});
