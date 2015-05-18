
import Q = require('q');
import ArangoDBModule = require('../../lib/Data/ArangoDB');

export class Node {

    constructor() {}

    public id: string;
    public tenantID: string
    public code: string;
    public description: string;
    public validFrom: string;
    public validUntil: string;
}

export class NodeRepository {

    constructor(session:ArangoDBModule.ISession) {
        this.session = session;
    }

    private session:ArangoDBModule.ISession;

    public getByID(tenantID:string, nodeID:string):Q.Promise<Node> {
        var deferred:Q.Deferred<Node> = Q.defer<Node>();

        this.session.query(
            'FOR node IN nodes ' +
            'FILTER node.id == @nodeID ' +
            '    FOR tenant IN tenants ' +
            '    FILTER tenant.id == node.tenantID AND tenant.id == @tenantID ' +
            'RETURN node',
            {tenantID: tenantID, nodeID: nodeID},
            (err, cursor):void => {

                var node: Node = null;
                if (cursor) {
                    var data:any = (<any[]>cursor._result)[0];

                    node = new Node();
                    node.id = data.id;
                    node.tenantID = data.tenantID;
                    node.code = data.code;
                    node.description = data.description;
                    node.validFrom = data.validFrom;
                    node.validUntil = data.validUntil;
                }

                deferred.resolve(node);
            }
        );

        return deferred.promise;
    }

    public getList(tenantID:string):Q.Promise<Array<Node>> {
        var deferred:Q.Deferred<Array<Node>> = Q.defer<Array<Node>>();

        this.session.query(
            'FOR node IN nodes ' +
            '    FOR tenant IN tenants ' +
            '    FILTER tenant.id == node.tenantID AND tenant.id == @tenantID ' +
            'RETURN node',
            {tenantID: tenantID},
            (err, cursor):void => {

                var nodes: Array<Node> = [];

                if (cursor) {
                    for (var i:number = 0; i < cursor._result.length; i++) {
                        var data:any = (<any[]>cursor._result)[i];

                        var node = new Node();
                        node.id = data.id;
                        node.tenantID = data.tenantID;
                        node.code = data.code;
                        node.description = data.description;
                        node.validFrom = data.validFrom;
                        node.validUntil = data.validUntil;

                        nodes.push(node);
                    }
                }

                deferred.resolve(nodes);
            }
        );

        return deferred.promise;
    }
}


