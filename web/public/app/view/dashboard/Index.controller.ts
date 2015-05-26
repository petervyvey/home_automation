/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
    }

    export class IndexController {

        static $inject = ['$scope', '$restService'];

        constructor($scope: any, $restService: HomeAutomation.Lib.Service.RestService){
            this.$localScope = this.$scope = $scope;

            this.$restService = $restService;

            this.initialize();
        }

        private $scope: any;
        private $localScope : IIndexScope;

        private $restService: HomeAutomation.Lib.Service.RestService;

        private initialize(): void {
            this.$restService.getNodes().then((nodes: HomeAutomation.Lib.Service.Representation) => {

            });
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);