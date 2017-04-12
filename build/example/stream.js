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
const fs = require("fs");
const path = require("path");
const mongodb_1 = require("mongodb");
const odata_v4_mongodb_1 = require("odata-v4-mongodb");
const stream_1 = require("stream");
const index_1 = require("../lib/index");
const model_1 = require("./model");
const mongodb = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield mongodb_1.MongoClient.connect("mongodb://localhost:27017/odataserver");
    });
};
const delay = function (ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
};
let ProductsController = class ProductsController extends index_1.ODataController {
    /*@odata.GET
    *find(@odata.query query:ODataQuery, @odata.stream stream:Writable):any{
        let db:Db = yield mongodb();
        let mongodbQuery = createQuery(query);
        if (typeof mongodbQuery.query._id == "string") mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        if (typeof mongodbQuery.query.CategoryId == "string") mongodbQuery.query.CategoryId = new ObjectID(mongodbQuery.query.CategoryId);
        return db.collection("Products")
            .find(
                mongodbQuery.query,
                mongodbQuery.projection,
                mongodbQuery.skip,
                mongodbQuery.limit
            ).stream().pipe(stream);
    }*/
    // example using generator with mongodb .next() and passing entity data into OData stream
    *find(query, stream) {
        let db = yield mongodb();
        let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
        if (typeof mongodbQuery.query._id == "string")
            mongodbQuery.query._id = new mongodb_1.ObjectID(mongodbQuery.query._id);
        if (typeof mongodbQuery.query.CategoryId == "string")
            mongodbQuery.query.CategoryId = new mongodb_1.ObjectID(mongodbQuery.query.CategoryId);
        let cursor = db.collection("Products")
            .find(mongodbQuery.query, mongodbQuery.projection, mongodbQuery.skip, mongodbQuery.limit);
        let item = yield cursor.next();
        while (item) {
            stream.write(item);
            item = yield cursor.next();
        }
        stream.end();
    }
    *findOne(key, query) {
        let db = yield mongodb();
        let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
        return db.collection("Products").findOne({ _id: new mongodb_1.ObjectID(key) }, {
            fields: mongodbQuery.projection
        });
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield mongodb();
            if (data.CategoryId)
                data.CategoryId = new mongodb_1.ObjectID(data.CategoryId);
            return yield db.collection("Products").insert(data).then((result) => {
                data._id = result.insertedId;
                return data;
            });
        });
    }
};
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.query), __param(1, index_1.odata.stream)
], ProductsController.prototype, "find", null);
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.key()), __param(1, index_1.odata.query)
], ProductsController.prototype, "findOne", null);
__decorate([
    index_1.odata.POST,
    __param(0, index_1.odata.body)
], ProductsController.prototype, "insert", null);
ProductsController = __decorate([
    index_1.odata.type(model_1.Product)
], ProductsController);
let CategoriesController = class CategoriesController extends index_1.ODataController {
    *find(query, stream) {
        let db = yield mongodb();
        let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
        if (typeof mongodbQuery.query._id == "string")
            mongodbQuery.query._id = new mongodb_1.ObjectID(mongodbQuery.query._id);
        let cursor = db.collection("Categories")
            .find(mongodbQuery.query, mongodbQuery.projection, mongodbQuery.skip, mongodbQuery.limit);
        let result = yield cursor.toArray();
        result.inlinecount = yield cursor.count(false);
        return result;
    }
    *findOne(key, query) {
        let db = yield mongodb();
        let mongodbQuery = odata_v4_mongodb_1.createQuery(query);
        return db.collection("Categories").findOne({ _id: new mongodb_1.ObjectID(key) }, {
            fields: mongodbQuery.projection
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
CategoriesController = __decorate([
    index_1.odata.type(model_1.Category)
], CategoriesController);
let Music = class Music extends stream_1.PassThrough {
};
__decorate([
    index_1.Edm.Key,
    index_1.Edm.Computed,
    index_1.Edm.Int32
], Music.prototype, "Id", void 0);
__decorate([
    index_1.Edm.String
], Music.prototype, "Artist", void 0);
__decorate([
    index_1.Edm.String
], Music.prototype, "Title", void 0);
Music = __decorate([
    index_1.Edm.MediaEntity("audio/mp3")
], Music);
let MusicController = class MusicController extends index_1.ODataController {
    findOne(key, context) {
        let music = new Music();
        music.Id = 1;
        music.Artist = "Dream Theater";
        music.Title = "Six degrees of inner turbulence";
        return music;
    }
    mp3(key, context) {
        let file = fs.createReadStream("tmp.mp3");
        return new Promise((resolve, reject) => {
            file.on("open", () => {
                context.response.on("finish", () => {
                    file.close();
                });
                resolve(file);
            }).on("error", reject);
        });
    }
    post(key, upload) {
        let file = fs.createWriteStream("tmp.mp3");
        return new Promise((resolve, reject) => {
            file.on('open', () => {
                upload.pipe(file);
            }).on('error', reject);
            upload.on('end', resolve);
        });
    }
};
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.key()), __param(1, index_1.odata.context)
], MusicController.prototype, "findOne", null);
__decorate([
    index_1.odata.GET.$value,
    __param(0, index_1.odata.key), __param(1, index_1.odata.context)
], MusicController.prototype, "mp3", null);
__decorate([
    index_1.odata.POST.$value,
    __param(0, index_1.odata.key), __param(1, index_1.odata.body)
], MusicController.prototype, "post", null);
MusicController = __decorate([
    index_1.odata.type(Music)
], MusicController);
class ImageMember {
}
__decorate([
    index_1.Edm.String
], ImageMember.prototype, "value", void 0);
class Image {
}
__decorate([
    index_1.Edm.Key,
    index_1.Edm.Computed,
    index_1.Edm.Int32
], Image.prototype, "Id", void 0);
__decorate([
    index_1.Edm.String
], Image.prototype, "Filename", void 0);
__decorate([
    index_1.Edm.Collection(index_1.Edm.ComplexType(ImageMember))
], Image.prototype, "Members", void 0);
__decorate([
    index_1.Edm.Stream("image/png")
], Image.prototype, "Data", void 0);
__decorate([
    index_1.Edm.Stream("image/png")
], Image.prototype, "Data2", void 0);
let ImagesController = class ImagesController extends index_1.ODataController {
    images(id, context) {
        let image = new Image();
        image.Id = id;
        image.Filename = "tmp.png";
        return image;
    }
    *getMembers(id, stream) {
        for (let i = 0; i < 10; i++) {
            stream.write({ value: `Member #${i}` });
            yield delay(1);
        }
        stream.end();
    }
    getData(id, context) {
        return new index_1.ODataStream(fs.createReadStream("tmp.png")).pipe(context.response);
    }
    postData(id, data) {
        return new index_1.ODataStream(fs.createWriteStream("tmp.png")).write(data);
    }
};
__decorate([
    index_1.odata.GET,
    __param(0, index_1.odata.key), __param(1, index_1.odata.context)
], ImagesController.prototype, "images", null);
__decorate([
    index_1.odata.GET("Members"),
    __param(0, index_1.odata.key), __param(1, index_1.odata.stream)
], ImagesController.prototype, "getMembers", null);
__decorate([
    index_1.odata.GET("Data"),
    index_1.odata.GET("Data2").$value,
    __param(0, index_1.odata.key), __param(1, index_1.odata.context)
], ImagesController.prototype, "getData", null);
__decorate([
    index_1.odata.POST("Data"),
    index_1.odata.POST("Data2").$value,
    __param(0, index_1.odata.key), __param(1, index_1.odata.body)
], ImagesController.prototype, "postData", null);
ImagesController = __decorate([
    index_1.odata.type(Image)
], ImagesController);
let StreamServer = class StreamServer extends index_1.ODataServer {
    Fetch(filename, stream, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = fs.createReadStream(filename);
            return file.on("open", () => {
                context.response.contentType(path.extname(filename));
                file.pipe(stream);
            });
        });
    }
};
__decorate([
    index_1.Edm.FunctionImport(index_1.Edm.Stream),
    __param(0, index_1.Edm.String), __param(1, index_1.odata.stream), __param(2, index_1.odata.context)
], StreamServer.prototype, "Fetch", null);
StreamServer = __decorate([
    index_1.odata.controller(ProductsController, true),
    index_1.odata.controller(CategoriesController, true),
    index_1.odata.controller(MusicController, true),
    index_1.odata.controller(ImagesController, true)
], StreamServer);
StreamServer.create("/odata", 3000);
//# sourceMappingURL=stream.js.map