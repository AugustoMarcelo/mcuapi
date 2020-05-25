"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tsyringe_1 = require("tsyringe");
var CreateMovieService_1 = __importDefault(require("../../../services/CreateMovieService"));
var UpdateMovieService_1 = __importDefault(require("../../../services/UpdateMovieService"));
var ListAllMoviesService_1 = __importDefault(require("../../../services/ListAllMoviesService"));
var ShowMovieService_1 = __importDefault(require("../../../services/ShowMovieService"));
var MoviesController = /** @class */ (function () {
    function MoviesController() {
    }
    MoviesController.prototype.index = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, limit, listAllMovies, _b, data, total;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = request.query, page = _a.page, limit = _a.limit;
                        listAllMovies = tsyringe_1.container.resolve(ListAllMoviesService_1.default);
                        return [4 /*yield*/, listAllMovies.execute({
                                page: page,
                                limit: limit,
                            })];
                    case 1:
                        _b = _c.sent(), data = _b.data, total = _b.total;
                        return [2 /*return*/, response.json({ data: data, total: total })];
                }
            });
        });
    };
    MoviesController.prototype.create = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var createMovie, movie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createMovie = tsyringe_1.container.resolve(CreateMovieService_1.default);
                        return [4 /*yield*/, createMovie.execute(request.body)];
                    case 1:
                        movie = _a.sent();
                        return [2 /*return*/, response.json(movie)];
                }
            });
        });
    };
    MoviesController.prototype.update = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var updateMovie, movie_id, updatedMovie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateMovie = tsyringe_1.container.resolve(UpdateMovieService_1.default);
                        movie_id = request.params.movie_id;
                        return [4 /*yield*/, updateMovie.execute(__assign({ movie_id: movie_id }, request.body))];
                    case 1:
                        updatedMovie = _a.sent();
                        return [2 /*return*/, response.json(updatedMovie)];
                }
            });
        });
    };
    MoviesController.prototype.show = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var movie_id, showMovie, movie;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        movie_id = request.params.movie_id;
                        showMovie = tsyringe_1.container.resolve(ShowMovieService_1.default);
                        return [4 /*yield*/, showMovie.execute({ movie_id: movie_id })];
                    case 1:
                        movie = _a.sent();
                        return [2 /*return*/, response.json(movie)];
                }
            });
        });
    };
    return MoviesController;
}());
exports.default = MoviesController;
