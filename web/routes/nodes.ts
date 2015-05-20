/// <reference path="../vendor/typings/references.d.ts" />

import express = require('express');
import Q = require('q');
import ApplicationServiceModule = require('../lib/Domain/ApplicationService');
import HalApi = require('../lib/Utils/Hal');
import TenantModule = require('../lib/Domain/Tenant');
import NodeModule = require('../lib/Domain/Node');
import SwitchApi = require('../lib/Domain/Switch');

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
    var _tenant: TenantModule.Tenant;
    var _node: NodeModule.Node;

    var service : ApplicationServiceModule.ApplicationService = new ApplicationServiceModule.ApplicationService();
    service.getTenantByCode((<any>req).tenantCode)
        .then((tenant: TenantModule.Tenant): Q.Promise<NodeModule.Node> => {
            if (!tenant) {
                throw 'UNKNOWN TENANT'
            }

            _tenant = tenant;

            return service.getNodeByID(tenant.id, req.params.nodeID)
        })
        .then((node: NodeModule.Node): Q.Promise<Array<SwitchApi.Switch>> => {
            _node = node;

            return service.getSwitchByNodeID(_tenant.id, node.id)
        })
        .then((switches: Array<SwitchApi.Switch>): void => {
            _node.addLink('self', new HalApi.Link(req.originalUrl));

            for(var i: number = 0; i < switches.length; i++) {
                var tenantCode: string = (<any>req).tenantCode;

                switches[i].addLink('self', new HalApi.Link('/' + tenantCode + '/switches/' + switches[i].id));
                switches[i].addLink('$mode.alwaysOff', HalApi.Link.CreateWithMethod('/' + tenantCode + '/switches/' + switches[i].id + '/mode/off', HalApi.HttpVerb.POST));
                switches[i].addLink('$mode.alwaysOn', HalApi.Link.CreateWithMethod('/' + tenantCode + '/switches/' + switches[i].id + '/mode/on', HalApi.HttpVerb.POST));
                switches[i].addLink('$mode.scheduled', HalApi.Link.CreateWithMethod('/' + tenantCode + '/switches/' + switches[i].id + '/mode/scheduled', HalApi.HttpVerb.POST));

            }

            _node.createEmbeddedResource('switches', switches);

            res.json(_node);
        })
        .catch((error: any) => {
            res.sendStatus(401);
        });
});

module.exports = router;
