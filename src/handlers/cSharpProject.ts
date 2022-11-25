import * as vscode from 'vscode';

export class CSharpProject {
    name: string = '';
    uri: vscode.Uri = vscode.Uri.file('');
    path: string = '';
    rootNamespace: string = '';
    projectReferencePaths: string[] = [];
    projectReferenceUris: vscode.Uri[] = [];

    constructor(values: CSharpProject = <CSharpProject>{}) {

        if (values) {
            Object.assign(this, values);
        }
    }
}