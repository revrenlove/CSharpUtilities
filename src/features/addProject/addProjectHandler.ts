import * as vscode from 'vscode';
import { inject, injectable } from "inversify";
import { WorkspaceQuickPickItem } from './workspaceQuickPickItem';
import { ProjectTemplate } from './projectTemplate';
import { ProjectTemplateHelper } from '../../helpers/projectTemplateHelper';
import { Util } from '../../util';
import TYPES from '../../types';
import { TerminalHandler } from '../../handlers/terminalHandler';

// TODO: Make sure this is actually clean...
@injectable()
export class AddProjectHandler {

    private readonly terminalHandler: TerminalHandler;

    constructor(
        @inject(TYPES.terminalHandler) terminalHandler: TerminalHandler
    ) {
        this.terminalHandler = terminalHandler;
    }

    public async addProject(uri: vscode.Uri | null | undefined): Promise<void> {

        if (!await this.validateWorkspace() ||
            // So the editor won't bark about possible nulls...
            !vscode.workspace.workspaceFolders) {
            return;
        }

        let commandPath: string;

        let currentStep = 0,
            totalStepQty = 2;

        if (uri) {
            commandPath = uri.fsPath;
        }
        else if (vscode.workspace.workspaceFolders.length === 1) {
            commandPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        else {
            currentStep++;
            totalStepQty++;

            const workspaceFolder = await this.getWorkspaceFolder(currentStep, totalStepQty);

            if (!workspaceFolder) {
                return;
            }

            commandPath = workspaceFolder.uri.fsPath;
        }

        currentStep++;
        const projectTemplate = await this.getProjectTemplate(currentStep, totalStepQty);
        if (!projectTemplate) {
            return;
        }

        currentStep++;
        const projectName = await this.getProjectName(currentStep, totalStepQty);
        if (!projectName) {
            return;
        }

        const command = `dotnet new ${projectTemplate.shortName} -n ${projectName}`;

        if (!command) {
            return;
        }

        this.terminalHandler.executeCommand(commandPath, command);

        Util.setInterval(async (): Promise<boolean> => {
            let projectHasBeenAdded: boolean;

            const path = `${commandPath}/${projectName}/${projectName}.csproj`;

            const uri = vscode.Uri.file(path);

            try {
                await vscode.workspace.fs.stat(uri);

                projectHasBeenAdded = true;
            }
            catch {
                projectHasBeenAdded = false;
            }

            if (projectHasBeenAdded) {
                await vscode.window.showInformationMessage(`${projectName} has been added.`);

                return true;
            }

            return false;
        }, `Unable to verify ${projectName} was added.`);
    }

    private async validateWorkspace(): Promise<boolean> {

        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            await vscode.window.showErrorMessage('You must have a workspace open to add a project.');

            return false;
        }

        return true;
    }

    private async getWorkspaceFolder(currentStep: number, totalStepQty: number): Promise<vscode.WorkspaceFolder | undefined> {

        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            await vscode.window.showErrorMessage('You must have a workspace open to add a project.');

            return;
        }

        if (workspaceFolders.length === 1) {
            return workspaceFolders[0];
        }

        const quickPickItems = workspaceFolders.map(w => {

            const quickPickItem: WorkspaceQuickPickItem = {
                workspaceFolder: w,
                label: w.name,
            };

            return quickPickItem;
        });

        const quickPickItem = await vscode.window.showQuickPick<WorkspaceQuickPickItem>(quickPickItems, {
            canPickMany: false,
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select workspace folder...',
            title: `Select Folder (${currentStep}/${totalStepQty})`
        });

        if (!quickPickItem) {
            return;
        }

        return quickPickItem.workspaceFolder;
    }

    private async getProjectTemplate(stepNumber: number, totalStepQty: number): Promise<ProjectTemplate | undefined> {

        const quickPickItems = ProjectTemplateHelper.getQuickPickItems();

        const quickPickItem = await vscode.window.showQuickPick(quickPickItems, {
            canPickMany: false,
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Search for project template...',
            title: `Project Template (${stepNumber}/${totalStepQty})`
        });

        return quickPickItem?.projectTemplate;
    }

    private async getProjectName(stepNumber: number, totalStepQty: number): Promise<string | undefined> {

        const options: vscode.InputBoxOptions = {
            placeHolder: 'Enter project name...',
            title: `Project Name (${stepNumber}/${totalStepQty})`,
            validateInput: Util.validateProjectName
        };

        const projectName = await vscode.window.showInputBox(options);

        return projectName;
    }
}