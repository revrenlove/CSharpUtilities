import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddStructCommand extends AddItemCommand {

    public readonly templateType: TemplateType = TemplateType.struct;

    public readonly id: string = 'c-sharp-utilities.addStruct';
}
