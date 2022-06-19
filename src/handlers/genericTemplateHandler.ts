import * as vscode from 'vscode';
import * as path from 'path';
import TYPES from '../types';
import { Config } from '../config';
import { ItemFileTemplate } from '../templates/itemFileTemplate';
import { TemplateType } from "../templates/templateType";
import { Util } from '../util';
import { inject, injectable } from 'inversify';
import { FileHandler } from './fileHandler';
import { CSharpProjectFactory } from './cSharpProjectFactory';

@injectable()
export class GenericTemplateHandler {

    private readonly filenameRegex = new RegExp(`\\${path.sep}[^\\${path.sep}]+$`);

    private fileHandler: FileHandler;
    private cSharpProjectFactory: CSharpProjectFactory;

    public constructor(
        @inject(TYPES.fileHandler) fileHandler: FileHandler,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory) {

        this.fileHandler = fileHandler;
        this.cSharpProjectFactory = cSharpProjectFactory;
    }

    public async generate(templateType: TemplateType, contextualUri: vscode.Uri): Promise<void> {

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

        await this.fileHandler.writeFile(newFileUris[1], fileContentsString);

        await this.openEditor(newFileUris[1]);
    }

    private async getObjectName(templateType: TemplateType): Promise<string | undefined> {

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

    private sanitizeName(objectName: string): string {

        const csExtRgx = /\.cs$/;

        if (csExtRgx.test(objectName)) {
            objectName = objectName.replace(csExtRgx, '');
        }

        return objectName;
    }

    private async getNewFileUris(contextualUri: vscode.Uri, objectName: string)
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

    private async isDuplicateFile(newFileUri: vscode.Uri): Promise<boolean> {

        try {
            await vscode.workspace.fs.stat(newFileUri);
            await vscode.window.showErrorMessage(`File already exists: ${newFileUri.fsPath}`);

            return true;
        }
        catch {
            return false;
        }
    }

    private async getFullNamespace(contextualDirectoryUri: vscode.Uri): Promise<string> {

        const projectFilePath = await this.getProjectFilePath(contextualDirectoryUri.fsPath);

        const projectFileUri = vscode.Uri.file(projectFilePath);

        const cSharpProject = await this.cSharpProjectFactory.fromUriAsync(projectFileUri);

        let namespace = cSharpProject.rootNamespace;

        const newFileDirectory = contextualDirectoryUri.fsPath;

        const projectFileDirectory = path.parse(projectFilePath).dir;

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

    private async getProjectFilePath(directoryFsPath: string): Promise<string> {

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

    private async populateTemplate(templateValues: ItemFileTemplate): Promise<string> {

        const templateUri = vscode.Uri.file(Config.genericTemplatePath);

        let template = await this.fileHandler.readFile(templateUri);

        for (const [placeholder, value] of Object.entries(templateValues)) {

            const rgx = new RegExp(`%${placeholder}%`);

            template = template.replace(rgx, value);
        }

        return template;
    }

    private async openEditor(uri: vscode.Uri): Promise<void> {

        const editor = await vscode.window.showTextDocument(uri);

        const newSelection = new vscode.Selection(
            Config.genericTemplateCursorPosition,
            Config.genericTemplateCursorPosition);

        editor.selection = newSelection;
    }
}
