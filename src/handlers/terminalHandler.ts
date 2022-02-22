import * as vscode from 'vscode';
import { injectable } from 'inversify';

@injectable()
export class TerminalHandler {

    private readonly terminalName = 'dotnet';

    public executeCommand(directoryPath: string, command: string, ...commandArgs: string[]): void {

        const terminal = this.ensureTerminal(directoryPath);

        if (commandArgs && commandArgs.length > 0) {
            command += ` ${commandArgs.join(' ')}`;
        }

        terminal.sendText(command);
    }

    private ensureTerminal(path: string): vscode.Terminal {

        let terminal: vscode.Terminal | undefined;

        vscode
            .window
            .terminals
            .forEach(t => {
                if (t.name === this.terminalName) {
                    terminal = t;
                }
            });

        if (!terminal) {

            const terminalOptions: vscode.TerminalOptions = {
                name: this.terminalName,
                cwd: path
            };

            terminal = vscode.window.createTerminal(terminalOptions);
        }
        else {
            terminal.sendText(['cd', `"${path}"`].join(' '), true);
        }

        return terminal;
    }
}