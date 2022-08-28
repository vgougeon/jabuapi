import API from "../index";
import { IApp } from "../types/app.interface";
import { IConfig } from "../types/config.interface";
export declare class ConfigService {
    private api;
    app: IApp;
    config: IConfig;
    constructor(api: API);
    setup(): Promise<boolean>;
    getAllRelations(collectionName: string): {
        name: string;
        options: import("../types/app.interface").IRelation;
    }[];
    getFields(collectionName: string): {
        name: string;
        options: import("../types/app.interface").IField;
    }[];
    getRelationByName(relationName: string): import("../types/app.interface").IRelation;
    getCollectionByName(collectionName: string): import("../types/app.interface").ICollection;
    setApp(app: IApp): Promise<void>;
    refreshConfig(): Promise<void>;
}
