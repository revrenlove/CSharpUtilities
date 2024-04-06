import * as configJson from './config.json';

export class Config {
    public static readonly fileScopedNamespaceTemplatePath = `${__dirname}/${configJson.fileScopedNamespaceTemplatePath}`;
    public static readonly namespaceEncapsulatedTemplatePath = `${__dirname}/${configJson.namespaceEncapsulatedTemplatePath}`;
}