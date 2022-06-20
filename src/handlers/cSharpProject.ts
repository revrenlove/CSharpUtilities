import * as vscode from 'vscode';

export interface CSharpProject {
    name: string;
    uri: vscode.Uri;
    path: string;
    rootNamespace: string;
    projectReferencePaths: string[];
    projectReferenceUris: vscode.Uri[];
}