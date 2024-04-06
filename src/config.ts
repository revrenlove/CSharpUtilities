import { injectable } from "inversify";

@injectable()
export class Config {

    private config: Config;

    constructor() {

    }

    // TODO: Remove the "generic" shit...
    genericTemplatePath: string;
    fileScopedNamespaceTemplatePath: string;
    namespaceEncapsulatedTemplatePath: string;
}