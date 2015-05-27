/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    export class RestServiceFactoryProvider implements ng.IServiceProvider {
        $get = ['$http', '$q', ($http: ng.IHttpService, $q: ng.IQService) => {
            return new RestServiceFactory($http, $q, this.configuration);
        }];

        private configuration: RestServiceConfiguration;

        setServiceConfig(configuration: RestServiceConfiguration): void {
            this.configuration = configuration;
        }
    }

    export class RestServiceFactory {

        constructor($http: ng.IHttpService, $q: ng.IQService, configuration?: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;
            this.configuration = configuration != null ? configuration : new RestServiceConfiguration();
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public configuration: RestServiceConfiguration;

        public host(options: string|IHostOptions): IRestServiceConfiguration {
            var _options: IHostOptions =  typeof options === 'string' ? { hostUrl: options }: options;
            var configuration: IRestServiceConfiguration = angular.extend(this.configuration, _options);

            return configuration;
        }

        public api(options: string|IApiOptions): IRestServiceConfiguration {
            var configuration: IRestServiceConfiguration = angular.extend(this.configuration, options != null ? options : {});

            return configuration;
        }

        public resource(options: string|IResourceOptions): IRestServiceConfiguration {
            var configuration: IRestServiceConfiguration = angular.extend(this.configuration, options != null ? options : {});

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
        apiPathTemplate: string;
        apiTemplateValues?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        apiPathTemplate: string;
        apiTemplateValues: any
    }

    export interface IResourceOptions {
        name: string;
    }

    export interface IResourceConfiguration extends IResourceOptions {
        name: string;
    }

    export interface IRestServiceConfiguration extends IHostConfiguration, IApiConfiguration {
        host(options: string|IHostOptions);
        api(options: string|IApiOptions): IRestServiceConfiguration;
        resource(options: string|IResourceOptions): IRestServiceConfiguration
    }

    export class RestServiceConfiguration implements IRestServiceConfiguration {
        public hostUrl: string;
        public apiPathTemplate: string;
        public apiTemplateValues: any;

        public host(options: string|IHostOptions): IRestServiceConfiguration {
            var configuration: IRestServiceConfiguration = angular.extend(this, options != null ? options : {});

            return this;
        }

        public api(options: IApiOptions): IRestServiceConfiguration {
            var configuration: IRestServiceConfiguration = angular.extend(this, options != null ? options : {});

            return this;
        }

        public resource(options: string|IResourceOptions): IRestServiceConfiguration {
            var configuration: IRestServiceConfiguration = angular.extend(this, options != null ? options : {});

            return this;
        }
    }

}

angular.module('application.component').provider('$restServiceFactory', HomeAutomation.Lib.Rest.RestServiceFactoryProvider);
