import * as vscode from 'vscode';
import * as path from 'path';
import * as csprojXmlParser from '../lib/csproj-xml-parser';
import { FileHandler } from './fileHandler';
import { CsProjFile } from './csProjFile';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { TerminalHandler } from './terminalHandler';

@injectable()
export class ProjectReferenceHandler {

    // private readonly fileHandler: FileHandler;
    private readonly terminalHandler: TerminalHandler;

    constructor(
        // @inject(TYPES.fileHandler) fileHandler: FileHandler,
        @inject(TYPES.terminalHandler) terminalHandler: TerminalHandler) {

        // this.fileHandler = fileHandler;
        this.terminalHandler = terminalHandler;
    }

    public async handleReferences(contextualProjectUri: vscode.Uri): Promise<void> {

        const workspaceProjectUris = await this.getWorkspaceProjectUris(contextualProjectUri);

        const referencedProjectPaths = await this.getReferencedProjectPaths(contextualProjectUri);

        const items = workspaceProjectUris.map(workspaceProjectUri => {

            const isSelected =
                referencedProjectPaths
                    .some(referencedProjectPath => referencedProjectPath === workspaceProjectUri.fsPath);

            return this.uriToQuickPick(workspaceProjectUri, isSelected);
        });

        const options: vscode.QuickPickOptions & { canPickMany: true } = {
            "canPickMany": true,
            "matchOnDetail": true,
            "placeHolder": 'Search for project...'
        };

        const selectedProjects = await vscode.window.showQuickPick<CsProjFile>(items, options);

        // Menu was closed
        if (!selectedProjects) { return; }

        const selectedProjectPaths = selectedProjects.map(p => p.uri.fsPath);

        const workspaceProjectPaths = workspaceProjectUris.map(u => u.fsPath);

        const pathsOfProjectsToAdd: string[] = this.getPathsOfProjectsToAdd(selectedProjectPaths, referencedProjectPaths);

        const pathsOfProjectsToRemove: string[] = this.getPathsOfProjectsToRemove(selectedProjectPaths, referencedProjectPaths, workspaceProjectPaths);

        const directoryPath = path.dirname(contextualProjectUri.fsPath);

        const circularReferences = this.getCircularReferences(pathsOfProjectsToAdd, pathsOfProjectsToRemove);

        if (circularReferences) {

            // TODO: The whole ok/cancel dialog should be built in... I should modularize this
            // TODO: Magic strings are shitty. I know.
            const circularReferenceWarningResult = await vscode.window.showWarningMessage("Test", ...['Ok', 'Cancel']);

            if (circularReferenceWarningResult !== 'Ok') {

                return;
            }

        }

        if (pathsOfProjectsToAdd.length > 0) {

            this.dotnetReferenceCommandHelper(directoryPath, 'add', pathsOfProjectsToAdd);
        }

        if (pathsOfProjectsToRemove.length > 0) {

            this.dotnetReferenceCommandHelper(directoryPath, 'remove', pathsOfProjectsToRemove);
        }

        return;
    }

    private async getWorkspaceProjectUris(contextualProjectUri: vscode.Uri): Promise<vscode.Uri[]> {

        const workspaceProjectUris = await vscode.workspace.findFiles('**/*.csproj');

        const contextualProjectUriIndex = workspaceProjectUris.findIndex(u => u.fsPath === contextualProjectUri.fsPath);

        workspaceProjectUris.splice(contextualProjectUriIndex, 1);

        return workspaceProjectUris;
    }

    private async getReferencedProjectPaths(projectUri: vscode.Uri): Promise<string[]> {

        const cSharpProject = await csprojXmlParser.parseFromFile(projectUri);

        const absolutePaths =
            cSharpProject
                .projectReferences
                .map(p => {

                    const absolutePath = this.relativePathToAbsolutePath(p, projectUri.fsPath);

                    return absolutePath;
                });

        return absolutePaths;
    }

    private uriToQuickPick(uri: vscode.Uri, picked: boolean = false): CsProjFile {

        const label = path.parse(uri.fsPath).name;

        const quickPickItem: CsProjFile = {
            label: label,
            detail: uri.fsPath,
            picked: picked,
            alwaysShow: true,
            uri: uri
        };

        return quickPickItem;
    }

    private relativePathToAbsolutePath(relativePath: string, projectPath: string): string {

        // dotnet project references use windows-style slashes.
        // This normalizes to the platform.
        relativePath = relativePath.replace(/\\/g, path.sep);

        const projectDirectoryPath = path.dirname(projectPath);

        const absolutePath = path.resolve(projectDirectoryPath, relativePath);

        return absolutePath;
    }

    private getPathsOfProjectsToAdd(
        selectedProjectPaths: string[],
        referencedProjectPaths: string[]): string[] {

        const pathsOfProjectsToAdd =
            selectedProjectPaths
                .filter(p => !referencedProjectPaths.includes(p));

        return pathsOfProjectsToAdd;
    }

    private getPathsOfProjectsToRemove(
        selectedProjectPaths: string[],
        referencedProjectPaths: string[],
        workspaceProjectPaths: string[]): string[] {

        const pathsOfProjectsToRemove =
            workspaceProjectPaths
                .filter(p => referencedProjectPaths.includes(p))
                .filter(p => !selectedProjectPaths.includes(p));

        return pathsOfProjectsToRemove;
    }

    private dotnetReferenceCommandHelper(
        directoryPath: string,
        dotnetCommand: string,
        projectPaths: string[]): void {

        // TODO: Get rid of the magic strings...

        this
            .terminalHandler
            .executeCommand(
                directoryPath,
                'dotnet',
                dotnetCommand,
                'reference',
                ...projectPaths.map(p => `"${p}"`));
    }

    // TODO: Should we be using a string/msg[] as the return?
    private getCircularReferences(
        pathsOfProjectsToAdd: string[],
        pathsOfProjectsToRemove: string[]): string[] | null {

        const circularReferenceMessages: string[] = [];

        return circularReferenceMessages;
    }
}
