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
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';

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

    // TODO: Refactor this so it's not so fucking long...
    public async handleReferences(contextualProjectUri: vscode.Uri): Promise<vscode.Uri[] | undefined> {

        const contextualProject = await this.cSharpProjectFactory.fromUri(contextualProjectUri);

        const otherWorkspaceProjectUris = await this.getWorkspaceProjectUris(contextualProjectUri);

        // TODO: Disable even having this option when this is the case in the future...
        if (otherWorkspaceProjectUris.length === 0) {

            await vscode.window.showInformationMessage('No other projects found in workspace.');

            return;
        }

        const referencedProjectPaths = contextualProject.projectReferencePaths;

        const quickPickItems = otherWorkspaceProjectUris.map(workspaceProjectUri => {

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

        // Selected Projects didn't change but Ok was clicked.
        if (!this.projectReferenceSelectionHasChanged(quickPickItems, selectedProjects)) {
            return;
        }

        const selectedProjectPaths = selectedProjects.map(p => p.uri.fsPath);

        const workspaceProjectPaths = otherWorkspaceProjectUris.map(u => u.fsPath);

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

        return selectedProjects.map(p => p.uri);
    }

    // TODO: JE - this will probably be changed??? maybe????
    // public buildProjectReferenceTree(): ProjectReferenceTreeItem {

    // }

    public async buildProjectReferenceTree(node: TreeNode<CSharpProject>): Promise<TreeNode<CSharpProject>> {

        const project = node.value;

        const nodePromises = project.projectReferencePaths.map(async path => {

            const childProject = await this.cSharpProjectFactory.fromUri(vscode.Uri.file(path));

            // let child = new TreeNode(childProject, wrapperFauxProjectNode);
            let child = new TreeNode(childProject, node);

            child = await this.buildProjectReferenceTree(child);

            node.children.push(child);
        });

        await Promise.all(nodePromises);

        // const fauxNode = new TreeNode<CSharpProject>({
        //     name: project.name,
        //     path: project.path,
        //     uri: project.uri,
        //     rootNamespace: project.rootNamespace,
        //     projectReferencePaths: [project.path],
        //     projectReferenceUris: [vscode.Uri.file(project.path)]
        // });

        // fauxNode.children = [node];

        // return fauxNode;

        return node;
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
        projectPathsToRemove: string[]): Promise<TreeNode<string>> {

        project.projectReferencePaths =
            project
                .projectReferencePaths
                .concat(projectPathsToAdd)
                .filter(x => projectPathsToRemove.indexOf(x) === -1);

        const rootNode = new TreeNode(project.path);

        rootNode.children = project.projectReferencePaths.map(p => new TreeNode(p, rootNode));

        return rootNode;
    }

    private async hasCircularReferences(node: TreeNode<string>): Promise<boolean> {

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

    private projectReferenceSelectionHasChanged(initial: CsProjFileQuickPickItem[], final: CsProjFileQuickPickItem[]): boolean {

        const initialProjectNames = initial.filter(c => c.picked).map(c => c.label);

        const finalProjectNames = final.map(c => c.label);

        if (initialProjectNames.length !== finalProjectNames.length) {
            return true;
        }

        const selectionHasChanged = !initialProjectNames.every(n => finalProjectNames.includes(n));

        return selectionHasChanged;
    }
}
