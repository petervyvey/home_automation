/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import TenantModule = require('../lib/Domain/Tenant');

var router = express.Router();

router.get('/:tenantID', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): void => {
            res.json(tenant);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

module.exports = router;
