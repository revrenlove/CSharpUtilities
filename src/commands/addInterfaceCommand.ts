import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { TemplateType } from '../templates/templateType';
import { AddTemplateCommand } from './addTemplateCommand';

@injectable()
export class AddInterfaceCommand extends AddTemplateCommand {

    public readonly id: string = 'c-sharp-utilities.addInterface';

    public async execute(uri: vscode.Uri): Promise<void> {

        await this.genericTemplateHandler.generate(TemplateType.interface, uri);
    }
}