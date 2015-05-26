/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Foundation {

    export class Token {
        constructor() {
            this.expiration = new Date('1900-01-01');
            this.accessToken = null;
        }

        public expiration: Date;
        public accessToken: string;
    }
    
    export class TokenManager {

        static $inject = ['$cookieStore'];

        constructor($cookies: ng.cookies.ICookiesService) {
            this.$cookies = $cookies;

            this.initializeObject();
        }

        public static AUTH_COOKIE_NAME: string = 'SlidingApps-Warrant-Identity-Token';

        public userToken: Token;
        public $cookies: ng.cookies.ICookiesService;

        private initializeObject() {
            var userToken: HomeAutomation.Lib.Foundation.Token = angular.fromJson(this.$cookies.get(TokenManager.AUTH_COOKIE_NAME));
            this.setUserToken(userToken);
        }

        public setUserToken(token: Token) {
            this.userToken = token;
        }
    }

}

angular.module('application.component').service('$tokenManager', HomeAutomation.Lib.Foundation.TokenManager);
