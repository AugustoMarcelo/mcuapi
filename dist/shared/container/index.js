"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tsyringe_1 = require("tsyringe");
require("../../modules/users/providers");
var MoviesRepository_1 = __importDefault(require("../../modules/movies/infra/typeorm/repositories/MoviesRepository"));
tsyringe_1.container.registerSingleton('MoviesRepository', MoviesRepository_1.default);
