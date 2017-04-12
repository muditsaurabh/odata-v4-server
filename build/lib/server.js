"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_service_metadata_1 = require("odata-v4-service-metadata");
const odata_v4_service_document_1 = require("odata-v4-service-document");
const odata_v4_metadata_1 = require("odata-v4-metadata");
const extend = require("extend");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const stream_1 = require("stream");
const controller_1 = require("./controller");
const odata = require("./odata");
const metadata_1 = require("./metadata");
const processor_1 = require("./processor");
const error_1 = require("./error");
function ensureODataMetadataType(req, res) {
    let metadata = processor_1.ODataMetadataType.minimal;
    if (req.headers && req.headers.accept && req.headers.accept.indexOf("odata.metadata=") >= 0) {
        if (req.headers.accept.indexOf("odata.metadata=full") >= 0)
            metadata = processor_1.ODataMetadataType.full;
        else if (req.headers.accept.indexOf("odata.metadata=none") >= 0)
            metadata = processor_1.ODataMetadataType.none;
    }
    res["metadata"] = metadata;
}
function ensureODataContentType(req, res, contentType) {
    contentType = contentType || "application/json";
    if (contentType.indexOf("odata.metadata=") < 0)
        contentType += `;odata.metadata=${processor_1.ODataMetadataType[res["metadata"]]}`;
    if (contentType.indexOf("odata.streaming=") < 0)
        contentType += ";odata.streaming=true";
    if (contentType.indexOf("IEEE754Compatible=") < 0)
        contentType += ";IEEE754Compatible=false";
    if (req.headers.accept && req.headers.accept.indexOf("charset") > 0) {
        contentType += `;charset=${res["charset"]}`;
    }
    res.contentType(contentType);
}
function ensureODataHeaders(req, res, next) {
    res.setHeader("OData-Version", "4.0");
    ensureODataMetadataType(req, res);
    let charset = req.headers["accept-charset"] || "utf-8";
    res["charset"] = charset;
    ensureODataContentType(req, res);
    if ((req.headers.accept && req.headers.accept.indexOf("charset") < 0) || req.headers["accept-charset"]) {
        const bufferEncoding = {
            "utf-8": "utf8",
            "utf-16": "utf16le"
        };
        let origsend = res.send;
        res.send = ((data) => {
            if (typeof data == "object")
                data = JSON.stringify(data);
            origsend.call(res, new Buffer(data, bufferEncoding[charset]));
        });
    }
    if (typeof next == "function")
        next();
}
/** ODataServer base class to be extended by concrete OData Server data sources */
class ODataServer extends stream_1.Transform {
    static requestHandler() {
        return (req, res, next) => {
            try {
                ensureODataHeaders(req, res);
                let processor = this.createProcessor({
                    url: req.url,
                    method: req.method,
                    protocol: req.secure ? "https" : "http",
                    host: req.headers.host,
                    base: req.baseUrl,
                    request: req,
                    response: res
                }, {
                    metadata: res["metadata"]
                });
                processor.on("header", (headers) => {
                    for (let prop in headers) {
                        if (prop.toLowerCase() == "content-type") {
                            ensureODataContentType(req, res, headers[prop]);
                        }
                        else {
                            res.setHeader(prop, headers[prop]);
                        }
                    }
                });
                let hasError = false;
                processor.on("data", (chunk, encoding, done) => {
                    if (!hasError) {
                        res.write(chunk, encoding, done);
                    }
                });
                let body = req.body && Object.keys(req.body).length > 0 ? req.body : req;
                processor.execute(body).then((result) => {
                    try {
                        if (result) {
                            res.status(result.statusCode || 200);
                            if (!res.headersSent) {
                                ensureODataContentType(req, res, result.contentType || "text/plain");
                            }
                            if (typeof result.body != "undefined") {
                                if (typeof result.body != "object")
                                    res.send("" + result.body);
                                else
                                    res.send(result.body);
                            }
                        }
                        res.end();
                    }
                    catch (err) {
                        hasError = true;
                        next(err);
                    }
                }, (err) => {
                    hasError = true;
                    next(err);
                });
            }
            catch (err) {
                next(err);
            }
        };
    }
    static execute(url, method, body) {
        let context = {};
        if (typeof url == "object") {
            context = extend(context, url);
            if (typeof method == "object") {
                body = method;
            }
            url = undefined;
            method = undefined;
        }
        else if (typeof url == "string" && typeof method == "string") {
            context.url = url;
            context.method = method;
        }
        let processor = this.createProcessor(context, {
            metadata: context.metadata || processor_1.ODataMetadataType.minimal
        });
        let response = "";
        processor.on("data", (chunk) => response += chunk.toString());
        return processor.execute(context.body || body).then((result) => {
            if (response)
                result.body = JSON.parse(response);
            return result;
        });
    }
    constructor(opts) {
        super(extend({
            objectMode: true
        }, opts));
        this.serverType = Object.getPrototypeOf(this).constructor;
    }
    _transform(chunk, encoding, done) {
        if ((chunk instanceof Buffer) || typeof chunk == "string") {
            try {
                chunk = JSON.parse(chunk.toString());
            }
            catch (err) {
                return done(err);
            }
        }
        this.serverType.execute(chunk).then((result) => {
            this.push(result);
            if (typeof done == "function")
                done();
        }, done);
    }
    _flush(done) {
        if (typeof done == "function")
            done();
    }
    static createProcessor(context, options) {
        return new processor_1.ODataProcessor(context, this, options);
    }
    static $metadata(metadata) {
        if (metadata) {
            if (!(metadata instanceof odata_v4_metadata_1.Edm.Edmx)) {
                if (metadata.version && metadata.dataServices && Array.isArray(metadata.dataServices.schema))
                    this._metadataCache = odata_v4_service_metadata_1.ServiceMetadata.processMetadataJson(metadata);
                else
                    this._metadataCache = odata_v4_service_metadata_1.ServiceMetadata.defineEntities(metadata);
            }
        }
        return this._metadataCache || (this._metadataCache = odata_v4_service_metadata_1.ServiceMetadata.processMetadataJson(metadata_1.createMetadataJSON(this)));
    }
    static document() {
        return odata_v4_service_document_1.ServiceDocument.processEdmx(this.$metadata().edmx);
    }
    static addController(controller, entitySetName, elementType) {
        odata.controller(controller, entitySetName, elementType)(this);
    }
    static getController(elementType) {
        for (let i in this.prototype) {
            if (this.prototype[i] &&
                this.prototype[i].prototype &&
                this.prototype[i].prototype instanceof controller_1.ODataController &&
                this.prototype[i].prototype.elementType == elementType) {
                return this.prototype[i];
            }
        }
        return null;
    }
    static create(path, port, hostname) {
        let server = this;
        let router = express.Router();
        router.use((req, res, next) => {
            req.url = req.url.replace(/[\/]+/g, "/").replace(":/", "://");
            if (req.headers["odata-maxversion"] && req.headers["odata-maxversion"] < "4.0")
                return next(new error_1.HttpRequestError(500, "Only OData version 4.0 supported"));
            next();
        });
        router.use(bodyParser.json());
        if (server.cors)
            router.use(cors());
        router.use((req, res, next) => {
            res.setHeader("OData-Version", "4.0");
            if (req.headers.accept &&
                req.headers.accept.indexOf("application/json") < 0 &&
                req.headers.accept.indexOf("text/html") < 0 &&
                req.headers.accept.indexOf("*/*") < 0 &&
                req.headers.accept.indexOf("xml") < 0) {
                next(new error_1.UnsupportedMediaTypeError());
            }
            else
                next();
        });
        router.get("/", ensureODataHeaders, (req, res, next) => {
            if (typeof req.query == "object" && Object.keys(req.query).length > 0)
                return next(new error_1.HttpRequestError(500, "Unsupported query"));
            next();
        }, server.document().requestHandler());
        router.get("/\\$metadata", server.$metadata().requestHandler());
        router.use(server.requestHandler());
        router.use(ODataErrorHandler);
        if (typeof path == "number") {
            if (typeof port == "string") {
                hostname = "" + port;
            }
            port = parseInt(path, 10);
            path = undefined;
        }
        if (typeof port == "number") {
            let app = express();
            app.use(path || "/", router);
            app.listen(port, hostname);
        }
        return router;
    }
}
exports.ODataServer = ODataServer;
/** ?????????? */
/** Create Express middleware for OData error handling */
function ODataErrorHandler(err, req, res, next) {
    if (err) {
        if (res.headersSent) {
            return next(err);
        }
        let statusCode = err.statusCode || err.status || (res.statusCode < 400 ? 500 : res.statusCode);
        if (!res.statusCode || res.statusCode < 400)
            res.status(statusCode);
        res.send({
            error: {
                code: statusCode,
                message: err.message,
                stack: err.stack
            }
        });
    }
    else
        next();
}
exports.ODataErrorHandler = ODataErrorHandler;
/** Create Express server for OData Server
 * @param server   OData Server instance
 * @param path     routing path for Express
 * @param port     port number for Express to listen to
 * @param hostname hostname for Express
 * @return         Express Router object
 */
function createODataServer(server, path, port, hostname) {
    return server.create(path, port, hostname);
}
exports.createODataServer = createODataServer;
//# sourceMappingURL=server.js.map