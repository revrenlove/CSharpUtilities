import * as vscode from 'vscode';

export class Util {

    public static capitalizeFirstLetter(s: string) {

        switch (s.length) {
            case 0:
                return s;
            case 1:
                return s[0].toUpperCase();
            default:
                return s[0].toUpperCase() + s.substring(1);
        }
    }

    public static validateProjectName(value: string): string | null | undefined {
        if (/ /.test(value)) {
            return 'Project name must not contain spaces.';
        }

        if (!/^[a-z0-9_]/i.test(value)) {
            return 'Project name must start with a number, letter, or underscore.';
        }
    }

    public static setInterval(
        callback: () => Promise<boolean>,
        errorMessage: string,
        maxRetry: number = 5,
        ms: number = 1000): void {

        let currentTry = 0;

        const timer = setInterval(async (): Promise<void> => {

            if (currentTry === maxRetry) {
                clearInterval(timer);

                if (errorMessage) {
                    await vscode.window.showErrorMessage(errorMessage);
                }
            }

            currentTry++;

            if (await callback()) {
                clearInterval(timer);
            }
        }, ms);
    }
}
