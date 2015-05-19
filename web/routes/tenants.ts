/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import sendhal = require('sendhal');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import TenantModule = require('../lib/Domain/Tenant');
import NodeApi = require('../lib/Domain/Node');
import HalApi = require('../lib/Utils/Hal');

var router = express.Router();

router.get('/:tenantID', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): void => {
            tenant.addLink('self', new HalApi.Link(req.originalUrl));
            var nodes: Array<HalApi.Representation> = tenant.createEmbeddedResource('nodes');

            tenant.addEmbeddedResource('nodes', new NodeApi.Node());

            res.json(tenant);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

module.exports = router;
