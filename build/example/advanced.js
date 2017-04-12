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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const odata_v4_mongodb_1 = require("odata-v4-mongodb");
const index_1 = require("../lib/index");
const model_1 = require("./model");
let categories = require("./categories");
let products = require("./products");
const mongodb = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield mongodb_1.MongoClient.connect("mongodb://localhost:27017/odataserver");
    });
};
let ProductsController = class ProductsController extends index_1.ODataController {
    find(query, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            if (mongodbQuery.query.CategoryId)
                mongodbQuery.query.CategoryId = new mongodb_1.ObjectID(mongodbQuery.query.CategoryId);
            return (yield mongodb()).collection("Products").find(mongodbQuery.query, mongodbQuery.projection, mongodbQuery.skip, mongodbQuery.limit).stream().pipe(stream);
        });
    }
    findOne(key, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            return (yield mongodb()).collection("Products").findOne({ _id: new mongodb_1.ObjectID(key) }, {
                fields: mongodbQuery.projection
            });
        });
    }
    getCategory(result) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield mongodb()).collection("Categories").findOne({ _id: result.CategoryId });
        });
    }
};
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.query), __param(1, index_1.odata.stream)
], ProductsController.prototype, "find", null);
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.key), __param(1, index_1.odata.query)
], ProductsController.prototype, "findOne", null);
__decorate([
    index_1.odata.GET("Category"),
    __param(0, index_1.odata.result)
], ProductsController.prototype, "getCategory", null);
ProductsController = __decorate([
    index_1.odata.type(model_1.Product),
    index_1.Edm.EntitySet("Products")
], ProductsController);
exports.ProductsController = ProductsController;
let CategoriesController = class CategoriesController extends index_1.ODataController {
    find(query, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            return (yield mongodb()).collection("Categories").find(mongodbQuery.query, mongodbQuery.projection, mongodbQuery.skip, mongodbQuery.limit).stream().pipe(stream);
        });
    }
    findOne(key, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            return (yield mongodb()).collection("Categories").findOne({ _id: new mongodb_1.ObjectID(key) }, {
                fields: mongodbQuery.projection
            });
        });
    }
    getProducts(result, query, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            mongodbQuery.query = { $and: [mongodbQuery.query, { CategoryId: result._id }] };
            return (yield mongodb()).collection("Products").find(mongodbQuery.query, mongodbQuery.projection, mongodbQuery.skip, mongodbQuery.limit).stream().pipe(stream);
        });
    }
};
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.query), __param(1, index_1.odata.stream)
], CategoriesController.prototype, "find", null);
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.key()), __param(1, index_1.odata.query)
], CategoriesController.prototype, "findOne", null);
__decorate([
    index_1.odata.GET("Products"),
    __param(0, index_1.odata.result), __param(1, index_1.odata.query), __param(2, index_1.odata.stream)
], CategoriesController.prototype, "getProducts", null);
CategoriesController = __decorate([
    index_1.odata.type(model_1.Category),
    index_1.Edm.EntitySet("Categories")
], CategoriesController);
exports.CategoriesController = CategoriesController;
let NorthwindODataServer = class NorthwindODataServer extends index_1.ODataServer {
    *GetCategoryById(id) {
        return yield categories.filter((category) => category._id.toString() == id)[0];
    }
    initDb() {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield mongodb();
            yield db.dropDatabase();
            let categoryCollection = db.collection("Categories");
            let productsCollection = db.collection("Products");
            yield categoryCollection.insertMany(categories);
            yield productsCollection.insertMany(products);
        });
    }
};
__decorate([
    index_1.Edm.EntityType(model_1.Category),
    index_1.Edm.FunctionImport,
    __param(0, index_1.Edm.String)
], NorthwindODataServer.prototype, "GetCategoryById", null);
__decorate([
    index_1.Edm.ActionImport
], NorthwindODataServer.prototype, "initDb", null);
NorthwindODataServer = __decorate([
    index_1.odata.namespace("Northwind"),
    index_1.odata.container("NorthwindContext"),
    index_1.odata.controller(ProductsController),
    index_1.odata.controller(CategoriesController),
    index_1.odata.cors
], NorthwindODataServer);
exports.NorthwindODataServer = NorthwindODataServer;
index_1.createODataServer(NorthwindODataServer, "/odata", 3000);
//# sourceMappingURL=advanced.js.map