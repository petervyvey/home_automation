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
            this.setTimer();
        }

        public once(): void {
            this.tick();
        }

        public poll():void {
            this.start(this.onTick);
        }

        public stop():void {
            if (this.timer) {
                this.$timeout.cancel(this.timer);
            }
        }

        private tick() {
            if (this.timer) {
                this.$timeout.cancel(this.timer);
            }

            this.onTick().then(() => {
                this.setTimer();
            });
        }

        private setTimer():void {
            var delay:number = this.generateDelayValue();

            this.timer = this.$timeout(() => {
                this.tick();
            }, delay);
        }

        private generateDelayValue():number {
            return this.iteration < 5 ? ((Math.pow(this.iteration++, 3)) * 200) : Math.round(Math.random() * 60000);
        }
    }

}

angular.module('application.component').provider('$pollingService', HomeAutomation.Lib.Foundation.PollingServiceProvider);