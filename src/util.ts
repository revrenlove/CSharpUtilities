import * as vscode from 'vscode';

enum ConfirmAction {

    ok = 'Ok',
    cancel = 'Cancel'
}

export class Util {

    public static capitalizeFirstLetter(s: string) {

        switch (s.length) {
            case 0: return s;
            case 1: return s[0].toUpperCase();
            default: return s[0].toUpperCase() + s.substring(1);
        }
    }

    public static async showWarningConfirm(msg: string): Promise<boolean> {

        const result = await vscode.window.showWarningMessage(msg, ...[ConfirmAction.ok, ConfirmAction.cancel]);

        const isOk = !!result && result === ConfirmAction.ok;

        return isOk;
    }
}