/// <reference path="../../reference.d.ts" />

module HomeAutomation.Lib.Foundation {

    export class PollingServiceProvider implements ng.IServiceProvider {
        $get = ['$timeout', '$q', ($timeout:ng.ITimeoutService, $q:ng.IQService) => {
            return new PollingService($timeout, $q);
        }]
    }

    export class PollingService {
        static $inject = ['$timeout', '$q'];

        constructor($timeout:ng.ITimeoutService, $q:ng.IQService) {
            this.$timeout = $timeout;
            this.$q = $q;
        }

        private $timeout:ng.ITimeoutService;
        private $q:ng.IQService;

        private iteration:number = 0;
        private timer:any;

        private onTick:() => ng.IPromise<any>;

        public start(onTick:() => ng.IPromise<any>):void {
            this.iteration = 0;

            if (this.timer) {
                this.$timeout.cancel(this.timer);
            }

            this.onTick = onTick;
            this.setTimer(this);
        }

        public poll():void {
            this.start(this.onTick);
        }

        public stop():void {
            if (this.timer) {
                this.$timeout.cancel(this.timer);
            }
        }

        public tick(self:PollingService) {
            if (self.timer) {
                self.$timeout.cancel(this.timer);
            }

            this.onTick().then(() => {
                self.setTimer(self);
            });
        }

        private setTimer(self:PollingService):void {
            var delay:number = self.generateDelayValue();

            self.timer = self.$timeout(() => {
                self.tick(self);
            }, delay);
        }

        private generateDelayValue():number {
            return this.iteration < 5 ? ((Math.pow(this.iteration++, 3)) * 200) : Math.round(Math.random() * 60000);
        }
    }

}

angular.module('application.component').provider('$pollingService', HomeAutomation.Lib.Foundation.PollingServiceProvider);