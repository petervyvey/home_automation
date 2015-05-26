/// <reference path='../../vendor/typings/references.d.ts' />

import express = require('express');

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
    [name: string]: Array<ResourceRepresentation>;
}

export interface IRepresentation {
    _links: ILinkDictionary;
    _embedded: IEmbeddedResourceDictionary;
}

export interface IResourceRepresentation extends IRepresentation {
}

export interface ICollectionRepresentation extends IRepresentation {
    count: number;
    total: number;
}

export class Link {

    constructor(request: express.Request, resourcePath: string, templated: boolean = false) {
        this.href = request.protocol + '://' + request.get('host') + resourcePath;
        this.templated = templated;
    }

    public href: string = null;
    public templated: boolean = null;
    public method: HttpVerb = HttpVerb.GET;

    public static CreateWithMethod(request: express.Request, href: string, method: HttpVerb = HttpVerb.GET): Link {
        var link: Link = new Link(request, href);
        link.method = method;

        return link;
    }
}

export class Representation implements IRepresentation {
    public _links: ILinkDictionary = null;
    public _embedded: IEmbeddedResourceDictionary = null;

    public cast<T extends Representation>(): T  {
        return <T>this;
    }
}

export class ResourceRepresentation extends Representation implements IResourceRepresentation {

    public buildSelfUrl(request: express.Request): string {
        return request.originalUrl;
    }

    public addSelfLink(request: express.Request) : ResourceRepresentation {
        this.addLink('self', new Link(request, this.buildSelfUrl(request)));

        return this;
    }

    public addLink(name: string, link: Link) : ResourceRepresentation {

        if (this._links==null) this._links = {};
        this._links[name] = link;

        return this;
    }

    public createEmbeddedResource(name: string, resources: Array<ResourceRepresentation> = null): ResourceRepresentation {

        if (this._embedded==null) this._embedded = {};
        this._embedded[name] = resources != null ? resources : [];

        return this;
    }

    public addEmbeddedResource(name: string, resource: ResourceRepresentation|Array<ResourceRepresentation>): ResourceRepresentation
    {
        if (this._embedded==null) this._embedded = {};
        if (this._embedded[name]==null) this.createEmbeddedResource(name);

        if (typeof resource === "Representation") {
            this._embedded[name].push(<ResourceRepresentation>resource);
        }
        else {
            (<Array<ResourceRepresentation>>resource).forEach((resource: ResourceRepresentation)=>{
                this._embedded[name].push(<ResourceRepresentation>resource)
            });
        }

        return this;
    }
}

export class CollectionRepresentation extends ResourceRepresentation implements ICollectionRepresentation {

    public count: number = null;
    public total: number = null;

    public setCount(count: number): CollectionRepresentation {
        this.count = count;

        return this;
    }

    public setTotal(total: number): CollectionRepresentation {
        this.total = total;

        return this;
    }
}