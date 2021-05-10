import * as vscode from 'vscode';
import * as path from 'path';
import * as csprojXmlParser from '../lib/csproj-xml-parser';
import { TextEncoder, TextDecoder } from 'util';
import { Config } from '../config';
import { ItemFileTemplate } from '../templates/itemFileTemplate';
import { TemplateType } from "../templates/templateType";
import { Util } from '../util';

export class GenericTemplateHandler {

    // TODO: Use FileHandler instead of TextEncode/TextDecoder
    private static readonly filenameRegex = new RegExp(`\\${path.sep}[^\\${path.sep}]+$`);

    private static textDecoder = new TextDecoder();

    public static async generate(templateType: TemplateType, contextualUri: vscode.Uri): Promise<void> {

        let objectName = await this.getObjectName(templateType);

        if (!objectName) { return; }

        objectName = this.sanitizeName(objectName);

        const newFileUris = await this.getNewFileUris(contextualUri, objectName);

        if (await this.isDuplicateFile(newFileUris[1])) { return; }

        const namespace = await this.getFullNamespace(newFileUris[0]);

        if (!namespace) { return; }

        const template: ItemFileTemplate = {
            namespace: namespace,
            objectType: TemplateType[templateType],
            objectName: objectName,
        };

        const fileContentsString = await this.populateTemplate(template);

        const fileContents = new TextEncoder().encode(fileContentsString);

        await vscode.workspace.fs.writeFile(newFileUris[1], Uint8Array.from(fileContents));

        await this.openEditor(newFileUris[1]);
    }

    private static async getObjectName(templateType: TemplateType): Promise<string | undefined> {

        const templateTypeName = Util.capitalizeFirstLetter(TemplateType[templateType]);

        let placeHolder = `MyAwesome${templateTypeName}`;

        if (templateType === TemplateType.interface) {
            placeHolder = `I${placeHolder}`;
        }

        const objectName = await vscode.window.showInputBox({
            "prompt": `Please enter the name of the new ${templateTypeName}...`,
            "placeHolder": placeHolder
        });

        return objectName;
    }

    private static sanitizeName(objectName: string): string {

        const csExtRgx = /\.cs$/;

        if (csExtRgx.test(objectName)) {
            objectName = objectName.replace(csExtRgx, '');
        }

        return objectName;
    }

    private static async getNewFileUris(contextualUri: vscode.Uri, objectName: string)
        : Promise<[directory: vscode.Uri, file: vscode.Uri]> {

        let newFileDirectoryPath: string;

        const stat = await vscode.workspace.fs.stat(contextualUri);

        if (stat.type === vscode.FileType.Directory) {

            newFileDirectoryPath = contextualUri.fsPath;
        }
        else {
            newFileDirectoryPath = contextualUri.fsPath.replace(this.filenameRegex, '');
        }

        const newFilePath = `${newFileDirectoryPath}/${objectName}.cs`;

        const newDirectoryUri = vscode.Uri.file(newFileDirectoryPath);
        const newFileUri = vscode.Uri.file(newFilePath);

        return [newDirectoryUri, newFileUri];
    }

    private static async isDuplicateFile(newFileUri: vscode.Uri): Promise<boolean> {

        try {
            await vscode.workspace.fs.stat(newFileUri);
            await vscode.window.showErrorMessage(`File already exists: ${newFileUri.fsPath}`);

            return true;
        }
        catch {
            return false;
        }
    }

    private static async getFullNamespace(contextualDirectoryUri: vscode.Uri): Promise<string> {

        const projectFilePath = await this.getProjectFilePath(contextualDirectoryUri.fsPath);

        const projectFileUri = vscode.Uri.file(projectFilePath);

        const csProject = await csprojXmlParser.parseFromFile(projectFileUri);

        let namespace = csProject.rootNamespace;

        const newFileDirectory = contextualDirectoryUri.fsPath;

        const projectFileDirectory = path.parse(projectFileUri.fsPath).name;

        if (newFileDirectory !== projectFileDirectory) {

            const escapedSeparator = path.sep.replace(/\\/g, '\\\\');

            const pathRegex = new RegExp(escapedSeparator, 'g');

            const subNamespace =
                newFileDirectory
                    .replace(projectFileDirectory, '')
                    .replace(pathRegex, '.');

            namespace += subNamespace;
        }

        return namespace;
    }

    private static async getProjectFilePath(directoryFsPath: string): Promise<string> {

        let projectFilePath: string;

        const directoryUri = vscode.Uri.file(directoryFsPath);

        const nameAndTypeArray = await vscode.workspace.fs.readDirectory(directoryUri);

        const nameAndType = nameAndTypeArray.find(nameAndType => /\.csproj$/.test(nameAndType[0]));

        if (nameAndType) {

            projectFilePath = path.join(directoryFsPath, nameAndType[0]);

            return projectFilePath;
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(directoryFsPath));

        if (workspaceFolder?.uri.fsPath === directoryFsPath) {
            await vscode.window.showErrorMessage("You can only add an item in a C# project folder.");
        }

        projectFilePath = await this.getProjectFilePath(directoryFsPath.replace(this.filenameRegex, ''));

        return projectFilePath;
    }

    private static async populateTemplate(templateValues: ItemFileTemplate): Promise<string> {

        const templateUri = vscode.Uri.file(Config.genericTemplatePath);

        const templateFileContentsArray = await vscode.workspace.fs.readFile(templateUri);

        let template = this.textDecoder.decode(templateFileContentsArray);

        for (const [placeholder, value] of Object.entries(templateValues)) {

            const rgx = new RegExp(`%${placeholder}%`);

            template = template.replace(rgx, value);
        }

        return template;
    }

    private static async openEditor(uri: vscode.Uri): Promise<void> {

        const editor = await vscode.window.showTextDocument(uri);

        const newSelection = new vscode.Selection(
            Config.genericTemplateCursorPosition,
            Config.genericTemplateCursorPosition);

        editor.selection = newSelection;
    }
}
