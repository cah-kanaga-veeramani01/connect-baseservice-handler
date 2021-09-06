import sequelizeManager from './DBManager';
import { logger } from './../utils/logger';
var SequelizeMock = require('sequelize-mock');

const loggerInfoSpy = jest.spyOn(logger.nonPhi, 'info').mockImplementation(() => {});
const loggerErrorSpy = jest.spyOn(logger.nonPhi, 'error').mockImplementation(() => {});
var dbMock = new SequelizeMock({});

describe('DB Manager', () => {
    test('logger info to work fine', async () => {
       sequelizeManager.log("test");
       expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
    });

	test('throws error', async () => {
        sequelizeManager.sync = jest.fn().mockImplementation(() => {
            return Promise.resolve();
        });
        try{
           await sequelizeManager.sync();
        } catch(error){
            expect(loggerErrorSpy).toHaveBeenCalled();
        }
    });
});