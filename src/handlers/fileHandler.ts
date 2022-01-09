import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { TextDecoder, TextEncoder } from 'util';

@injectable()
export class FileHandler {

    private readonly textDecoder = new TextDecoder();
    private readonly textEncoder = new TextEncoder();

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