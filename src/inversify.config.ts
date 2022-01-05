import 'reflect-metadata';
import { Container } from 'inversify';
import TYPES from './types';
import { Command } from './commands/command';
import { CommandManager } from './commands/commandManager';
import { ManageProjectReferencesCommand } from './commands/manageProjectReferencesCommand';
import { ProjectReferenceHandler } from './handlers/projectReferenceHandler';
import { FileHandler } from './handlers/fileHandler';
import { TerminalHandler } from './handlers/terminalHandler';
import { GenericTemplateHandler } from './handlers/genericTemplateHandler';
import * as commands from './commands';
import { CSharpProjectFactory } from './handlers/cSharpProjectFactory';

const container = new Container();

container.bind<Command>(TYPES.command).to(ManageProjectReferencesCommand);

container.bind<CommandManager>(TYPES.commandManager).to(CommandManager);

container.bind<ProjectReferenceHandler>(TYPES.projectReferenceHandler).to(ProjectReferenceHandler);
container.bind<FileHandler>(TYPES.fileHandler).to(FileHandler);
container.bind<TerminalHandler>(TYPES.terminalHandler).to(TerminalHandler);
container.bind<GenericTemplateHandler>(TYPES.genericTemplateHandler).to(GenericTemplateHandler);
container.bind<CSharpProjectFactory>(TYPES.cSharpProjectFactory).to(CSharpProjectFactory);

Object.values(commands).forEach(command => {
    container.bind<Command>(TYPES.command).to(command);
});

export default container;