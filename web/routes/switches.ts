/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import TenantModule = require('../lib/Domain/Tenant');
import SwitchModule = require('../lib/Domain/Switch');

var router = express.Router();

router.get('/', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<Array<SwitchModule.Switch>> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getSwitches(tenant.id);
        })
        .then((switches: Array<SwitchModule.Switch>): void => {
            res.json(switches);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

router.get('/:switchID', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<SwitchModule.Switch> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getSwitchByID(tenant.id, req.params.switchID)
        })
        .then((_switch: SwitchModule.Switch): void => {
            res.json(_switch);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

router.post('/:switchID/mode/:mode', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<boolean> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.submitChangeSwitchModeCommand(tenant.id, req.params.switchID, req.params.mode)
        })
        .then((isAccepted: boolean): void => {
            if (isAccepted) {
                res.sendStatus(202);
            }
            else {
                res.sendStatus(500);
            }
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

module.exports = router;