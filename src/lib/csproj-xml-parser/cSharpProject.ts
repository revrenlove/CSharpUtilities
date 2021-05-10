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

    private getRootNamespace(json: any): string | undefined {

        let propertyGroupNode: JsonNode = json?.Project?.PropertyGroup;

        if (!propertyGroupNode) { return; }

        // NOTE: Currently if multiple `PropertyGroup` elements exist,
        //          we just use the first one we find. This has been 
        //          noted in the `README.md`, an issue has been filed,
        //          and if enough interest is expressed, this will
        //          be addressed.
        if (Array.isArray(propertyGroupNode)) {
            propertyGroupNode = propertyGroupNode[0];
        }

        const namespace: string | undefined = propertyGroupNode.RootNamespace;

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
