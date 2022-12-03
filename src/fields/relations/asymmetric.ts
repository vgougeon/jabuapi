import { IRelation } from './../../types/app.interface';
import { Knex } from "knex";
import { Field } from "../field.class";

export class RelationAsymmetric extends Field {
    name = 'ASYMMETRIC'

    async createRelation(relation: { name: string; options: IRelation; }) {
        super.createRelation(relation)
        return await this.api.db.userDb?.schema.alterTable(relation.options.leftTable, (table) => {
            table.integer(relation.options.leftFieldName).unsigned()
            table.foreign(relation.options.leftFieldName)
                .references(relation.options.rightReference).inTable(relation.options.rightTable)
        })
    }

    async deleteRelation(relation: { name: string; options: IRelation; }) {
        super.deleteRelation(relation)
        return await this.api.db.userDb?.schema.alterTable(relation.options.leftTable, (table) => {
            table.dropForeign(relation.options.fieldName)
            table.dropColumn(relation.options.fieldName)  
        })
    }

    async mapRelation(relation: { name: string; options: IRelation }, mapped: any, error: any, context: any) {
        if(relation.options.leftTable === context.name) {
            mapped[relation.options.leftFieldName] = context.body[relation.options.leftFieldName]
        }
    }
}