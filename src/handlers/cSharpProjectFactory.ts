import * as vscode from 'vscode';
import * as path from 'path';
import * as parser from 'fast-xml-parser';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { FileHandler } from './fileHandler';
import { CSharpProject } from './cSharpProject';

// TODO: Move these definitions into their own lib
//          Perhaps extend the parser...
type KeyedString = { [k: string]: string; };
type KeyValuePair = { [k: string]: any };
type JsonNode = KeyValuePair[] | KeyValuePair | undefined;

@injectable()
export class CSharpProjectFactory {

    private fileHandler: FileHandler;

    public constructor(@inject(TYPES.fileHandler) fileHandler: FileHandler) {

        this.fileHandler = fileHandler;
    }

    public async fromUri(uri: vscode.Uri): Promise<CSharpProject> {

        const projectName = path.parse(uri.fsPath).name;

        const fileContents = await this.fileHandler.readFile(uri);

        const json = parser.parse(fileContents, { ignoreAttributes: false });

        const rootNamespace = this.getRootNamespace(json) ?? projectName;

        const projectReferencePaths = this.getReferencePaths(json, "ProjectReference", uri.fsPath);

        const cSharpProject: CSharpProject = {
            path: uri.fsPath,
            rootNamespace: rootNamespace,
            projectReferencePaths: projectReferencePaths
        };

        return cSharpProject;
    }

    // If multiple `PropertyGroup` elements exist with different
    //  `RootNamespace` values, all `RootNamespace`s will be ignored.
    private getRootNamespace(json: any): string | undefined {

        const propertyGroupNode: JsonNode = json?.Project?.PropertyGroup;

        if (!propertyGroupNode) {
            return;
        }

        let namespace: string | undefined;

        if (!Array.isArray(propertyGroupNode)) {

            namespace = propertyGroupNode.RootNamespace;

            return namespace;
        }

        for (let i = 0; i < propertyGroupNode.length; i++) {

            if (!propertyGroupNode[i].RootNamespace) {
                continue;
            }

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

    private getReferencePaths(json: any, elementName: string, projectPath: string): string[] {

        const XML_ATTRIBUTE_KEY = '@_Include';

        let projectReferencePaths: string[] = [];

        let itemGroupNode: JsonNode = json?.Project?.ItemGroup;

        if (!itemGroupNode) { return projectReferencePaths; }

        if (!Array.isArray(itemGroupNode)) {
            itemGroupNode = [itemGroupNode];
        }

        itemGroupNode = itemGroupNode.find((p: KeyValuePair) => p[elementName]);

        if (!itemGroupNode) { return projectReferencePaths; }

        const singleItemGroupNode: KeyValuePair = itemGroupNode;

        if (Array.isArray(singleItemGroupNode[elementName])) {
            projectReferencePaths = singleItemGroupNode[elementName].map((n: KeyedString) => n[XML_ATTRIBUTE_KEY]);
        }
        else {
            projectReferencePaths = [singleItemGroupNode[elementName][XML_ATTRIBUTE_KEY]];
        }

        const absoluteProjectPaths =
            projectReferencePaths
                .map(x => this.relativePathToAbsolutePath(x, projectPath));

        return absoluteProjectPaths;
    }

    private relativePathToAbsolutePath(relativePath: string, projectPath: string): string {

        // dotnet project references use windows-style slashes.
        // This normalizes to the platform.
        relativePath = relativePath.replace(/\\/g, path.sep);

        const projectDirectoryPath = path.dirname(projectPath);

        const absolutePath = path.resolve(projectDirectoryPath, relativePath);

        return absolutePath;
    }
}