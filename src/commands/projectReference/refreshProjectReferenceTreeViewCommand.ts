// import { Command } from "vscode";

import { inject, injectable } from "inversify";
import { ProjectReferenceTreeDataProvider } from "../../features/projectReferenceTree/projectReferenceTreeDataProvider";
import TYPES from "../../types";
import { Command } from "../command";

@injectable()
export class RefreshProjectReferenceTreeViewCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.refreshProjectReferenceTreeViewCommand';

    private readonly projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider;

    constructor(@inject(TYPES.projectReferenceTreeDataProvider) projectReferenceTreeDataProvider: ProjectReferenceTreeDataProvider) {

        this.projectReferenceTreeDataProvider = projectReferenceTreeDataProvider;
    }

    // TODO: May need to be async...
    public execute(): any {

        this.projectReferenceTreeDataProvider.refresh();
    }
}