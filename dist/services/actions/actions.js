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
const action_1 = require("./action");
class Actions {
    constructor(api) {
        this.api = api;
        this.queue = [];
    }
    create(name, ...args) {
        if (this.api.status === 'online') {
            this.addToQueue(new action_1.Action(this.api, name, args));
        }
    }
    addToQueue(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.length === 0) {
                this.queue.push(action);
                while (this.queue.length > 0) {
                    yield this.append(this.queue[0]);
                    this.queue.shift();
                }
            }
            else {
                this.queue.push(action);
            }
        });
    }
    append(action) {
        return __awaiter(this, void 0, void 0, function* () {
            const array = yield this.api.jsonService.getOrCreateFile('actions.json', []);
            array.push({
                id: action.id,
                name: action.name,
                args: action.args
            });
            yield this.api.jsonService.overwriteFile('actions.json', array);
        });
    }
}
exports.default = Actions;
