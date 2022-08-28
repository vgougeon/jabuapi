"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const nanoid_1 = require("nanoid");
class Action {
    constructor(api, name, args) {
        this.api = api;
        this.name = name;
        this.args = args;
        this.id = new Date().getTime().toString() + (0, nanoid_1.nanoid)();
    }
}
exports.Action = Action;
