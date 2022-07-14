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
exports.CrudService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const class_validator_1 = require("class-validator");
const error_mapper_1 = __importDefault(require("../../utils/error-mapper"));
const nanoid_1 = require("nanoid");
class CrudService {
    constructor(api) {
        this.api = api;
    }
    selectFields(collectionName, name = '') {
        const collection = this.api.configService.getCollectionByName(collectionName);
        console.log(Object.keys(collection.fields).map(key => `${collectionName}.${key}`).join(', '));
        return Object.keys(collection.fields).map(key => `${collectionName}.${key}${name ? ` as ${name}.${key}` : ''}`);
    }
    toJson(result) {
        const convertRow = (row) => {
            const result = {};
            for (const objectPath in row) {
                const parts = objectPath.split('.');
                let target = result;
                while (parts.length > 1) {
                    const part = parts.shift();
                    if (part)
                        target = target[part] = target[part] || {};
                }
                target[parts[0]] = row[objectPath];
            }
            return result;
        };
        if (Array.isArray(result)) {
            return result.map(row => convertRow(row));
        }
        else
            return convertRow(result);
    }
    findAll(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const relations = this.api.configService.getAllRelations(collectionName);
            let request = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).select(this.selectFields(collectionName));
            for (let relation of relations) {
                //MANY TO ONE
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    request = request === null || request === void 0 ? void 0 : request.leftJoin(relation.options.rightTable, `${relation.options.rightTable}.${relation.options.rightReference}`, `${collectionName}.${relation.options.fieldName}`).select(this.selectFields(relation.options.rightTable, relation.options.fieldName));
                //ONE TO MANY
                // if(relation.options.rightTable === collectionName) {
                //     console.log(relation)
                //     request = request?.leftJoin(
                //         relation.options.leftTable,
                //         `${relation.options.rightTable}.${relation.options.rightReference}`,
                //         `${relation.options.leftTable}.${relation.options.fieldName}`
                //     ).select(this.selectFields(relation.options.leftTable, relation.options.fieldName))
                // }
            }
            res.send(this.toJson(yield request));
            // res.send(await request)
        });
    }
    findOne(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const relations = this.api.configService.getAllRelations(collectionName);
            let query = (_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).where({ id: +req.params.id }).select(this.selectFields(collectionName));
            for (let relation of relations) {
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === collectionName)
                    query = query === null || query === void 0 ? void 0 : query.leftJoin(relation.options.rightTable, `${relation.options.rightTable}.${relation.options.rightReference}`, `${collectionName}.${relation.options.fieldName}`).select(this.selectFields(relation.options.rightTable, relation.options.fieldName));
            }
            const item = yield (query === null || query === void 0 ? void 0 : query.first());
            if (!item)
                return res.status(404).send(item);
            return res.send(this.toJson(item));
        });
    }
    insert(collectionName) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { mapped, error } = yield this.mapBody(Object.assign(Object.assign({}, req.body), req.files || {}), collectionName, 'insert', { req, res });
            if (error.errorsFound())
                return res.status(400).send(error.getMap());
            try {
                const id = yield ((_b = (_a = this.api.db).userDb) === null || _b === void 0 ? void 0 : _b.call(_a, collectionName).insert(Object.assign({}, mapped)));
                if (id === null || id === void 0 ? void 0 : id[0]) {
                    const item = yield ((_d = (_c = this.api.db).userDb) === null || _d === void 0 ? void 0 : _d.call(_c, collectionName).where({ id: id[0] }).first());
                    return res.send(item);
                }
                else {
                    return res.status(400).send('Unknown error');
                }
            }
            catch (err) {
                console.log("ERROR", err.sqlMessage);
                return res.status(500).send(err.sqlMessage);
            }
        });
    }
    saveMedia(media) {
        return __awaiter(this, void 0, void 0, function* () {
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
    mapBody(body, name, context, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const mapped = {};
            const error = new error_mapper_1.default();
            const collection = this.api.configService.app.collections[name];
            const relations = this.api.configService.getAllRelations(name);
            const fields = this.api.configService.getFields(name);
            console.log(body);
            if (context === 'insert') {
                const fields = Object.entries(collection.fields).map(([name, options]) => ({ name, options }));
                const createdAt = fields.filter(i => i.options.type === 'CREATED_AT' || i.options.type === 'UPDATED_AT');
                const ip = fields.filter(i => i.options.type === 'IP');
                for (let field of createdAt)
                    mapped[field.name] = new Date();
                for (let field of ip) {
                    if (options === null || options === void 0 ? void 0 : options.req)
                        mapped[field.name] = options.req.ip;
                }
            }
            for (let [key, value] of Object.entries(body)) {
                if (collection.fields[key]) {
                    const type = collection.fields[key].type;
                    switch (type) {
                        case 'STRING':
                            if (!(0, class_validator_1.maxLength)(value, 255))
                                error.set(key, 'should be less than 255 characters');
                            mapped[key] = value;
                            break;
                        case 'TEXT':
                        case 'JSON':
                        case 'RICHTEXT':
                            mapped[key] = value;
                            break;
                        case 'MEDIA':
                            mapped[key] = yield this.saveMedia(value);
                            break;
                        case 'EMAIL':
                            if (!(0, class_validator_1.isEmail)(value))
                                error.set(key, 'should be a valid email address');
                            mapped[key] = value;
                            break;
                        case 'PASSWORD':
                            mapped[key] = bcrypt_1.default.hashSync(String(value), 10);
                            break;
                        case 'DATE':
                            mapped[key] = new Date(String(value));
                            break;
                        case 'BOOLEAN':
                            mapped[key] = !!value;
                            break;
                        case 'INTEGER':
                            if (!(0, class_validator_1.isNumber)(Number(value)))
                                error.set(key, 'should be a number');
                            if (!(0, class_validator_1.isInt)(Number(value)))
                                error.set(key, 'should be an integer');
                            mapped[key] = Number(value);
                            break;
                        case 'FLOAT':
                            if (!(0, class_validator_1.isNumber)(Number(value)))
                                error.set(key, 'should be a number');
                            mapped[key] = Number(value);
                            break;
                    }
                }
            }
            for (let relation of relations) {
                if (relation.options.type === 'ASYMMETRIC' && relation.options.leftTable === name) {
                    mapped[relation.options.fieldName] = body[relation.options.fieldName];
                }
            }
            if (context === 'insert') {
                for (let field of fields) {
                    if (field.options.default !== undefined && mapped[field.name] === undefined) {
                        mapped[field.name] = this.generateDefault(field.options.default);
                    }
                }
            }
            return { mapped, error };
        });
    }
    generateDefault(type) {
        switch (type) {
            case 'RANDOM_TOKEN': return (0, nanoid_1.nanoid)(40);
            case 'CURRENT_DATE': return new Date();
            default: return '';
        }
    }
}
exports.CrudService = CrudService;
