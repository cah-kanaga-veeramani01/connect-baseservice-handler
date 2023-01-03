import { Router } from 'express';
import { ServicesExternalRouter } from './services-external-router';

export const ExternalRouterManager = Router();
ExternalRouterManager.use('/external', ServicesExternalRouter);
