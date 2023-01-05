import * as vscode from 'vscode';
import { inject, injectable } from "inversify";
import { Command } from "./command";
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import TYPES from '../types';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import path = require('path');
import { CSharpProject } from '../handlers/cSharpProject';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';

// TODO: Make this lean... pull all the functionality out to it's own thing in a feature folder...
@injectable()
export class RemoveProjectCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.removeProjectCommand';

    private readonly cSharpProjectFactory: CSharpProjectFactory;
    private readonly projectReferenceHelper: ProjectReferenceHelper;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    constructor(
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceHelper = projectReferenceHelper;
        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
    }

    public async execute(resource: vscode.Uri | ProjectReferenceTreeItem): Promise<void> {

        const deletedProject = await this.cSharpProjectFactory.resolve(resource);

        if (!await this.promptForConfirmation(deletedProject.name)) {
            return;
        }

        const dependantProjects = await this.getDependantProjects(deletedProject.path);

        // Remove all references
        dependantProjects.forEach(p => {
            this.projectReferenceHelper.removeReference(path.dirname(p.path), deletedProject.path);
        });

        if (!this.projectReferenceTreeDataProvider.rootElement) {
            return;
        }

        const updateCheckTimeout = setInterval(async (): Promise<void> => {

            const referencesHaveBeenUpdated = await this.referencesHaveBeenUpdated(dependantProjects, deletedProject);

            if (referencesHaveBeenUpdated) {

                clearInterval(updateCheckTimeout);

                let project = this.projectReferenceTreeDataProvider.rootElement?.cSharpProject;

                if (!project) {
                    return;
                }

                project = await this.cSharpProjectFactory.resolve(project.uri);

                await this.projectReferenceTreeDataProvider.renderTree(project);
            }

        }, 1000);

        await this.deleteProjectFolder(deletedProject.path);
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

    private async referencesHaveBeenUpdated(projects: CSharpProject[], deletedProject: CSharpProject): Promise<boolean> {

        for (const project of projects) {

            const hasDeletedProject = (await this.cSharpProjectFactory.resolve(project.uri)).projectReferencePaths.includes(deletedProject.path);

            if (hasDeletedProject) {

                return false;
            }
        }

        return true;
    }
}
