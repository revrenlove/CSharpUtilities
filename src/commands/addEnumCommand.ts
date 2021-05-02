import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { GenericTemplateHandler } from '../handlers/genericTemplateHandler';
import { TemplateType } from '../templates/templateType';
import { Command } from './command';

@injectable()
export class AddEnumCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.addEnum';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await GenericTemplateHandler.generate(TemplateType.enum, contextualUri);
    }
}