import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { RefreshProjectReferenceTreeViewCommand } from './projectReference/refreshProjectReferenceTreeViewCommand';

@injectable()
export class ManageProjectReferencesCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.manageProjectReferences';

    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;
    private readonly projectReferenceHelper: ProjectReferenceHelper;

    constructor(
        @inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper) {

        this.projectReferenceHandler = projectReferenceHandler;
        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
        this.projectReferenceHelper = projectReferenceHelper;
    }

    public async execute(resource: vscode.Uri | ProjectReferenceTreeItem): Promise<void> {

        let isFromTreeView: boolean = true;
        let uri: vscode.Uri;

        if (resource instanceof vscode.Uri) {
            uri = resource;
            isFromTreeView = false;
        }
        else { // if (resource instanceof ProjectReferenceTreeItem)
            uri = resource.cSharpProject.uri;
        }

        const selectedProjectUris = await this.projectReferenceHandler.handleReferences(uri);

        if (!selectedProjectUris || !isFromTreeView) {
            return;
        }

        const updateCheckTimeout = setInterval(async (): Promise<void> => {

            const referencesHaveBeenUpdated =
                await
                    this
                        .projectReferenceHelper
                        .referencesHaveBeenUpdated(uri, selectedProjectUris);

            if (referencesHaveBeenUpdated) {

                clearInterval(updateCheckTimeout);

                // TODO: we shouldn't have to reinitialize this project var, right?
                const project = await this.cSharpProjectFactory.fromUriAsync(uri);

                await this.projectReferenceTreeDataProvider.renderTree(project);
            }
        }, 1000);
    }
}