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
exports.JsonService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class JsonService {
    constructor(api) {
        this.api = api;
    }
    getOrCreate(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promises_1.default.stat(this.api.options.root + '/' + fileName);
            }
            catch (_a) {
                yield this.create(fileName, { collections: {}, relations: {} });
            }
            const read = yield promises_1.default.readFile(this.api.options.root + '/' + fileName);
            const object = JSON.parse(read.toString());
            return object;
        });
    }
    get(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return promises_1.default.stat(this.api.options.root + '/' + fileName)
                .then(() => promises_1.default.readFile(this.api.options.root + '/' + fileName))
                .then(f => JSON.parse(f.toString()))
                .catch(err => {
                if (err.syscall === 'open')
                    console.log('No config yet. Skipping');
                if (err.syscall === 'stat')
                    console.log('No config yet. Skipping');
                else
                    console.log('Unknown error. Skipping');
            });
        });
    }
    create(fileName, object) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield promises_1.default.writeFile(this.api.options.root + '/' + fileName, JSON.stringify(object, null, '\t'));
        });
    }
}
exports.JsonService = JsonService;
