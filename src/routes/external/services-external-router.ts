import { Router } from 'express';
import ExternalServiceController from '../../controllers/externalServiceController';
import { validateRequest } from '../../middleware';
import ExternalServiceManager from '../../managers/externalServiceManager';
import db from '../../../database/DBManager';
import { getKeycloak } from '../../../config/keycloak-config';
import { updateModuleConfig, getServiceAttributesSchema, getServiceDetailsSchema, refreshSNSMessages } from '../../models/externalSchema';
import { Service } from '../../../database/models/Service';
import { ServiceModuleConfig } from '../../../database/models/ServiceModuleConfig';

const externalController = new ExternalServiceController(new ExternalServiceManager(db.getRepository(Service), db.getRepository(ServiceModuleConfig))),
	keycloak = getKeycloak(),
	SERVICE_API_CREATE = process.env.SERVICE_CREATE_ROLE;
export const ServicesExternalRouter = Router({ mergeParams: true });

ServicesExternalRouter.route('/refreshSNSMessages').get(keycloak.protect(SERVICE_API_CREATE), validateRequest(refreshSNSMessages), externalController.getRefreshSNSMessages.bind(externalController));

ServicesExternalRouter.route('/:serviceID/module/:moduleID').post(
	keycloak.protect(SERVICE_API_CREATE),
	validateRequest(updateModuleConfig),
	externalController.addModuleConfig.bind(externalController)
);

ServicesExternalRouter.route('/attributes').get(
	keycloak.protect(SERVICE_API_CREATE),
	validateRequest(getServiceAttributesSchema),
	externalController.getServiceAttributesDetails.bind(externalController)
);

ServicesExternalRouter.route('/details').get(keycloak.protect(SERVICE_API_CREATE), validateRequest(getServiceDetailsSchema), externalController.getServiceDetails.bind(externalController));
