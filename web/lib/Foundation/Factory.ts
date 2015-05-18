
interface INewable<T> {
    new(...args: any[]): T;
}

export class Factory {

    public static createInstance<T>(ctor: INewable<T>, ...args: any[]): T {

        return new ctor(args);
    }
}