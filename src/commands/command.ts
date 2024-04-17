export interface Command {
    id: string;
    execute(...args: any[]): Promise<void>;
}