/// <reference types="node" />
import { Transform } from "stream";
import { ODataResult } from "./result";
export declare type GeneratorAction = (value?) => {};
export declare namespace ODataGeneratorHandlers {
    function PromiseHandler(request: any, next: GeneratorAction): any;
    function StreamHandler(request: any, next: GeneratorAction): Promise<{}>;
    function GeneratorHandler(request: any, next: GeneratorAction): any;
}
export declare enum ODataMetadataType {
    minimal = 0,
    full = 1,
    none = 2,
}
export interface ODataProcessorOptions {
    disableEntityConversion: boolean;
    metadata: ODataMetadataType;
}
export declare class ODataProcessor extends Transform {
    private serverType;
    private options;
    private ctrl;
    private prevCtrl;
    private instance;
    private resourcePath;
    private workflow;
    private context;
    private method;
    private url;
    private query;
    private entitySets;
    private odataContext;
    private body;
    private streamStart;
    private streamEnabled;
    private streamEnd;
    private streamInlineCount;
    private elementType;
    private resultCount;
    constructor(context: any, server: any, options?: ODataProcessorOptions);
    _transform(chunk: any, encoding: string, done: Function): void;
    protected _flush(done?: Function): void;
    private __EntityCollectionNavigationProperty(part);
    private __EntityNavigationProperty(part);
    private __PrimitiveProperty(part);
    private __PrimitiveKeyProperty(part);
    private __PrimitiveCollectionProperty(part);
    private __ComplexProperty(part);
    private __ComplexCollectionProperty(part);
    private __read(ctrl, part, params, data?, filter?, elementType?, include?);
    private __stripOData(obj);
    private __EntitySetName(part);
    private __actionOrFunctionImport(part);
    private __actionOrFunction(part);
    private __appendLinks(ctrl, elementType, context, body, result?);
    private __appendODataContext(result, ctrlType, includes?);
    private __resolveAsync(type, prop, propValue, entity);
    private __convertEntity(context, result, elementType, includes?);
    private __include(include, context, prop, ctrl, result, elementType);
    private __enableStreaming(part);
    private __applyParams(container, name, params, queryString?, result?, include?);
    execute(body?: any): Promise<ODataResult>;
}
