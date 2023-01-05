import { ProjectTemplateQuickPickItem } from '../features/addProject/projectTemplateQuickPickItem';
import { projectTemplates } from '../features/addProject/projectTemplates';

export class ProjectTemplateHelper {

    public static getQuickPickItems(): ProjectTemplateQuickPickItem[] {

        const quickPickItems: ProjectTemplateQuickPickItem[] = projectTemplates.map(t => {

            const quickPickItem: ProjectTemplateQuickPickItem = {
                projectTemplate: t,
                label: t.friendlyName,
                detail: t.tag,
                description: t.shortName,
                picked: false,
            };

            return quickPickItem;
        });

        quickPickItems.sort((a, b) => (a.label > b.label) ? 1 : -1);

        return quickPickItems;
    }
}
