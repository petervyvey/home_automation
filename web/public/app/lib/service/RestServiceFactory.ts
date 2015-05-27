/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    export class RestServiceFactoryProvider implements ng.IServiceProvider {
        $get = ['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => {
            return new RestServiceFactory($http, $q, this.baseRestService);
        }];

        private baseRestService: RestService;

        setServiceConfig(configuration: RestService): void {
            this.baseRestService = configuration;
        }
    }

    export class RestServiceFactory implements IRestServiceApi{

        constructor($http:ng.IHttpService, $q:ng.IQService, baseRestService?: RestService) {
            this.$http = $http;
            this.$q = $q;
            this.baseRestService = baseRestService != null ? baseRestService : new RestService();
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public baseRestService: RestService;

        public host(options: string|IHostOptions): IRestService {
            var _options: IHostOptions = typeof options === 'string' ? {hostUrl: options} : options;
            var configuration: IRestService = angular.extend(new RestService(), this.baseRestService, _options);

            return configuration;
        }

        public path(options: string|IApiOptions): IRestService {
            var _options: IApiOptions = typeof options === 'string' ? {pathTemplate: options} : options;
            var configuration:IRestService = angular.extend(new RestService(), this.baseRestService, _options);

            return configuration;
        }

        public resource(options: string|IResourceOptions): IRestService {
            var _options: IResourceOptions = typeof options === 'string' ? {resourceName: options} : options;
            var configuration: IRestService = angular.extend(new RestService(), this.baseRestService, _options);

            return configuration;
        }
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

    export interface IRestServiceApi {
        host(options: string|IHostOptions);
        path(options: string|IApiOptions): IRestService;
        resource(options: string|IResourceOptions): IRestService
    }

    export interface IRestService extends IRestServiceApi, IHostConfiguration, IApiConfiguration, IResourceConfiguration {

    }

    export class RestService implements IRestService {
        public hostUrl: string;
        public pathTemplate: string;
        public pathTemplateValues: any;
        public resourceName: string;

        public host(options: string|IHostOptions): IRestService {
            var _options: IHostOptions =  typeof options === 'string' ? { hostUrl: options }: options;

            this.hostUrl = _options.hostUrl

            return this;
        }

        public path(options: string|IApiOptions): IRestService {
            var _options: IApiOptions =  typeof options === 'string' ? { pathTemplate: options }: options;

            this.pathTemplate = _options.pathTemplate;
            this.pathTemplateValues = _options.pathTemplateValues;

            return this;
        }

        public resource(options: string|IResourceOptions): IRestService {
            var _options: IResourceOptions = typeof options === 'string' ? { resourceName: options.toString() }: options;

            this.resourceName = _options.resourceName;

            return this;
        }
    }

}

angular.module('application.component').provider('$restServiceFactory', HomeAutomation.Lib.Rest.RestServiceFactoryProvider);
