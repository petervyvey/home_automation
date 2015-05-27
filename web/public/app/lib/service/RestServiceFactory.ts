/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    export class RestServiceProvider implements ng.IServiceProvider {
        $get = ['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => {
            return new RestService($http, $q, this.configuration);
        }];

        private configuration: RestServiceFactoryConfiguration;

        setServiceConfig(configuration: RestServiceFactoryConfiguration): void {
            this.configuration = configuration;
        }
    }

    export class RestService implements IRestServiceConfigurationApi {

        constructor($http:ng.IHttpService, $q:ng.IQService, configuration: RestServiceFactoryConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration != null ? configuration : new RestServiceFactoryConfiguration();
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public configuration: RestServiceFactoryConfiguration;

        public host(options: string|IHostOptions): RestService {
            var _options: IHostOptions = typeof options === 'string' ? {hostUrl: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestService = new RestService(this.$http, this.$q, configuration);

            return service;
        }

        public path(options: string|IApiOptions): RestService {
            var _options: IApiOptions = typeof options === 'string' ? {pathTemplate: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestService = new RestService(this.$http, this.$q, configuration);

            return service;
        }

        public resource(options: string|IResourceOptions): RestService {
            var _options: IResourceOptions = typeof options === 'string' ? {resourceName: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestService = new RestService(this.$http, this.$q, configuration);

            return service;
        }
    }

    export class RestServiceFactoryConfiguration {
        public hostUrl: string = 'http://localhost/';
        public pathTemplate: string = 'api';
        public pathTemplateValues: any = null;
    }

    export interface IHostOptions {
        hostUrl?: string;
    }

    export interface IHostConfiguration extends IHostOptions{
        hostUrl: string;
    }

    export interface IApiOptions {
        pathTemplate: string;
        pathTemplateValues?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        pathTemplate: string;
        pathTemplateValues: any
    }

    export interface IResourceOptions {
        resourceName: string;
    }

    export interface IResourceConfiguration extends IResourceOptions {
        resourceName: string;
    }

    export interface IRestServiceConfigurationApi {
        host(options: string|IHostOptions): RestService;
        path(options: string|IApiOptions): RestService;
        resource(options: string|IResourceOptions): RestService
    }

    export class RestServiceConfiguration implements IHostConfiguration, IApiConfiguration, IResourceConfiguration {
        public hostUrl: string = 'http://localhost/';
        public pathTemplate: string = 'api';
        public pathTemplateValues: any = null;
        public resourceName: string = '';
    }

    export interface IRestServiceApi {
        all<TRepresentation>(): ng.IPromise<TRepresentation>;
    }

    export class RestService2 implements IRestServiceApi, IRestServiceConfigurationApi {

        constructor($http:ng.IHttpService, $q:ng.IQService, configuration: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration;
        }

        public static DELIMITER: string = '/';

        private $q: ng.IQService;
        private $http: ng.IHttpService;

        public configuration: RestServiceConfiguration;

        public host(options: string|IHostOptions): RestService {
            var _options: IHostOptions =  typeof options === 'string' ? { hostUrl: options }: options;

            this.configuration.hostUrl = _options.hostUrl;

            return this;
        }

        public path(options: string|IApiOptions): RestService {
            var _options: IApiOptions =  typeof options === 'string' ? { pathTemplate: options }: options;

            this.configuration.pathTemplate = _options.pathTemplate;
            this.configuration.pathTemplateValues = _options.pathTemplateValues;

            return this;
        }

        public resource(options: string|IResourceOptions): RestService {
            var _options: IResourceOptions = typeof options === 'string' ? { resourceName: options.toString() }: options;

            this.configuration.resourceName = _options.resourceName;

            return this;
        }

        public all<TRepresentation>(): ng.IPromise<TRepresentation> {
            var deferred: ng.IDeferred<TRepresentation> = this.$q.defer();

            var config: ng.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            this.$http.get(this.buildEndpoint(), config)
                .success((data: TRepresentation) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        private buildEndpoint(): string {
            if (this.configuration.hostUrl[this.configuration.hostUrl.length-1] === '/') {
                this.configuration.hostUrl = this.configuration.hostUrl.substr(0, this.configuration.hostUrl.length - 1);
            }

            if (this.configuration.pathTemplate[0] === '/') {
                this.configuration.pathTemplate = this.configuration.pathTemplate.substr(1);
            }

            if (this.configuration.pathTemplate[this.configuration.pathTemplate.length-1] === '/') {
                this.configuration.pathTemplate = this.configuration.pathTemplate.substr(0, this.configuration.pathTemplate.length - 1);
            }

            var endpoint: string = this.configuration.hostUrl + RestService.DELIMITER + this.configuration.pathTemplate + RestService.DELIMITER + this.configuration.resourceName;

            return endpoint;
        }
    }

}

angular.module('application.component').provider('$restService', HomeAutomation.Lib.Rest.RestServiceFactoryProvider);
