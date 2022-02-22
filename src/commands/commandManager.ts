import * as vscode from 'vscode';
import TYPES from "../types";
import { injectable, multiInject } from "inversify";
import { Command } from "./command";

@injectable()
export class CommandManager {

    constructor(
        @multiInject(TYPES.command) private commands: Command[]
    ) { }

    registerCommands(context: vscode.ExtensionContext) {

        for (const command of this.commands) {

            const commandSubscription = vscode.commands.registerCommand(command.id, command.execute, command);

            context.subscriptions.push(commandSubscription);
        }
    }
}