import { Knex } from "knex";
import { IField } from "../types/app.interface";

export abstract class Field {
    name!: string;

    createField(table: Knex.CreateTableBuilder, field: { name: string; options: IField }) {}
}