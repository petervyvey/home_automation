
import Q = require('q');
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
        var tenant = new Tenant();
        tenant.id = data.id;
        tenant.code = data.code;
        tenant.description = data.description;

        return tenant;
    }
}

export class TenantRepresentation extends HalApi.Representation {

    constructor() {
        super();
    }

    public id: string;
    public code: string;
    public description: string;

    public static FromDomainObject(domainObject: Tenant): TenantRepresentation {
        var representation: TenantRepresentation = new TenantRepresentation();

        representation.id = domainObject.id;
        representation.code = domainObject.code;
        representation.description = domainObject.description;

        return representation;
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
