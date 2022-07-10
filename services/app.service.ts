import { API } from "../geni";
import { IApp } from "../types/app.interface";
export class AppService {

    constructor(private api: API) {}

    async initDb() {
        const config: IApp = await this.api.jsonService.getOrCreate('app.json')
        if (!config) return false;

        const collections = Object.entries(config.collections)
            .map(([name, options]) => ({ name, options }))
        const relations = Object.entries(config.relations)
            .map(([name, options]) => ({ name, options }))
        if (this.api.db.userDb) {
            await this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 0;')
            const [req] = await this.api.db.userDb.raw(`SELECT * FROM information_schema.tables WHERE TABLE_SCHEMA = '${this.api.db.userDbName}'`)
            const tables = req.map((t: any) => t.TABLE_NAME)
            for (let table of tables) {
                await this.api.db.userDb.schema.dropTableIfExists(table)
            }

            //Create tables
            for (let collection of collections) {
                const fields = Object.entries(collection.options.fields)
                    .map(([name, options]) => ({ name, options: options }))
                await this.api.db.userDb.schema.createTable(collection.name, (table) => {
                    for (let field of fields) {
                        this.api.SQL.fieldGenerator(table, field)
                    }
                })
            }

            for (let relation of relations) {
                if (relation.options.type === 'MANY TO MANY') {
                    await this.api.db.userDb.schema.createTable(relation.name, (table) => {
                        table.integer(`${relation.options.leftTable}_${relation.options.leftReference}`).unsigned().notNullable()
                        table.foreign(`${relation.options.leftTable}_${relation.options.leftReference}`)
                        .references(relation.options.leftReference).inTable(relation.options.leftTable)
                        table.integer(`${relation.options.rightTable}_${relation.options.rightReference}`).unsigned().notNullable()
                        table.foreign(`${relation.options.rightTable}_${relation.options.rightReference}`)
                        .references(relation.options.rightReference).inTable(relation.options.rightTable)
                    })
                }

                if (relation.options.type === 'ASYMMETRIC') {
                    await this.api.db.userDb.schema.alterTable(relation.options.leftTable, (table) => {
                        table.integer(relation.options.fieldName).unsigned()
                        table.foreign(relation.options.fieldName)
                        .references(relation.options.rightReference).inTable(relation.options.rightTable)
                    })
                }
            }

            await this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 1;')

        }
        return true
    }

}