/// <reference path="../../../vendor/typings/_reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
        message: string;
    }

    export class IndexController {

        static $inject = ['$scope'];

        constructor($scope: any){
            this.$localScope = this.$scope = $scope;
            this.$localScope.message = "test";
        }

        private $scope: any;
        private $localScope : IIndexScope;
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);