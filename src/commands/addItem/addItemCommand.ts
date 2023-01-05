import * as vscode from 'vscode';
import { injectable } from "inversify";
import { GenericTemplateHandler } from "../../handlers/genericTemplateHandler";
import container from "../../inversify.config";
import { TemplateType } from "../../templates/templateType";
import TYPES from "../../types";
import { Command } from "../command";

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