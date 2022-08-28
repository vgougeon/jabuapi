import { IRelation } from './../types/app.interface';
import { IField } from "../types/app.interface";
import API from '..';
export declare abstract class Field {
    protected api: API;
    name: string;
    constructor(api: API);
    createField(table: string, field: {
        name: string;
        options: IField;
    }): void;
    deleteField(table: string, name: string): void;
    createRelation(relation: {
        name: string;
        options: IRelation;
    }): void;
    deleteRelation(relation: {
        name: string;
        options: IRelation;
    }): void;
    mapField(field: {
        name: string;
        options: IField;
    }, mapped: any, error: any, context: any): Promise<void>;
    mapRelation(relation: {
        name: string;
        options: IRelation;
    }, mapped: any, error: any, context: any): Promise<void>;
}
