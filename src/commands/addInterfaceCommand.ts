import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { GenericTemplateHandler } from '../handlers/genericTemplateHandler';
import { TemplateType } from '../templates/templateType';
import { Command } from './command';

@injectable()
export class AddInterfaceCommand implements Command {

    public readonly id: string = 'c-sharp-utilities.addInterface';

    public async execute(uri: vscode.Uri): Promise<void> {

        await GenericTemplateHandler.generate(TemplateType.interface, uri);
    }
}