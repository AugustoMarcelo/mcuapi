"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var movies_routes_1 = __importDefault(require("../../../../modules/movies/infra/http/routes/movies.routes"));
var sessions_routes_1 = __importDefault(require("../../../../modules/users/infra/http/routes/sessions.routes"));
var routes = express_1.Router();
routes.use('/sessions', sessions_routes_1.default);
routes.use('/api/v1/movies', movies_routes_1.default);
exports.default = routes;
