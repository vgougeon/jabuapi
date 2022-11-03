import { ICollection, IField, IRelation } from "../../types/app.interface"
import fs from 'fs/promises'
import API from "../../index"
import { EAction } from "../actions/action.enum"
import { toNameOptions } from "../../utils/utils"

export class SQL {
    constructor(private API: API) { }
    online = true
    async appendSQL(sql: string, instruction: Promise<any>) {
        // FOR Knex.SQL format
        // if(Array.isArray(sql)) {
        //     for(let line of sql) {
        //         fs.appendFile(this.API.options.root + '/transactions.sql', line.sql + ';\n')
        //         .then(() => console.log('transactions.sql updated'))
        //     }
        // }

        fs.appendFile(this.API.options.root + '/transactions.sql', sql + ';\n')
            .then(() => console.log('transactions.sql updated'))

        if (this.online) {
            await instruction
            await this.API.configService.setup()
            await this.API.routerService.resetRoutes()
        }
    }

    async createCollection(collection: { [name: string]: ICollection }) {
        const name = Object.keys(collection)[0]
        const fields = Object.entries(collection[name].fields).map(([name, options]) => ({ name, options }))
        await this.API.db.userDb?.schema.createTable(name, (table) => {
            table.timestamp('__jabuapi__')
        })
        this.API.actions.create(EAction.CreateTable, toNameOptions<ICollection>(collection).name)
        for (let field of fields) {
            if(this.API.db.userDb) {
                this.API.fields.get(field.options.type)?.createField(name, field)
            }
        }
    }

    async deleteCollection(name: string) {
        await this.API.db.userDb?.schema.dropTableIfExists(name)
        this.API.actions.create(EAction.DeleteTable, name)
    }

    async renameCollection(name: string, newName: string) {
        await this.API.db.userDb?.schema.renameTable(name, newName)
        this.API.actions.create(EAction.RenameTable, { name, newName })
    }

    addField(collection: string, body: { [key: string]: IField }): any {
        const field = Object.entries(body).map(([name, options]) => ({ name, options }))[0]
        if(this.API.db.userDb) {
            this.API.fields.get(field.options.type)?.createField(collection, field)
        }
    }

    editField(collection: string, field: string, body: { [key: string]: IField }) {
        const current = this.API.configService.app.collections[collection].fields[field]
        const edit = Object.entries(body).map(([name, options]) => ({ name, options }))[0]
        const editing = this.API.db.userDb?.schema.alterTable(collection, (table) => {
            table.renameColumn(field, edit.name)
            console.log(field, edit.name)
            if (current.nullable && !edit.options.nullable) {
                table.dropNullable(edit.name)
            }
            else if (!current.nullable && edit.options.nullable) {
                table.setNullable(edit.name)
            }
            if (current.unique && !edit.options.unique) {
                table.unique([edit.name])
            }
            else if (!current.unique && edit.options.unique) {
                table.dropUnique([edit.name])
            }
        })
        // console.log((editing as)
        this.appendSQL(editing!.toString(), editing!)
    }

    removeField(collection: string, field: string): any {
        const del = this.API.db.userDb?.schema.alterTable(collection, (table) => {
            table.dropColumn(field)
        })
        this.appendSQL(del!.toString(), del!)
    }

    addRelation(collection: string, body: { [key: string]: IRelation }) {
        const relation = Object.entries(body).map(([name, options]) => ({ name, options }))[0]
        if(relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collection) {
            const adding = this.API.db.userDb?.schema.alterTable(collection, (table) => {
                table.integer(relation.options.fieldName).unsigned()
                table.foreign(relation.options.fieldName)
                    .references(relation.options.rightReference).inTable(relation.options.rightTable)
            })
            this.appendSQL(adding!.toString(), adding!)
        }
    }
}