
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

    public _links: ILinkCollection = null;

    public addLink(name: string, link: Link) {

        if (this._links==null) this._links = {};

        this._links[name] = link;
    }
}