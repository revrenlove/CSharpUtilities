import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';
import { TreeNode } from '../framework/treeNode';
import { CSharpProject } from '../handlers/cSharpProject';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';

@injectable()
export class ManageProjectReferencesCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.manageProjectReferences';

    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly cSharpProjectFactory: CSharpProjectFactory;

    constructor(
        @inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler,
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory) {

        this.projectReferenceHandler = projectReferenceHandler;
        this.cSharpProjectFactory = cSharpProjectFactory;
    }

    public async execute(resource: vscode.Uri | TreeNode<CSharpProject>): Promise<void> {

        let uri: vscode.Uri;

        if (resource instanceof vscode.Uri) {
            uri = resource;
        }
        else { // if (resource instanceof TreeNode)
            uri = resource.value.uri;
        }

        const selectedProjectUris = await this.projectReferenceHandler.handleReferences(uri);

        if (!selectedProjectUris) {
            return;
        }

        const updateCheckTimeout = setInterval(async (): Promise<void> => {

            const referencesHaveBeenUpdated = await this.referencesHaveBeenUpdated(uri, selectedProjectUris);

            if (referencesHaveBeenUpdated) {

                clearInterval(updateCheckTimeout);

                // TODO: figure out how to not have this be a magic string...
                await vscode.commands.executeCommand('c-sharp-utilities.refreshProjectReferenceTreeViewCommand');
            }
        }, 1000);
    }

    private async referencesHaveBeenUpdated(projectUri: vscode.Uri, referencedProjectsUris: vscode.Uri[]): Promise<boolean> {

        try {
            const project = await this.cSharpProjectFactory.fromUri(projectUri);

            if (project.projectReferenceUris.length !== referencedProjectsUris.length) {
                return false;
            }

            const hasBeenUpdated = project.projectReferenceUris.every(p => referencedProjectsUris.some(r => r.fsPath === p.fsPath));

            return hasBeenUpdated;
        }
        // Yeah, yeah, I know...
        catch {
            return false;
        }
    }
}