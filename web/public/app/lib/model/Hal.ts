/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Model {

    export interface IRepresentation {
        _links: ILinkSet;
        _embedded: any;
    }

    export interface ICollectionRepresentation<TEmbeddedCollection> extends IRepresentation {
        _embedded: TEmbeddedCollection;
    }

    export interface ILinkSet {
        self: ILink;
    }

    export interface ILink {
        href: string;
        method: string;
        templated: boolean;
    }
}