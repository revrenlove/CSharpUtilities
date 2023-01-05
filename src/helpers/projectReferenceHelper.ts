import * as vscode from 'vscode';
import TYPES from "../types";
import { inject, injectable } from 'inversify';
import { CSharpProjectFactory } from '../handlers/cSharpProjectFactory';
import { TerminalHandler } from '../handlers/terminalHandler';

@injectable()
export class ProjectReferenceHelper {

    private readonly cSharpProjectFactory: CSharpProjectFactory;
    private readonly terminalHandler: TerminalHandler;

    constructor(
        @inject(TYPES.cSharpProjectFactory) cSharpProjectFactory: CSharpProjectFactory,
        @inject(TYPES.terminalHandler) terminalHandler: TerminalHandler) {

        this.terminalHandler = terminalHandler;
        this.cSharpProjectFactory = cSharpProjectFactory;
    }

    public removeReference(affectedProjectDirectory: string, paths: string[]): void;
    public removeReference(affectedProjectDirectory: string, ...paths: string[]): void;
    public removeReference(affectedProjectDirectory: string, paths: string | string[]): void {

        if (typeof paths === 'string') {
            paths = [paths];
        }

        this.dotnetReferenceCommandHelper(affectedProjectDirectory, 'remove', paths);
    }

    public addReference(affectedProjectDirectory: string, paths: string[]): void;
    public addReference(affectedProjectDirectory: string, ...paths: string[]): void;
    public addReference(affectedProjectDirectory: string, paths: string | string[]): void {

        if (typeof paths === 'string') {
            paths = [paths];
        }

        this.dotnetReferenceCommandHelper(affectedProjectDirectory, 'add', paths);
    }

    public async referencesHaveBeenUpdated(projectUri: vscode.Uri, referencedProjectsUris: vscode.Uri[]): Promise<boolean> {

        try {
            const project = await this.cSharpProjectFactory.resolve(projectUri);

            if (project.projectReferenceUris.length !== referencedProjectsUris.length) {
                return false;
            }

            const hasBeenUpdated = project.projectReferenceUris.every(p => referencedProjectsUris.some(r => r.fsPath === p.fsPath));

            return hasBeenUpdated;
        }
        // This is the only way - when trying to load the file,
        // it will throw an exception if it can't
        catch {
            return false;
        }
    }

    private dotnetReferenceCommandHelper(
        directoryPath: string,
        dotnetCommand: string,
        projectPaths: string[]): void {

        const command = 'dotnet';
        const param = 'reference';

        this
            .terminalHandler
            .executeCommand(
                directoryPath,
                command,
                dotnetCommand,
                param,
                ...projectPaths.map(p => `"${p}"`));
    }
}
