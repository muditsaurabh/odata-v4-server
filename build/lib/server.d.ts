/// <reference types="express" />
/// <reference types="node" />
import { ServiceMetadata } from "odata-v4-service-metadata";
import { ServiceDocument } from "odata-v4-service-document";
import { Edm as Metadata } from "odata-v4-metadata";
import * as express from "express";
import { Transform, TransformOptions } from "stream";
import { ODataResult } from "./result";
import { ODataController } from "./controller";
import { ODataProcessor, ODataProcessorOptions } from "./processor";
/** HTTP context interface when using the server HTTP request handler */
export interface ODataHttpContext {
    url: string;
    method: string;
    protocol: "http" | "https";
    host: string;
    base: string;
    request: express.Request;
    response: express.Response;
}
/** ODataServer base class to be extended by concrete OData Server data sources */
export declare class ODataServer extends Transform {
    private static _metadataCache;
    static namespace: string;
    static containerName: string;
    private serverType;
    static requestHandler(): (req: any, res: any, next: any) => void;
    static execute(url: string, method: string, body?: any): Promise<ODataResult>;
    static execute(context: any, body?: any): Promise<ODataResult>;
    constructor(opts?: TransformOptions);
    _transform(chunk: any, encoding?: string, done?: Function): any;
    _flush(done?: Function): void;
    static createProcessor(context: any, options?: ODataProcessorOptions): ODataProcessor;
    static $metadata(): ServiceMetadata;
    static $metadata(metadata: Metadata.Edmx | any): any;
    static document(): ServiceDocument;
    static addController(controller: typeof ODataController, isPublic?: boolean): any;
    static addController(controller: typeof ODataController, isPublic?: boolean, elementType?: Function): any;
    static addController(controller: typeof ODataController, entitySetName?: string, elementType?: Function): any;
    static getController(elementType: Function): any;
    static create(): express.Router;
    static create(port: number): void;
    static create(path: string, port: number): void;
    static create(port: number, hostname: string): void;
    static create(path?: string | RegExp | number, port?: number | string, hostname?: string): void;
}
/** ?????????? */
/** Create Express middleware for OData error handling */
export declare function ODataErrorHandler(err: any, req: any, res: any, next: any): any;
/** Create Express server for OData Server
 * @param server OData Server instance
 * @return       Express Router object
 */
export declare function createODataServer(server: typeof ODataServer): express.Router;
/** Create Express server for OData Server
 * @param server OData Server instance
 * @param port   port number for Express to listen to
 */
export declare function createODataServer(server: typeof ODataServer, port: number): void;
/** Create Express server for OData Server
 * @param server OData Server instance
 * @param path   routing path for Express
 * @param port   port number for Express to listen to
 */
export declare function createODataServer(server: typeof ODataServer, path: string, port: number): void;
/** Create Express server for OData Server
 * @param server   OData Server instance
 * @param port     port number for Express to listen to
 * @param hostname hostname for Express
 */
export declare function createODataServer(server: typeof ODataServer, port: number, hostname: string): void;
