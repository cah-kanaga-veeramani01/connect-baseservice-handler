import { Router } from 'express';
import { ServiceClassesInternalRouter } from './service-tag-internal-router';
import { ServiceTypesInternalRouter } from './service-types-internal-router';
import { ServicesInternalRouter } from './services-internal-router';

export const InternalRouterManager = Router({ mergeParams: true });

InternalRouterManager.use('/classes', ServiceClassesInternalRouter);
InternalRouterManager.use('/types', ServiceTypesInternalRouter);
InternalRouterManager.use('/', ServicesInternalRouter);
