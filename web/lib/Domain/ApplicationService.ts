/// <reference path="../../vendor/typings/references.d.ts" />

import Q = require('q');
import when = require('when');
import amqp = require('amqplib');
import ArangoDBApi = require('../Data/ArangoDB');
import GeneratorApi = require('../Utils/Generator');
import DomainApi = require('./Domain');
import TenantApi = require('./Tenant');
import NodeApi = require('./Node');
import SwitchApi = require('./Switch');

export class ApplicationService extends DomainApi.DomainService {

    constructor() {
        super();

        this.session = new ArangoDBApi.ArangoSession('http://automation:automation@localhost:8529', 'automation');

        this.tenantRepository = new TenantApi.TenantRepository(this.session);
        this.nodeRepository = new NodeApi.NodeRepository(this.session);
        this.switchRepository = new SwitchApi.SwitchRepository(this.session);
    }

    private tenantRepository: TenantApi.TenantRepository;
    private nodeRepository: NodeApi.NodeRepository;
    private switchRepository: SwitchApi.SwitchRepository;

    public getTenantByID(id: string): Q.Promise<TenantApi.Tenant> {
        var deferred: Q.Deferred<TenantApi.Tenant> = Q.defer<TenantApi.Tenant>()

        this.tenantRepository.getByID(id)
            .then((tenant: TenantApi.Tenant)=>{
                deferred.resolve(tenant);
            });

        return deferred.promise;
    }

    public getTenantByCode(code: string): Q.Promise<TenantApi.Tenant> {
        var deferred: Q.Deferred<TenantApi.Tenant> = Q.defer<TenantApi.Tenant>()

        this.tenantRepository.getByCode(code)
            .then((tenant: TenantApi.Tenant)=>{
                deferred.resolve(tenant);
            });

        return deferred.promise;
    }

    public getNodeByID(tenantID: string, nodeID: string): Q.Promise<NodeApi.Node> {
        var deferred: Q.Deferred<NodeApi.Node> = Q.defer<NodeApi.Node>()

        var _node: NodeApi.Node;
        this.nodeRepository.getByID(tenantID, nodeID)
            .then((node: NodeApi.Node) : Q.Promise<Array<SwitchApi.Switch>> => {
                _node = node;

                return this.getSwitchByNodeID(tenantID, node.id);
            })
            .then((switches: Array<SwitchApi.Switch>) : void => {
                _node.switches = switches;

                deferred.resolve(_node);
                _node = null;
            });

        return deferred.promise;
    }

    public getNodes(tenantID: string): Q.Promise<Array<NodeApi.Node>> {
        var deferred: Q.Deferred<Array<NodeApi.Node>> = Q.defer<Array<NodeApi.Node>>()

        var _nodes: Array<NodeApi.Node>;
        this.nodeRepository.getList (tenantID)
            .then((nodes: Array<NodeApi.Node>)=>{
                _nodes = nodes;
                var promises: Array<Q.Promise<Array<SwitchApi.Switch>>> = _nodes.map((node: NodeApi.Node) => { return this.getSwitchByNodeID(tenantID, node.id); });

                return Q.all(promises);

            })
        .then((resultSet: Array<Array<SwitchApi.Switch>>) => {
                for(var i: number=0; i < resultSet.length; i++){
                    _nodes[i].switches = resultSet[i];
                }

                deferred.resolve(_nodes);

                // Dereference closure.
                _nodes = null;
            });

        return deferred.promise;
    }

    public getSwitchByID(tenantID: string, switchID: string): Q.Promise<SwitchApi.Switch> {
        var deferred: Q.Deferred<SwitchApi.Switch> = Q.defer<SwitchApi.Switch>()

        this.switchRepository.getByID(tenantID, switchID)
            .then((_switch: SwitchApi.Switch)=>{
                deferred.resolve(_switch);
            });

        return deferred.promise;
    }

    public getSwitchByNodeID(tenantID: string, nodeID: string): Q.Promise<Array<SwitchApi.Switch>> {
        var deferred: Q.Deferred<Array<SwitchApi.Switch>> = Q.defer<Array<SwitchApi.Switch>>()

        this.switchRepository.getByNodeID(tenantID, nodeID)
            .then((switches: Array<SwitchApi.Switch>)=>{
                deferred.resolve(switches);
            });

        return deferred.promise;
    }

    public getSwitchesForNode(node: NodeApi.Node): Q.Promise<NodeApi.Node> {
        var deferred: Q.Deferred<NodeApi.Node> = Q.defer<NodeApi.Node>()

        this.switchRepository.getByNodeID(node.tenantID, node.id)
            .then((switches: Array<SwitchApi.Switch>)=>{
                node.switches = switches;
                deferred.resolve(node);
            });

        return deferred.promise;
    }

    public getSwitches(tenantID: string): Q.Promise<Array<SwitchApi.Switch>> {
        var deferred: Q.Deferred<Array<SwitchApi.Switch>> = Q.defer<Array<SwitchApi.Switch>>()

        this.switchRepository.getList (tenantID)
            .then((switches: Array<SwitchApi.Switch>)=>{
                deferred.resolve(switches);
            });

        return deferred.promise;
    }

    public submitChangeSwitchModeCommand(tenantID: string, switchID: string, mode: string): Q.Promise<boolean> {
        var deferred: Q.Deferred<boolean> = Q.defer<boolean>();

        var key: string = 'automation.event';
        var event: string = JSON.stringify({ id: GeneratorApi.Generator.NewGuid(), type:'SwitchModeEvent', tenantID: tenantID, switches:[ { id: switchID, mode:  mode}]});

        amqp.connect('amqp://automation:automation@localhost/automation')
            .then(function(connection) {
                return when(connection.createChannel()
                    .then(function(channel) {
                        var exchangeName = 'EventExchange';
                        var ifExists = channel.assertExchange(exchangeName, 'topic', {durable: true});

                        return ifExists
                            .then(function() {
                                channel.publish(exchangeName, key, new Buffer(event));

                                return channel.close();
                            });
                    }))
                    .ensure(function() {
                        connection.close();

                        deferred.resolve(true);
                    })

            });

        return deferred.promise;
    }
}