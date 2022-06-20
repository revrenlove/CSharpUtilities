import * as vscode from 'vscode';
import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddClassCommand extends AddItemCommand {

    public readonly id: string = 'c-sharp-utilities.addClass';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.class, contextualUri);
    }
}
