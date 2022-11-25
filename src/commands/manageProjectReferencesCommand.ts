import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { RefreshProjectReferenceTreeViewCommand } from './projectReference/refreshProjectReferenceTreeViewCommand';

@injectable()
export class ManageProjectReferencesCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.manageProjectReferences';

    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly projectReferenceHelper: ProjectReferenceHelper;

    constructor(
        @inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper) {

        this.projectReferenceHandler = projectReferenceHandler;
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

                await RefreshProjectReferenceTreeViewCommand.execute();
            }
        }, 1000);
    }
}