
export class Generator {
    public static NewGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
            var r: number = Math.random()*16|0;
            var v: any = c == 'x' ? r : r&0x3|0x8;

            return v.toString(16);
        });
    }

    public static NewId(length: number = 5): string {
        return Math.random().toString(36).replace(/[^a-z^A-Z]+/g, '').substr(0, length);
    }
}