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
exports.FieldMedia = void 0;
const field_class_1 = require("../field.class");
class FieldMedia extends field_class_1.Field {
    constructor() {
        super(...arguments);
        this.name = 'MEDIA';
    }
    createField(table, field) {
        const _super = Object.create(null, {
            createField: { get: () => super.createField }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _super.createField.call(this, table, field);
            yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(table, (builder) => {
                let t = builder.string(field.name);
                if (field.options.nullable)
                    t.nullable();
                else
                    t.notNullable();
                if (field.options.unique)
                    t.unique();
            }));
        });
    }
    deleteField(table, name) {
        const _super = Object.create(null, {
            deleteField: { get: () => super.deleteField }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _super.deleteField.call(this, table, name);
            yield ((_a = this.api.db.userDb) === null || _a === void 0 ? void 0 : _a.schema.alterTable(table, (table) => {
                table.dropColumn(name);
            }));
        });
    }
    mapField(field, mapped, error, context) {
        const _super = Object.create(null, {
            mapField: { get: () => super.mapField }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.mapField.call(this, field, mapped, error, context);
            if (context.body[field.name]) {
                console.log(context.body[field.name]);
                mapped[field.name] = yield this.saveMedia(context.body[field.name]);
            }
        });
    }
    saveMedia(media) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: Create directory automatically
            const path = `${this.api.options.root}/medias/${media.name}`;
            return new Promise((resolve, reject) => {
                media.mv(path, (err) => {
                    if (err)
                        return reject(err);
                    else
                        resolve(`/api/medias/${media.name}`);
                });
            });
        });
    }
}
exports.FieldMedia = FieldMedia;
