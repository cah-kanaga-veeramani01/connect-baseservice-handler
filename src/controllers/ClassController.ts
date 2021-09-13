import { NextFunction, Request, Response } from 'express';
import CLassService from '../services/service-class';

export default class ClassController {
	constructor(public classService: CLassService) {}
	public async displayMessage(req: Request, res: Response) {
		res.send('Hello Service App!!');
	}

	public async crateClass(req: Request, res: Response, next: NextFunction) {
		try {
			await this.classService.createServiceClass(req.body?.message);
			res.json({ message: 'success' });
		} catch (error) {
			next(error);
		}
	}
}
