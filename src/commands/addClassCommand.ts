import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { GenericTemplateHandler } from '../handlers/genericTemplateHandler';
import { TemplateType } from '../templates/templateType';
import { Command } from './command';

@injectable()
export class AddClassCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.addClass';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await GenericTemplateHandler.generate(TemplateType.class, contextualUri);
    }
}