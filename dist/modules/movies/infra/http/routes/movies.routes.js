"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ensureAuthenticated_1 = __importDefault(require("../../../../users/infra/http/middlewares/ensureAuthenticated"));
var MoviesController_1 = __importDefault(require("../controllers/MoviesController"));
var moviesRouter = express_1.Router();
var moviesController = new MoviesController_1.default();
moviesRouter.get('/', moviesController.index);
moviesRouter.post('/', ensureAuthenticated_1.default, moviesController.create);
moviesRouter.put('/:movie_id', ensureAuthenticated_1.default, moviesController.update);
moviesRouter.get('/:movie_id', moviesController.show);
exports.default = moviesRouter;
