import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';
import { ProjectReferenceTreeItem } from '../features/projectReferenceTree/projectReferenceTreeItem';
import { ProjectReferenceTreeDataProvider } from '../features/projectReferenceTree/projectReferenceTreeDataProvider';
import { ProjectReferenceHelper } from '../helpers/projectReferenceHelper';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import { Util } from '../util';

// TODO: Make this lean... pull all the functionality out to it's own thing in a feature folder...
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

    private refreshProjectReferenceTree(uri: vscode.Uri, projectReferenceUris: vscode.Uri[]): void {

        Util.setInterval(async (): Promise<boolean> => {

            if (!this.projectReferenceTreeDataProvider.rootElement) {
                return false;
            }

            const referencesHaveBeenUpdated =
                await
                    this
                        .projectReferenceHelper
                        .referencesHaveBeenUpdated(uri, projectReferenceUris);

            if (referencesHaveBeenUpdated) {
                // TODO: we shouldn't have to reinitialize this project var, right?
                const project = await this.cSharpProjectFactory.resolve(this.projectReferenceTreeDataProvider.rootElement.cSharpProject.uri);

                await this.projectReferenceTreeDataProvider.renderTree(project);

                return true;
            }

            return false;
        }, 'Unable to verify references were updated. Check the `dotnet` terminal for details.');
    }
}
