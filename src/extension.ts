import * as vscode from 'vscode';
import container from './inversify.config';
import TYPES from './types';
import { CommandManager } from './commands/commandManager';

export function activate(context: vscode.ExtensionContext) {

	const commandManager = container.get<CommandManager>(TYPES.commandManager);

	commandManager.registerCommands(context);
}

export function deactivate() { }
