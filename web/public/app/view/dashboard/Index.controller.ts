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

        static $inject = ['$scope', '$q', '$restService', '$pollingService'];

        constructor($scope:any, $q: ng.IQService, $restService:HomeAutomation.Lib.Rest.RestService, $pollingService: HomeAutomation.Lib.Foundation.PollingService) {
            this.$localScope = this.$scope = $scope;

            this.$q = $q;
            this.$restService = $restService;
            this.$pollingService = $pollingService;

            this.initialize();
        }

        private $scope:any;
        private $localScope:IIndexScope;

        private $q: ng.IQService;
        private $restService: HomeAutomation.Lib.Rest.RestService;
        private $pollingService: HomeAutomation.Lib.Foundation.PollingService;

        private initialize():void {
            console.log(this.$pollingService);

            this.$pollingService.start((): ng.IPromise<any> => {
                var deferred: ng.IDeferred<any> = this.$q.defer<any>();

                this.$restService
                    .all(Resource.Node.NAME)
                    .query({active: false, page: 1, pageSize: 20})
                    .get()
                    .then((data:Resource.INodeCollection) => {
                        this.$localScope.representation = data;
                        deferred.resolve();
                        deferred = null;
                    });

                return deferred.promise;
            });

            this.$localScope.$on('$destroy',(event: ng.IAngularEvent) => {
                this.$pollingService.stop();
            });

            this.$localScope.rules = new IndexRuleSet();

            this.$localScope.onSwitchClicked = (link:HomeAutomation.Lib.Model.ILink) => {
                this.$restService
                    .endpoint(link.href)
                    .put()
                    .finally((): any => {
                        this.$pollingService.once();
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