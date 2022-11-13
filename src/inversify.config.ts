import 'reflect-metadata';
import * as commands from './commands';
import TYPES from './types';
import { Container } from 'inversify';
import { Command } from './commands/command';
import { CommandManager } from './commands/commandManager';
import { ProjectReferenceHandler } from './handlers/projectReferenceHandler';
import { FileHandler } from './handlers/fileHandler';
import { TerminalHandler } from './handlers/terminalHandler';
import { GenericTemplateHandler } from './handlers/genericTemplateHandler';
import { CSharpProjectFactory } from './handlers/cSharpProjectFactory';
import { QuickPickItemHelper } from './helpers/quickPickItemHelper';
import { ProjectReferenceTreeDataProvider } from './features/projectReferenceTree/projectReferenceTreeDataProvider';
import { ProjectReferenceHelper } from './helpers/projectReferenceHelper';

const container = new Container();

container.bind<CommandManager>(TYPES.commandManager).to(CommandManager);

// TODO: See if we can refactor the handlers and put them in a similar thing like the command manager....
container.bind<ProjectReferenceHandler>(TYPES.projectReferenceHandler).to(ProjectReferenceHandler);
container.bind<FileHandler>(TYPES.fileHandler).to(FileHandler);
container.bind<TerminalHandler>(TYPES.terminalHandler).to(TerminalHandler);
container.bind<GenericTemplateHandler>(TYPES.genericTemplateHandler).to(GenericTemplateHandler);
container.bind<CSharpProjectFactory>(TYPES.cSharpProjectFactory).to(CSharpProjectFactory);

container.bind<QuickPickItemHelper>(TYPES.quickPickItemHelper).to(QuickPickItemHelper);
container.bind<ProjectReferenceHelper>(TYPES.projectReferenceHelper).to(ProjectReferenceHelper);

container.bind<ProjectReferenceTreeDataProvider>(TYPES.projectReferenceTreeDataProvider).to(ProjectReferenceTreeDataProvider).inSingletonScope();

Object.values(commands).forEach(command => {
    container.bind<Command>(TYPES.command).to(command);
});

export default container;