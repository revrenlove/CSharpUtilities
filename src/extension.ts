import * as vscode from 'vscode';
import { CommandManager } from './commands/commandManager';
import container from './inversify.config';
import TYPES from './types';

export function activate(context: vscode.ExtensionContext) {

	const cmdManager = container.get<CommandManager>(TYPES.commandManager);

	cmdManager.registerCommands(context);

	// TODO: Eventually figure out how to dynamically enable menus only when a csproj is in workspace
	vscode.commands.executeCommand('setContext', 'c-sharp-utilities.enableMenus', true);
}

export function deactivate() { }
