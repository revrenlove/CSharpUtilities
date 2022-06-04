import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ProjectReferenceTreeItem } from './projectReferenceTreeItem';
import { ProjectReferenceHandler } from '../../handlers/projectReferenceHandler';
import TYPES from '../../types';
import { CSharpProject } from '../../handlers/cSharpProject';
import { CSharpProjectFactory } from '../../handlers/cSharpProjectFactory';
import container from '../../inversify.config';
import { TreeNode } from '../../framework/treeNode';

@injectable()
export class ProjectReferenceTreeDataProvider implements vscode.TreeDataProvider<ProjectReferenceTreeItem> {

    private readonly projectReferenceHandler: ProjectReferenceHandler;
    private readonly treeDataChangeEmitter: vscode.EventEmitter<void | ProjectReferenceTreeItem | null | undefined>;

    private rootElement?: ProjectReferenceTreeItem;
    // private rootElements: ProjectReferenceTreeItem[] = [];

    constructor(@inject(TYPES.projectReferenceHandler) projectReferenceHandler: ProjectReferenceHandler) {

        this.projectReferenceHandler = projectReferenceHandler;

        this.treeDataChangeEmitter = new vscode.EventEmitter<ProjectReferenceTreeItem | undefined | null | void>();
        this.onDidChangeTreeData = this.treeDataChangeEmitter.event;
    }

    public readonly onDidChangeTreeData?: vscode.Event<void | ProjectReferenceTreeItem | null | undefined> | undefined;

    public getTreeItem(element: ProjectReferenceTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return element;
    }

    public getChildren(element?: ProjectReferenceTreeItem): vscode.ProviderResult<ProjectReferenceTreeItem[]> {

        if (!element) {

            if (!this.rootElement) {

                return;
            }

            element = this.rootElement;
        }

        return element.children;
    }

    // HACK: This LOOKS like it's technically working for the params[] type C# notation...
    public refreshTest(...projects: CSharpProject[]): void;
    public refreshTest(projects: CSharpProject[]): void;
    public refreshTest(projects: CSharpProject | CSharpProject[]): void {

        if (!Array.isArray(projects)) {
            projects = [projects];
        }

        if (projects.length === 0 && !this.rootElement) {
            return;
        }

        // TODO: THIS IS WRONG!!!
        const treeNodes: TreeNode<CSharpProject>[] = [new TreeNode<CSharpProject>(projects[0])];

        this.rootElement = projects.map(p => new ProjectReferenceTreeItem(p))

        const x = projects;
    }

    public refresh(rootElement?: ProjectReferenceTreeItem): void {

        if (!rootElement && !this.rootElement) {
            return;
        }

        if (!rootElement) {
            return;
        }

        this.rootElement = rootElement;
        // TODO: Rebuild the tree using a method from the Handler...
        // TODO: Actually build the method in the handler...

        // const x = this.rootElement.cSharpProject;

        // const y = this.projectReferenceHandler.

        this.treeDataChangeEmitter.fire();
    }

    public clear(): void {

        this.rootElement = undefined;

        this.treeDataChangeEmitter.fire();
    }

    // TODO: DELETE THIS....
    public deleteMe() {
        const x: CSharpProject = {
            name: '',
            uri: vscode.Uri.file(''),
            path: '',
            rootNamespace: '',
            projectReferencePaths: [],
            projectReferenceUris: []
        };

        this.refreshTest();
        this.refreshTest(x);
        this.refreshTest(x, x, x, x, x, x);
        this.refreshTest([x]);
        this.refreshTest([x, x]);
    }
}