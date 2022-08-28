"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
function RelationRouter(API) {
    const router = (0, express_1.Router)();
    router.delete('/:relation', (req, res) => {
        var _a;
        const name = req.params.relation;
        console.log(name);
        const relation = API.configService.getRelationByName(name);
        let config = API.configService.app;
        (_a = API.fields.get(relation.type)) === null || _a === void 0 ? void 0 : _a.deleteRelation({
            name: req.params.relation,
            options: relation
        });
        delete config.relations[name];
        API.configService.setApp(config)
            .then(() => res.send(config));
    });
    return router;
}
exports.default = RelationRouter;
