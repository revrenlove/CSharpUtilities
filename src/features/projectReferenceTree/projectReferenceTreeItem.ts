import * as vscode from 'vscode';
import { TreeNode } from '../../framework/treeNode';
import { CSharpProject } from '../../handlers/cSharpProject';

export class ProjectReferenceTreeItem extends vscode.TreeItem {

    constructor(cSharpProjectNode: TreeNode<CSharpProject>) {

        super(cSharpProjectNode.value.name);

        this.tooltip = cSharpProjectNode.value.path;
        this.resourceUri = cSharpProjectNode.value.uri;

        if (cSharpProjectNode.children && cSharpProjectNode.children.length > 0) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        }

        this.cSharpProject = cSharpProjectNode.value;

        // TODO: JE - we might need to loop/dive into the tree...
        this.children = cSharpProjectNode.children.map(node => new ProjectReferenceTreeItem(node));
    }

    public readonly cSharpProject: CSharpProject;

    public readonly children: ProjectReferenceTreeItem[];

    // TODO: JE - what the fuck is this supposed to be?
    private RenameMe(): void {

    }
}