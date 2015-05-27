/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import sendhal = require('sendhal');
import Q = require('q');
import ApplicationServiceApi = require('../lib/Domain/ApplicationService');
import TenantApi = require('../lib/Domain/Tenant');
import NodeApi = require('../lib/Domain/Node');
import HalApi = require('../lib/Utils/Hal');

var router = express.Router();

router.get('/:tenantID', (request: express.Request, res, next) => {
    var service : ApplicationServiceApi.ApplicationService = new ApplicationServiceApi.ApplicationService();
    service.getTenantByCode((<any>request).tenantCode)
        .then((tenant: TenantApi.Tenant): void => {

            var _tenant: HalApi.Representation =
                TenantApi.TenantRepresentation.CreateRepresentation(request, tenant.code, tenant)
                    .addSelfLink(request);

            res.json(_tenant);
        })
        .catch((error: any) => {
            console.log(error);
            res.sendStatus(401);
        });
});

module.exports = router;
