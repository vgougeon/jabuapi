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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
class AppService {
    constructor(api) {
        this.api = api;
    }
    initDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.api.jsonService.getOrCreate('app.json');
            if (!config)
                return false;
            const collections = Object.entries(config.collections)
                .map(([name, options]) => ({ name, options }));
            const relations = Object.entries(config.relations)
                .map(([name, options]) => ({ name, options }));
            if (this.api.db.userDb) {
                yield this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 0;');
                const [req] = yield this.api.db.userDb.raw(`SELECT * FROM information_schema.tables WHERE TABLE_SCHEMA = '${this.api.db.userDbName}'`);
                const tables = req.map((t) => t.TABLE_NAME);
                for (let table of tables) {
                    yield this.api.db.userDb.schema.dropTableIfExists(table);
                }
                //Create tables
                for (let collection of collections) {
                    const fields = Object.entries(collection.options.fields)
                        .map(([name, options]) => ({ name, options: options }));
                    yield this.api.db.userDb.schema.createTable(collection.name, (table) => {
                        for (let field of fields) {
                            this.api.SQL.fieldGenerator(table, field);
                        }
                    });
                }
                for (let relation of relations) {
                    if (relation.options.type === 'MANY TO MANY') {
                        yield this.api.db.userDb.schema.createTable(relation.name, (table) => {
                            table.integer(`${relation.options.leftTable}_${relation.options.leftReference}`).unsigned().notNullable();
                            table.foreign(`${relation.options.leftTable}_${relation.options.leftReference}`)
                                .references(relation.options.leftReference).inTable(relation.options.leftTable);
                            table.integer(`${relation.options.rightTable}_${relation.options.rightReference}`).unsigned().notNullable();
                            table.foreign(`${relation.options.rightTable}_${relation.options.rightReference}`)
                                .references(relation.options.rightReference).inTable(relation.options.rightTable);
                        });
                    }
                    if (relation.options.type === 'ASYMMETRIC') {
                        yield this.api.db.userDb.schema.alterTable(relation.options.leftTable, (table) => {
                            table.integer(relation.options.fieldName).unsigned();
                            table.foreign(relation.options.fieldName)
                                .references(relation.options.rightReference).inTable(relation.options.rightTable);
                        });
                    }
                }
                yield this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 1;');
            }
            return true;
        });
    }
}
exports.AppService = AppService;
