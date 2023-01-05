import { TemplateType } from '../../templates/templateType';
import { AddItemCommand } from './addItemCommand';

export class AddRecordCommand extends AddItemCommand {

    public readonly templateType: TemplateType = TemplateType.record;

    public readonly id: string = 'c-sharp-utilities.addRecord';
}
