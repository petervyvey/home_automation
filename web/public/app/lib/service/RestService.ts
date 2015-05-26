/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    export class Resource {

        public all(resourceName: string): any {

        }
    }

    export interface IRestServiceOptions {
        host?: string;
    }

    export interface IRestServiceConfiguration extends IRestServiceOptions{
        host: string;
    }

    export interface IApiOptions {
        url: string;
        templateValues?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        url: string;
        templateValues: any
    }

    export class RestServiceConfiguration implements IRestServiceConfiguration {
        public host: string;
    }

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

        constructor($http: ng.IHttpService, $q: ng.IQService, configuration: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;
            this.configuration = configuration;
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public configuration: RestServiceConfiguration;

        public service(options?: IRestServiceOptions): Resource {
            return new Resource();
        }

        public api(options?: IApiOptions): Resource {
            return null;
        }

        public request(){
            return new Resource();
        }
    }

}

angular.module('application.component').provider('$restService', HomeAutomation.Lib.Rest.RestServiceFactoryProvider);
