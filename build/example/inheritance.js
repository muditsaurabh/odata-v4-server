"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
let Category = class Category {
    constructor(title) {
        this.id = Math.floor(Math.random() * 100);
        this.title = title;
    }
};
__decorate([
    lib_1.Edm.Key,
    lib_1.Edm.Computed,
    lib_1.Edm.Int32
], Category.prototype, "id", void 0);
__decorate([
    lib_1.Edm.String
], Category.prototype, "title", void 0);
Category = __decorate([
    lib_1.odata.namespace("InheritanceSchema")
], Category);
exports.Category = Category;
let Subcategory = class Subcategory extends Category {
    constructor(title, subtitle) {
        super(title);
        this.subtitle = subtitle;
    }
};
__decorate([
    lib_1.Edm.String
], Subcategory.prototype, "subtitle", void 0);
Subcategory = __decorate([
    lib_1.odata.namespace("Default")
], Subcategory);
exports.Subcategory = Subcategory;
let Subcategory2 = class Subcategory2 extends Category {
    constructor(title, subtitle) {
        super(title);
        this.subtitle2 = subtitle;
    }
};
__decorate([
    lib_1.Edm.String
], Subcategory2.prototype, "subtitle2", void 0);
Subcategory2 = __decorate([
    lib_1.odata.namespace("Default")
], Subcategory2);
exports.Subcategory2 = Subcategory2;
class SubcategoryDetails extends Subcategory {
    constructor(title, subtitle, description) {
        super(title, subtitle);
        this.description = description;
        this.subid = Math.floor(Math.random() * 100) + 1000;
    }
}
__decorate([
    lib_1.Edm.String
], SubcategoryDetails.prototype, "description", void 0);
__decorate([
    lib_1.Edm.Key,
    lib_1.Edm.Int32
], SubcategoryDetails.prototype, "subid", void 0);
exports.SubcategoryDetails = SubcategoryDetails;
let InheritanceController = class InheritanceController extends lib_1.ODataController {
    all() {
        return [
            { id: 123, title: "Games", "@odata.type": Category },
            new Category("Games"),
            new Subcategory("Games", "Hearthstone"),
            new Subcategory2("Games", "Diablo 3"),
            new SubcategoryDetails("Games", "Diablo 3", "RPG game")
        ];
    }
    one(id, subid) {
        return new SubcategoryDetails("Games", "Diablo 3", "RPG game");
    }
};
__decorate([
    lib_1.odata.GET
], InheritanceController.prototype, "all", null);
__decorate([
    lib_1.odata.GET,
    __param(0, lib_1.odata.key), __param(1, lib_1.odata.key)
], InheritanceController.prototype, "one", null);
InheritanceController = __decorate([
    lib_1.odata.type(Subcategory)
], InheritanceController);
exports.InheritanceController = InheritanceController;
let InheritanceServer = class InheritanceServer extends lib_1.ODataServer {
};
InheritanceServer = __decorate([
    lib_1.odata.controller(InheritanceController, true),
    lib_1.odata.controller(InheritanceController, "Inheritance2")
], InheritanceServer);
exports.InheritanceServer = InheritanceServer;
InheritanceServer.create(3000);
//# sourceMappingURL=inheritance.js.map