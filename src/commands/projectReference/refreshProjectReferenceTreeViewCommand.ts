import * as vscode from 'vscode';
import { inject, injectable } from "inversify";
import { ProjectReferenceTreeDataProvider } from "../../features/projectReferenceTree/projectReferenceTreeDataProvider";
import TYPES from "../../types";
import { Command } from "../command";

@injectable()
export class RefreshProjectReferenceTreeViewCommand implements Command {

    private static readonly _id: string = 'c-sharp-utilities.refreshProjectReferenceTreeViewCommand';

    public readonly id: string = RefreshProjectReferenceTreeViewCommand._id;

    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    constructor(@inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
    }

    public async execute(): Promise<any> {

        await this.projectReferenceTreeDataProvider.renderTree();
    }

    public static async execute(): Promise<any> {
        await vscode.commands.executeCommand(this._id);
    }
}