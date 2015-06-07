/// <reference path='../../vendor/typings/references.d.ts' />

import express = require('express');
import Q = require('q');
import UtilsApi = require('../../lib/Utils/Utils');
import ArangoDBApi = require('../../lib/Data/ArangoDB');
import DomainApi = require('./Domain');
import HalApi = require('../../lib/Utils/Hal');

export interface ITenantOptions {
    id?: string;
    code?: string;
    description?: string;
}

export interface ITenantAttributes extends ITenantOptions {
    id: string;
    code: string;
    description: string;
}

export class Tenant extends DomainApi.DomainObject {

    constructor() {
        super();
    }

    public id: string;
    public code: string;
    public description: string;
}

export class TenantFactory {

    public static create(data: ITenantOptions): Tenant {
        var tenant: Tenant = null;

        if (data) {
            tenant = new Tenant();
            tenant.id = data.id;
            tenant.code = data.code;
            tenant.description = data.description;
        }

        return tenant;
    }
}

export class TenantRepresentation extends HalApi.ResourceRepresentation {

    constructor() {
        super();
    }

    public static SELF_LINK_TEMPLATE:string = '/{0}/tenants/{1}';

    public id: string;
    public code: string;
    public description: string;

    public static CreateRepresentation(request: express.Request, tenantCode: string, tenant: Tenant): TenantRepresentation {

        var representation: TenantRepresentation =
            TenantRepresentation.FromDomainObject(request, tenant)
                .addSelfLink(request)
                .cast<TenantRepresentation>();

        return representation;
    }

    public static FromDomainObject(request: express.Request, domainObject: Tenant): TenantRepresentation {
        var representation: TenantRepresentation = new TenantRepresentation();

        representation.id = domainObject.id;
        representation.code = domainObject.code;
        representation.description = domainObject.description;

        return representation;
    }

    public buildSelfUrl(request: express.Request): string {

        var href: string = UtilsApi.StringFormat.Format(TenantRepresentation.SELF_LINK_TEMPLATE, (<any>request).tenantCode, this.id);

        return href;
    }
}

export class TenantRepository {

    constructor(session: ArangoDBApi.ISession){
        this.session = session;
    }

    private session: ArangoDBApi.ISession;

    public getByID(id: string): Q.Promise<Tenant> {
        var deferred: Q.Deferred<Tenant> = Q.defer<Tenant>();

        this.session.query(
            'FOR tenant IN tenants FILTER tenant.id == @tenantID RETURN tenant',
            {tenantID: id},
            (err, cursor): void => {

                var tenant: Tenant = null;
                if (cursor && cursor._result) {
                    var data:any = (<any[]>cursor._result)[0];
                    tenant = TenantFactory.create(data);
                }

                deferred.resolve(tenant);
            }
        );

        return deferred.promise;
    }

    public getByCode(code: string): Q.Promise<Tenant> {
        var deferred: Q.Deferred<Tenant> = Q.defer<Tenant>();

        this.session.query(
            'FOR tenant IN tenants FILTER tenant.code == @tenantCode RETURN tenant',
            {tenantCode: code},
            (err, cursor): void => {

                var tenant: Tenant = null;
                if (cursor && cursor._result) {
                    var data:any = (<any[]>cursor._result)[0];
                    tenant = TenantFactory.create(data);
                }

                deferred.resolve(tenant);
            }
        );

        return deferred.promise;
    }
}
