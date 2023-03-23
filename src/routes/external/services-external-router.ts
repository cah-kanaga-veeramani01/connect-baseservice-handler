import { Router } from 'express';
import ExternalServiceController from '../../controllers/externalServiceController';
import { validateRequest } from '../../middleware';
import ExternalServiceManager from '../../managers/externalServiceManager';
import db from '../../../database/DBManager';
import { getKeycloak } from '../../../config/keycloak-config';
import { updateModuleConfig } from '../../models/externalSchema';
import { Service } from '../../../database/models/Service';
import { ServiceModuleConfig } from '../../../database/models/ServiceModuleConfig';

const externalController = new ExternalServiceController(new ExternalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig))),
	keycloak = getKeycloak(),
	SERVICE_API_CREATE = process.env.SERVICE_CREATE_ROLE;
export const ServicesExternalRouter = Router({ mergeParams: true });

ServicesExternalRouter.route('/:serviceID/module/:moduleID').post(
	keycloak.protect(SERVICE_API_CREATE),
	validateRequest(updateModuleConfig),
	externalController.addModuleConfig.bind(externalController)
);
