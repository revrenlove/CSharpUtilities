export class Version {
    constructor(versionString) {
        const parts = versionString.split(".");

        this.major = parseInt(parts[0]);
        this.minor = parseInt(parts[1]);
        this.patch = parseInt(parts[2]);

        this.toString = () => `${this.major}.${this.minor}.${this.patch}`;
    }
}
