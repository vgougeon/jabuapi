import { IRelation } from './../types/app.interface';
import { Knex } from "knex";
import { IField } from "../types/app.interface";
import API from '..';
import { EAction } from '../services/actions/action.enum';

export abstract class Field {
    name!: string;

    constructor(protected api: API) {}

    createField(table: string, field: { name: string; options: IField }) {
        this.api.actions.create(EAction.CreateField, table, field)
    }
    deleteField(table: string, name: string) {
        this.api.actions.create(EAction.DeleteField, table, name)
    }
    createRelation(relation: { name: string; options: IRelation }) {
        this.api.actions.create(EAction.CreateRelation, relation)
    }
    deleteRelation(relation: { name: string; options: IRelation }) {
        this.api.actions.create(EAction.DeleteRelation, relation)
    }
    async mapField(field: { name: string; options: IField }, mapped: any, error: any, context: any) {
        if(context.body[field.name] === undefined && field.options.default !== undefined) {
            context.body[field.name] = field.options.default
        }
    }
    async mapRelation(relation: { name: string; options: IRelation }, mapped: any, error: any, context: any) {}
}