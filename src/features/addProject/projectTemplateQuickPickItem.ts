import * as vscode from 'vscode';
import { ProjectTemplate } from "./projectTemplate";

export interface ProjectTemplateQuickPickItem extends vscode.QuickPickItem {
    projectTemplate: ProjectTemplate;
}
