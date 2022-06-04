// // TODO: This class will probably move...
// import * as vscode from 'vscode';
// import { TreeNode } from '../framework/treeNode';
// import { injectable } from 'inversify';
// import { CSharpProject } from './CSharpProject';

// // TODO: This needs to NOT be a singleton!!!!
// @injectable()
// export class ProjectReferenceProvider implements vscode.TreeDataProvider<TreeNode<CSharpProject>>{

//     private readonly _onDidChangeTreeData: vscode.EventEmitter<TreeNode<CSharpProject> | undefined | null | void> = new vscode.EventEmitter<TreeNode<CSharpProject> | undefined | null | void>();
//     readonly onDidChangeTreeData: vscode.Event<TreeNode<CSharpProject> | undefined | null | void> = this._onDidChangeTreeData.event;

//     private rootElement?: TreeNode<CSharpProject>;

//     public constructor() {

//     }


//     public getTreeItem(element: TreeNode<CSharpProject>): vscode.TreeItem {

//         const treeItem = new vscode.TreeItem(element.value.name);

//         // treeItem.iconPath = vscode.ThemeIcon.File;
//         treeItem.tooltip = element.value.path;
//         treeItem.resourceUri = element.value.uri;

//         if (element.children && element.children.length > 0) {
//             treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
//             // treeItem.iconPath = vscode.ThemeIcon.Folder;
//         }

//         // const treeItem = new vscode.TreeItem(element.value.name, collapsibleState);



//         return treeItem;
//     }

//     public getChildren(element?: TreeNode<CSharpProject>): vscode.ProviderResult<TreeNode<CSharpProject>[]> {

//         // if (!element || !element.children) {
//         //     return;
//         // }

//         if (!element) {

//             if (!this.rootElement) {

//                 return;
//             }

//             element = this.rootElement;
//         }

//         return element.children;
//     }

//     public refresh(rootElement?: TreeNode<CSharpProject>): void {

//         this.rootElement = rootElement;

//         this._onDidChangeTreeData.fire();
//     }

//     // TODO: Rename this to refresh...
//     // TODO: We need to rebuild the TreeNode shit...
//     public refreshCurrent(): void {
//         this._onDidChangeTreeData.fire();
//     }

//     public clear(): void {
//         this.rootElement = undefined;

//         this._onDidChangeTreeData.fire();
//     }
// }