import { UploadedFile } from "express-fileupload";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";
export declare class FieldMedia extends Field {
    name: string;
    createField(table: string, field: {
        name: string;
        options: IField;
    }): Promise<void>;
    deleteField(table: string, name: string): Promise<void>;
    mapField(field: {
        name: string;
        options: IField;
    }, mapped: any, error: any, context: any): Promise<void>;
    saveMedia(media: UploadedFile): Promise<unknown>;
}