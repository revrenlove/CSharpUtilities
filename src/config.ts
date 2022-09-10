import * as vscode from 'vscode';

export class Config {
    public static readonly genericTemplatePath = `${__dirname}/templates/itemFile.tmpl`;
    public static readonly genericTemplateV10Path = `${__dirname}/templates/itemFileV10.tmpl`;
    public static readonly genericTemplateCursorPosition = new vscode.Position(6, 8);
}