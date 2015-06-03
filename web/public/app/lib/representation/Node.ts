/// <reference path="../../reference.d.ts" />

module Resource {

    export class Node {
        public static NAME: string = 'nodes';

        public id: string;
    }

    export interface INode extends HomeAutomation.Lib.Model.IRepresentation {
        id: string;
        tenantID: string;
        code: string;
        description: string;

        _embedded: INodeEmbeddedRepresentations;
    }

    export interface INodeEmbeddedRepresentations {
        switches : Array<Resource.ISwitch>
    }

    export interface INodeCollection extends HomeAutomation.Lib.Model.ICollectionRepresentation<IEmbeddedNodeCollection>  {
    }

    export interface IEmbeddedNodeCollection {
        nodes: Array<INode>
    }
}

module Resource.Portal.V1 {
    export class Node {

    }
}