
import Q = require('q');
import ArangoDBModule = require('../../lib/Data/ArangoDB');
import DomainApi = require('./Domain');
import SwitchApi = require('./Switch');
import HalApi = require('../../lib/Utils/Hal');

export interface INodeOptions {
    id: string;
    tenantID?: string
    code?: string;
    description?: string;
    validFrom?: string;
    validUntil?: string;
}

export interface INodeAttributes extends INodeOptions {
    id: string;
    tenantID: string
    code: string;
    description: string;
    validFrom: string;
    validUntil: string;
}
export class Node extends DomainApi.DomainObject implements INodeAttributes {

    constructor() {
        super();
    }

    public id: string;
    public tenantID: string
    public code: string;
    public description: string;
    public validFrom: string;
    public validUntil: string;

    public switches: Array<SwitchApi.Switch> = [];
}


export class NodeRepresentation extends HalApi.Representation implements INodeAttributes {

    constructor() {
        super();
    }

    public id: string;
    public tenantID: string
    public code: string;
    public description: string;
    public validFrom: string;
    public validUntil: string;
}

export class NodeFactory {

    public static create(data: INodeOptions): Node {
        var node = new Node();
        node.id = data.id;
        node.tenantID = data.tenantID;
        node.code = data.code;
        node.description = data.description;
        node.validFrom = data.validFrom;
        node.validUntil = data.validUntil;

        return node;
    }
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
                if (cursor && cursor._result) {
                    var data:any = (<any[]>cursor._result)[0];
                    node = NodeFactory.create(data);
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

                if (cursor && cursor._result) {
                    for (var i:number = 0; i < cursor._result.length; i++) {
                        var data:any = (<any[]>cursor._result)[i];
                        var node = NodeFactory.create(data);

                        nodes.push(node);
                    }
                }

                deferred.resolve(nodes);
            }
        );

        return deferred.promise;
    }
}


