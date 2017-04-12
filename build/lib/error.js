"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, CustomError);
    }
}
exports.CustomError = CustomError;
class HttpRequestError extends CustomError {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.HttpRequestError = HttpRequestError;
class NotImplementedError extends HttpRequestError {
    constructor() {
        super(501, NotImplementedError.MESSAGE);
    }
}
NotImplementedError.MESSAGE = "Not implemented.";
exports.NotImplementedError = NotImplementedError;
class ResourceNotFoundError extends HttpRequestError {
    constructor() {
        super(404, ResourceNotFoundError.MESSAGE);
    }
}
ResourceNotFoundError.MESSAGE = "Resource not found.";
exports.ResourceNotFoundError = ResourceNotFoundError;
class MethodNotAllowedError extends HttpRequestError {
    constructor() {
        super(405, MethodNotAllowedError.MESSAGE);
    }
}
MethodNotAllowedError.MESSAGE = "Method not allowed.";
exports.MethodNotAllowedError = MethodNotAllowedError;
class UnsupportedMediaTypeError extends HttpRequestError {
    constructor() {
        super(415, UnsupportedMediaTypeError.MESSAGE);
    }
}
UnsupportedMediaTypeError.MESSAGE = "Unsupported media type.";
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
//# sourceMappingURL=error.js.map