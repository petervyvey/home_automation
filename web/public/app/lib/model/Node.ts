/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Model {

    export class Node {
        public static RESOURCE: string = 'nodes';
    }

    export interface INode extends HomeAutomation.Lib.Model.IRepresentation {
        id: string;
        tenantID: string;
        code: string;
        description: string;
    }

    export interface INodeCollection extends HomeAutomation.Lib.Model.ICollectionRepresentation<IEmbeddedNodeCollection>  {
    }

    export interface IEmbeddedNodeCollection {
        nodes: Array<INode>
    }
}