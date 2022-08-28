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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.api.status = 'setup';
            const config = yield this.api.jsonService.getOrCreate('app.json');
            this.api.configService.app = config;
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
                        table.timestamp('__jabuapi__');
                    });
                    for (let field of fields) {
                        (_a = this.api.fields.get(field.options.type)) === null || _a === void 0 ? void 0 : _a.createField(collection.name, field);
                    }
                }
                for (let relation of relations) {
                    yield ((_b = this.api.fields.get(relation.options.type)) === null || _b === void 0 ? void 0 : _b.createRelation(relation));
                }
                yield this.api.db.userDb.raw('SET FOREIGN_KEY_CHECKS = 1;');
                this.api.status = 'online';
            }
            return true;
        });
    }
}
exports.AppService = AppService;
