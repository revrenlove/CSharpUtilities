import * as configJson from './config.json';

export class Config {
    public static readonly genericTemplatePath = `${__dirname}/${configJson.genericTemplatePath}`;
}