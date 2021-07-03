import * as vscode from 'vscode';

export class Util {

    public static capitalizeFirstLetter(s: string) {

        switch (s.length) {
            case 0: return s;
            case 1: return s[0].toUpperCase();
            default: return s[0].toUpperCase() + s.substring(1);
        }
    }

    public static async showWarningConfirm(msg: string): Promise<boolean> {

        const circularReferenceWarningResult = await vscode.window.showWarningMessage(msg, ...['Ok', 'Cancel']);

        // TODO: Actually write the fucking code.

        return true;
    }
}