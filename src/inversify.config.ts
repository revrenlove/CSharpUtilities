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

const container = new Container();
container.bind<Command>(TYPES.command).to(AddClassCommand);
container.bind<Command>(TYPES.command).to(AddInterfaceCommand);
container.bind<Command>(TYPES.command).to(AddRecordCommand);
container.bind<Command>(TYPES.command).to(AddEnumCommand);
container.bind<Command>(TYPES.command).to(AddStructCommand);
container.bind<CommandManager>(TYPES.commandManager).to(CommandManager);

export default container;