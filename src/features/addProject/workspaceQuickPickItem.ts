import * as vscode from 'vscode';

export interface WorkspaceQuickPickItem extends vscode.QuickPickItem {
    workspaceFolder: vscode.WorkspaceFolder;
}
