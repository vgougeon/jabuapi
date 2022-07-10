import knex, { Knex } from "knex"
import { ICollection, IField, IRelation } from "../../types/app.interface"
import fs from 'fs/promises'
import { API } from "../../geni"

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

    createCollection(collection: { [name: string]: ICollection }) {
        const name = Object.keys(collection)[0]
        const fields = Object.entries(collection[name].fields).map(([name, options]) => ({ name, options }))
        const creating = this.API.db.userDb?.schema.createTable(name, (table) => {
            for (let field of fields) {
                this.fieldGenerator(table, field)
            }
        })
        this.appendSQL(creating!.toString(), creating!)
    }

    addField(collection: string, body: { [key: string]: IField }): any {
        const field = Object.entries(body).map(([name, options]) => ({ name, options }))[0]
        const adding = this.API.db.userDb?.schema.alterTable(collection, (table) => {
            this.fieldGenerator(table, field)
        })
        this.appendSQL(adding!.toString(), adding!)
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

    fieldGenerator(table: Knex.CreateTableBuilder, field: { name: string; options: IField }) {
        let t;
        if (field.options.type === 'ID') table.increments()
        if (field.options.type === 'EMAIL') t = table.string(field.name);
        if (field.options.type === 'STRING') t = table.string(field.name);
        if (field.options.type === 'MEDIA') t = table.string(field.name); // TODO: Create external table with size, name, and url, switch to relation
        if (field.options.type === 'PASSWORD') t = table.string(field.name);
        if (field.options.type === 'TEXT') t = table.text(field.name);
        if (field.options.type === 'RICHTEXT') t = table.text(field.name);
        if (field.options.type === 'JSON') t = table.json(field.name);
        if (field.options.type === 'BOOLEAN') t = table.boolean(field.name);
        if (field.options.type === 'INTEGER') t = table.integer(field.name);
        if (field.options.type === 'FLOAT') t = table.float(field.name);
        if (field.options.type === 'DATE') t = table.datetime(field.name);
        if (field.options.type === 'CREATED_AT') t = table.datetime(field.name);
        if (field.options.type === 'UPDATED_AT') t = table.datetime(field.name);
        if (field.options.type === 'IP') t = table.string(field.name);
        if (field.options.nullable) t?.nullable(); else t?.notNullable()
        if (field.options.unique) t?.unique();
    }
}