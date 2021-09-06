import { Request, Response } from 'express';

export default class ServiceController {
	public async displayMessage(req: Request, res: Response) {
		res.send('Hello Service App!!');
	}
}
