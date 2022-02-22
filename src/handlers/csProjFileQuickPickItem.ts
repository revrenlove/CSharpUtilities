import * as vscode from 'vscode';

export interface CsProjFileQuickPickItem extends vscode.QuickPickItem {
    uri: vscode.Uri
}