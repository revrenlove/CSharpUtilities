import * as vscode from 'vscode';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ProjectReferenceHandler } from '../handlers/projectReferenceHandler';
import { Command } from './command';

@injectable()
export class ManageProjectReferencesCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.manageProjectReferences';

    private readonly projectReferenceHandler: ProjectReferenceHandler;

    constructor(@inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler) {

        this.projectReferenceHandler = projectReferenceHandler;
    }

    public async execute(uri: vscode.Uri): Promise<void> {

        await this.projectReferenceHandler.handleReferences(uri);
    }
}