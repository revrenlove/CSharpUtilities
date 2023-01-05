import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddClassCommand extends AddItemCommand {

    public readonly templateType: TemplateType = TemplateType.class;

    public readonly id: string = 'c-sharp-utilities.addClass';
}
