export interface ILink {
  href: string;
}

export type TLinkValue = ILink | ILink[];

export interface IResourceLinks {
  [rel: string]: TLinkValue;
}

export type WithLinks<T> = T & { _links: IResourceLinks };
