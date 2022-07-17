import { Knex } from "knex";
import { IField } from "../types/app.interface";
export declare abstract class Field {
    name: string;
    createField(table: Knex.CreateTableBuilder, field: {
        name: string;
        options: IField;
    }): void;
}
