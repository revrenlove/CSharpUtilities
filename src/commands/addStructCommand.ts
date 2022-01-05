import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { TemplateType } from '../templates/templateType';
import { AddTemplateCommand } from './addTemplateCommand';

@injectable()
export class AddStructCommand extends AddTemplateCommand {

    public readonly id: string = 'c-sharp-utilities.addStruct';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.struct, contextualUri);
    }
}