/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
    }

    export class IndexController {

        static $inject = ['$scope', '$restServiceFactory'];

        constructor($scope: any, $restServiceFactory: HomeAutomation.Lib.Rest.RestServiceFactory){
            this.$localScope = this.$scope = $scope;
            this.$restServiceFactory = $restServiceFactory;

            this.initialize();
        }

        private $scope: any;
        private $localScope : IIndexScope;

        private $restServiceFactory: HomeAutomation.Lib.Rest.RestServiceFactory;

        private initialize(): void {
            console.log('RestServiceFactory', this.$restServiceFactory);

            var service: any =
                this.$restServiceFactory
                    //.host('http://localhost:3000/')
                    //.path('home/api/')
                    .resource(HomeAutomation.Lib.Model.Node.RESOURCE)
                    .all<HomeAutomation.Lib.Model.INodeCollection>()
                    .then((data: HomeAutomation.Lib.Model.INodeCollection) => {
                        console.log('data', data);

                        var nodeID = data._embedded.nodes[0].id;
                        console.log('nodeID', nodeID);
                    });
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);