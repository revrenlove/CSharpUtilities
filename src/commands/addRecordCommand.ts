import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { TemplateType } from '../templates/templateType';
import { AddTemplateCommand } from './addTemplateCommand';

@injectable()
export class AddRecordCommand extends AddTemplateCommand {

    public readonly id: string = 'c-sharp-utilities.addRecord';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.record, contextualUri);
    }
}