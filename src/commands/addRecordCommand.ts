import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { GenericTemplateHandler } from '../handlers/genericTemplateHandler';
import { TemplateType } from '../templates/templateType';
import { Command } from './command';

@injectable()
export class AddRecordCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.addRecord';

    public async execute(contextualUri: vscode.Uri): Promise<void> {

        await GenericTemplateHandler.generate(TemplateType.record, contextualUri);
    }
}