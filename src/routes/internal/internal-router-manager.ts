import { Router } from 'express';
import { ServiceClassesInternalRouter } from './service-classes-internal-router';
import { ServiceTypesInternalRouter } from './service-types-internal-router';
import { ServicesInternalRouter } from './services-internal-router';

export const InternalRouterManager = Router();

InternalRouterManager.use('/', ServicesInternalRouter);
InternalRouterManager.use('/classes', ServiceClassesInternalRouter);
InternalRouterManager.use('/types', ServiceTypesInternalRouter);
