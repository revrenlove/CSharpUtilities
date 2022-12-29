// TODO: Do we need this class even???
export class Util {

    // TODO: Maybe move this...
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

    // TODO: Maybe move this...
    public static validateProjectName(value: string): string | null | undefined {
        if (/ /.test(value)) {
            return 'Project name must not contain spaces.';
        }

        if (!/^[a-z0-9_]/i.test(value)) {
            return 'Project name must start with a number, letter, or underscore.';
        }
    }
}