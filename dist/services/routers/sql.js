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
const action_enum_1 = require("../actions/action.enum");
const utils_1 = require("../../utils/utils");
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const name = Object.keys(collection)[0];
            const fields = Object.entries(collection[name].fields).map(([name, options]) => ({ name, options }));
            yield ((_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.createTable(name, (table) => {
                table.timestamp('__jabuapi__');
            }));
            this.API.actions.create(action_enum_1.EAction.CreateTable, (0, utils_1.toNameOptions)(collection).name);
            for (let field of fields) {
                if (this.API.db.userDb) {
                    (_b = this.API.fields.get(field.options.type)) === null || _b === void 0 ? void 0 : _b.createField(name, field);
                }
            }
        });
    }
    deleteCollection(name) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.dropTableIfExists(name));
            this.API.actions.create(action_enum_1.EAction.DeleteTable, name);
        });
    }
    renameCollection(name, newName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.API.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.renameTable(name, newName));
            this.API.actions.create(action_enum_1.EAction.RenameTable, { name, newName });
        });
    }
    addField(collection, body) {
        var _a;
        const field = Object.entries(body).map(([name, options]) => ({ name, options }))[0];
        if (this.API.db.userDb) {
            (_a = this.API.fields.get(field.options.type)) === null || _a === void 0 ? void 0 : _a.createField(collection, field);
        }
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
}
exports.SQL = SQL;
