import { Router } from 'express';
import { ClassRouter } from './class-router';

export const ServiceInternalRoute = Router({ mergeParams: true });

ServiceInternalRoute.use('/classes', ClassRouter);
