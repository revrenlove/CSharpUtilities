import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';

@injectable()
export class ManageProjectReferencesCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.manageProjectReferences';

    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;
    private readonly projectReferenceHelper: ProjectReferenceHelper;
    private readonly cSharpProjectFactory: CSharpProjectFactory;

    constructor(
        @inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler,
        @inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider,
        @inject(TYPES.projectReferenceHelper) projectReferenceHelper: ProjectReferenceHelper,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory) {

        this.projectReferenceHandler = projectReferenceHandler;
        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
        this.projectReferenceHelper = projectReferenceHelper;
        this.cSharpProjectFactory = cSharpProjectFactory;
    }

    public async execute(resource: vscode.Uri | ProjectReferenceTreeItem): Promise<void> {

        let uri: vscode.Uri;

        if (resource instanceof vscode.Uri) {
            uri = resource;
        }
        else { // if (resource instanceof ProjectReferenceTreeItem)
            uri = resource.cSharpProject.uri;
        }

        // TODO: Figure out exactly what this is... like what it should be named...
        const projectReferenceUris = await this.projectReferenceHandler.handleReferences(uri);

        if (!projectReferenceUris) {
            return;
        }

        if (!this.projectReferenceTreeDataProvider.rootElement) {
            return;
        }

        this.refreshProjectReferenceTree(uri, projectReferenceUris);
    }

    // TODO: Set max retry
    private refreshProjectReferenceTree(uri: vscode.Uri, projectReferenceUris: vscode.Uri[]): void {
        const updateCheckTimeout = setInterval(async (): Promise<void> => {

            if (!this.projectReferenceTreeDataProvider.rootElement) {
                clearInterval(updateCheckTimeout);
                return;
            }

            const referencesHaveBeenUpdated =
                await
                    this
                        .projectReferenceHelper
                        .referencesHaveBeenUpdated(uri, projectReferenceUris);

            if (referencesHaveBeenUpdated) {

                clearInterval(updateCheckTimeout);

                // TODO: we shouldn't have to reinitialize this project var, right?
                const project = await this.cSharpProjectFactory.resolve(this.projectReferenceTreeDataProvider.rootElement.cSharpProject.uri);

                await this.projectReferenceTreeDataProvider.renderTree(project);
            }
        }, 1000);
    }
}