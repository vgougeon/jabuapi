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
exports.RelationManyToMany = void 0;
const field_class_1 = require("../field.class");
class RelationManyToMany extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'MANY TO MANY';
    }
    //MUTATE DATABASE LIVE
    createRelation(relation) {
        const _super = Object.create(null, {
            createRelation: { get: () => super.createRelation }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _super.createRelation.call(this, relation);
            yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.createTable(relation.name, (table) => {
                table.integer(`l_${relation.options.leftTable}_${relation.options.leftReference}`)
                    .unsigned().notNullable();
                table.foreign(`l_${relation.options.leftTable}_${relation.options.leftReference}`)
                    .references(relation.options.leftReference).inTable(relation.options.leftTable);
                table.integer(`r_${relation.options.rightTable}_${relation.options.rightReference}`)
                    .unsigned().notNullable();
                table.foreign(`r_${relation.options.rightTable}_${relation.options.rightReference}`)
                    .references(relation.options.rightReference).inTable(relation.options.rightTable);
            }));
        });
    }
    deleteRelation(relation) {
        const _super = Object.create(null, {
            deleteRelation: { get: () => super.deleteRelation }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _super.deleteRelation.call(this, relation);
            return yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.dropTableIfExists(relation.name));
        });
    }
    mapRelation(relation, mapped, error, context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // mapped[relation.name] = context.body[relation.name]
            if (!context.inserted)
                return;
            if (context.context !== 'insert')
                return;
            const elements = context.body[`${relation.name}[]`];
            const table = relation.options.leftTable === context.name ? relation.options.rightTable : relation.options.leftTable;
            const side = context.name === relation.options.leftTable ? 'LEFT' : 'RIGHT';
            if (Array.isArray(elements)) {
                for (let element of elements) {
                    yield ((_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, relation.name).insert({
                        [`l_${relation.options.leftTable}_id`]: side === 'LEFT' ? context.inserted : element,
                        [`r_${relation.options.rightTable}_id`]: side === 'RIGHT' ? context.inserted : element
                    }));
                }
            }
        });
    }
}
exports.RelationManyToMany = RelationManyToMany;
