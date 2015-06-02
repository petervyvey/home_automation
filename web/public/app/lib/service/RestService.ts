/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    var DELIMITER: string = '/';

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

        public host(options: string|IHostOptions): RestServiceConnector {
            var _options: IHostOptions = typeof options === 'string' ? {hostUrl: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return service;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions = typeof options === 'string' ? {apiPath: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return service;
        }

        public resource(options: string|IResourceOptions): RestServiceConnector {
            var _options: IResourceOptions = typeof options === 'string' ? {resourceName: options} : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration, _options);
            var service: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return service;
        }
    }

    export class RestServiceFactoryConfiguration {
        public hostUrl: string = 'http://localhost/';
        public pathTemplate: string = 'api';
        public pathTemplateValues: any = null;
    }

    interface IKeyValuePair<TValue> {
        key: string;
        value: TValue;
    }

    export interface IHostOptions {
        hostUrl?: string;
    }

    export interface IHostConfiguration extends IHostOptions{
        hostUrl: string;
    }

    export interface IApiOptions {
        apiPath: string;
        apiPathValues?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        apiPath: string;
        apiPathValues: any
    }

    export interface IResourceOptions {
        resourceName: string;
    }

    export interface IResourceConfiguration extends IResourceOptions {
        resourceName: string;
    }

    export interface IRestServiceConfigurationApi {
        host(options: string|IHostOptions): RestServiceConnector;
        api(options: string|IApiOptions): RestServiceConnector;
        resource(options: string|IResourceOptions): RestServiceConnector
    }

    export class RestServiceConfiguration implements IHostConfiguration, IApiConfiguration, IResourceConfiguration {
        public hostUrl: string = 'http://localhost/';
        public apiPath: string = 'api';
        public apiPathValues: any = null;
        public resourceName: string = '';
    }

    export interface IRestServiceApi {
        all<TRepresentation>(query?: any): angular.IPromise<TRepresentation>;
        one<TRepresentation>(identifier: string, query?: any): angular.IPromise<TRepresentation>;
        several<TRepresentation>(identifiers: Array<string>, query?: any): angular.IPromise<TRepresentation>;
    }

    export class RestServiceConnector implements IRestServiceApi, IRestServiceConfigurationApi {

        constructor($http:ng.IHttpService, $q:ng.IQService, configuration: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration;
        }

        private $q: ng.IQService;
        private $http: ng.IHttpService;

        public configuration: RestServiceConfiguration;

        public host(options: string|IHostOptions): RestServiceConnector {
            var _options: IHostOptions =  typeof options === 'string' ? { hostUrl: options }: options;

            this.configuration.hostUrl = _options.hostUrl;

            return this;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions =  typeof options === 'string' ? { apiPath: options }: options;

            this.configuration.apiPath = _options.apiPath;
            this.configuration.apiPathValues = _options.apiPathValues;

            return this;
        }

        public resource(options: string|IResourceOptions): RestServiceConnector {
            var _options: IResourceOptions = typeof options === 'string' ? { resourceName: options.toString() }: options;

            this.configuration.resourceName = _options.resourceName;

            return this;
        }

        public all<TRepresentation>(query?: any): angular.IPromise<TRepresentation> {
            var endpoint: RestServiceEndpoint = RestServiceEndpoint.Create(this.$http, this.$q, this.configuration);

            return endpoint.all(query);
        }

        public one<TRepresentation>(identifier: string, query?: any): angular.IPromise<TRepresentation> {
            var endpoint: RestServiceEndpoint = RestServiceEndpoint.Create(this.$http, this.$q, this.configuration);

            return endpoint.one(identifier, query);
        }

        public several<TRepresentation>(identifiers: Array<string>, query?: any): angular.IPromise<Array<TRepresentation>> {
            var promises: Array<angular.IPromise<TRepresentation>> = [];

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            for (var i = 0; i < identifiers.length; i++) {
                var promise: angular.IPromise<TRepresentation> = this.one<TRepresentation>(identifiers[i], query);
                promises.push(promise);
            }

            return this.$q.all(promises);
        }

    }

    export interface IEndpointOptions {
        url: string;
    }

    export interface IEndpointConfiguration extends IEndpointOptions {
        url: string;
    }

    export class RestServiceEndpoint implements IRestServiceApi {

        constructor($http:ng.IHttpService, $q:ng.IQService, options: IEndpointOptions) {
            this.$http = $http;
            this.$q = $q;

            this.endpoint = endpoint;
        }

        private $q: ng.IQService;
        private $http: ng.IHttpService;

        private endpoint: string;

        public static Create($http:ng.IHttpService, $q:ng.IQService, configuration: RestServiceConfiguration): RestServiceEndpoint {
            if (configuration.hostUrl[configuration.hostUrl.length - 1] === '/') {
                configuration.hostUrl = configuration.hostUrl.substr(0, configuration.hostUrl.length - 1);
            }

            if (configuration.apiPath[0] === '/') {
                configuration.apiPath = configuration.apiPath.substr(1);
            }

            if (configuration.apiPath[configuration.apiPath.length - 1] === '/') {
                configuration.apiPath = configuration.apiPath.substr(0, configuration.apiPath.length - 1);
            }

            var endpoint:string = configuration.hostUrl + DELIMITER + configuration.apiPath + DELIMITER + configuration.resourceName;

            return new RestServiceEndpoint($http, $q, endpoint);
        }

        public all<TRepresentation>(query?: any): angular.IPromise<TRepresentation> {
            var deferred: angular.IDeferred<TRepresentation> = this.$q.defer();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            this.endpoint = this.endpoint + this.buildQueryString(query);

            this.$http.get(this.endpoint, config)
                .success((data: TRepresentation) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        public one<TRepresentation>(identifier: string, query?: any): angular.IPromise<TRepresentation> {
            var deferred: angular.IDeferred<TRepresentation> = this.$q.defer();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            this.endpoint = this.endpoint + (identifier ? '/' + identifier : '');
            this.endpoint = this.endpoint + this.buildQueryString(query);

            this.$http.get(this.endpoint, config)
                .success((data: TRepresentation) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        public several<TRepresentation>(identifiers: Array<string>, query?: any): angular.IPromise<Array<TRepresentation>> {
            var promises: Array<angular.IPromise<TRepresentation>> = [];

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            for (var i = 0; i < identifiers.length; i++) {
                var promise: angular.IPromise<TRepresentation> = this.one<TRepresentation>(identifiers[i], query);
                promises.push(promise);
            }

            return this.$q.all(promises);
        }

        private buildQueryString(query: any): string {
            var queryString: string = '';

            if (query) {
                queryString =
                    Object.keys(query)
                        .map((key: string): IKeyValuePair<any> => {
                            return {
                                key: key,
                                value: query[key]
                            }
                        })
                        .filter((pair: IKeyValuePair<any>) => {
                            return pair.value !== null && pair.value !== undefined;
                        })
                        .map((pair: IKeyValuePair<any>) => {
                            return pair.key.toLowerCase() + '=' + encodeURIComponent(pair.value);
                        })
                        .reduce((previous: string, current: string): string => {
                            return previous + '&' + current;
                        });
            }

            return queryString != '' ? '?' + queryString : queryString;
        }

    }

}

angular.module('application.component').provider('$restService', HomeAutomation.Lib.Rest.RestServiceProvider);
