import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddEnumCommand extends AddItemCommand {

    public readonly templateType: TemplateType = TemplateType.enum;

    public readonly id: string = 'c-sharp-utilities.addEnum';
}
