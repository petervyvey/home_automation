/// <reference path="../../vendor/typings/references.d.ts" />

import arangojs = require('arangojs');

export interface ISession {
    store: any;
    query(...args: any[]): void;
}

export class ArangoSession implements ISession {

    constructor(url: string, databaseName: string) {
        this.url = url;
        this.databaseName = databaseName;

        this.initializeInstance();
    }

    public store: any = null;

    private url: string = null;
    private databaseName: string = null;

    public query(...args: any[]): void{
        this.store.query(args[0], args[1], args[2]);
    }

    private initializeInstance(): void {
        var _arangojs: any = arangojs;

        this.store =
            new _arangojs(
                {
                    url: this.url,
                    databaseName: this.databaseName,
                    absolutePath: '_db/' + this.databaseName + '/'
                });
    }

}