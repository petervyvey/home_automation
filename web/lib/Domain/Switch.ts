/// <reference path='../../vendor/typings/references.d.ts' />

import express = require('express');
import Q = require('q');
import UtilsApi = require('../../lib/Utils/Utils');
import ArangoDBApi = require('../../lib/Data/ArangoDB');
import HalApi = require('../../lib/Utils/Hal');
import DomainApi = require('./Domain');

export interface ISwitchOptions {
    id: string;
    nodeID?: string
    code?: string;
    description?: string;
    state?: string;
    mode?: string;
    validFrom?: string;
    validUntil?: string;
}

export interface ISwitchAttributes extends ISwitchOptions {
    id: string;
    nodeID: string
    code: string;
    description: string;
    state: string;
    mode: string;
    validFrom: string;
    validUntil: string;
}

export class Switch extends DomainApi.DomainObject implements ISwitchAttributes {

    constructor() {
        super();
    }

    public id: string;
    public nodeID: string
    public code: string;
    public description: string;
    public state: string;
    public mode: string;
    public validFrom: string;
    public validUntil: string;
}

export class SwitchRepresentation extends HalApi.ResourceRepresentation implements ISwitchAttributes {

    constructor() {
        super();
    }

    public static SELF_LINK_TEMPLATE:string = '/{0}/switches/{1}';

    public id:string;
    public nodeID:string
    public code:string;
    public description:string;
    public state:string;
    public mode:string;
    public validFrom:string;
    public validUntil:string;

    public static CreateRepresentation(request:express.Request, tenantCode:string, _switch:Switch):SwitchRepresentation {
        var switchRepresentation:SwitchRepresentation =
            SwitchRepresentation.FromDomainObject(request, _switch)
                .addLink('self', new HalApi.Link(request, '/' + tenantCode + '/switches/' + _switch.id))
                .addLink('$mode.alwaysOff', HalApi.Link.CreateWithMethod(request, '/' + tenantCode + '/switches/' + _switch.id + '/mode/off', HalApi.HttpVerb.POST))
                .addLink('$mode.alwaysOn', HalApi.Link.CreateWithMethod(request, '/' + tenantCode + '/switches/' + _switch.id + '/mode/on', HalApi.HttpVerb.POST))
                .addLink('$mode.scheduled', HalApi.Link.CreateWithMethod(request, '/' + tenantCode + '/switches/' + _switch.id + '/mode/scheduled', HalApi.HttpVerb.POST))
                .cast<SwitchRepresentation>();

        return switchRepresentation;
    }

    public static FromDomainObject(request:express.Request, domainObject:Switch):SwitchRepresentation {
        var representation:SwitchRepresentation = new SwitchRepresentation();

        representation.id = domainObject.id;
        representation.nodeID = domainObject.nodeID;
        representation.code = domainObject.code;
        representation.description = domainObject.description;
        representation.mode = domainObject.mode;
        representation.state = domainObject.state;
        representation.validFrom = domainObject.validFrom;
        representation.validUntil = domainObject.validUntil;

        return representation;
    }

    public buildSelfUrl(request:express.Request):string {

        var href:string = UtilsApi.StringFormat.Format(SwitchRepresentation.SELF_LINK_TEMPLATE, (<any>request).tenantCode, this.id);

        return href;
    }
}

export class SwitchFactory {

    public static create(data: ISwitchOptions): Switch {
        var _switch = new Switch();
        _switch.id = data.id;
        _switch.nodeID = data.nodeID;
        _switch.code = data.code;
        _switch.description = data.description;
        _switch.state = data.state;
        _switch.mode = data.mode;
        _switch.validFrom = data.validFrom;
        _switch.validUntil = data.validUntil;

        return _switch;
    }
}

export class SwitchRepository {

    constructor(session: ArangoDBApi.ISession){
        this.session = session;
    }

    private session: ArangoDBApi.ISession;

    public getByID(tenantID: string, switchID: string): Q.Promise<Switch> {
        var deferred: Q.Deferred<Switch> = Q.defer<Switch>();

        this.session.query(
            'FOR switch IN switches ' +
            'FILTER switch.id == @switchID ' +
            '    FOR node IN nodes '+
            '    FILTER node.id == switch.nodeID ' +
            '        FOR tenant IN tenants ' +
            '        FILTER tenant.ID == node.tenantid AND tenant.id == @tenantID ' +
            'RETURN switch',
            {tenantID: tenantID, switchID: switchID},
            (err, cursor): void => {

                var _switch: Switch = null;
                if (cursor && cursor._result) {
                    var data:any = (<any[]>cursor._result)[0];
                    _switch = SwitchFactory.create(data);
                }

                deferred.resolve(_switch);
            }
        );

        return deferred.promise;
    }

    public getByNodeID(tenantID: string, nodeID: string): Q.Promise<Array<Switch>> {
        var deferred: Q.Deferred<Array<Switch>> = Q.defer<Array<Switch>>();

        this.session.query(
            'FOR switch IN switches ' +
            '    FOR node IN nodes '+
            '    FILTER node.id == switch.nodeID AND node.id == @nodeID ' +
            '        FOR tenant IN tenants ' +
            '        FILTER tenant.ID == node.tenantid AND tenant.id == @tenantID ' +
            'RETURN switch',
            {tenantID: tenantID, nodeID: nodeID},
            (err, cursor): void => {

                var switches: Array<Switch> = [];

                if (cursor && cursor._result) {
                    for (var i:number = 0; i < cursor._result.length; i++) {
                        var data:any = (<any[]>cursor._result)[i];
                        var _switch = SwitchFactory.create(data);

                        switches.push(_switch);
                    }
                }

                deferred.resolve(switches);
            }
        );

        return deferred.promise;
    }

    public getList(tenantID: string): Q.Promise<Array<Switch>> {
        var deferred: Q.Deferred<Array<Switch>> = Q.defer<Array<Switch>>();

        this.session.query(
            'FOR switch IN switches ' +
            '    FOR node IN nodes '+
            '    FILTER node.id == switch.nodeID ' +
            '        FOR tenant IN tenants ' +
            '        FILTER tenant.ID == node.tenantid AND tenant.id == @tenantID ' +
            'RETURN switch',
            {tenantID: tenantID},
            (err, cursor): void => {

                var switches: Array<Switch> = [];

                if (cursor && cursor._result) {
                    for (var i:number = 0; i < cursor._result.length; i++) {
                        var data:any = (<any[]>cursor._result)[i];
                        var _switch = SwitchFactory.create(data);

                        switches.push(_switch);
                    }
                }

                deferred.resolve(switches);
            }
        );

        return deferred.promise;
    }

    
}