
import Q = require('q');
import ArangoDBApi = require('../../lib/Data/ArangoDB');
import HalApi = require('../../lib/Utils/Hal');

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

export class Switch extends HalApi.Representation implements ISwitchAttributes {

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