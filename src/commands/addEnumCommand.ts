import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { TemplateType } from '../templates/templateType';
import { AddTemplateCommand } from './addTemplateCommand';

@injectable()
export class AddEnumCommand extends AddTemplateCommand {

    public readonly id: string = 'c-sharp-utilities.addEnum';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.enum, contextualUri);
    }
}