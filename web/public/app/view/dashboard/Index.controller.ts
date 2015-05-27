/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
    }

    export class IndexController {

        static $inject = ['$scope', '$restServiceFactory'];

        constructor($scope: any, RestServiceFactory: HomeAutomation.Lib.Rest.RestServiceFactory){
            this.$localScope = this.$scope = $scope;
            this.RestServiceFactory = RestServiceFactory;

            this.initialize();
        }

        private $scope: any;
        private $localScope : IIndexScope;

        private RestServiceFactory: HomeAutomation.Lib.Rest.RestServiceFactory;

        private initialize(): void {
            console.log('RestServiceFactory', this.RestServiceFactory);

            var service: HomeAutomation.Lib.Rest.RestService =
                this.RestServiceFactory
                    .host('http://localhost:3000/')
                    .path('api/portal')
                    .resource(HomeAutomation.Lib.Model.Node.RESOURCE);
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);