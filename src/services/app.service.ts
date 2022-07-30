import API from "../index";
import { IApp } from "../types/app.interface";
export class AppService {

    constructor(private api: API) {}

    async initDb() {
        this.api.status = 'setup'
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
                    table.timestamp('__jabuapi__')
                })
                for (let field of fields) {
                    this.api.fields.get(field.options.type)?.createField(collection.name, field)
                }
            }

            for (let relation of relations) {
                await this.api.fields.get(relation.options.type)?.createRelation(relation)
            }

            await this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 1;')
            this.api.status = 'online'
        }
        return true
    }

}