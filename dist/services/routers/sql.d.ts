import { ICollection, IField, IRelation } from "../../types/app.interface";
import API from "../../index";
export declare class SQL {
    private API;
    constructor(API: API);
    online: boolean;
    appendSQL(sql: string, instruction: Promise<any>): Promise<void>;
    createCollection(collection: {
        [name: string]: ICollection;
    }): void;
    addField(collection: string, body: {
        [key: string]: IField;
    }): any;
    editField(collection: string, field: string, body: {
        [key: string]: IField;
    }): void;
    removeField(collection: string, field: string): any;
    addRelation(collection: string, body: {
        [key: string]: IRelation;
    }): void;
}
