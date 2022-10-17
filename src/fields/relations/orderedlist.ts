import { IRelation } from '../../types/app.interface';
import { Field } from "../field.class";

export class RelationOrderedList extends Field {
    name = 'ORDERED LIST'

    //MUTATE DATABASE LIVE
    async createRelation(relation: { name: string; options: IRelation; }) {
        super.createRelation(relation)
        await this.api.db.userDb?.schema.createTable(relation.name, (table) => {
            table.string(`lexorank`)
            table.integer(`l_${relation.options.leftTable}_${relation.options.leftReference}`)
            .unsigned().notNullable()
            table.foreign(`l_${relation.options.leftTable}_${relation.options.leftReference}`)
            .references(relation.options.leftReference).inTable(relation.options.leftTable)
            table.integer(`r_${relation.options.rightTable}_${relation.options.rightReference}`)
            .unsigned().notNullable()
            table.foreign(`r_${relation.options.rightTable}_${relation.options.rightReference}`)
            .references(relation.options.rightReference).inTable(relation.options.rightTable)
        })
    }

    async deleteRelation(relation: { name: string; options: IRelation; }) {
        super.deleteRelation(relation)
        return await this.api.db.userDb?.schema.dropTableIfExists(relation.name)
    }

    async mapRelation(relation: { name: string; options: IRelation }, mapped: any, error: any, context: any) {
        // mapped[relation.name] = context.body[relation.name]
        if(!context.inserted) return ;
        if(context.context !== 'insert') return ;
        const elements = context.body[`${relation.name}[]`]
        const table = relation.options.leftTable === context.name ? relation.options.rightTable : relation.options.leftTable
        const side = context.name === relation.options.leftTable ? 'LEFT' : 'RIGHT'
        if(Array.isArray(elements)) {
            for(let element of elements) {
                await this.api.db.userDb?.(relation.name).insert({
                    [`l_${relation.options.leftTable}_id`]: side === 'LEFT' ? context.inserted : element,
                    [`r_${relation.options.rightTable}_id`]: side === 'RIGHT' ? context.inserted : element
                })
            }
        }
    }
}