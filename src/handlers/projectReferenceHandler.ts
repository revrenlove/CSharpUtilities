import * as vscode from 'vscode';
import * as path from 'path';
import TYPES from '../types';
import { CsProjFileQuickPickItem } from './csProjFileQuickPickItem';
import { inject, injectable } from 'inversify';
import { TreeNode } from '../framework/treeNode';
import { CSharpProject } from './cSharpProject';
import { CSharpProjectFactory } from './cSharpProjectFactory';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';

@injectable()
export class ProjectReferenceHandler {

    private readonly projectReferenceHelper: ProjectReferenceHelper;
    private readonly cSharpProjectFactory: CSharpProjectFactory;

    public constructor(
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper) {

        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceHelper = projectReferenceHelper;
    }

    // TODO: Refactor this so it's not so fucking long...
    // TODO: Also... What does "handleReferences" mean? In what context? Should be renamed...
    // TODO: We need to handle the case when there is are incompatible frameworks...
    public async handleReferences(contextualProjectUri: vscode.Uri): Promise<vscode.Uri[] | undefined> {

        const contextualProject = await this.cSharpProjectFactory.resolve(contextualProjectUri);

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

            this.projectReferenceHelper.addReference(directoryPath, pathsOfProjectsToAdd);
        }

        if (pathsOfProjectsToRemove.length > 0) {

            this.projectReferenceHelper.removeReference(directoryPath, pathsOfProjectsToRemove);
        }

        return selectedProjects.map(p => p.uri);
    }

    public async buildProjectReferenceTree(node: TreeNode<CSharpProject>): Promise<TreeNode<CSharpProject>> {

        const project = node.value;

        const nodePromises = project.projectReferencePaths.map(async path => {

            const childProject = await this.cSharpProjectFactory.resolve(vscode.Uri.file(path));

            // let child = new TreeNode(childProject, wrapperFauxProjectNode);
            let child = new TreeNode(childProject, node);

            child = await this.buildProjectReferenceTree(child);

            node.children.push(child);
        });

        await Promise.all(nodePromises);

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

            const project = await this.cSharpProjectFactory.resolve(vscode.Uri.file(node.children[i].value));

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
