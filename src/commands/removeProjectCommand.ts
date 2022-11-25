import * as vscode from 'vscode';
import { inject, injectable } from "inversify";
import { Command } from "./command";
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import TYPES from '../types';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import path = require('path');
import { RefreshProjectReferenceTreeViewCommand } from './projectReference/refreshProjectReferenceTreeViewCommand';
import { CSharpProject } from '../handlers/cSharpProject';

@injectable()
export class RemoveProjectCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.removeProjectCommand';

    private readonly cSharpProjectFactory: CSharpProjectFactory;
    private readonly projectReferenceHelper: ProjectReferenceHelper;

    constructor(
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper) {

        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceHelper = projectReferenceHelper;
    }

    public async execute(resource: vscode.Uri | ProjectReferenceTreeItem): Promise<void> {

        const project = await this.cSharpProjectFactory.resolve(resource);

        if (!await this.promptForConfirmation(project.name)) {
            return;
        }

        const dependantProjects = await this.getDependantProjects(project.path);

        // Remove all references
        dependantProjects.forEach(p => {
            this.projectReferenceHelper.removeReference(path.dirname(p.path), project.path);
        });

        // Refresh tree (if applicable)
        // if (resource instanceof ProjectReferenceTreeItem) {

        await RefreshProjectReferenceTreeViewCommand.execute();
        // }

        await this.deleteProjectFolder(project.path);
    }

    private async getDependantProjects(projectPath: string): Promise<CSharpProject[]> {
        const projectUris =
            await
                vscode
                    .workspace
                    .findFiles('**/*.csproj');

        const projects = await Promise.all(projectUris.map(async p => await this.cSharpProjectFactory.resolve(p)));

        const dependantProjects = projects.filter(p => p.projectReferenceUris.some(u => u.fsPath === projectPath));

        return dependantProjects;
    }

    private async deleteProjectFolder(filePath: string): Promise<void> {

        const projectDirectory = path.dirname(filePath);
        const projectDirectoryUri = vscode.Uri.file(projectDirectory);

        const directoryContents = await vscode.workspace.fs.readDirectory(projectDirectoryUri);

        const hasFolders = directoryContents.some((nameAndType) => nameAndType[1] === vscode.FileType.Directory);

        if (hasFolders) {
            await vscode.workspace.fs.delete(projectDirectoryUri, {
                recursive: true,
                useTrash: true,
            });

            return;
        }

        directoryContents
            .map(z => vscode.Uri.parse(z[0]))
            .forEach(async (uri) => {
                await vscode.workspace.fs.delete(uri, { useTrash: true });
            });
    }

    private async promptForConfirmation(projectName: string): Promise<boolean> {

        const message = `Are you sure you wish to remove the following project: "${projectName}"?`;

        const messageOptions: vscode.MessageOptions = {
            modal: true,
            detail: 'IMPORTANT! This will place all contents of this folder in the trash.'
        };

        const messageItems: vscode.MessageItem[] = [
            {
                title: 'Ok',
                isCloseAffordance: false
            }, {
                title: 'Cancel',
                isCloseAffordance: true
            }
        ];

        const clickedItem = await vscode.window.showWarningMessage(message, messageOptions, ...messageItems);

        if (clickedItem?.title === 'Ok') {
            return true;
        }

        return false;
    }
}