/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Model {

    export interface IRepresentation {
        _link: any;
        _embedded: Array<any>;
    }

    export interface ICollectionRepresentation<TEmbeddedRepresentationCollection> extends IRepresentation {
        _embedded: TEmbeddedRepresentationCollection;
    }

}