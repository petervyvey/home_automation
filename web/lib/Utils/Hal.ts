
interface ILinkCollection {
    [name: string]: Link;
}

export class Link {

    constructor(href: string, templated: boolean = null) {
        this.href = href;
        this.templated = templated;
    }

    public href: string = null;
    public templated: boolean = null;
}

export interface IRepresentation {
    _links: ILinkCollection;
}

export class Representation implements IRepresentation {

    public _links: ILinkCollection = {};

    public addLink(name: string, link: Link) {
        this._links[name] = link;
    }
}