/// <reference types="node" />
import { ODataController, ODataServer, ODataQuery } from "../lib/index";
import { Writable } from "stream";
export declare class ProductsController extends ODataController {
    find(query: ODataQuery, stream: Writable): Promise<Writable>;
    findOne(key: string, query: ODataQuery): Promise<any>;
    getCategory(result: any): Promise<any>;
}
export declare class CategoriesController extends ODataController {
    find(query: ODataQuery, stream: Writable): Promise<Writable>;
    findOne(key: string, query: ODataQuery): Promise<any>;
    getProducts(result: any, query: ODataQuery, stream: Writable): Promise<Writable>;
}
export declare class NorthwindODataServer extends ODataServer {
    GetCategoryById(id: string): IterableIterator<any>;
    initDb(): Promise<void>;
}
