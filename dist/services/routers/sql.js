"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQL = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class SQL {
    constructor(API) {
        this.API = API;
        this.online = true;
    }
    appendSQL(sql, instruction) {
        return __awaiter(this, void 0, void 0, function* () {
            // FOR Knex.SQL format
            // if(Array.isArray(sql)) {
            //     for(let line of sql) {
            //         fs.appendFile(this.API.options.root + '/transactions.sql', line.sql + ';\n')
            //         .then(() => console.log('transactions.sql updated'))
            //     }
            // }
            promises_1.default.appendFile(this.API.options.root + '/transactions.sql', sql + ';\n')
                .then(() => console.log('transactions.sql updated'));
            if (this.online) {
                yield instruction;
                yield this.API.configService.setup();
                yield this.API.routerService.resetRoutes();
            }
        });
    }
    createCollection(collection) {
        var _a;
        const name = Object.keys(collection)[0];
        const fields = Object.entries(collection[name].fields).map(([name, options]) => ({ name, options }));
        const creating = (_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.createTable(name, (table) => {
            for (let field of fields) {
                this.fieldGenerator(table, field);
            }
        });
        this.appendSQL(creating.toString(), creating);
    }
    addField(collection, body) {
        var _a;
        const field = Object.entries(body).map(([name, options]) => ({ name, options }))[0];
        const adding = (_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(collection, (table) => {
            this.fieldGenerator(table, field);
        });
        this.appendSQL(adding.toString(), adding);
    }
    editField(collection, field, body) {
        var _a;
        const current = this.API.configService.app.collections[collection].fields[field];
        const edit = Object.entries(body).map(([name, options]) => ({ name, options }))[0];
        const editing = (_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(collection, (table) => {
            table.renameColumn(field, edit.name);
            console.log(field, edit.name);
            if (current.nullable && !edit.options.nullable) {
                table.dropNullable(edit.name);
            }
            else if (!current.nullable && edit.options.nullable) {
                table.setNullable(edit.name);
            }
            if (current.unique && !edit.options.unique) {
                table.unique([edit.name]);
            }
            else if (!current.unique && edit.options.unique) {
                table.dropUnique([edit.name]);
            }
        });
        // console.log((editing as)
        this.appendSQL(editing.toString(), editing);
    }
    removeField(collection, field) {
        var _a;
        const del = (_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(collection, (table) => {
            table.dropColumn(field);
        });
        this.appendSQL(del.toString(), del);
    }
    addRelation(collection, body) {
        var _a;
        const relation = Object.entries(body).map(([name, options]) => ({ name, options }))[0];
        if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collection) {
            const adding = (_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(collection, (table) => {
                table.integer(relation.options.fieldName).unsigned();
                table.foreign(relation.options.fieldName)
                    .references(relation.options.rightReference).inTable(relation.options.rightTable);
            });
            this.appendSQL(adding.toString(), adding);
        }
    }
    fieldGenerator(table, field) {
        let t;
        if (field.options.type === 'ID')
            table.increments();
        if (field.options.type === 'EMAIL')
            t = table.string(field.name);
        if (field.options.type === 'STRING')
            t = table.string(field.name);
        if (field.options.type === 'MEDIA')
            t = table.string(field.name); // TODO: Create external table with size, name, and url, switch to relation
        if (field.options.type === 'PASSWORD')
            t = table.string(field.name);
        if (field.options.type === 'TEXT')
            t = table.text(field.name);
        if (field.options.type === 'RICHTEXT')
            t = table.text(field.name);
        if (field.options.type === 'JSON')
            t = table.json(field.name);
        if (field.options.type === 'BOOLEAN')
            t = table.boolean(field.name);
        if (field.options.type === 'INTEGER')
            t = table.integer(field.name);
        if (field.options.type === 'FLOAT')
            t = table.float(field.name);
        if (field.options.type === 'DATE')
            t = table.datetime(field.name);
        if (field.options.type === 'CREATED_AT')
            t = table.datetime(field.name);
        if (field.options.type === 'UPDATED_AT')
            t = table.datetime(field.name);
        if (field.options.type === 'IP')
            t = table.string(field.name);
        if (field.options.nullable)
            t === null || t === void 0 ? void 0 : t.nullable();
        else
            t === null || t === void 0 ? void 0 : t.notNullable();
        if (field.options.unique)
            t === null || t === void 0 ? void 0 : t.unique();
    }
}
exports.SQL = SQL;
