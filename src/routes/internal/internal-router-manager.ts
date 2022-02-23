import { Router } from 'express';
import { ServiceTagsInternalRouter } from './service-tag-internal-router';
import { ServiceTypesInternalRouter } from './service-types-internal-router';
import { ServicesInternalRouter } from './services-internal-router';

export const InternalRouterManager = Router({ mergeParams: true });

InternalRouterManager.use('/tags', ServiceTagsInternalRouter);
InternalRouterManager.use('/types', ServiceTypesInternalRouter);
InternalRouterManager.use('/', ServicesInternalRouter);
