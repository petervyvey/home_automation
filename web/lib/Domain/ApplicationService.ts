/// <reference path="../../vendor/typings/references.d.ts" />

import Q = require('q');
import when = require('when');
import amqp = require('amqplib');
import TenantModule = require('./Tenant');
import NodeModule = require('./Node');
import SwitchModule = require('./Switch');
import GeneratorModule = require('../Utils/Generator');
import FactoryModule = require('../Foundation/Factory');
import ArangoDBModule = require('../Data/ArangoDB');

export class ApplicationService {

    constructor() {
        this.session = new ArangoDBModule.ArangoSession('http://automation:automation@localhost:8529', 'automation');

        this.tenantRepository = new TenantModule.TenantRepository(this.session);
        this.nodeRepository = new NodeModule.NodeRepository(this.session);
        this.switchtRepository = new SwitchModule.SwitchRepository(this.session);
    }

    private session: ArangoDBModule.ArangoSession;
    private tenantRepository: TenantModule.TenantRepository;
    private nodeRepository: NodeModule.NodeRepository;
    private switchtRepository: SwitchModule.SwitchRepository;

    public getTenantByID(id: string): Q.Promise<TenantModule.Tenant> {
        var deferred: Q.Deferred<TenantModule.Tenant> = Q.defer<TenantModule.Tenant>()

        this.tenantRepository.getByID(id)
            .then((tenant: TenantModule.Tenant)=>{
                deferred.resolve(tenant);
            });

        return deferred.promise;
    }

    public getTenantByCode(code: string): Q.Promise<TenantModule.Tenant> {
        var deferred: Q.Deferred<TenantModule.Tenant> = Q.defer<TenantModule.Tenant>()

        this.tenantRepository.getByCode(code)
            .then((tenant: TenantModule.Tenant)=>{
                deferred.resolve(tenant);
            });

        return deferred.promise;
    }

    public getNodeByID(tenantID: string, nodeID: string): Q.Promise<NodeModule.Node> {
        var deferred: Q.Deferred<NodeModule.Node> = Q.defer<NodeModule.Node>()

        this.nodeRepository.getByID(tenantID, nodeID)
            .then((node: NodeModule.Node)=>{
                deferred.resolve(node);
            });

        return deferred.promise;
    }

    public getNodes(tenantID: string): Q.Promise<Array<NodeModule.Node>> {
        var deferred: Q.Deferred<Array<NodeModule.Node>> = Q.defer<Array<NodeModule.Node>>()

        this.nodeRepository.getList (tenantID)
            .then((nodes: Array<NodeModule.Node>)=>{
                deferred.resolve(nodes);
            });

        return deferred.promise;
    }

    public getSwitchByID(tenantID: string, switchID: string): Q.Promise<SwitchModule.Switch> {
        var deferred: Q.Deferred<SwitchModule.Switch> = Q.defer<SwitchModule.Switch>()

        this.switchtRepository.getByID(tenantID, switchID)
            .then((_switch: SwitchModule.Switch)=>{
                deferred.resolve(_switch);
            });

        return deferred.promise;
    }

    public getSwitchByNodeID(tenantID: string, nodeID: string): Q.Promise<Array<SwitchModule.Switch>> {
        var deferred: Q.Deferred<Array<SwitchModule.Switch>> = Q.defer<Array<SwitchModule.Switch>>()

        this.switchtRepository.getByNodeID(tenantID, nodeID)
            .then((switches: Array<SwitchModule.Switch>)=>{
                deferred.resolve(switches);
            });

        return deferred.promise;
    }

    public getSwitches(tenantID: string): Q.Promise<Array<SwitchModule.Switch>> {
        var deferred: Q.Deferred<Array<SwitchModule.Switch>> = Q.defer<Array<SwitchModule.Switch>>()

        this.switchtRepository.getList (tenantID)
            .then((switches: Array<SwitchModule.Switch>)=>{
                deferred.resolve(switches);
            });

        return deferred.promise;
    }

    public submitChangeSwitchModeCommand(tenantID: string, switchID: string, mode: string): Q.Promise<boolean> {
        var deferred: Q.Deferred<boolean> = Q.defer<boolean>();

        var key: string = 'automation.event';
        var event: string = JSON.stringify({ id: GeneratorModule.Generator.NewGuid(), type:'SwitchModeEvent', tenant: tenantID, switches:[ { id: switchID, mode:  mode}]});

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