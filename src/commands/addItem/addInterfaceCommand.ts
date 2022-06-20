import * as vscode from 'vscode';
import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddInterfaceCommand extends AddItemCommand {

    public readonly id: string = 'c-sharp-utilities.addInterface';

    public async execute(uri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.interface, uri);
    }
}