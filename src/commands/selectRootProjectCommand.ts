import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Command } from './command';
import { CSharpProject } from '../handlers/cSharpProject';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';
import { CsProjFileQuickPickItem } from '../handlers/csProjFileQuickPickItem';

@injectable()
export class SelectRootProjectCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.selectRootProject';

    private readonly cSharpProjectFactory: CSharpProjectFactory;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    public constructor(
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.cSharpProjectFactory = cSharpProjectFactory;
        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
    }

    public async execute(): Promise<void> {

        const workspaceProjects: CSharpProject[] = await this.getWorkspaceProjects();

        const quickPickItems = workspaceProjects.map(project => this.cSharpProjectToQuickPick(project));

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

        await this.projectReferenceTreeDataProvider.renderTree(selectedProject);
    }

    // TODO: Eventually this will be refactored to be used in the `ProjectReferenceHandler` as well...
    private async getWorkspaceProjects(): Promise<CSharpProject[]> {

        const workspaceProjectUris = await vscode.workspace.findFiles('**/*.csproj');

        const mapPromises = workspaceProjectUris.map(async (uri): Promise<CSharpProject> => {

            const cSharpProject = this.cSharpProjectFactory.resolve(uri);

            return cSharpProject;
        });

        const cSharpProjects = await Promise.all(mapPromises);

        return cSharpProjects;
    }

    private cSharpProjectToQuickPick(project: CSharpProject, picked: boolean = false): CsProjFileQuickPickItem {

        const quickPickItem: CsProjFileQuickPickItem = {
            label: project.name,
            detail: project.path,
            picked: picked,
            alwaysShow: true,
            uri: project.uri,
        };

        return quickPickItem;
    }
}