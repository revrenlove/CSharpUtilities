import * as vscode from 'vscode';
import * as path from 'path';
import TYPES from '../types';
import { CsProjFileQuickPickItem } from './csProjFileQuickPickItem';
import { inject, injectable } from 'inversify';
import { TerminalHandler } from './terminalHandler';
import { Util } from '../util';
import { TreeNode } from '../framework/treeNode';
import { CSharpProject } from './cSharpProject';
import { CSharpProjectFactory } from './cSharpProjectFactory';

@injectable()
export class ProjectReferenceHandler {

    private readonly terminalHandler: TerminalHandler;
    private readonly cSharpProjectFactory: CSharpProjectFactory;

    public constructor(
        @inject(TYPES.terminalHandler) terminalHandler: TerminalHandler,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory) {

        this.terminalHandler = terminalHandler;
        this.cSharpProjectFactory = cSharpProjectFactory;
    }

    public async handleReferences(contextualProjectUri: vscode.Uri): Promise<void> {

        const contextualProject = await this.cSharpProjectFactory.fromUri(contextualProjectUri);

        const workspaceProjectUris = await this.getWorkspaceProjectUris(contextualProjectUri);

        const referencedProjectPaths = contextualProject.projectReferencePaths;

        const quickPickItems = workspaceProjectUris.map(workspaceProjectUri => {

            const isSelected =
                referencedProjectPaths
                    .some(referencedProjectPath => referencedProjectPath === workspaceProjectUri.fsPath);

            return this.uriToQuickPick(workspaceProjectUri, isSelected);
        });

        const quickPickOptions: vscode.QuickPickOptions & { canPickMany: true } = {
            "canPickMany": true,
            "matchOnDetail": true,
            "placeHolder": 'Search for project...'
        };

        const selectedProjects = await vscode.window.showQuickPick<CsProjFileQuickPickItem>(quickPickItems, quickPickOptions);

        // Menu was closed
        if (!selectedProjects) {
            return;
        }

        const selectedProjectPaths = selectedProjects.map(p => p.uri.fsPath);

        const workspaceProjectPaths = workspaceProjectUris.map(u => u.fsPath);

        const pathsOfProjectsToAdd: string[] = this.getPathsOfProjectsToAdd(selectedProjectPaths, referencedProjectPaths);

        const pathsOfProjectsToRemove: string[] = this.getPathsOfProjectsToRemove(selectedProjectPaths, referencedProjectPaths, workspaceProjectPaths);

        const directoryPath = path.dirname(contextualProjectUri.fsPath);

        const rootTreeNode = await this.getRootTreeNode(contextualProject, pathsOfProjectsToAdd, pathsOfProjectsToRemove);

        const hasCircularReferences = await this.hasCircularReferences(rootTreeNode);

        if (hasCircularReferences) {

            const msg = 'This would create circular dependencies. Operation cancelled.';

            await vscode.window.showErrorMessage(msg);

            return;
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

    private uriToQuickPick(uri: vscode.Uri, picked: boolean = false): CsProjFileQuickPickItem {

        const label = path.parse(uri.fsPath).name;

        const quickPickItem: CsProjFileQuickPickItem = {
            label: label,
            detail: uri.fsPath,
            picked: picked,
            alwaysShow: true,
            uri: uri
        };

        return quickPickItem;
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

        const command = 'dotnet';
        const param = 'reference';

        this
            .terminalHandler
            .executeCommand(
                directoryPath,
                command,
                dotnetCommand,
                param,
                ...projectPaths.map(p => `"${p}"`));
    }

    // TODO: Eventually we need to display which projects are the culprits... That's a new ticket...
    private async getRootTreeNode(
        project: CSharpProject,
        projectPathsToAdd: string[],
        projectPathsToRemove: string[]): Promise<TreeNode> {

        project.projectReferencePaths =
            project
                .projectReferencePaths
                .concat(projectPathsToAdd)
                .filter(x => projectPathsToRemove.indexOf(x) === -1);

        const rootNode = new TreeNode(project.path);

        rootNode.children = project.projectReferencePaths.map(p => new TreeNode(p, rootNode));

        return rootNode;
    }

    private async hasCircularReferences(node: TreeNode): Promise<Boolean> {

        if (node.children.some(n => n.isCircular())) {
            return true;
        }

        for (let i = 0; i < node.children.length; i++) {

            const project = await this.cSharpProjectFactory.fromUri(vscode.Uri.file(node.children[i].value));

            node.children[i].children =
                project
                    .projectReferencePaths
                    .map(p => new TreeNode(p, node.children[i]));

            if (await this.hasCircularReferences(node.children[i])) {
                return true;
            }
        }

        return false;
    }
}
