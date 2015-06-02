/// <reference path="../../reference.d.ts" />

module HomeAutomation.Dashboard {

    interface IIndexScope extends ng.IRootScopeService {
        presentationRule: PresentationRule;
        representation: Resource.INodeCollection;
        onSwitchClicked: (link: HomeAutomation.Lib.Model.ILink) => void;
    }

    export class PresentationRule {
        showSwitchAlwaysOnIcon(_switch: Resource.ISwitch): boolean {
            return _switch.mode.toLocaleLowerCase() === 'alwayson' || (_switch.mode.toLocaleLowerCase() === 'scheduled' && _switch.state.toLocaleLowerCase() === 'on');
        }

        showSwitchAlwaysOffIcon(_switch: Resource.ISwitch): boolean {
            return _switch.mode.toLocaleLowerCase() === 'alwaysoff' || (_switch.mode.toLocaleLowerCase() === 'scheduled' && _switch.state.toLocaleLowerCase() === 'off');
        }

        isScheduled(_switch: Resource.ISwitch): boolean {
            return _switch.mode.toLocaleLowerCase() === 'scheduled';
        }
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

            this.$localScope.presentationRule = new PresentationRule();

            this.$localScope.onSwitchClicked = (link:HomeAutomation.Lib.Model.ILink) => {
                console.log(link);
            };

            this.$restService
                .host('http://localhost:3000/')
                .api('petervyvey/api/')
                .one({name: Resource.Node.NAME, id: '50af70d9-9ad1-4c53-8391-83c006b3668b'})
                .query({active: false, page: 1, pageSize: 20})
                .get()
                .then((data:Resource.INodeCollection) => {
                    console.log(data);
                });

            this.$restService
                .host('http://localhost:3000/')
                .api('petervyvey/api/')
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