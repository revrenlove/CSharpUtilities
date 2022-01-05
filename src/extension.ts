import * as vscode from 'vscode';
import { CommandManager } from './commands/commandManager';
import container from './inversify.config';
import TYPES from './types';

export function activate(context: vscode.ExtensionContext) {

	const commandManager = container.get<CommandManager>(TYPES.commandManager);

	commandManager.registerCommands(context);
}

export function deactivate() { }
