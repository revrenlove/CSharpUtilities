import { CsProjFileQuickPickItem } from '../handlers/csProjFileQuickPickItem';
import { CSharpProject } from '../handlers/cSharpProject';
import { injectable } from 'inversify';

@injectable()
export class QuickPickItemHelper {

    public cSharpProjectToQuickPick(project: CSharpProject, picked: boolean = false): CsProjFileQuickPickItem {

        const quickPickItem: CsProjFileQuickPickItem = {
            label: project.name,
            detail: project.path,
            picked: picked,
            alwaysShow: true,
            uri: project.uri,
        };

        return quickPickItem;
    }
}