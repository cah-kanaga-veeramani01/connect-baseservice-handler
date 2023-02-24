import Keycloak from 'keycloak-connect';
import { logger } from '../utils';

let _keycloak;

const keycloakURL = process.env.KEYCLOAK_BASE_URL + '/auth';

const keycloakConfig = {
    clientId: process.env.CLIENT_ID,
    bearerOnly: true,
    serverUrl: keycloakURL,
    realm: process.env.REALM,
    realmPublicKey: process.env.PUBLIC_KEY
};

export const initKeyclock = (memoryStore) => {
    if (_keycloak) {
        logger.nonPhi.info('trying to repeat init Keycloak!');
        return _keycloak;
    }

    logger.nonPhi.info('intializing keycloak.....');

    _keycloak = new Keycloak({
        store: memoryStore
    }, keycloakConfig);

    return _keycloak;
};

export const getKeycloak = () => {
    if (!_keycloak) {
        logger.nonPhi.error('Keycloak is not initialized, Please call init.')
    }
    return _keycloak;
};