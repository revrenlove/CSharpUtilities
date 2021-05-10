import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { injectable } from 'inversify';

@injectable()
export class FileHandler {

    private readonly textDecoder = new TextDecoder();
    private readonly textEncoder = new TextEncoder();

    public constructor() { }

    public async readFile(uri: vscode.Uri): Promise<string> {

        const fileContentsArray = await vscode.workspace.fs.readFile(uri);

        const fileContents = this.textDecoder.decode(fileContentsArray);

        return fileContents;
    }

    public async writeFile(uri: vscode.Uri, fileContents: string): Promise<void> {

        const fileContentsArray = this.textEncoder.encode(fileContents);

        await vscode.workspace.fs.writeFile(uri, fileContentsArray);
    }
}