/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import HalApi = require('../lib/Utils/Hal');
import TenantApi = require('../lib/Domain/Tenant');
import NodeApi = require('../lib/Domain/Node');
import SwitchApi = require('../lib/Domain/Switch');

var router = express.Router();

router.get('/', (request, response, next) => {
    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>request).tenantCode)
        .then((tenant: TenantApi.Tenant): Q.Promise<Array<NodeApi.Node>> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            return service.getNodes(tenant.id);
        })
        .then((nodes: Array<NodeApi.Node>): void => {

            var nodeRepresentations: Array<NodeApi.NodeRepresentation> =
                nodes.map((node: NodeApi.Node): NodeApi.NodeRepresentation =>{
                    return NodeApi.NodeRepresentation.CreateRepresentation(request, (<any>request).tenantCode, node)
                });

            var representation: HalApi.CollectionRepresentation = new HalApi.CollectionRepresentation();
            representation
                .setCount(nodeRepresentations.length)
                .setTotal(nodeRepresentations.length)
                .addSelfLink(request)
                .addEmbeddedResource('nodes', nodeRepresentations);

            response.set('Content-Type', 'application/hal+json');
            response.json(representation);
        })
        .catch((error: any) => {
            response.sendStatus(401);
        });
});

router.get('/:nodeID', (request: express.Request, response: express.Response, next) => {
    var _tenant: TenantApi.Tenant;
    var _node: HalApi.ResourceRepresentation;

    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>request).tenantCode)

        // Check for valid tenant.
        // TODO: use oauth2 token to match requested tenant and token.tenant.
        .then((tenant: TenantApi.Tenant): Q.Promise<NodeApi.Node> => {
            if (!tenant) throw 'UNKNOWN TENANT'

            _tenant = tenant;

            return service.getNodeByID(tenant.id, request.params.nodeID)
        })

        // Retrieve the requested node.
        .then((node: NodeApi.Node): void => {
            var representation: NodeApi.NodeRepresentation = NodeApi.NodeRepresentation.CreateRepresentation(request, (<any>request).tenantCode, node);

            response.set('Content-Type', 'application/hal+json');
            response.json(representation);
        })
        .catch((error: any) => {
            response.sendStatus(401);
        });
});

module.exports = router;
