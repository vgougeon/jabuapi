import { Knex } from "knex";
import { IField } from "../../types/app.interface";
import { Field } from "../field.class";
export declare class FieldUpdatedAt extends Field {
    name: string;
    createField(table: Knex.CreateTableBuilder, field: {
        name: string;
        options: IField;
    }): void;
}
