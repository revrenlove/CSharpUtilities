import 'reflect-metadata';

import { Container } from 'inversify';
import TYPES from './types';
import { Command } from './commands/command';
import { CommandManager } from './commands/commandManager';
import { AddClassCommand } from './commands/addClassCommand';
import { AddInterfaceCommand } from './commands/addInterfaceCommand';
import { AddRecordCommand } from './commands/addRecordCommand';
import { AddEnumCommand } from './commands/addEnumCommand';
import { AddStructCommand } from './commands/addStructCommand';
import { ManageProjectReferencesCommand } from './commands/manageProjectReferencesCommand';
import { ProjectReferenceHandler } from './handlers/projectReferenceHandler';
import { FileHandler } from './handlers/fileHandler';
import { TerminalHandler } from './handlers/terminalHandler';

const container = new Container();

container.bind<Command>(TYPES.command).to(AddClassCommand);
container.bind<Command>(TYPES.command).to(AddInterfaceCommand);
container.bind<Command>(TYPES.command).to(AddRecordCommand);
container.bind<Command>(TYPES.command).to(AddEnumCommand);
container.bind<Command>(TYPES.command).to(AddStructCommand);

container.bind<Command>(TYPES.command).to(ManageProjectReferencesCommand);

container.bind<CommandManager>(TYPES.commandManager).to(CommandManager);

container.bind<ProjectReferenceHandler>(TYPES.projectReferenceHandler).to(ProjectReferenceHandler);
container.bind<FileHandler>(TYPES.fileHandler).to(FileHandler);
container.bind<TerminalHandler>(TYPES.terminalHandler).to(TerminalHandler);

export default container;