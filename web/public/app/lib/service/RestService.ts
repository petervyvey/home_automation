/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Rest {

    var DELIMITER: string = '/';

    export class RestServiceProvider implements angular.IServiceProvider {
        $get = ['$http', '$q', ($http: angular.IHttpService, $q: angular.IQService) => {
            return new RestService($http, $q, this.configuration);
        }];

        private configuration: RestServiceConfiguration;

        setServiceConfig(configuration: RestServiceConfiguration): void {
            this.configuration = configuration;
        }
    }

    export class RestService {

        constructor($http: angular.IHttpService, $q: angular.IQService, configuration: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration != null ? configuration : new RestServiceConfiguration();
        }

        public $http: angular.IHttpService;
        public $q: angular.IQService;
        public configuration: RestServiceConfiguration;

        public host(options: string|IHostOptions): RestServiceConnector {
            var _options: IHostOptions = typeof options === 'string' ? { url: options } : options;
            var configuration: RestServiceConfiguration = angular.extend({} , this.configuration);
            configuration.host.url = _options.url;

            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions = typeof options === 'string' ? { path: options } : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration);
            configuration.api.path = _options.path;
            configuration.api.values =_options.values;

            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector;
        }
    }

    export class RestServiceConnector {

        constructor($http: angular.IHttpService, $q: angular.IQService, configuration: RestServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration;
        }

        private $q: angular.IQService;
        private $http: angular.IHttpService;

        public configuration: RestServiceConfiguration;

        public host(options: string|IHostOptions): RestServiceConnector {
            var _options: IHostOptions = typeof options === 'string' ? { url: options } : options;
            var configuration: RestServiceConfiguration = angular.extend({} , this.configuration);
            configuration.host.url = _options.url;

            return this;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions = typeof options === 'string' ? { path: options } : options;
            var configuration: RestServiceConfiguration = angular.extend({}, this.configuration);
            configuration.api.path = _options.path;
            configuration.api.values =_options.values;

            return this;
        }

        public all<TRepresentation>(options: string|IResourceOptions): RestServiceEndpoint {
            var endpointUrl: string = this.buildEndpointUrl();
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(endpointUrl));
            endpoint.all(options);

            return endpoint;
        }

        public one<TRepresentation>(name: string, id?: string): RestServiceEndpoint {
            var endpointUrl: string = this.buildEndpointUrl();
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(endpointUrl));
            endpoint.one(name, id);

            return endpoint;
        }

        public buildEndpointUrl(): string {
            if (this.configuration.host.url[this.configuration.host.url.length - 1] === '/') {
                this.configuration.host.url = this.configuration.host.url.substr(0, this.configuration.host.url.length - 1);
            }

            if (this.configuration.api.path[0] === '/') {
                this.configuration.api.path = this.configuration.api.path.substr(1);
            }

            if (this.configuration.api.path[this.configuration.api.path.length - 1] === '/') {
                this.configuration.api.path = this.configuration.api.path.substr(0, this.configuration.api.path.length - 1);
            }

            var endpoint: string = this.configuration.host.url + DELIMITER + this.configuration.api.path;

            return endpoint;
        }
    }

    export class RestServiceEndpoint {

        constructor($http: angular.IHttpService, $q: angular.IQService, configuration: EndpointConfiguration) {
            this.$http = $http;
            this.$q = $q;

            this.configuration = configuration;
        }

        private $q: angular.IQService;
        private $http: angular.IHttpService;

        private configuration: EndpointConfiguration;
        private resources: Array<ResourceConfiguration> = [];
        private queryString: string = '';

        public query(query: any): RestServiceEndpoint {
            this.queryString = this.buildQueryString(query);

            return this;
        }

        public all<TRepresentation>(options: string|IResourceOptions): RestServiceEndpoint {
            var _options: IResourceOptions = typeof options === 'string' ? { name: options.toString() } : options;
            var configuration: ResourceConfiguration = new ResourceConfiguration(_options.name);

            this.resources.push(configuration);

            return this;
        }

        public one<TRepresentation>(name: string, id?: string): RestServiceEndpoint {
            var _options: IResourceOptions = { name: name, id: id };
            var configuration: ResourceConfiguration = new ResourceConfiguration(_options.name, _options.id);

            this.resources.push(configuration);

            return this;
        }

        public get<TRepresentation>(): angular.IPromise<TRepresentation> {
            var deferred: angular.IDeferred<TRepresentation> = this.$q.defer();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            var url: string = this.configuration.url;
            this.resources.forEach((resource: ResourceConfiguration) => {
                url = url + DELIMITER + resource.name + (resource.id ? '/' + resource.id : '');
            });

            url = url + this.queryString;

            this.$http.get(url, config)
                .success((data: TRepresentation) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
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

    // -------------------------------------------------------------------------------------------------------------
    // OPTIONS & CONFIGURATIONS
    // -------------------------------------------------------------------------------------------------------------

    interface IKeyValuePair<TValue> {
        key: string;
        value: TValue;
    }

    export interface IHostOptions {
        url: string;
    }

    export interface IHostConfiguration extends IHostOptions {
        url: string;
    }

    export interface IApiOptions {
        path: string;
        values?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        path: string;
        values: any;
    }

    export interface IEndpointOptions {
        url: string;
    }

    export interface IEndpointConfiguration extends IEndpointOptions {
        url: string;
    }

    export interface IRestServiceConfiguration {
        host: IHostConfiguration;
        api: IApiConfiguration;
    }

    export class HostConfiguration implements IHostConfiguration {
        url: string = 'http://localhost/';
    }

    export class ApiConfiguration  implements IApiConfiguration {
        path: string = 'api';
        values: any = null;
    }

    export class EndpointConfiguration implements IEndpointConfiguration {

        constructor(url: string) {
            this.url = url;
        }

        public url: string;
    }

    export interface IResourceOptions {
        name: string;
        id?: string;
    }

    export interface IResourceConfiguration extends IResourceOptions {
        name: string;
        id: string
    }

    export class RestServiceConfiguration implements IRestServiceConfiguration {

        constructor() {
            this.host = new HostConfiguration();
            this.api = new ApiConfiguration();
        }

        host: IHostConfiguration;
        api: IApiConfiguration;
    }

    export class ResourceConfiguration implements IResourceConfiguration {

        constructor(name: string, id?: string) {
            this.name = name;
            this.id = id;
        }

        name: string;
        id: string = null;
    }

}

angular.module('application.component').provider('$restService', HomeAutomation.Lib.Rest.RestServiceProvider);
