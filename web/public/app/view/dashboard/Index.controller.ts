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

            this.RestServiceFactory
                .host('http://localhost:3000/')
                .api({apiPathTemplate: 'api/{tenantCode}/', apiTemplateValues: {tenantCode: 'home'}})
                .resource({name: 'nodes'});
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);