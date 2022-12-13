import { Router } from 'express';
import { ServiceTypesInternalRouter } from './service-types-internal-router';
import { ServicesInternalRouter } from './services-internal-router';

export const InternalRouterManager = Router({ mergeParams: true });

InternalRouterManager.use('/types', ServiceTypesInternalRouter);
InternalRouterManager.use('/', ServicesInternalRouter);
