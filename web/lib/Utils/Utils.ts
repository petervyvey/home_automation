
export class StringFormat {

    public static Format(template: string, ...args:Array<string>): string {
        for (var i = 0; i < args.length; i++) {
            // "gm" = RegEx options for Global search (more than one instance)
            var regEx = new RegExp("\\{" + (i) + "\\}", "gm");
            template = template.replace(regEx, args[i]);
        }

        return template;
    }
}