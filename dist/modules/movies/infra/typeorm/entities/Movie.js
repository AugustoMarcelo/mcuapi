"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var Movie = /** @class */ (function () {
    function Movie() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn('uuid'),
        __metadata("design:type", String)
    ], Movie.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Movie.prototype, "title", void 0);
    __decorate([
        typeorm_1.Column('date'),
        __metadata("design:type", Date)
    ], Movie.prototype, "release_date", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Movie.prototype, "box_office", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Movie.prototype, "duration", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Movie.prototype, "overview", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Movie.prototype, "cover_url", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Movie.prototype, "directed_by", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Movie.prototype, "phase", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", String)
    ], Movie.prototype, "saga", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Movie.prototype, "chronology", void 0);
    __decorate([
        typeorm_1.Column({ default: 0 }),
        __metadata("design:type", Number)
    ], Movie.prototype, "post_credit_scenes", void 0);
    Movie = __decorate([
        typeorm_1.Entity('movies')
    ], Movie);
    return Movie;
}());
exports.default = Movie;
