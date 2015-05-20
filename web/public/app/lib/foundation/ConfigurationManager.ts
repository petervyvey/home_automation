/// <reference path="../../../vendor/typings/_reference.d.ts" />

module HomeAutomation.Lib.Foundation {

    export class RuntimeConfiguration {
        public serverURL: string;
        public applicationName: string;
        public groepCode: string;        
    }

    export class ApplicationContext {
        public id: string;
    }

    export class ApplicationSettings {

        constructor() {
            this.initializeObject();
        }

        public runtimeConfiguration: RuntimeConfiguration;
        public applicationContext: ApplicationContext;

        private initializeObject(): void {
            this.runtimeConfiguration = new RuntimeConfiguration();
            this.applicationContext = new ApplicationContext();
        }

    }

    export class ConfigurationManager {

        static $inject = ['$rootScope', '$stateParams'];

        constructor($rootScope: ng.IRootScopeService, $stateParams: ng.ui.IStateParamsService) {
            this.$rootScope = $rootScope;
            this.$stateParams = $stateParams;

            this.initializeObject();
        }

        public static CONTEXT: string = 'SlidingApps.Collaboration.Context';

        private $rootScope: ng.IRootScopeService;
        private $stateParams: ng.ui.IStateParamsService;

        public settings: ApplicationSettings;

        private initializeObject(): void {
            this.settings = new ApplicationSettings();

            var context: string;
            context = sessionStorage.getItem(ConfigurationManager.CONTEXT);
            if (!context) {
                context = localStorage.getItem(ConfigurationManager.CONTEXT);
            }

            this.settings.applicationContext.id = context;

            this.$rootScope.$watch(() => { return this.$stateParams; }, (current, previous) => {
                if (previous && previous['context']) {
                    if (current['context'] && current['context'] != previous['context'] && current['context'] == this.settings.applicationContext.id) {
                        setTimeout(() => {
                            alert('Application context werd gewijzigd.');
                        }, 300);
                    }
                }
            }, true);
        }

    }

    export class ConfigurationScriptDirectiveController {
        static $inject = ['$scope', '$configurationManager'];

        constructor($scope: any, $configurationManager: ConfigurationManager) {
            this.$scope = $scope;
            this.$configurationManager = $configurationManager;
        }

        private $scope: any;
        public $configurationManager: ConfigurationManager;
    }

    export class ConfigurationScriptDirective implements ng.IDirective {

        constructor($configurationManager: ConfigurationManager) {
            this.scope = {};
            this.restrict = 'E';

            this.controller = ConfigurationScriptDirectiveController;
        }

        public scope: any;
        public restrict: string;
        public controller: any;

        public link($scope: any, $element: any, $attrs: any, $controller: ConfigurationScriptDirectiveController): void {
            if ($attrs.type != 'json/configuration') return;

            var configuration: any = JSON.parse($element.text());

            if ($attrs.hasOwnProperty('name') && $attrs['name'] === 'runtime') {
                $controller.$configurationManager.settings.runtimeConfiguration = configuration;
            }
        }
    }

}

angular.module('application.component').service('$configurationManager', HomeAutomation.Lib.Foundation.ConfigurationManager);
angular.module('application.component').directive('script', ['$configurationManager', ($configurationManager: HomeAutomation.Lib.Foundation.ConfigurationManager) => new HomeAutomation.Lib.Foundation.ConfigurationScriptDirective($configurationManager)]);