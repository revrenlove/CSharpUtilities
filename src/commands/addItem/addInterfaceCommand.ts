import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddInterfaceCommand extends AddItemCommand {

    public readonly templateType: TemplateType = TemplateType.interface;

    public readonly id: string = 'c-sharp-utilities.addInterface';
}
