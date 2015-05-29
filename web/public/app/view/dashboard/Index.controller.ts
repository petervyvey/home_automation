/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
        nodes: Resource.INodeCollection;
        onSwitchClicked: (link: HomeAutomation.Lib.Model.ILink) => void;
    }

    export class IndexController {

        static $inject = ['$scope', '$restService'];

        constructor($scope: any, $restService: HomeAutomation.Lib.Rest.RestService){
            this.$localScope = this.$scope = $scope;
            this.$restService = $restService;

            this.initialize();
        }

        private $scope: any;
        private $localScope : IIndexScope;

        private $restService: HomeAutomation.Lib.Rest.RestService;

        private initialize(): void {

            this.$localScope.onSwitchClicked = (link: HomeAutomation.Lib.Model.ILink) => {
                console.log(link);
            };

            var service: any =
                this.$restService
                    //.host('http://localhost:3000/')
                    //.path('home/api/')
                    .resource(Resource.Node.NAME)
                    .all<Resource.INodeCollection>()
                    .then((data: Resource.INodeCollection) => {
                        this.$localScope.nodes = data;

                        //var collection: Resource.INodeCollection = data;
                        //var switchID: string = collection._embedded.nodes[0]._embedded.switches[0].id;
                    });
        }
    }

}

angular.module('application.component').controller('HomeAutomation.Dashboard.IndexController', HomeAutomation.Dashboard.IndexController);