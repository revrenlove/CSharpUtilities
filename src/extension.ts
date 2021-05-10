import * as vscode from 'vscode';
import { CommandManager } from './commands/commandManager';
import container from './inversify.config';
import TYPES from './types';

export function activate(context: vscode.ExtensionContext) {

	const cmdManager = container.get<CommandManager>(TYPES.commandManager);

	cmdManager.registerCommands(context);
}

export function deactivate() { }
