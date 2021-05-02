import * as vscode from 'vscode';

export class Config {
    public static readonly genericTemplatePath = `${__dirname}/templates/itemFile.tmpl`;
    public static readonly genericTemplateCursorPosition = new vscode.Position(6, 8);
}