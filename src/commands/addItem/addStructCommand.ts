import * as vscode from 'vscode';
import { TemplateType } from '../../templates/templateType';
// import { injectable } from 'inversify';
// import { TemplateType } from '../templates/templateType';
import { AddItemCommand } from './addItemCommand';

// @injectable()
export class AddStructCommand extends AddItemCommand {

    public readonly id: string = 'c-sharp-utilities.addStruct';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.struct, contextualUri);
    }
}