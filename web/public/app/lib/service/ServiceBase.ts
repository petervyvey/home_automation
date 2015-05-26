/// <reference path="../../../vendor/typings/_reference.d.ts" />
/// <reference path="../foundation/ConfigurationManager.ts" />
/// <reference path="../foundation/TokenManager.ts" />

module HomeAutomation.Lib.Service {

    export class ServiceBase {

        static $inject = ['$http', '$q', '$tokenManager', '$configurationManager'];

        constructor($http: ng.IHttpService, $q: ng.IQService, serviceConfiguration: ServiceConfiguration) {
            this.$http = $http;
            this.$q = $q;
            this.serviceConfiguration = serviceConfiguration;
        }

        public $http: ng.IHttpService;
        public $q: ng.IQService;
        public serviceConfiguration: ServiceConfiguration;

        protected $getData<TRepresentation>(operation: string): ng.IPromise<TRepresentation> {
            var operationInfo: OperationInfo = new OperationInfo(this.serviceConfiguration.serviceUrl, operation);

            var deferred: ng.IDeferred<TRepresentation> = this.$q.defer();

            var config: ng.IRequestShortcutConfig = { headers: {} };
            config.headers = this.addCustomHttpHeaders();

            this.$http.get(operationInfo.endpoint(), config)
                .success((data: TRepresentation) => {
                    deferred.resolve(data);
                })
                .error((error: any) => {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        protected $postData<TRepresentation>(operation: string, data: any): ng.IPromise<TRepresentation> {
            var operationInfo: OperationInfo = new OperationInfo(this.serviceConfiguration.serviceUrl, operation);
            var promise: ng.IPromise<TRepresentation> = <ng.IPromise<TRepresentation>>this.$http.post(operationInfo.endpoint(), data);

            return promise;
        }

        private addCustomHttpHeaders(): any {
            var headers: any = {};
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