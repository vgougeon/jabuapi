import { IRelation } from '../../types/app.interface';
import { Field } from "../field.class";

export class RelationOneToOne extends Field {
    name = 'ONE TO ONE'

    async createRelation(relation: { name: string; options: IRelation; }) {
        super.createRelation(relation)
        await this.api.db.userDb?.schema.alterTable(relation.options.leftTable, (table) => {
            table.integer(relation.options.leftFieldName).unsigned()
            table.foreign(relation.options.leftFieldName)
                .references(relation.options.rightReference).inTable(relation.options.rightTable)
        })
        await this.api.db.userDb?.schema.alterTable(relation.options.rightTable, (table) => {
            table.integer(relation.options.rightFieldName).unsigned()
            table.foreign(relation.options.rightFieldName)
                .references(relation.options.leftReference).inTable(relation.options.leftTable)
        })
    }

    async deleteRelation(relation: { name: string; options: IRelation; }) {
        super.deleteRelation(relation)
        await this.api.db.userDb?.schema.alterTable(relation.options.leftTable, (table) => {
            table.dropForeign(relation.options.leftFieldName)
            table.dropColumn(relation.options.leftFieldName)
        })
        await this.api.db.userDb?.schema.alterTable(relation.options.rightTable, (table) => {
            table.dropForeign(relation.options.rightFieldName)
            table.dropColumn(relation.options.rightFieldName)
        })
    }

    async mapRelation(relation: { name: string; options: IRelation }, mapped: any, error: any, context: any) {
        if (relation.options.leftTable === context.name) {
            mapped[relation.options.leftFieldName] = context.body[relation.options.leftFieldName]
        }
        else if (relation.options.rightTable === context.name) {
            mapped[relation.options.rightFieldName] = context.body[relation.options.rightFieldName]
        }
    }
}