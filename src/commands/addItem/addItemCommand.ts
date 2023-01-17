import * as vscode from 'vscode';
import container from "../../inversify.config";
import TYPES from "../../types";
import { injectable } from "inversify";
import { Command } from "../command";
import { GenericTemplateHandler } from "../../handlers/genericTemplateHandler";
import { TemplateType } from "../../templates/templateType";

@injectable()
export abstract class AddItemCommand implements Command {

    public abstract id: string;

    public abstract templateType: TemplateType;

    public async execute(contextualUri: vscode.Uri): Promise<void> {
        await this.genericTemplateHandler.generate(this.templateType, contextualUri);
    }

    private readonly genericTemplateHandler: GenericTemplateHandler =
        container.get(TYPES.genericTemplateHandler);
}
