/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import HalApi = require('../lib/Utils/Hal');
import TenantApi = require('../lib/Domain/Tenant');
import SwitchApi = require('../lib/Domain/Switch');

var router = express.Router();

router.get('/', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantApi.Tenant): Q.Promise<Array<SwitchApi.Switch>> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getSwitches(tenant.id);
        })
        .then((switches: Array<SwitchApi.Switch>): void => {
            res.json(switches);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

router.get('/:switchID', (request: express.Request, response: express.Response, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>request).tenantCode)
        .then((tenant: TenantApi.Tenant): Q.Promise<SwitchApi.Switch> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getSwitchByID(tenant.id, request.params.switchID)
        })
        .then((_switch: SwitchApi.Switch): void => {
            var representation: SwitchApi.SwitchRepresentation = SwitchApi.SwitchRepresentation.CreateRepresentation(request, (<any>request).tenantCode, _switch); //BuildRepresentation(request, (<any>request).tenantCode, _switch);

            response.set('Content-Type', 'application/hal+json');
            response.json(representation);
        })
        .catch((error: any) => {
            response.sendStatus(401);
        });
});

router.put('/:switchID/mode/:mode', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantApi.Tenant): Q.Promise<boolean> => {
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