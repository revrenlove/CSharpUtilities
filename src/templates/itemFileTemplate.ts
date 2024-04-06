import { Uri } from "vscode";

export interface ItemFileTemplate {

    namespace: string;
    objectType: string;
    objectName: string;
    usings: string[];
}
