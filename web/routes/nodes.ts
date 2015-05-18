/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import TenantModule = require('../lib/Domain/Tenant');
import NodeModule = require('../lib/Domain/Node');

var router = express.Router();

router.get('/', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<Array<NodeModule.Node>> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getNodes(tenant.id);
        })
        .then((nodes: Array<NodeModule.Node>): void => {
            res.json(nodes);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

router.get('/:nodeID', (req, res, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<NodeModule.Node> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getNodeByID(tenant.id, req.params.nodeID)
        })
        .then((node: NodeModule.Node): void => {
            res.json(node);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

module.exports = router;
