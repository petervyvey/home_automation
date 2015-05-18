
import Q = require('q');
import ArangoDBModule = require('../../lib/Data/ArangoDB');

export class Tenant {

    constructor() {}

    public id: string;
    public code: string;
    public description: string;
}

export class TenantRepository {

    constructor(session: ArangoDBModule.ISession){
        this.session = session;
    }

    private session: ArangoDBModule.ISession;

    public getByID(id: string): Q.Promise<Tenant> {
        var deferred: Q.Deferred<Tenant> = Q.defer<Tenant>();

        this.session.query(
            'FOR tenant IN tenants FILTER tenant.id == @tenantID RETURN tenant',
            {tenantID: id},
            (err, cursor): void => {

                var tenant: Tenant = null;
                if (cursor) {
                    var data:any = (<any[]>cursor._result)[0];

                    tenant = new Tenant();
                    tenant.id = data.id;
                    tenant.code = data.code;
                    tenant.description = data.description;
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
                if (cursor) {
                    var data:any = (<any[]>cursor._result)[0];

                    tenant = new Tenant();
                    tenant.id = data.id;
                    tenant.code = data.code;
                    tenant.description = data.description;
                }

                deferred.resolve(tenant);
            }
        );

        return deferred.promise;
    }
}
