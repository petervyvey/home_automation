/// <reference path="../reference.d.ts" />

angular.module('application', ['application.component', 'ngRoute', 'ui.router']);
angular.module('application.component', []);

angular.module('application')
    .config([
        '$httpProvider', ($httpProvider: ng.IHttpProvider) => {
            // FIX: x-domain request fail. see: https://github.com/angular/angular.js/pull/1454.
            delete $httpProvider.defaults.headers.common["X-Requested-With"];
        }
    ])
    .config([
        '$restServiceProvider', ($restServiceFactoryProvider: HomeAutomation.Lib.Rest.RestServiceProvider) => {
            var configuration: HomeAutomation.Lib.Rest.RestServiceConfiguration = new HomeAutomation.Lib.Rest.RestServiceConfiguration();
            configuration.host.url = 'http://localhost:3000';
            configuration.api.path = '{:tenant}/api';

            $restServiceFactoryProvider.setServiceConfig(configuration);
        }
    ])
    .config([
        '$urlRouterProvider', '$locationProvider', ($urlRouterProvider, $locationProvider) => {
            $locationProvider.html5Mode(false).hashPrefix();
            $urlRouterProvider.otherwise('/');
        }
    ])
    .config([
        '$stateProvider', ($stateProvider: any) => {
            $stateProvider
                .state('index', {
                    url: '/',
                    templateUrl: 'app/view/dashboard/Index.html'
                });
        }
    ])
    .run(['$rootScope', '$restService',($rootScope: ng.IRootScopeService, $restService: HomeAutomation.Lib.Rest.RestService) => {
        $restService.configuration.interceptors.api = (configuration: HomeAutomation.Lib.Rest.IApiConfiguration)=>{
            configuration.values = {tenant: 'petervyvey'};
        };
    }]);
