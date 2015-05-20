/// <reference path="../../../vendor/typings/_reference.d.ts" />
/// <reference path="../foundation/ConfigurationManager.ts" />
/// <reference path="../foundation/TokenManager.ts" />

module HomeAutomation.Lib.Service {

    export class ServiceBase {

        static $inject = ['$http', '$q', '$tokenManager', '$configurationManager'];

        constructor($http: ng.IHttpService, $q: ng.IQService, $tokenManager: HomeAutomation.Lib.Foundation.TokenManager, $configurationManager: HomeAutomation.Lib.Foundation.ConfigurationManager, serviceConfiguration: ServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;
            this.$tokenManager = $tokenManager;
            this.$configurationManager = $configurationManager;
            this.serviceConfiguration = serviceConfiguration;
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public $tokenManager: HomeAutomation.Lib.Foundation.TokenManager;
        public $configurationManager: HomeAutomation.Lib.Foundation.ConfigurationManager;
        public serviceConfiguration: ServiceConfiguration;

        // ReSharper disable once UsingOfReservedWord
        protected $getData<TDataTransferObject>(operation: string): ng.IPromise<TDataTransferObject> {
            var operationInfo: OperationInfo = new OperationInfo(this.serviceConfiguration.serviceUrl, operation);

            var deferred: ng.IDeferred<TDataTransferObject> = this.$q.defer();

            var config: ng.IRequestShortcutConfig = { headers: {} };
            config.headers = this.addCustomHttpHeaders();

            this.$http.get(operationInfo.endpoint(), config)
                .success((data: TDataTransferObject) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        // ReSharper disable once UsingOfReservedWord
        protected $postData<TDataTransferObject>(operation: string, data: any): ng.IPromise<TDataTransferObject> {
            var operationInfo: OperationInfo = new OperationInfo(this.serviceConfiguration.serviceUrl, operation);
            var promise: ng.IPromise<TDataTransferObject> = <ng.IPromise<TDataTransferObject>>this.$http.post(operationInfo.endpoint(), data);

            return promise;
        }

        private addCustomHttpHeaders(): any {
            var headers: any = {};

            if (this.$tokenManager) {
                if (this.$tokenManager.userToken) {
                    angular.extend(headers, { 'Authorization': 'Bearer ' + this.$tokenManager.userToken.accessToken });
                }

                if (this.$tokenManager) {
                    angular.extend(headers, { 'SlidingApps-Warrant-Application-Context': angular.toJson({ runtime: this.$configurationManager.settings.runtimeConfiguration, context: this.$configurationManager.settings.applicationContext }) });
                }
            }

            return headers;
        }
    }

    export class ServiceConfiguration {
        constructor(serviceUrl: string) {
            this.serviceUrl = serviceUrl;
        }

        public serviceUrl: string;
    }

    export class OperationInfo {

        constructor(serviceUrl: string, operation: string) {
            this.serviceUrl = serviceUrl;
            this.operation = operation;
        }

        public static DELIMITER: string = '/';

        public serviceUrl: string = '';
        public operation: string = '';

        public endpoint(): string {
            var delimiter: string = this.serviceUrl.slice(-1) === '/' ? '' : OperationInfo.DELIMITER;

            if (this.operation[0] == '/') {
                this.operation = this.operation.substr(1);
            }

            return this.serviceUrl + delimiter + this.operation;
        }

    }
}