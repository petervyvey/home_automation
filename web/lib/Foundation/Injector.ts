
export interface IInterfaceChecker {
    methodNames?: string[];
    propertyNames?: string[];
    className: string;
}

export class InterfaceChecker<T extends IInterfaceChecker> {

    implementsInterface(classToCheck: any, t: { new (): T; }): boolean {
        var targetInterface = new t();
        var i, len: number;

        if (targetInterface.methodNames) {
            for (i = 0, len = targetInterface.methodNames.length; i < len; i++) {
                var method: string = targetInterface.methodNames[i];
                if (!classToCheck[method] ||
                    typeof classToCheck[method] !== 'function') {
                    console.log("Function :" + method + " not found");
                    return false;
                }
            }
        }

        if (targetInterface.propertyNames) {
            for (i = 0, len = targetInterface.propertyNames.length; i < len; i++) {
                var property: string = targetInterface.propertyNames[i];
                if (!classToCheck[property] ||
                    typeof classToCheck[property] == 'function') {
                    console.log("Property :" + property + " not found");
                    return false;
                }
            }
        }

        return true;
    }
}

export class Injector {

    static registeredClasses: any[] = new Array();

    public static register(targetObject: any, targetInterface: { new (): IInterfaceChecker; }) {
        var interfaceChecker = new InterfaceChecker();
        var targetClassName = new targetInterface();

        if (interfaceChecker.implementsInterface(targetObject, targetInterface)) {
            this.registeredClasses[targetClassName.className] = targetObject;
        }
        else {
            throw new Error("TypeScriptTinyIoC cannot register instance of " + targetClassName.className);
        }
    }

    public static resolve(targetInterface: { new (): IInterfaceChecker; }) {
        var targetClassName = new targetInterface();

        if (this.registeredClasses[targetClassName.className]) {
            return this.registeredClasses[targetClassName.className];
        }
        else {
            throw new Error("TypeScriptTinyIoC cannot find instance of " + targetClassName.className);
        }
    }

    public static unregister(targetInterface: { new (): IInterfaceChecker; }) {
        var targetClassName = new targetInterface();

        if (this.registeredClasses[targetClassName.className]) {
            delete this.registeredClasses[targetClassName.className];
        }
    }

}
