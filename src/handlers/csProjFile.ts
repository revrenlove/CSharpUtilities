import * as vscode from 'vscode';

export interface CsProjFile extends vscode.QuickPickItem {
    uri: vscode.Uri
}