/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    export interface IRuleCollection {
        [index: string]: (subject: any) => boolean;
    }

    export interface DefaultConstructor<T> {
        new (): T;
    }

    export interface IEvaluationValue<TPresentationRules> {
        value: boolean;
        instance: RuleSet<TPresentationRules>
    }

    export class RuleSet<TPresentationRules> {
        constructor(ctor: DefaultConstructor<TPresentationRules>) {
            this.container = new ctor();
        }

        public container: TPresentationRules;

        public evaluate(): IEvaluationValue<TPresentationRules> {
            return { value: true, instance: this };
        }
    }

    export class IndexRuleSet extends RuleSet<PresentationRules> {
        constructor() {
            super(PresentationRules);
        }
    }

    export class PresentationRules {

        public showSwitchAlwaysOnIcon(_switch:Resource.ISwitch):boolean {
            return _switch.mode.toLocaleLowerCase() === 'alwayson' || (_switch.mode.toLocaleLowerCase() === 'scheduled' && _switch.state.toLocaleLowerCase() === 'on');
        }

        public showSwitchAlwaysOffIcon(_switch:Resource.ISwitch):boolean {
            return _switch.mode.toLocaleLowerCase() === 'alwaysoff' || (_switch.mode.toLocaleLowerCase() === 'scheduled' && _switch.state.toLocaleLowerCase() === 'off');
        }

        public isScheduled(_switch:Resource.ISwitch):boolean {
            return _switch.mode.toLocaleLowerCase() === 'scheduled';
        }
    }

    interface IIndexScope extends ng.IRootScopeService, IRuleCollection {
        rules: IndexRuleSet;
        representation: Resource.INodeCollection;
        onSwitchClicked: (link:HomeAutomation.Lib.Model.ILink) => void;
    }

    export class IndexController {

        static $inject = ['$scope', '$restService'];

        constructor($scope:any, $restService:HomeAutomation.Lib.Rest.RestService) {
            this.$localScope = this.$scope = $scope;
            this.$restService = $restService;

            this.initialize();
        }

        private $scope:any;
        private $localScope:IIndexScope;

        private $restService:HomeAutomation.Lib.Rest.RestService;

        private initialize():void {
            this.$localScope.rules = new IndexRuleSet();

            this.$localScope.onSwitchClicked = (link:HomeAutomation.Lib.Model.ILink) => {
                console.log(link);
                this.$restService
                    .endpoint(link.href)
                    .put()
                    .then((data:any) => {
                        console.log('data', data);
                    });
            };

            this.$restService
                .all(Resource.Node.NAME)
                .query({active: false, page: 1, pageSize: 20})
                .get()
                .then((data:Resource.INodeCollection) => {
                    this.$localScope.representation = data;
                });
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);