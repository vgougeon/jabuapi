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
exports.RelationAsymmetric = void 0;
const field_class_1 = require("../field.class");
class RelationAsymmetric extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'ASYMMETRIC';
    }
    createRelation(relation) {
        const _super = Object.create(null, {
            createRelation: { get: () => super.createRelation }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _super.createRelation.call(this, relation);
            return yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(relation.options.leftTable, (table) => {
                table.integer(relation.options.fieldName).unsigned();
                table.foreign(relation.options.fieldName)
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
            return yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(relation.options.leftTable, (table) => {
                table.dropForeign(relation.options.fieldName);
                table.dropColumn(relation.options.fieldName);
            }));
        });
    }
    mapRelation(relation, mapped, error, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (relation.options.leftTable === context.name) {
                mapped[relation.options.fieldName] = context.body[relation.options.fieldName];
            }
        });
    }
}
exports.RelationAsymmetric = RelationAsymmetric;
