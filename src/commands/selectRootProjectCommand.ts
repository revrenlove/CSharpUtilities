import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Command } from './command';
import { QuickPickItemHelper } from '../helpers/quickPickItemHelper';
import { CSharpProject } from '../handlers/cSharpProject';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import { TreeNode } from '../framework/treeNode';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';

@injectable()
export class SelectRootProjectCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.selectRootProject';

    private readonly quickPickItemHelper: QuickPickItemHelper;
    private readonly cSharpProjectFactory: CSharpProjectFactory;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    public constructor(
        @inject(TYPES.quickPickItemHelper) quickPickItemHelper: QuickPickItemHelper,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.quickPickItemHelper = quickPickItemHelper;
        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
    }

    public async execute(): Promise<void> {

        const workspaceProjects: CSharpProject[] = await this.getWorkspaceProjects();

        const quickPickItems = workspaceProjects.map(project => this.quickPickItemHelper.cSharpProjectToQuickPick(project));

        const quickPickOptions: vscode.QuickPickOptions & { canPickMany: false } = {
            "canPickMany": false,
            "matchOnDetail": true,
            "placeHolder": 'Search for project...'
        };

        const selectedQuickPickItem = await vscode.window.showQuickPick(quickPickItems, quickPickOptions);

        const selectedProject = workspaceProjects.find(project => project.uri === selectedQuickPickItem?.uri);

        if (selectedProject === undefined) {
            return;
        }

        const root = await this.buildProjectReferenceTree(new TreeNode(selectedProject));

        const fauxNode = new TreeNode<CSharpProject>({
            name: selectedProject.name,
            path: selectedProject.path,
            uri: selectedProject.uri,
            rootNamespace: selectedProject.rootNamespace,
            projectReferencePaths: [selectedProject.path],
            projectReferenceUris: [vscode.Uri.file(selectedProject.path)]
        });

        fauxNode.children = [root];

        // TODO: Render tree...
        this.renderTree(fauxNode);
    }

    public async executeXXX(): Promise<void> {
        const workspaceProjects: CSharpProject[] = await this.getWorkspaceProjects();

        const quickPickItems = workspaceProjects.map(project => this.quickPickItemHelper.cSharpProjectToQuickPick(project));

        const quickPickOptions: vscode.QuickPickOptions & { canPickMany: true } = {
            "canPickMany": true,
            "matchOnDetail": true,
            "placeHolder": 'Search for project...'
        };

        const selectedQuickPickItems = await vscode.window.showQuickPick(quickPickItems, quickPickOptions);

        if (selectedQuickPickItems === undefined) {
            return;
        }

        const selectedProjects = workspaceProjects.filter(p => selectedQuickPickItems.map(item => item.uri).some(u => u === p.uri));

        if (selectedQuickPickItems === undefined || selectedProjects.length === 0) {
            return;
        }
    }

    // TODO: Eventually this will be refactored to be used in the `ProjectReferenceHandler` as well...
    private async getWorkspaceProjects(): Promise<CSharpProject[]> {

        const workspaceProjectUris = await vscode.workspace.findFiles('**/*.csproj');

        const mapPromises = workspaceProjectUris.map(async (uri): Promise<CSharpProject> => {

            const cSharpProject = this.cSharpProjectFactory.fromUri(uri);

            return cSharpProject;
        });

        const cSharpProjects = await Promise.all(mapPromises);

        return cSharpProjects;
    }

    // TODO: This will probably get moved to another 
    // class since it wil probably need to be used by the `ProjectReferenceHandler`
    private async buildProjectReferenceTree(node: TreeNode<CSharpProject>): Promise<TreeNode<CSharpProject>> {

        // const wrapperFauxProjectNode = new TreeNode<CSharpProject>({
        //     name: node.value.name,
        //     uri: node.value.uri,
        //     path: node.value.path,
        //     rootNamespace: node.value.rootNamespace,
        //     projectReferencePaths: [node.value.path]
        // });

        const project = node.value;
        // const project = wrapperFauxProjectNode.value;

        const nodePromises = project.projectReferencePaths.map(async path => {

            const childProject = await this.cSharpProjectFactory.fromUri(vscode.Uri.file(path));

            // let child = new TreeNode(childProject, wrapperFauxProjectNode);
            let child = new TreeNode(childProject, node);

            child = await this.buildProjectReferenceTree(child);

            node.children.push(child);
        });

        await Promise.all(nodePromises);

        // // Wrap node...
        // const wrapperFauxProject = new TreeNode<CSharpProject>({
        //     name: node.value.name,
        //     uri: node.value.uri,
        //     path: node.value.path,
        //     rootNamespace: node.value.rootNamespace,
        //     projectReferencePaths: [node.value.path]
        // });

        // x.children = [node];

        // node.parent = x;

        return node;
    }

    private renderTree(node: TreeNode<CSharpProject>): void {

        const treeItem = new ProjectReferenceTreeItem(node);

        this.projectReferenceTreeDataProvider.refresh(treeItem);

        const treeView = vscode.window.createTreeView('projectReferences', {
            treeDataProvider: this.projectReferenceTreeDataProvider,
            showCollapseAll: true
        });

        treeView.title = node.value.name;
    }
}