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
exports.Field = void 0;
const action_enum_1 = require("../services/actions/action.enum");
class Field {
    constructor(api) {
        this.api = api;
    }
    createField(table, field) {
        this.api.actions.create(action_enum_1.EAction.CreateField, table, field);
    }
    deleteField(table, name) {
        this.api.actions.create(action_enum_1.EAction.DeleteField, table, name);
    }
    createRelation(relation) {
        this.api.actions.create(action_enum_1.EAction.CreateRelation, relation);
    }
    deleteRelation(relation) {
        this.api.actions.create(action_enum_1.EAction.DeleteRelation, relation);
    }
    mapField(field, mapped, error, context) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    mapRelation(relation, mapped, error, context) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Field = Field;
