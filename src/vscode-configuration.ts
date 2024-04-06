import * as vscode from 'vscode';

export default class VSCodeConfiguration {

    static get isFileScopedNamespace(): boolean {
        const value = this.getConfigurationValue<boolean>('fileScopedNamespace');
        return value;
    }

    static get isImplicitUsings(): boolean {
        const value = !this.getConfigurationValue<boolean>('includeUsingStatements');
        return value;
    }

    static get namespacesToInclude(): string[] {
        const value = this.getConfigurationValue<string[]>('namespacesToInclude');
        return value;
    }

    private static getConfigurationValue<T>(section: string): T {
        const config = vscode.workspace.getConfiguration('c-sharp-utilities.newItemTemplate');

        const value = config.get(section) as T;

        return value;
    }
}