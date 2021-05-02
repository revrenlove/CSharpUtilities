import * as vscode from 'vscode';
import { CommandManager } from './commands/commandManager';
import container from './inversify.config';
import TYPES from './types';

export function activate(context: vscode.ExtensionContext) {

	// TODO: only activate if c# project or solution is open...

	const cmdManager = container.get<CommandManager>(TYPES.commandManager);


	cmdManager.registerCommands(context);

	// TESTING: Dynamic menus
	// TODO: 3rd parameter should be fn that determines enablement
	console.log("Jim's extension has started...");
	vscode.commands.executeCommand('setContext', 'c-sharp-utilities.enableMenus', ((...args: any[]) => {
		console.log(args);
		return true;
	})());

}

export function deactivate() { }
