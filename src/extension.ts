import * as vscode from 'vscode';
import container from './inversify.config';
import TYPES from './types';
import { CommandManager } from './commands/commandManager';
import { ProjectReferenceTreeDataProvider } from './features/projectReferenceTree/projectReferenceTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {

	const commandManager = container.get<CommandManager>(TYPES.commandManager);

	commandManager.registerCommands(context);

	// TODO: Put the `ProjectReferenceProvider` in the container...
	const projectReferenceTreeDataProvider = container.get<ProjectReferenceTreeDataProvider>(TYPES.projectReferenceTreeDataProvider);
	vscode.window.registerTreeDataProvider('projectReferences', projectReferenceTreeDataProvider);

	vscode.commands.registerCommand('c-sharp-utilities.clearProjectReferenceExplorer', () =>
		projectReferenceTreeDataProvider.clear()
	);
}

export function deactivate() { }
