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
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            configuration.host.url = _options.url;

            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions = typeof options === 'string' ? { path: options } : options;
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            configuration.api.path = _options.path ? _options.path : configuration.api.path;
            configuration.api.values = _options.values ? _options.values : configuration.api.values;

            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector;
        }

        public endpoint(url: string): RestServiceEndpoint {
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(url));

            return endpoint;
        }

        public operation<TRepresentation>(options: string|IOperationOptions): RestServiceEndpoint {
            var _options: IOperationOptions = typeof options === 'string' ? { name: options } : options;
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector.all(_options);
        }

        public all<TRepresentation>(options: string|IResourceOptions): RestServiceEndpoint {
            var _options: IResourceOptions = typeof options === 'string' ? { name: options } : options;
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector.all(_options);
        }

        public one<TRepresentation>(name: string, id?: string): RestServiceEndpoint {
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var connector: RestServiceConnector = new RestServiceConnector(this.$http, this.$q, configuration);

            return connector.one(name, id);
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
            this.configuration.host.url = _options.url;

            return this;
        }

        public api(options: string|IApiOptions): RestServiceConnector {
            var _options: IApiOptions = typeof options === 'string' ? { path: options } : options;
            this.configuration.api.path = _options.path;
            this.configuration.api.values = _options.values;

            return this;
        }

        public operation<TRepresentation>(options: string|IOperationOptions): RestServiceEndpoint {
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var endpointUrl: string = configuration.buildEndpointUrl();
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(endpointUrl));
            endpoint.all(options);

            return endpoint;
        }

        public all<TRepresentation>(options: string|IResourceOptions): RestServiceEndpoint {
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var endpointUrl: string = configuration.buildEndpointUrl();
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(endpointUrl));
            endpoint.all(options);

            return endpoint;
        }

        public one<TRepresentation>(name: string, id?: string): RestServiceEndpoint {
            var configuration: RestServiceConfiguration = RestServiceConfiguration.Clone(this.configuration);
            var endpointUrl: string = configuration.buildEndpointUrl();
            var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(endpointUrl));
            endpoint.one(name, id);

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
            this.queryString = RestServiceUtils.BuildQueryString(query);

            return this;
        }

        public operation<TRepresentation>(options: string|IOperationOptions): RestServiceEndpoint {
            var _options: IResourceOptions = typeof options === 'string' ? { name: options.toString() } : options;
            var configuration: ResourceConfiguration = new ResourceConfiguration(_options.name);

            this.resources.push(configuration);

            return this;
        }

        public all<TRepresentation>(options: string|IResourceOptions): RestServiceEndpoint {
            var _options: IResourceOptions = typeof options === 'string' ? { name: options.toString() } : options;
            var configuration: ResourceConfiguration = new ResourceConfiguration(_options.name);

            this.resources.push(configuration);

            return this;
        }

        public one<TRepresentation>(name: string, identifier?: string): RestServiceEndpoint {
            var _options: IResourceOptions = { name: name, id: identifier };
            var configuration: ResourceConfiguration = new ResourceConfiguration(_options.name, _options.id);

            this.resources.push(configuration);

            return this;
        }

        public several<TRepresentation>(name: string, identifiers: Array<string>): RestServiceEndpointSet
        {
            var url: string = this.configuration.url;
            this.resources.forEach((resource: ResourceConfiguration) => {
                url = url + DELIMITER + resource.name + (resource.id ? '/' + resource.id : '');
            });

            var endpoints: Array<RestServiceEndpoint> = [];
            for (var i = 0; i < identifiers.length; i++) {
                var endpoint: RestServiceEndpoint = new RestServiceEndpoint(this.$http, this.$q, new EndpointConfiguration(url));
                endpoint.one(name, identifiers[i]);

                endpoints.push(endpoint);
            }

            var endpointSet: RestServiceEndpointSet = new RestServiceEndpointSet(this.$q, endpoints);

            return endpointSet;
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

        public post<TRepresentation>(instance: TRepresentation): angular.IPromise<any> {
            var deferred: angular.IDeferred<TRepresentation> = this.$q.defer();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            var url: string = this.configuration.url;
            this.resources.forEach((resource: ResourceConfiguration) => {
                url = url + DELIMITER + resource.name + (resource.id ? '/' + resource.id : '');
            });

            this.$http.post(url, instance, config)
                .success((data: any) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        public put<TRepresentation>(instance?: TRepresentation): angular.IPromise<TRepresentation> {
            var deferred: angular.IDeferred<TRepresentation> = this.$q.defer();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            var url: string = this.configuration.url;
            this.resources.forEach((resource: ResourceConfiguration) => {
                url = url + DELIMITER + resource.name + (resource.id ? '/' + resource.id : '');
            });

            this.$http.put(url, instance, config)
                .success((data: any) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        public delete<TRepresentation>(): angular.IPromise<void>
        {
            var deferred: angular.IDeferred<void> = this.$q.defer<void>();

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            var url: string = this.configuration.url;
            this.resources.forEach((resource: ResourceConfiguration) => {
                url = url + DELIMITER + resource.name + (resource.id ? '/' + resource.id : '');
            });

            this.$http.delete(url, config)
                .success(() => {
                    deferred.resolve();
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    }

    export class RestServiceEndpointSet {

        constructor($q: angular.IQService, endpoints: Array<RestServiceEndpoint>) {
            this.$q = $q;

            this.endpoints = endpoints;
        }

        private $q: angular.IQService;
        private endpoints: Array<RestServiceEndpoint> = [];
        private _query: any = {};

        public query(query: any): RestServiceEndpointSet {
            this._query = query;

            return this;
        }

        public get<TRepresentation>(): angular.IPromise<Array<TRepresentation>> {
            var promises: Array<angular.IPromise<TRepresentation>> = [];

            var config: angular.IRequestShortcutConfig = { headers: {} };
            //config.headers = this.addCustomHttpHeaders();

            for (var i = 0; i < this.endpoints.length; i++) {
                var promise: angular.IPromise<TRepresentation> = this.endpoints[i].query(this._query).get();
                promises.push(promise);
            }

            return this.$q.all(promises);
        }
    }

    // -------------------------------------------------------------------------------------------------------------
    // HELPER, OPTIONS & CONFIGURATIONS
    // -------------------------------------------------------------------------------------------------------------

    export class RestServiceUtils {

        public static Format(template:string, values):string {

            if (values) {
                var pairs:Array<IKeyValuePair<any>> =
                    Object.keys(values)
                        .map((key:string):IKeyValuePair<any> => {
                            return {
                                key: key,
                                value: values[key]
                            }
                        })
                        .filter((pair:IKeyValuePair<any>):boolean => {
                            return pair.value !== null && pair.value !== undefined;
                        });

                pairs.forEach((pair:IKeyValuePair<any>):void => {
                    var regEx = new RegExp("\\{:" + pair.key + "\\}", "gm");
                    template = template.replace(regEx, pair.value.toString());
                });
            }

            return template;
        }

        public static BuildQueryString(query: any): string {
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
                        .filter((pair: IKeyValuePair<any>): boolean => {
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
        path?: string;
        values?: any
    }

    export interface IApiConfiguration extends IApiOptions {
        path?: string;
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

    export class ApiConfiguration implements IApiConfiguration {
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

    export interface IOperationOptions extends IResourceOptions {
    }

    export interface IOperationConfiguration extends IResourceConfiguration {
    }

    export interface IInterceptors {
        api: (configuration: IApiConfiguration)=>void;
    }

    export class Interceptors implements IInterceptors {
        api: (configuration: IApiConfiguration)=>void = null;
    }

    export class RestServiceConfiguration implements IRestServiceConfiguration {

        constructor() {
            this.host = new HostConfiguration();
            this.api = new ApiConfiguration();
            this.interceptors = new Interceptors();
        }

        host: IHostConfiguration;
        api: IApiConfiguration;
        interceptors: IInterceptors;

        public static Clone(instance: RestServiceConfiguration): RestServiceConfiguration {
            var clone: RestServiceConfiguration = new RestServiceConfiguration();
            clone.host = angular.extend(new HostConfiguration(), instance.host);
            clone.api = angular.extend(new ApiConfiguration(), instance.api);
            clone.interceptors = instance.interceptors;

            return clone;
        }

        public buildEndpointUrl(): string {
            if (this.host.url[this.host.url.length - 1] === '/') {
                this.host.url = this.host.url.substr(0, this.host.url.length - 1);
            }

            if (this.api.path[0] === '/') {
                this.api.path = this.api.path.substr(1);
            }

            if (this.api.path[this.api.path.length - 1] === '/') {
                this.api.path = this.api.path.substr(0, this.api.path.length - 1);
            }

            this.interceptors.api(this.api);

            var endpoint: string = this.host.url + DELIMITER + RestServiceUtils.Format(this.api.path, this.api.values);

            return endpoint;
        }
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
