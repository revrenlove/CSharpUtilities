import { injectable } from "inversify";
import { GenericTemplateHandler } from "../handlers/genericTemplateHandler";
import container from "../inversify.config";
import TYPES from "../types";
import { Command } from "./command";

@injectable()
export abstract class AddTemplateCommand implements Command {

    public abstract id: string;
    public abstract execute(...args: any[]): Promise<void>;
    protected genericTemplateHandler: GenericTemplateHandler = container.get(TYPES.genericTemplateHandler);
}