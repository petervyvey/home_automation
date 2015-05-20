
export enum HttpVerb {
    'GET' = <any>'GET',
    'PUT' = <any>'PUT',
    'POST' = <any>'POST',
    'DELETE' = <any>'DELETE'
}

interface ILinkDictionary {
    [name: string]: Link;
}

interface IEmbeddedResourceDictionary {
    [name: string]: Array<Representation>;
}

export class Link {

    constructor(href: string, templated: boolean = null) {
        this.href = href;
        this.templated = templated;
    }

    public href: string = null;
    public templated: boolean = null;
    public method: HttpVerb = null;

    public static CreateWithMethod(href: string, method: HttpVerb = null): Link {
        var link: Link = new Link(href);
        link.method = method;

        return link;
    }
}

export interface IRepresentation {
    _links: ILinkDictionary;
    _embedded: IEmbeddedResourceDictionary;
}

export class Representation implements IRepresentation {

    public _links: ILinkDictionary = null;
    public _embedded: IEmbeddedResourceDictionary = null;

    public addLink(name: string, link: Link) : Link {

        if (this._links==null) this._links = {};
        this._links[name] = link;

        return this._links[name];
    }

    public createEmbeddedResource(name: string, resources: Array<Representation> = null): Array<Representation> {

        if (this._embedded==null) this._embedded = {};
        this._embedded[name] = resources != null ? resources : [];

        return this._embedded[name];
    }

    public addEmbeddedResource(name: string, resource: Representation): Representation
    {
        if (this._embedded==null) this._embedded = {};
        if (this._embedded[name]==null) this.createEmbeddedResource(name);

        this._embedded[name].push(resource);

        return resource;
    }
}