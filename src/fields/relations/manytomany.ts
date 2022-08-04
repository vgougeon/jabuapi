import { IRelation } from './../../types/app.interface';
import { Knex } from "knex";
import { Field } from "../field.class";

export class RelationManyToMany extends Field {
    name = 'MANY TO MANY'

    //MUTATE DATABASE LIVE
    async createRelation(relation: { name: string; options: IRelation; }) {
        super.createRelation(relation)
        await this.api.db.userDb?.schema.createTable(relation.name, (table) => {
            table.integer(`${relation.options.leftTable}_${relation.options.leftReference}`)
            .unsigned().notNullable()
            table.foreign(`${relation.options.leftTable}_${relation.options.leftReference}`)
            .references(relation.options.leftReference).inTable(relation.options.leftTable)
            table.integer(`${relation.options.rightTable}_${relation.options.rightReference}`)
            .unsigned().notNullable()
            table.foreign(`${relation.options.rightTable}_${relation.options.rightReference}`)
            .references(relation.options.rightReference).inTable(relation.options.rightTable)
        })
    }

    async deleteRelation(relation: { name: string; options: IRelation; }) {
        super.deleteRelation(relation)
        return await this.api.db.userDb?.schema.dropTableIfExists(relation.name)
    }

    async mapRelation(relation: { name: string; options: IRelation }, mapped: any, error: any, context: any) {
        console.log("MAP MANY TO MANY NOT IMPLEMENTED yet")
    }
}