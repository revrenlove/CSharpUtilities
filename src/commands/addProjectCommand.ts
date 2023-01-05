import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { Command } from './command';
import TYPES from '../types';
import { AddProjectHandler } from '../features/addProject/addProjectHandler';

@injectable()
export class AddProjectCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.addProjectCommand';

    private readonly addProjectHandler: AddProjectHandler;

    constructor(
        @inject(TYPES.addProjectHandler) addProjectHandler: AddProjectHandler
    ) {
        this.addProjectHandler = addProjectHandler;
    }

    public async execute(uri: vscode.Uri | null | undefined): Promise<void> {

        await this.addProjectHandler.addProject(uri);
    }
}
