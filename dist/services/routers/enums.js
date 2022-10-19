"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
function EnumRouter(API) {
    const router = (0, express_1.Router)();
    // CREATE COLLECTION
    router.post('/', (req, res) => {
        const app = API.configService.app;
        app.enums[req.body.name] = {
            entries: req.body.values,
            type: req.body.type || undefined
        };
        API.configService.setApp(app).then(() => {
            res.send(true);
        });
    });
    // DELETE COLLECTION
    router.delete('/:enum', (req, res) => {
    });
    return router;
}
exports.default = EnumRouter;
