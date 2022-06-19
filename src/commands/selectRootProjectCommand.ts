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
    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    public constructor(
        @inject(TYPES.quickPickItemHelper) quickPickItemHelper: QuickPickItemHelper,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.quickPickItemHelper = quickPickItemHelper;
        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceHandler = projectReferenceHandler;
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

        await this.projectReferenceTreeDataProvider.renderTreeTest(selectedProject);
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
}