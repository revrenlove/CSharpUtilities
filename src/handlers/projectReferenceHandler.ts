import * as vscode from 'vscode';
import * as path from 'path';
import * as parser from 'fast-xml-parser';
import { FileHandler } from './fileHandler';
import { CsProjFile } from './csProjFile';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { TerminalHandler } from './terminalHandler';

@injectable()
export class ProjectReferenceHandler {

    private readonly fileHandler: FileHandler;
    private readonly terminalHandler: TerminalHandler;

    constructor(
        @inject(TYPES.fileHandler) fileHandler: FileHandler,
        @inject(TYPES.terminalHandler) terminalHandler: TerminalHandler) {

        this.fileHandler = fileHandler;
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

        const projectsToAdd: string[] = this.getProjectsToAdd(selectedProjectPaths, referencedProjectPaths);

        const projectsToRemove: string[] = this.getProjectsToRemove(selectedProjectPaths, referencedProjectPaths, workspaceProjectPaths);

        const directoryPath = path.dirname(contextualProjectUri.fsPath);

        if (projectsToAdd.length > 0) {

            this.dotnetReferenceCommandHelper(directoryPath, 'add', projectsToAdd);
        }

        if (projectsToRemove.length > 0) {

            this.dotnetReferenceCommandHelper(directoryPath, 'remove', projectsToRemove);
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

        const PROJECT_KEY = '@_Include';

        const xml = await this.fileHandler.readFile(projectUri);
        const json = parser.parse(xml, { ignoreAttributes: false });

        let projectPaths: string[];

        type KeyedString = { [k: string]: string; };

        const projectReference: KeyedString[] | KeyedString | null = json?.Project?.ItemGroup?.ProjectReference;

        if (!projectReference) {
            projectPaths = [];
        }
        else if (Array.isArray(projectReference)) {
            projectPaths = projectReference.map((n: KeyedString) => n[PROJECT_KEY]);
        }
        else {
            projectPaths = [projectReference[PROJECT_KEY]];
        }

        const absoluteProjectPaths =
            projectPaths
                .map(p => this.relativePathToAbsolutePath(p, projectUri.fsPath));

        return absoluteProjectPaths;
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

    private getProjectsToAdd(
        selectedProjectPaths: string[],
        referencedProjectPaths: string[]): string[] {

        const projectsToAdd =
            selectedProjectPaths
                .filter(p => !referencedProjectPaths.includes(p));

        return projectsToAdd;
    }

    private getProjectsToRemove(
        selectedProjectPaths: string[],
        referencedProjectPaths: string[],
        workspaceProjectPaths: string[]): string[] {

        const projectsToRemove =
            workspaceProjectPaths
                .filter(p => referencedProjectPaths.includes(p))
                .filter(p => !selectedProjectPaths.includes(p));

        return projectsToRemove;
    }

    private dotnetReferenceCommandHelper(directoryPath: string, dotnetCommand: string, projectPaths: string[]) {

        this
            .terminalHandler
            .executeCommand(
                directoryPath,
                'dotnet',
                dotnetCommand,
                'reference',
                ...projectPaths.map(p => `"${p}"`));
    }
}
