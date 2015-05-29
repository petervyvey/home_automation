/// <reference path="../../reference.d.ts" />

module Resource {

    export class Switch {
        public static NAME: string = 'switches';
    }

    export interface ISwitch extends HomeAutomation.Lib.Model.IRepresentation {
        id: string;
        nodeID: string;
        code: string;
        description: string;
    }

    export interface ISwitchCollection extends HomeAutomation.Lib.Model.ICollectionRepresentation<IEmbeddedSwitchCollection>  {
    }

    export interface IEmbeddedSwitchCollection {
        nodes: Array<INode>
    }
}