import * as parser from 'fast-xml-parser';

type KeyedString = { [k: string]: string; };
type KeyValuePair = { [k: string]: any };
type JsonNode = KeyValuePair[] | KeyValuePair | undefined;

export class CSharpProject {

    constructor(projectName: string, xml: string) {

        const json = parser.parse(xml, { ignoreAttributes: false });

        this.rootNamespace = this.getRootNamespace(json) ?? projectName;

        this.projectReferences = this.getReferences(json, "ProjectReference");

        this.nugetPackageReferences = this.getReferences(json, "PackageReference");
    }

    public readonly rootNamespace: string;
    public readonly projectReferences: string[];
    public readonly nugetPackageReferences: string[];

    // If multiple `PropertyGroup` elements exist with different `RootNamespace`
    //  values, all `RootNamespace`s will be ignored.
    private getRootNamespace(json: any): string | undefined {

        const propertyGroupNode: JsonNode = json?.Project?.PropertyGroup;

        if (!propertyGroupNode) { return; }

        let namespace: string | undefined;

        if (!Array.isArray(propertyGroupNode)) {

            namespace = propertyGroupNode.RootNamespace;

            return namespace;
        }

        for (let i = 0; i < propertyGroupNode.length; i++) {

            if (!propertyGroupNode[i].RootNamespace) { continue; }

            if (!namespace) {

                namespace = propertyGroupNode[i].RootNamespace;

                continue;
            }

            if (namespace !== propertyGroupNode[i].RootNamespace) {

                namespace = undefined;
            }
        }

        return namespace;
    }

    private getReferences(json: any, elementName: string): string[] {

        const XML_ATTRIBUTE_KEY = '@_Include';

        let projectReferences: string[] = [];

        let itemGroupNode: JsonNode = json?.Project?.ItemGroup;

        if (!itemGroupNode) { return projectReferences; }

        if (!Array.isArray(itemGroupNode)) {
            itemGroupNode = [itemGroupNode];
        }

        itemGroupNode = itemGroupNode.find((p: KeyValuePair) => p[elementName]);

        if (!itemGroupNode) { return projectReferences; }

        const singleItemGroupNode: KeyValuePair = itemGroupNode;

        if (Array.isArray(singleItemGroupNode[elementName])) {
            projectReferences = singleItemGroupNode[elementName].map((n: KeyedString) => n[XML_ATTRIBUTE_KEY]);
        }
        else {
            projectReferences = [singleItemGroupNode[elementName][XML_ATTRIBUTE_KEY]];
        }


        return projectReferences;
    }
}
