import * as vscode from 'vscode';
import * as path from 'path';
import { TextDecoder } from 'util';
import { CSharpProject } from "./cSharpProject";

const parseFromFile = async (uri: vscode.Uri): Promise<CSharpProject> => {

    const projectName = path.parse(uri.fsPath).name;

    const fileContentsArray = await vscode.workspace.fs.readFile(uri);

    const fileContents = new TextDecoder().decode(fileContentsArray);

    return new CSharpProject(projectName, fileContents);
};

export {
    parseFromFile
};