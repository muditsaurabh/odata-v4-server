"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("odata-v4-parser/lib/lexer");
const ODataParser = require("odata-v4-parser");
const extend = require("extend");
const url = require("url");
const qs = require("qs");
const util = require("util");
const stream_1 = require("stream");
const utils_1 = require("./utils");
const result_1 = require("./result");
const visitor_1 = require("./visitor");
const Edm = require("./edm");
const odata = require("./odata");
const error_1 = require("./error");
const getODataRoot = function (context) {
    return (context.protocol || "http") + "://" + (context.host || "localhost") + (context.base || "");
};
const createODataContext = function (context, entitySets, server, resourcePath, processor) {
    let odataContextBase = getODataRoot(context) + "/$metadata#";
    let odataContext = "";
    let prevResource = null;
    let prevType = server;
    let selectContext = "";
    if (processor.query && processor.query.$select) {
        selectContext = `(${processor.query.$select})`;
    }
    resourcePath.navigation.forEach((baseResource, i) => {
        let next = resourcePath.navigation[i + 1];
        let selectContextPart = (i == resourcePath.navigation.length - 1) ? selectContext : "";
        if (next && next.type == lexer_1.TokenType.RefExpression)
            return;
        if (baseResource.type == lexer_1.TokenType.EntitySetName) {
            prevResource = baseResource;
            prevType = baseResource.key ? entitySets[baseResource.name].prototype.elementType : entitySets[baseResource.name];
            odataContext += baseResource.name;
            odataContext += selectContextPart;
            if (baseResource.key && resourcePath.navigation.indexOf(baseResource) == resourcePath.navigation.length - 1)
                return odataContext += "/$entity";
            if (baseResource.key) {
                return odataContext += "(" + baseResource.key.map((key) => key.raw).join(",") + ")";
            }
        }
        else if (getResourcePartFunction(baseResource.type) && !(baseResource.name in expCalls)) {
            odataContext = "";
            if (prevResource) {
                let target = prevType || entitySets[prevResource.name];
                if (!target)
                    return;
                let propertyKey = baseResource.name.split(".").pop();
                let returnType = Edm.getReturnType(target, propertyKey);
                let returnTypeName = Edm.getReturnTypeName(target, propertyKey);
                if (typeof returnType == "function") {
                    prevType = returnType;
                    let ctrl = server.getController(returnType);
                    let entitySet = null;
                    for (let prop in entitySets) {
                        if (entitySets[prop] == ctrl) {
                            entitySet = prop;
                            break;
                        }
                    }
                    returnType = entitySet ? entitySet + (returnTypeName.indexOf("Collection") == 0 ? selectContextPart : selectContextPart + "/$entity") : returnTypeName;
                }
                else
                    returnType = returnTypeName;
                return odataContext += returnType;
            }
            else {
                let call = baseResource.name;
                let returnType = Edm.getReturnType(server, call);
                let returnTypeName = Edm.getReturnTypeName(server, call);
                if (typeof returnType == "function") {
                    prevType = returnType;
                    let ctrl = server.getController(returnType);
                    let entitySet = null;
                    for (let prop in entitySets) {
                        if (entitySets[prop] == ctrl) {
                            entitySet = prop;
                            break;
                        }
                    }
                    returnType = entitySet ? entitySet + (returnTypeName.indexOf("Collection") == 0 ? selectContextPart : selectContextPart + "/$entity") : returnTypeName;
                }
                else
                    returnType = returnTypeName;
                return odataContext += returnType;
            }
        }
        if (baseResource.type == lexer_1.TokenType.EntityCollectionNavigationProperty) {
            prevResource = baseResource;
            odataContext += "/" + baseResource.name;
            prevType = baseResource.key ? Edm.getType(prevType, baseResource.name) : server.getController(Edm.getType(prevType, baseResource.name));
            let ctrl = server.getController(prevType);
            let entitySet = null;
            for (let prop in entitySets) {
                if (entitySets[prop] == ctrl) {
                    entitySet = prop;
                    break;
                }
            }
            if (entitySet)
                odataContext = entitySet;
            odataContext += selectContextPart;
            if (baseResource.key && resourcePath.navigation.indexOf(baseResource) == resourcePath.navigation.length - 1)
                return odataContext += "/$entity";
            if (baseResource.key) {
                return odataContext += "(" + baseResource.key.map((key) => key.raw).join(",") + ")";
            }
            return odataContext;
        }
        if (baseResource.type == lexer_1.TokenType.EntityNavigationProperty) {
            prevResource = baseResource;
            prevType = Edm.getType(prevType, baseResource.name);
            let ctrl = server.getController(prevType);
            let entitySet = null;
            for (let prop in entitySets) {
                if (entitySets[prop] == ctrl) {
                    entitySet = prop;
                    break;
                }
            }
            return entitySet ? odataContext = entitySet + selectContextPart + "/$entity" : odataContext += "/" + baseResource.name;
        }
        if (baseResource.type == lexer_1.TokenType.PrimitiveProperty ||
            baseResource.type == lexer_1.TokenType.PrimitiveCollectionProperty ||
            baseResource.type == lexer_1.TokenType.ComplexProperty ||
            baseResource.type == lexer_1.TokenType.ComplexCollectionProperty) {
            prevType = Edm.getType(prevType, baseResource.name);
            return odataContext += "/" + baseResource.name;
        }
    });
    return odataContextBase + odataContext;
};
const fnCaller = function (fn, params) {
    params = params || {};
    let fnParams;
    fnParams = utils_1.getFunctionParameters(fn);
    for (var i = 0; i < fnParams.length; i++) {
        fnParams[i] = params[fnParams[i]];
    }
    return fn.apply(this, fnParams);
};
const ODataRequestMethods = ["get", "post", "put", "patch", "delete"];
const ODataRequestResult = {
    get: result_1.ODataResult.Ok,
    post: result_1.ODataResult.Created,
    put: (result, contentType) => {
        return (result ? result_1.ODataResult.Created : result_1.ODataResult.NoContent)(result, contentType);
    },
    patch: result_1.ODataResult.NoContent,
    delete: result_1.ODataResult.NoContent
};
const expCalls = {
    $count: function (processor) {
        return this.body && this.body.value ? (this.body.value.length || 0) : 0;
    },
    $value: function (processor) {
        let prevPart = processor.resourcePath.navigation[processor.resourcePath.navigation.length - 2];
        let fn = odata.findODataMethod(processor.ctrl, `${processor.method}/$value`, prevPart.key || []);
        if (fn) {
            let ctrl = processor.ctrl;
            let params = {};
            if (prevPart.key)
                prevPart.key.forEach((key) => params[key.name] = key.value);
            let fnDesc = fn;
            processor.__applyParams(ctrl, fnDesc.call, params, processor.url.query, this);
            fn = ctrl.prototype[fnDesc.call];
            if (fnDesc.key.length == 1 && prevPart.key.length == 1 && fnDesc.key[0].to != prevPart.key[0].name) {
                params[fnDesc.key[0].to] = params[prevPart.key[0].name];
                delete params[prevPart.key[0].name];
            }
            else {
                for (let i = 0; i < fnDesc.key.length; i++) {
                    if (fnDesc.key[i].to != fnDesc.key[i].from) {
                        params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                        delete params[fnDesc.key[i].from];
                    }
                }
            }
            let currentResult = fnCaller.call(ctrl, fn, params);
            if (utils_1.isIterator(fn)) {
                currentResult = run(currentResult, defaultHandlers);
            }
            if (!utils_1.isPromise(currentResult)) {
                currentResult = Promise.resolve(currentResult);
            }
            if (prevPart.type == "PrimitiveProperty" || prevPart.type == "PrimitiveKeyProperty")
                return currentResult.then(value => value.toString());
            return currentResult;
        }
        else {
            if (this.stream)
                return Promise.resolve(this.stream);
            if (this.body) {
                let result = this.body.value || this.body;
                for (let prop in result) {
                    if (prop.indexOf("@odata") >= 0)
                        delete result[prop];
                }
                result = result.value || result;
                if (typeof result == "object" && (prevPart.type == "PrimitiveProperty" || prevPart.type == "PrimitiveKeyProperty"))
                    return Promise.resolve(result.toString());
                return Promise.resolve(result);
            }
        }
    },
    $ref: function (processor) {
        let prevPart = processor.resourcePath.navigation[processor.resourcePath.navigation.length - 2];
        let routePart = processor.resourcePath.navigation[processor.resourcePath.navigation.length - 3];
        let fn = odata.findODataMethod(processor.prevCtrl, processor.method + "/" + prevPart.name + "/$ref", routePart.key || []);
        if (processor.method == "get") {
            return {
                "@odata.context": `${getODataRoot(processor.context)}/$metadata#$ref`,
                "@odata.id": `${this.body["@odata.id"]}/${prevPart.name}`
            };
        }
        if (!fn)
            throw new error_1.ResourceNotFoundError();
        let linkUrl = (processor.resourcePath.id || (processor.body || {})["@odata.id"] || "").replace(getODataRoot(processor.context), "");
        let linkAst, linkPath, linkPart;
        if (linkUrl) {
            linkUrl = decodeURIComponent(linkUrl);
            processor.emit("header", { "OData-EntityId": linkUrl });
            linkAst = ODataParser.odataUri(linkUrl, { metadata: processor.serverType.$metadata().edmx });
            linkPath = new visitor_1.ResourcePathVisitor().Visit(linkAst);
            linkPart = linkPath.navigation[linkPath.navigation.length - 1];
        }
        else
            linkPart = prevPart;
        let ctrl = processor.prevCtrl;
        let params = {};
        if (routePart.key)
            routePart.key.forEach((key) => params[key.name] = key.value);
        let fnDesc = fn;
        processor.__applyParams(ctrl, fnDesc.call, params, processor.url.query, this);
        fn = ctrl.prototype[fnDesc.call];
        if (fnDesc.key.length == 1 && routePart.key.length == 1 && fnDesc.key[0].to != routePart.key[0].name) {
            params[fnDesc.key[0].to] = params[routePart.key[0].name];
            delete params[routePart.key[0].name];
        }
        else {
            for (let i = 0; i < fnDesc.key.length; i++) {
                if (fnDesc.key[i].to != fnDesc.key[i].from) {
                    params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                    delete params[fnDesc.key[i].from];
                }
            }
        }
        let linkParams = {};
        if (linkPart.key)
            linkPart.key.forEach((key) => linkParams[key.name] = key.value);
        if (fnDesc.link.length == 1 && linkPart.key.length == 1 && fnDesc.link[0].to != linkPart.key[0].name) {
            params[fnDesc.link[0].to] = linkParams[linkPart.key[0].name];
        }
        else {
            for (let i = 0; i < fnDesc.link.length; i++) {
                params[fnDesc.link[i].to] = linkParams[fnDesc.link[i].from];
            }
        }
        let currentResult = fnCaller.call(ctrl, fn, params);
        if (utils_1.isIterator(fn)) {
            currentResult = run(currentResult, defaultHandlers);
        }
        if (!utils_1.isPromise(currentResult)) {
            currentResult = Promise.resolve(currentResult);
        }
        return currentResult;
    }
};
const getResourcePartFunction = (type) => {
    switch (type) {
        case "PrimitiveFunctionImportCall":
        case "PrimitiveCollectionFunctionImportCall":
        case "ComplexFunctionImportCall":
        case "ComplexCollectionFunctionImportCall":
        case "EntityFunctionImportCall":
        case "EntityCollectionFunctionImportCall":
        case "ActionImportCall":
        case "ActionImport":
            return "__actionOrFunctionImport";
        case "BoundPrimitiveFunctionCall":
        case "BoundPrimitiveCollectionFunctionCall":
        case "BoundComplexFunctionCall":
        case "BoundComplexCollectionFunctionCall":
        case "BoundEntityFunctionCall":
        case "BoundEntityCollectionFunctionCall":
        case "BoundActionCall":
        case "BoundAction":
        case "CountExpression":
        case "ValueExpression":
        case "RefExpression":
            return "__actionOrFunction";
    }
};
const jsPrimitiveTypes = [
    Object,
    String,
    Boolean,
    Number,
    Date
];
const writeMethods = [
    "delete",
    "post",
    "put",
    "patch"
];
var ODataGeneratorHandlers;
(function (ODataGeneratorHandlers) {
    function PromiseHandler(request, next) {
        if (utils_1.isPromise(request)) {
            return request.then(next);
        }
    }
    ODataGeneratorHandlers.PromiseHandler = PromiseHandler;
    function StreamHandler(request, next) {
        if (utils_1.isStream(request)) {
            return new Promise((resolve, reject) => {
                request.on("end", resolve);
                request.on("error", reject);
            }).then(next);
        }
    }
    ODataGeneratorHandlers.StreamHandler = StreamHandler;
    function GeneratorHandler(request, next) {
        if (utils_1.isIterator(request)) {
            return run(request(), defaultHandlers).then(next);
        }
    }
    ODataGeneratorHandlers.GeneratorHandler = GeneratorHandler;
})(ODataGeneratorHandlers = exports.ODataGeneratorHandlers || (exports.ODataGeneratorHandlers = {}));
const defaultHandlers = [
    ODataGeneratorHandlers.GeneratorHandler,
    ODataGeneratorHandlers.PromiseHandler,
    ODataGeneratorHandlers.StreamHandler
];
function run(iterator, handlers) {
    function id(x) { return x; }
    function iterate(value) {
        let next = iterator.next(value);
        let request = next.value;
        let nextAction = next.done ? id : iterate;
        for (let handler of handlers) {
            let action = handler(request, nextAction);
            if (typeof action != "undefined")
                return action;
        }
        return nextAction(request);
    }
    return iterate();
}
class ODataStreamWrapper extends stream_1.Transform {
    constructor() {
        super({
            objectMode: true
        });
        this.buffer = [];
    }
    _transform(chunk, encoding, done) {
        this.buffer.push(chunk);
        if (typeof done == "function")
            done();
    }
    _flush(done) {
        if (typeof done == "function")
            done();
    }
    toPromise() {
        return new Promise((resolve, reject) => {
            this.on("finish", () => {
                resolve(this.buffer);
            });
            this.on("error", reject);
        });
    }
}
class StreamWrapper {
    constructor(value) {
        this.stream = value;
    }
    toJSON() {
        return undefined;
    }
}
var ODataMetadataType;
(function (ODataMetadataType) {
    ODataMetadataType[ODataMetadataType["minimal"] = 0] = "minimal";
    ODataMetadataType[ODataMetadataType["full"] = 1] = "full";
    ODataMetadataType[ODataMetadataType["none"] = 2] = "none";
})(ODataMetadataType = exports.ODataMetadataType || (exports.ODataMetadataType = {}));
class ODataProcessor extends stream_1.Transform {
    constructor(context, server, options) {
        super({
            objectMode: true
        });
        this.streamStart = false;
        this.streamEnabled = false;
        this.streamEnd = false;
        this.resultCount = 0;
        this.context = context;
        this.serverType = server;
        this.options = options || {};
        let method = this.method = context.method.toLowerCase();
        if (ODataRequestMethods.indexOf(method) < 0)
            throw new error_1.MethodNotAllowedError();
        this.url = url.parse(context.url);
        this.query = qs.parse(this.url.query);
        let ast = ODataParser.odataUri(context.url, { metadata: this.serverType.$metadata().edmx });
        let resourcePath = this.resourcePath = new visitor_1.ResourcePathVisitor().Visit(ast);
        let entitySets = this.entitySets = odata.getPublicControllers(this.serverType);
        this.odataContext = createODataContext(context, entitySets, server, resourcePath, this);
        if (resourcePath.navigation.length == 0)
            throw new error_1.ResourceNotFoundError();
        this.workflow = resourcePath.navigation.map((part, i) => {
            let next = resourcePath.navigation[i + 1];
            if (next && next.type == lexer_1.TokenType.RefExpression)
                return;
            let fn = this[getResourcePartFunction(part.type) || ("__" + part.type)];
            if (fn)
                return fn.call(this, part);
        }).filter(it => !!it);
        this.workflow.push((result) => {
            return new Promise((resolve, reject) => {
                if (result && result.statusCode && result.statusCode == 201) {
                    this.emit("header", {
                        "Location": result.body["@odata.id"]
                    });
                }
                resolve(result);
            });
        });
    }
    _transform(chunk, encoding, done) {
        if (this.streamEnabled) {
            if (!(chunk instanceof Buffer)) {
                if (!this.streamStart) {
                    this.push("{");
                    if (this.options.metadata != ODataMetadataType.none) {
                        this.push(`"@odata.context":"${this.odataContext}",`);
                    }
                    this.push('"value":[');
                }
                else
                    this.push(',');
                try {
                    this.streamStart = true;
                    if (chunk instanceof Object) {
                        if (chunk["@odata.count"] || chunk.inlinecount) {
                            this.streamInlineCount = chunk["@odata.count"] || chunk.inlinecount;
                        }
                        let entity = {};
                        if (this.ctrl)
                            this.__appendLinks(this.ctrl, this.ctrl.prototype.elementType, entity, chunk);
                        this.__convertEntity(entity, chunk, this.elementType || this.ctrl.prototype.elementType, this.resourcePath.includes).then(() => {
                            chunk = JSON.stringify(entity);
                            this.push(chunk);
                            if (typeof done == "function")
                                done();
                        }, (err) => {
                            console.log(err);
                            if (typeof done == "function")
                                done(err);
                        });
                    }
                    else {
                        this.push(JSON.stringify(chunk));
                        if (typeof done == "function")
                            done();
                    }
                }
                catch (err) {
                    console.log(err);
                    if (typeof done == "function")
                        done(err);
                }
            }
            else {
                this.push(chunk);
                if (typeof done == "function")
                    done();
            }
        }
        else {
            this.resultCount++;
            if (typeof done == "function")
                done();
        }
    }
    _flush(done) {
        if (this.streamEnabled) {
            if (this.streamStart) {
                if (typeof this.streamInlineCount == "number") {
                    this.push(`],"@odata.count":${this.streamInlineCount}}`);
                }
                else
                    this.push("]}");
            }
            else {
                if (this.options.metadata != ODataMetadataType.none) {
                    this.push('{"value":[]}');
                }
                else {
                    this.push(`{"@odata.context":"${this.odataContext}","value":[]}`);
                }
            }
        }
        this.streamEnd = true;
        if (typeof done == "function")
            done();
    }
    __EntityCollectionNavigationProperty(part) {
        return (result) => {
            let resultType = result.elementType;
            let elementType = Edm.getType(resultType, part.name);
            let partIndex = this.resourcePath.navigation.indexOf(part);
            let method = writeMethods.indexOf(this.method) >= 0 && partIndex < this.resourcePath.navigation.length - 1
                ? "get"
                : this.method;
            let fn = odata.findODataMethod(this.ctrl, `${method}/${part.name}`, part.key);
            if (fn) {
                let ctrl = this.ctrl;
                let fnDesc = fn;
                let params = {};
                if (part.key)
                    part.key.forEach((key) => params[key.name] = key.value);
                this.__applyParams(ctrl, fnDesc.call, params, this.url.query, result);
                fn = ctrl.prototype[fnDesc.call];
                if (fnDesc.key.length == 1 && part.key.length == 1 && fnDesc.key[0].to != part.key[0].name) {
                    params[fnDesc.key[0].to] = params[part.key[0].name];
                    delete params[part.key[0].name];
                }
                else {
                    for (let i = 0; i < fnDesc.key.length; i++) {
                        if (fnDesc.key[i].to != fnDesc.key[i].from) {
                            params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                            delete params[fnDesc.key[i].from];
                        }
                    }
                }
                if (part.key)
                    part.key.forEach((key) => params[key.name] = key.value);
                return this.__read(ctrl, part, params, result, fn, elementType).then((result) => {
                    this.ctrl = this.serverType.getController(elementType);
                    return result;
                });
            }
            else {
                let ctrl = this.serverType.getController(elementType);
                let foreignKeys = Edm.getForeignKeys(resultType, part.name);
                let typeKeys = Edm.getKeyProperties(resultType);
                result.foreignKeys = {};
                let foreignFilter = foreignKeys.map((key) => {
                    result.foreignKeys[key] = result.body[typeKeys[0]];
                    return `${key} eq ${Edm.escape(result.body[typeKeys[0]], Edm.getTypeName(elementType, key))}`;
                }).join(" and ");
                let params = {};
                if (part.key)
                    part.key.forEach((key) => params[key.name] = key.value);
                return this.__read(ctrl, part, params, result, foreignFilter);
            }
        };
    }
    __EntityNavigationProperty(part) {
        return (result) => {
            let resultType = result.elementType;
            let elementType = Edm.getType(resultType, part.name);
            let partIndex = this.resourcePath.navigation.indexOf(part);
            let method = writeMethods.indexOf(this.method) >= 0 && partIndex < this.resourcePath.navigation.length - 1
                ? "get"
                : this.method;
            let fn = odata.findODataMethod(this.ctrl, `${method}/${part.name}`, part.key);
            if (fn) {
                let ctrl = this.ctrl;
                let fnDesc = fn;
                let params = {};
                if (part.key)
                    part.key.forEach((key) => params[key.name] = key.value);
                this.__applyParams(ctrl, fnDesc.call, params, this.url.query, result);
                fn = ctrl.prototype[fnDesc.call];
                if (fnDesc.key.length == 1 && part.key.length == 1 && fnDesc.key[0].to != part.key[0].name) {
                    params[fnDesc.key[0].to] = params[part.key[0].name];
                    delete params[part.key[0].name];
                }
                else {
                    for (let i = 0; i < fnDesc.key.length; i++) {
                        if (fnDesc.key[i].to != fnDesc.key[i].from) {
                            params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                            delete params[fnDesc.key[i].from];
                        }
                    }
                }
                return this.__read(ctrl, part, params, result, fn, elementType).then((result) => {
                    this.ctrl = this.serverType.getController(elementType);
                    return result;
                });
            }
            else {
                let ctrl = this.serverType.getController(elementType);
                let foreignKeys = Edm.getForeignKeys(resultType, part.name);
                result.foreignKeys = {};
                part.key = foreignKeys.map((key) => {
                    result.foreignKeys[key] = result.body[key];
                    return {
                        name: key,
                        value: result.body[key]
                    };
                });
                let params = {};
                if (part.key)
                    part.key.forEach((key) => params[key.name] = key.value);
                return this.__read(ctrl, part, params, result);
            }
        };
    }
    __PrimitiveProperty(part) {
        return (result) => {
            return new Promise((resolve, reject) => {
                this.__enableStreaming(part);
                let currentResult;
                let prevPart = this.resourcePath.navigation[this.resourcePath.navigation.indexOf(part) - 1];
                let fn = odata.findODataMethod(this.ctrl, `${this.method}/${part.name}`, prevPart.key || []) ||
                    odata.findODataMethod(this.ctrl, `${this.method}/${part.name}/$value`, prevPart.key || []);
                if (!fn && this.method != "get") {
                    fn = this.method == "delete"
                        ? odata.findODataMethod(this.ctrl, "patch", prevPart.key || [])
                        : odata.findODataMethod(this.ctrl, `${this.method}`, prevPart.key || []);
                    if (fn) {
                        let body = this.body;
                        if (Edm.getTypeName(result.elementType, part.name) != "Edm.Stream")
                            body = body.body || body;
                        this.body = {};
                        this.body[part.name] = this.method == "delete" ? null : body.value || body;
                    }
                }
                if (fn) {
                    let ctrl = this.prevCtrl;
                    let params = {};
                    if (prevPart.key)
                        prevPart.key.forEach((key) => params[key.name] = key.value);
                    let fnDesc = fn;
                    this.__applyParams(ctrl, fnDesc.call, params, this.url.query, this);
                    fn = ctrl.prototype[fnDesc.call];
                    if (fnDesc.key.length == 1 && prevPart.key.length == 1 && fnDesc.key[0].to != prevPart.key[0].name) {
                        params[fnDesc.key[0].to] = params[prevPart.key[0].name];
                        delete params[prevPart.key[0].name];
                    }
                    else {
                        for (let i = 0; i < fnDesc.key.length; i++) {
                            if (fnDesc.key[i].to != fnDesc.key[i].from) {
                                params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                                delete params[fnDesc.key[i].from];
                            }
                        }
                    }
                    this.elementType = Edm.getType(result.elementType, part.name) || Object;
                    if (typeof this.elementType == "string")
                        this.elementType = Object;
                    currentResult = fnCaller.call(ctrl, fn, params);
                    if (utils_1.isIterator(fn)) {
                        currentResult = run(currentResult, defaultHandlers);
                    }
                    if (!utils_1.isPromise(currentResult)) {
                        currentResult = Promise.resolve(currentResult);
                    }
                }
                else {
                    let value = result.body[part.name];
                    if (value instanceof StreamWrapper) {
                        value = value.stream;
                    }
                    currentResult = Promise.resolve(value);
                }
                if (this.method == "get") {
                    currentResult.then((value) => {
                        try {
                            result.body = {
                                "@odata.context": this.options.metadata != ODataMetadataType.none ? result.body["@odata.context"] : undefined,
                                value: value
                            };
                            let elementType = result.elementType;
                            if (value instanceof Object)
                                result.elementType = Edm.getType(result.elementType, part.name) || Object;
                            if (value && (utils_1.isStream(value) || utils_1.isStream(value.stream))) {
                                this.emit("header", { "Content-Type": Edm.getContentType(elementType.prototype, part.name) || value.contentType || "application/octet-stream" });
                                if (value.stream)
                                    value = value.stream;
                                value.pipe(this);
                                value.on("end", resolve);
                                value.on("error", reject);
                            }
                            else {
                                if (this.streamEnabled && this.streamStart)
                                    delete result.body;
                                resolve(result);
                            }
                        }
                        catch (err) {
                            console.log(err);
                            reject(err);
                        }
                    }, reject);
                }
                else {
                    result_1.ODataResult.NoContent(currentResult).then(resolve, reject);
                }
            });
        };
    }
    __PrimitiveKeyProperty(part) {
        return this.__PrimitiveProperty(part);
    }
    __PrimitiveCollectionProperty(part) {
        return this.__PrimitiveProperty(part);
    }
    __ComplexProperty(part) {
        return this.__PrimitiveProperty(part);
    }
    __ComplexCollectionProperty(part) {
        return this.__PrimitiveProperty(part);
    }
    __read(ctrl, part, params, data, filter, elementType, include) {
        return new Promise((resolve, reject) => {
            if (this.ctrl)
                this.prevCtrl = this.ctrl;
            else
                this.prevCtrl = ctrl;
            this.ctrl = ctrl;
            let method = writeMethods.indexOf(this.method) >= 0 &&
                this.resourcePath.navigation.indexOf(part) < this.resourcePath.navigation.length - 1
                ? "get"
                : this.method;
            this.instance = new ctrl();
            let fn;
            if (typeof filter == "string" || !filter) {
                fn = odata.findODataMethod(ctrl, method, part.key);
                if (!fn)
                    return reject(new error_1.ResourceNotFoundError());
                let queryString = filter ? `$filter=${filter}` : (include || this.url).query;
                if (include && filter && include.query && !include.query.$filter) {
                    include.query.$filter = filter;
                    queryString = Object.keys(include.query).map(p => {
                        return `${p}=${include.query[p]}`;
                    }).join("&");
                }
                else if ((include && filter && include.query) || (!include && this.resourcePath.navigation.indexOf(part) == this.resourcePath.navigation.length - 1)) {
                    queryString = Object.keys((include || this).query).map(p => {
                        if (p == "$filter" && filter) {
                            (include || this).query[p] = `(${(include || this).query[p]}) and (${filter})`;
                        }
                        return `${p}=${(include || this).query[p]}`;
                    }).join("&") || queryString;
                }
                if (queryString && typeof queryString == "object") {
                    queryString = Object.keys(queryString).map(p => {
                        return `${p}=${queryString[p]}`;
                    }).join("&");
                }
                if (typeof fn != "function") {
                    let fnDesc = fn;
                    fn = ctrl.prototype[fnDesc.call];
                    if (fnDesc.key.length == 1 && part.key.length == 1 && fnDesc.key[0].to != part.key[0].name) {
                        params[fnDesc.key[0].to] = params[part.key[0].name];
                        delete params[part.key[0].name];
                    }
                    else {
                        for (let i = 0; i < fnDesc.key.length; i++) {
                            if (fnDesc.key[i].to != fnDesc.key[i].from) {
                                params[fnDesc.key[i].to] = params[fnDesc.key[i].from];
                                delete params[fnDesc.key[i].from];
                            }
                        }
                    }
                    this.__applyParams(ctrl, fnDesc.call, params, queryString, undefined, include);
                }
                else
                    this.__applyParams(ctrl, method, params, queryString, undefined, include);
            }
            else
                fn = filter;
            if (!include)
                this.__enableStreaming(part);
            let currentResult;
            switch (method) {
                case "get":
                case "delete":
                    currentResult = fnCaller.call(ctrl, fn, params);
                    break;
                case "post":
                    this.odataContext += "/$entity";
                case "put":
                case "patch":
                    let body = data ? extend(this.body, data.foreignKeys) : this.body;
                    let bodyParam = odata.getBodyParameter(ctrl, fn.name);
                    let typeParam = odata.getTypeParameter(ctrl, fn.name);
                    if (typeParam) {
                        params[typeParam] = (body["@odata.type"] || (`${ctrl.prototype.elementType.namespace}.${ctrl.prototype.elementType.name}`)).replace(/^#/, "");
                    }
                    if (bodyParam) {
                        this.__stripOData(body);
                        params[bodyParam] = body;
                    }
                    if (!part.key) {
                        let properties = Edm.getProperties((elementType || ctrl.prototype.elementType).prototype);
                        properties.forEach((prop) => {
                            if (Edm.isKey(elementType || ctrl.prototype.elementType, prop)) {
                                params[prop] = (this.body || {})[prop] || ((data || {}).body || {})[prop];
                            }
                        });
                    }
                    currentResult = fnCaller.call(ctrl, fn, params);
                    break;
            }
            if (utils_1.isIterator(fn)) {
                currentResult = run(currentResult, defaultHandlers);
            }
            if (!utils_1.isPromise(currentResult)) {
                currentResult = Promise.resolve(currentResult);
            }
            return currentResult.then((result) => {
                if (utils_1.isStream(result) && include) {
                    include.streamPromise.then((result) => {
                        ODataRequestResult[method](result).then((result) => {
                            return this.__appendODataContext(result, elementType || this.ctrl.prototype.elementType, (include || this.resourcePath).includes).then(() => {
                                resolve(result);
                            }, reject);
                        }, reject);
                    }, reject);
                }
                else if (utils_1.isStream(result) && (!part.key || !Edm.isMediaEntity(elementType || this.ctrl.prototype.elementType))) {
                    result.on("end", () => resolve(ODataRequestResult[method]()));
                    result.on("error", reject);
                }
                else if (!(result instanceof result_1.ODataResult)) {
                    return ODataRequestResult[method](result).then((result) => {
                        if (!this.streamStart &&
                            writeMethods.indexOf(this.method) < 0 && !result.body)
                            return reject(new error_1.ResourceNotFoundError());
                        try {
                            this.__appendODataContext(result, elementType || this.ctrl.prototype.elementType, (include || this.resourcePath).includes).then(() => {
                                if (!this.streamEnd && this.streamEnabled && this.streamStart)
                                    this.on("end", () => resolve(result));
                                else
                                    resolve(result);
                            }, reject);
                        }
                        catch (err) {
                            reject(err);
                        }
                    }, reject);
                }
                else {
                    try {
                        this.__appendODataContext(result, elementType || this.ctrl.prototype.elementType, (include || this.resourcePath).includes).then(() => {
                            if (!this.streamEnd && this.streamEnabled && this.streamStart)
                                this.on("end", () => resolve(result));
                            else
                                resolve(result);
                        }, reject);
                    }
                    catch (err) {
                        reject(err);
                    }
                }
            }, reject);
        });
    }
    __stripOData(obj) {
        for (let prop in obj) {
            if (prop.indexOf("@odata") >= 0)
                delete obj[prop];
            if (typeof obj[prop] == "object")
                this.__stripOData(obj[prop]);
        }
    }
    __EntitySetName(part) {
        let ctrl = this.entitySets[part.name];
        let params = {};
        if (part.key)
            part.key.forEach((key) => params[key.name] = key.value);
        return (data) => {
            return this.__read(ctrl, part, params, data);
        };
    }
    __actionOrFunctionImport(part) {
        let fn = this.serverType.prototype[part.name];
        return (data) => {
            return new Promise((resolve, reject) => {
                try {
                    this.__enableStreaming(part);
                    let returnType = Edm.getReturnType(this.serverType, part.name);
                    let isAction = false;
                    let schemas = this.serverType.$metadata().edmx.dataServices.schemas;
                    if (Edm.isActionImport(this.serverType, part.name) ||
                        schemas.some(schema => schema.entityContainer.some(container => container.actionImports.some(actionImport => actionImport.name == part.name)))) {
                        isAction = true;
                        part.params = extend(part.params, this.body);
                    }
                    this.__applyParams(this.serverType, part.name, part.params);
                    let result = fnCaller.call(data, fn, part.params);
                    if (utils_1.isIterator(fn)) {
                        result = run(result, defaultHandlers);
                    }
                    if (isAction) {
                        return result_1.ODataResult.NoContent(result).then(resolve, reject);
                    }
                    else {
                        return result_1.ODataResult.Ok(result).then((result) => {
                            if (utils_1.isStream(result.body)) {
                                result.body.on("end", resolve);
                                result.body.on("error", reject);
                            }
                            else {
                                try {
                                    this.__appendODataContext(result, returnType, this.resourcePath.includes).then(() => {
                                        resolve(result);
                                    });
                                }
                                catch (err) {
                                    reject(err);
                                }
                            }
                        }, reject);
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        };
    }
    __actionOrFunction(part) {
        return (result) => {
            return new Promise((resolve, reject) => {
                this.__enableStreaming(part);
                if (!result)
                    return resolve();
                let boundOpName = part.name.split(".").pop();
                let elementType = result.elementType;
                let entityBoundOp = typeof elementType == "function" ? elementType.prototype[boundOpName] : null;
                let ctrlBoundOp = this.instance[boundOpName];
                let expOp = expCalls[boundOpName];
                let scope = this.serverType;
                let returnType = Object;
                let isAction = false;
                let schemas = this.serverType.$metadata().edmx.dataServices.schemas;
                if (entityBoundOp) {
                    scope = result.body;
                    returnType = Edm.getReturnType(elementType, boundOpName);
                    if (Edm.isAction(elementType, boundOpName) ||
                        schemas.some(schema => schema.actions.some(action => action.name == boundOpName && action.isBound && action.parameters.some(parameter => parameter.name == "bindingParameter" && parameter.type == (elementType.namespace + "." + elementType.name))))) {
                        isAction = true;
                        part.params = extend(part.params, this.body);
                    }
                    this.__applyParams(elementType, boundOpName, part.params, null, result);
                }
                else if (ctrlBoundOp) {
                    scope = this.instance;
                    returnType = Edm.getReturnType(this.ctrl, boundOpName);
                    if (Edm.isAction(elementType, boundOpName) ||
                        schemas.some(schema => schema.actions.some(action => action.name == boundOpName && action.isBound && action.parameters.some(parameter => parameter.name == "bindingParameter" && parameter.type == "Collection(" + (elementType.namespace + "." + elementType.name) + ")")))) {
                        isAction = true;
                        part.params = extend(part.params, this.body);
                    }
                    this.__applyParams(this.ctrl, boundOpName, part.params, null, result);
                }
                else if (expOp) {
                    scope = result;
                    part.params["processor"] = this;
                }
                let boundOp = entityBoundOp || ctrlBoundOp || expOp;
                try {
                    let opResult = fnCaller.call(scope, boundOp, part.params);
                    if (utils_1.isIterator(boundOp)) {
                        opResult = run(opResult, defaultHandlers);
                    }
                    if (boundOp == expOp) {
                        let expResult = Promise.resolve(boundOpName == "$count" ? opResult || this.resultCount : opResult);
                        if (elementType && boundOpName == "$value" && typeof elementType == "function" && Edm.isMediaEntity(elementType)) {
                            opResult.then((opResult) => {
                                if (this.method == "get") {
                                    this.emit("header", { "Content-Type": Edm.getContentType(elementType) || opResult.contentType || "application/octet-stream" });
                                    if (opResult.stream)
                                        opResult = opResult.stream;
                                    opResult.pipe(this);
                                    opResult.on("end", resolve);
                                    opResult.on("error", reject);
                                }
                                else
                                    result_1.ODataResult.NoContent().then(resolve, reject);
                            }, reject);
                        }
                        else {
                            expResult.then((expResult) => {
                                return (boundOpName == "$ref" && this.method != "get" ? result_1.ODataResult.NoContent : ODataRequestResult[this.method])(expResult, typeof expResult == "object" ? "application/json" : "text/plain").then((result) => {
                                    if (typeof expResult == "object" && boundOpName != "$ref")
                                        result.elementType = elementType;
                                    resolve(result);
                                }, reject);
                            }, reject);
                        }
                    }
                    if (isAction) {
                        return result_1.ODataResult.NoContent(opResult).then(resolve, reject);
                    }
                    return result_1.ODataResult.Ok(opResult).then((result) => {
                        if (utils_1.isStream(result.body)) {
                            result.body.on("end", resolve);
                            result.body.on("error", reject);
                        }
                        else {
                            try {
                                this.__appendODataContext(result, returnType, this.resourcePath.includes).then(() => {
                                    resolve(result);
                                });
                            }
                            catch (err) {
                                reject(err);
                            }
                        }
                    }, reject);
                }
                catch (err) {
                    reject(err);
                }
            });
        };
    }
    __appendLinks(ctrl, elementType, context, body, result) {
        if (this.options.metadata == ODataMetadataType.none)
            return;
        let entitySet = this.entitySets[this.resourcePath.navigation[0].name] == ctrl ? this.resourcePath.navigation[0].name : null;
        if (!entitySet) {
            for (let prop in this.entitySets) {
                if (this.entitySets[prop] == ctrl) {
                    entitySet = prop;
                    break;
                }
            }
        }
        if (entitySet) {
            let resultType = Object.getPrototypeOf(body).constructor;
            if (resultType != Object && resultType != elementType)
                elementType = resultType;
            if (typeof body["@odata.type"] == "function")
                elementType = body["@odata.type"];
            let keys = Edm.getKeyProperties(elementType);
            let resolveBaseType = (elementType) => {
                if (elementType && elementType.prototype) {
                    let proto = Object.getPrototypeOf(elementType.prototype);
                    if (proto) {
                        let baseType = proto.constructor;
                        if (baseType != Object && Edm.getProperties(baseType.prototype).length > 0) {
                            keys = Edm.getKeyProperties(baseType).concat(keys);
                            resolveBaseType(baseType);
                        }
                    }
                }
            };
            resolveBaseType(elementType);
            if (keys.length > 0) {
                let id;
                try {
                    if (keys.length == 1) {
                        id = Edm.escape(body[keys[0]], Edm.getTypeName(elementType, keys[0]));
                    }
                    else {
                        id = keys.map(it => `${it}=${Edm.escape(body[it], Edm.getTypeName(elementType, it))}`).join(",");
                    }
                    if (typeof id != "undefined") {
                        context["@odata.id"] = `${getODataRoot(this.context)}/${entitySet}(${id})`;
                        if (typeof elementType == "function" && Edm.isMediaEntity(elementType)) {
                            context["@odata.mediaReadLink"] = `${getODataRoot(this.context)}/${entitySet}(${id})/$value`;
                            if (odata.findODataMethod(ctrl, "post/$value", [])) {
                                context["@odata.mediaEditLink"] = `${getODataRoot(this.context)}/${entitySet}(${id})/$value`;
                            }
                            let contentType = Edm.getContentType(elementType);
                            if (contentType)
                                context["@odata.mediaContentType"] = contentType;
                            if (typeof result == "object")
                                result.stream = body;
                        }
                        if (odata.findODataMethod(ctrl, "put", keys) ||
                            odata.findODataMethod(ctrl, "patch", keys)) {
                            context["@odata.editLink"] = `${getODataRoot(this.context)}/${entitySet}(${id})`;
                        }
                    }
                }
                catch (err) { }
            }
        }
    }
    __appendODataContext(result, ctrlType, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof result.body == "undefined")
                return;
            let context = {
                "@odata.context": this.options.metadata != ODataMetadataType.none ? this.odataContext : undefined
            };
            let elementType = result.elementType = jsPrimitiveTypes.indexOf(result.elementType) >= 0 || result.elementType == String || typeof result.elementType != "function" ? ctrlType : result.elementType;
            if (typeof result.body == "object" && result.body) {
                if (typeof result.body["@odata.count"] == "number")
                    context["@odata.count"] = result.body["@odata.count"];
                if (!result.body["@odata.context"]) {
                    let ctrl = this.ctrl && this.ctrl.prototype.elementType == ctrlType ? this.ctrl : this.serverType.getController(ctrlType);
                    if (result.body.value && Array.isArray(result.body.value)) {
                        context.value = result.body.value;
                        yield Promise.all(result.body.value.map((entity, i) => {
                            return ((entity, i) => __awaiter(this, void 0, void 0, function* () {
                                if (typeof entity == "object") {
                                    let item = {};
                                    if (ctrl)
                                        this.__appendLinks(ctrl, elementType, item, entity);
                                    yield this.__convertEntity(item, entity, elementType, includes);
                                    context.value[i] = item;
                                }
                            }))(entity, i);
                        }));
                    }
                    else {
                        if (ctrl)
                            this.__appendLinks(ctrl, elementType, context, result.body, result);
                        yield this.__convertEntity(context, result.body, elementType, includes);
                    }
                }
            }
            else if (typeof result.body != "undefined" && result.body) {
                context.value = result.body;
            }
            result.body = context;
        });
    }
    __resolveAsync(type, prop, propValue, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utils_1.isIterator(propValue)) {
                propValue = yield run(propValue.call(entity), defaultHandlers);
            }
            if (typeof propValue == "function")
                propValue = propValue.call(entity);
            if (utils_1.isPromise(propValue))
                propValue = yield propValue;
            if (type != "Edm.Stream" && utils_1.isStream(propValue)) {
                let stream = new ODataStreamWrapper();
                propValue.pipe(stream);
                propValue = yield stream.toPromise();
            }
            return propValue;
        });
    }
    __convertEntity(context, result, elementType, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (elementType === Object || this.options.disableEntityConversion)
                return extend(context, result);
            let resultType = Object.getPrototypeOf(result).constructor;
            if (resultType != Object && resultType != this.ctrl.prototype.elementType) {
                elementType = resultType;
                if (this.options.metadata != ODataMetadataType.none && Edm.isEntityType(elementType))
                    context["@odata.type"] = `#${(elementType.namespace || this.serverType.namespace)}.${elementType.name}`;
            }
            if (typeof result["@odata.type"] == "function") {
                elementType = result["@odata.type"];
                if (this.options.metadata != ODataMetadataType.none && Edm.isEntityType(elementType))
                    context["@odata.type"] = `#${(elementType.namespace || this.serverType.namespace)}.${elementType.name}`;
            }
            if (typeof context["@odata.type"] == "undefined" && this.ctrl && elementType != this.ctrl.prototype.elementType) {
                if (this.options.metadata != ODataMetadataType.none && Edm.isEntityType(elementType))
                    context["@odata.type"] = `#${(elementType.namespace || this.serverType.namespace)}.${elementType.name}`;
            }
            if (this.options.metadata == ODataMetadataType.full) {
                context["@odata.type"] = `#${(elementType.namespace || this.serverType.namespace)}.${elementType.name}`;
            }
            let props = Edm.getProperties(elementType.prototype);
            if (Edm.isOpenType(elementType)) {
                props = Object.getOwnPropertyNames(result).concat(props);
            }
            let ctrl = this.serverType.getController(elementType);
            let resolveBaseType = (elementType) => {
                if (elementType && elementType.prototype) {
                    let proto = Object.getPrototypeOf(elementType.prototype);
                    if (proto) {
                        let baseType = proto.constructor;
                        if (baseType != Object && Edm.getProperties(baseType.prototype).length > 0) {
                            props = Edm.getProperties(baseType.prototype).concat(props);
                            ctrl = ctrl || this.serverType.getController(baseType);
                            resolveBaseType(baseType);
                        }
                    }
                }
            };
            resolveBaseType(elementType);
            let entityType = function () { };
            util.inherits(entityType, elementType);
            result = Object.assign(new entityType(), result);
            if (props.length > 0) {
                let metadata = {};
                yield Promise.all(props.map(prop => ((prop) => __awaiter(this, void 0, void 0, function* () {
                    let type = Edm.getType(elementType, prop);
                    let itemType;
                    if (typeof type == "function") {
                        itemType = function () { };
                        util.inherits(itemType, type);
                    }
                    let converter = Edm.getConverter(elementType, prop);
                    let isCollection = Edm.isCollection(elementType, prop);
                    let entity = result;
                    let propValue = entity[prop];
                    propValue = yield this.__resolveAsync(type, prop, propValue, entity);
                    if (isCollection && propValue) {
                        let value = Array.isArray(propValue) ? propValue : (typeof propValue != "undefined" ? [propValue] : []);
                        for (let i = 0; i < value.length; i++) {
                            value[i] = yield this.__resolveAsync(type, prop, value[i], entity);
                        }
                        if (includes && includes[prop]) {
                            yield this.__include(includes[prop], context, prop, ctrl, entity, elementType);
                        }
                        else if (typeof type == "function") {
                            for (let i = 0; i < value.length; i++) {
                                let it = value[i];
                                if (!it)
                                    return it;
                                let item = new itemType();
                                yield this.__convertEntity(item, it, type, includes);
                                value[i] = item;
                            }
                        }
                        if (typeof converter == "function") {
                            context[prop] = value.map(it => converter(it));
                        }
                        else
                            context[prop] = value;
                    }
                    else {
                        if (this.options.metadata == ODataMetadataType.full) {
                            if (Edm.isEntityType(elementType, prop)) {
                                if (!includes || (includes && !includes[prop])) {
                                    metadata[`${prop}@odata.associationLink`] = `${context["@odata.id"]}/${prop}/$ref`;
                                    metadata[`${prop}@odata.navigationLink`] = `${context["@odata.id"]}/${prop}`;
                                }
                            }
                            else if (type != "Edm.String" && type != "Edm.Boolean") {
                                let typeName = Edm.getTypeName(elementType, prop);
                                if (typeof type == "string" && type.indexOf("Edm.") == 0)
                                    typeName = typeName.replace(/Edm\./, "");
                                if (typeof result[prop] !== 'undefined')
                                    context[`${prop}@odata.type`] = `#${typeName}`;
                            }
                        }
                        if (includes && includes[prop]) {
                            yield this.__include(includes[prop], context, prop, ctrl, entity, elementType);
                        }
                        else if (typeof type == "function" && propValue) {
                            context[prop] = new itemType();
                            yield this.__convertEntity(context[prop], propValue, type, includes);
                        }
                        else if (typeof converter == "function") {
                            context[prop] = converter(propValue);
                        }
                        else if (type == "Edm.Stream") {
                            if (this.options.metadata != ODataMetadataType.none) {
                                context[`${prop}@odata.mediaReadLink`] = `${context["@odata.id"]}/${prop}`;
                                if (odata.findODataMethod(ctrl, `post/${prop}`, []) || odata.findODataMethod(ctrl, `post/${prop}/$value`, [])) {
                                    context[`${prop}@odata.mediaEditLink`] = `${context["@odata.id"]}/${prop}`;
                                }
                                let contentType = Edm.getContentType(elementType.prototype, prop) || (propValue && propValue.contentType);
                                if (contentType)
                                    context[`${prop}@odata.mediaContentType`] = contentType;
                            }
                            context[prop] = new StreamWrapper(propValue);
                        }
                        else if (typeof propValue != "undefined")
                            context[prop] = propValue;
                    }
                }))(prop)));
                Object.assign(context, metadata);
            }
        });
    }
    __include(include, context, prop, ctrl, result, elementType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let oldPrevCtrl = this.prevCtrl;
                let oldCtrl = this.ctrl;
                const isCollection = Edm.isCollection(elementType, include.navigationProperty);
                const navigationType = Edm.getType(elementType, include.navigationProperty);
                let navigationResult;
                if (typeof result[prop] == "object") {
                    navigationResult = yield result_1.ODataResult.Ok(result[prop]);
                    yield this.__appendODataContext(navigationResult, navigationType, include.includes);
                    ctrl = this.serverType.getController(navigationType);
                }
                else {
                    const fn = odata.findODataMethod(ctrl, `get/${include.navigationProperty}`, []);
                    let params = {};
                    let stream, streamPromise;
                    if (isCollection) {
                        stream = include.stream = new ODataStreamWrapper();
                        streamPromise = include.streamPromise = stream.toPromise();
                    }
                    if (fn) {
                        this.__applyParams(ctrl, fn.call, params, include.ast, result, include);
                        let fnResult = yield fnCaller.call(ctrl, ctrl.prototype[fn.call], params);
                        if (utils_1.isStream(fnResult) && stream && streamPromise)
                            navigationResult = yield result_1.ODataResult.Ok(streamPromise);
                        else
                            navigationResult = yield result_1.ODataResult.Ok(fnResult);
                        yield this.__appendODataContext(navigationResult, navigationType, include.includes);
                        ctrl = this.serverType.getController(navigationType);
                    }
                    else {
                        ctrl = this.serverType.getController(navigationType);
                        if (isCollection) {
                            let foreignKeys = Edm.getForeignKeys(elementType, include.navigationProperty);
                            let typeKeys = Edm.getKeyProperties(navigationType);
                            result.foreignKeys = {};
                            let part = {};
                            let foreignFilter = foreignKeys.map((key) => {
                                result.foreignKeys[key] = result[typeKeys[0]];
                                return `${key} eq ${Edm.escape(result[typeKeys[0]], Edm.getTypeName(navigationType, key))}`;
                            }).join(" and ");
                            if (part.key)
                                part.key.forEach((key) => params[key.name] = key.value);
                            navigationResult = yield this.__read(ctrl, part, params, result, foreignFilter, navigationType, include);
                        }
                        else {
                            const foreignKeys = Edm.getForeignKeys(elementType, include.navigationProperty);
                            result.foreignKeys = {};
                            let part = {};
                            part.key = foreignKeys.map(key => {
                                result.foreignKeys[key] = result[key];
                                return {
                                    name: key,
                                    value: result[key]
                                };
                            });
                            if (part.key)
                                part.key.forEach((key) => params[key.name] = key.value);
                            navigationResult = yield this.__read(ctrl, part, params, result, undefined, navigationType, include);
                        }
                    }
                }
                let entitySet = this.entitySets[this.resourcePath.navigation[0].name] == ctrl ? this.resourcePath.navigation[0].name : null;
                if (!entitySet) {
                    for (let prop in this.entitySets) {
                        if (this.entitySets[prop] == ctrl) {
                            entitySet = prop;
                            break;
                        }
                    }
                }
                delete navigationResult.body["@odata.context"];
                if (this.options.metadata == ODataMetadataType.full) {
                    context[`${prop}@odata.associationLink`] = `${context["@odata.id"]}/${prop}/$ref`;
                    context[`${prop}@odata.navigationLink`] = `${context["@odata.id"]}/${prop}`;
                }
                if (isCollection && navigationResult.body.value && Array.isArray(navigationResult.body.value)) {
                    context[prop + "@odata.count"] = navigationResult.body["@odata.count"];
                    context[prop] = navigationResult.body.value;
                }
                else if (navigationResult.body && Object.keys(navigationResult.body).length > 0) {
                    context[prop] = navigationResult.body;
                }
                this.prevCtrl = oldPrevCtrl;
                this.ctrl = oldCtrl;
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    __enableStreaming(part) {
        this.streamEnabled = part == this.resourcePath.navigation[this.resourcePath.navigation.length - 1] ||
            (this.resourcePath.navigation[this.resourcePath.navigation.indexOf(part) + 1] &&
                this.resourcePath.navigation[this.resourcePath.navigation.indexOf(part) + 1].name == "$value");
        if (!this.streamEnabled)
            this.resultCount = 0;
    }
    __applyParams(container, name, params, queryString, result, include) {
        let queryParam, filterParam, contextParam, streamParam, resultParam, idParam, bodyParam;
        queryParam = odata.getQueryParameter(container, name);
        filterParam = odata.getFilterParameter(container, name);
        contextParam = odata.getContextParameter(container, name);
        streamParam = odata.getStreamParameter(container, name);
        resultParam = odata.getResultParameter(container, name);
        idParam = odata.getIdParameter(container, name);
        bodyParam = odata.getBodyParameter(container, name);
        queryString = queryString || this.url.query;
        let queryAst = queryString ? (typeof queryString == "string" ? ODataParser.query(queryString, { metadata: this.serverType.$metadata().edmx }) : queryString) : null;
        if (queryParam) {
            params[queryParam] = queryAst;
        }
        if (filterParam) {
            let filter = queryString ? (typeof queryString == "string" ? qs.parse(queryString).$filter : queryString.value.options.find(t => t.type == lexer_1.TokenType.Filter)) : null;
            let filterAst = filter ? (typeof filter == "string" ? ODataParser.filter(filter, { metadata: this.serverType.$metadata().edmx }) : filter) : null;
            params[filterParam] = filterAst;
        }
        if (contextParam) {
            params[contextParam] = this.context;
        }
        if (streamParam) {
            params[streamParam] = include ? include.stream : this;
        }
        if (resultParam) {
            params[resultParam] = result instanceof result_1.ODataResult ? result.body : result;
        }
        if (idParam) {
            params[idParam] = decodeURI(this.resourcePath.id || this.body["@odata.id"]);
        }
        if (bodyParam && !params[bodyParam]) {
            params[bodyParam] = this.body;
        }
    }
    execute(body) {
        this.body = body;
        this.workflow[0] = this.workflow[0].call(this, body);
        for (let i = 1; i < this.workflow.length; i++) {
            this.workflow[0] = this.workflow[0].then((...args) => {
                return this.workflow[i].apply(this, args);
            });
        }
        return this.workflow[0];
    }
}
exports.ODataProcessor = ODataProcessor;
//# sourceMappingURL=processor.js.map