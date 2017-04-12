import "reflect-metadata";
import { ODataServer } from "./server";
import { ODataController } from "./controller";
import { PropertyDecorator } from "./utils";
export declare class ODataMethodType {
    static GET: string;
    static POST: string;
    static PUT: string;
    static PATCH: string;
    static DELETE: string;
}
/** Set element type
 * @param elementType The type of element
 */
export declare function type(elementType: Function): any;
export declare function type(target: Function, targetKey: string, parameterIndex: number): any;
/** Set namespace
 * @param namespace Namespace to be set
 */
export declare function namespace(namespace: string): (target: any, targetKey?: string) => void;
/** Set container
 * @param name  Name of the container
 */
export declare function container(name: string): (server: typeof ODataServer) => void;
/** Class decorator for server that binds the given controller to the server.
 * @param controller    Controller to be bind to the server.
 * @param isPublic      Is the binding public or not.
 */
export declare function controller(controller: typeof ODataController, isPublic?: boolean): any;
/** Class decorator for server that binds the given controller to the server.
 * @param controller    Controller to be bind to the server.
 * @param isPublic      Is the binding public or not.
 * @param elementType   Type of the element.
 */
export declare function controller(controller: typeof ODataController, isPublic?: boolean, elementType?: Function): any;
/** Class decorator for server that binds the given controller to the server.
 * @param controller    Controller to be bind to the server.
 * @param entitySetName The name of the entity set.
 * @param elementType   Type of the element.
 */
export declare function controller(controller: typeof ODataController, entitySetName?: string, elementType?: Function): any;
/** Gives the public controllers of the given server
 * @param server
 */
export declare function getPublicControllers(server: typeof ODataServer): any;
/** Enables CORS on your server
 * @param server The server where you turn the CORS on
 * */
export declare const cors: (server: typeof ODataServer) => void;
export interface ExpressionDecorator extends PropertyDecorator<ExpressionDecorator> {
    /** Annotate function for $value handler */
    $value: PropertyDecorator<void>;
    /** Annotate function for $count handler */
    $count: PropertyDecorator<void>;
}
export interface RefExpressionDecorator extends ExpressionDecorator {
    $ref: PropertyDecorator<void>;
}
export interface ODataMethodDecorator extends ExpressionDecorator {
    (): ExpressionDecorator;
    (navigationProperty: string): RefExpressionDecorator;
}
export interface RefExpressionGETDecorator extends ExpressionDecorator {
    /** Create reference for OData GET operation */
    $ref: PropertyDecorator<void>;
}
export interface ODataGETMethodDecorator extends ExpressionDecorator {
    /** Annotate function for OData GET operation */
    (): ExpressionDecorator;
    /** Annotate function for OData GET operation
     * @param navigationProperty Navigation property name to handle
     */
    (navigationProperty: string): RefExpressionGETDecorator;
    /** Annotate function for OData GET operation
     * @param target    The prototype of the class for an instance member
     * @param targetKey The name of the class method
     */
    (target?: any, targetKey?: string): ExpressionDecorator;
}
/** Annotate function for OData GET operation */
export declare const GET: ODataGETMethodDecorator;
export interface RefExpressionPOSTDecorator extends ExpressionDecorator {
    /** Create reference for OData POST operation */
    $ref: PropertyDecorator<void>;
}
export interface ODataPOSTMethodDecorator extends ExpressionDecorator {
    /** Annotate function for OData POST operation */
    (): ExpressionDecorator;
    /** Annotate function for OData POST operation
     * @param navigationProperty Navigation property name to handle
     */
    (navigationProperty: string): RefExpressionPOSTDecorator;
    /** Annotate function for OData POST operation
     * @param target    The prototype of the class for an instance member
     * @param targetKey The name of the class method
     */
    (target?: any, targetKey?: string): ExpressionDecorator;
}
/** Annotate function for OData POST operation */
export declare const POST: ODataPOSTMethodDecorator;
export interface RefExpressionPUTDecorator extends ExpressionDecorator {
    /** Create reference for OData PUT operation */
    $ref: PropertyDecorator<void>;
}
export interface ODataPUTMethodDecorator extends ExpressionDecorator {
    /** Annotate function for OData PUT operation */
    (): ExpressionDecorator;
    /** Annotate function for OData PUT operation
     * @param navigationProperty Navigation property name to handle
     */
    (navigationProperty: string): RefExpressionPUTDecorator;
    /** Annotate function for OData PUT operation
     * @param target    The prototype of the class for an instance member
     * @param targetKey The name of the class method
     */
    (target?: any, targetKey?: string): ExpressionDecorator;
}
/** Annotate function for OData PUT operation */
export declare const PUT: ODataPUTMethodDecorator;
export interface RefExpressionPATCHDecorator extends ExpressionDecorator {
    /** Create reference for OData PATCH operation */
    $ref: PropertyDecorator<void>;
}
export interface ODataPATCHMethodDecorator extends ExpressionDecorator {
    /** Annotate function for OData PATCH operation */
    (): ExpressionDecorator;
    /** Annotate function for OData PATCH operation
     * @param navigationProperty Navigation property name to handle
     */
    (navigationProperty: string): RefExpressionPATCHDecorator;
    /** Annotate function for OData PATCH operation
     * @param target    The prototype of the class for an instance member
     * @param targetKey The name of the class method
     */
    (target?: any, targetKey?: string): ExpressionDecorator;
}
/** Annotate function for OData PATCH operation */
export declare const PATCH: ODataPATCHMethodDecorator;
export interface RefExpressionDELETEDecorator extends ExpressionDecorator {
    /** Create reference for OData DELETE operation */
    $ref: PropertyDecorator<void>;
}
export interface ODataDELETEMethodDecorator extends ExpressionDecorator {
    /** Annotate function for OData DELETE operation */
    (): ExpressionDecorator;
    /** Annotate function for OData DELETE operation
     * @param navigationProperty Navigation property name to handle
     */
    (navigationProperty: string): RefExpressionDELETEDecorator;
    /** Annotate function for OData DELETE operation
     * @param target    The prototype of the class for an instance member
     * @param targetKey The name of the class method
     */
    (target?: any, targetKey?: string): ExpressionDecorator;
}
/** Annotate function for OData DELETE operation */
export declare const DELETE: ODataDELETEMethodDecorator;
/** Create reference for OData POST operation
 * @param navigationProperty Navigation property name to handle
 */
export declare function createRef(navigationProperty: string): PropertyDecorator<void>;
/** Update reference for OData PUT operation
 * @param navigationProperty Navigation property name to handle
 */
export declare function updateRef(navigationProperty: string): PropertyDecorator<void>;
/** Delete reference for OData DELETE operation
 * @param navigationProperty Navigation property name to handle
 */
export declare function deleteRef(navigationProperty: string): PropertyDecorator<void>;
/** Annotate function for a specified OData method operation */
export declare function method(method: string): ODataMethodDecorator;
/** Annotate function for a specified OData method operation */
export declare function method(method: string, navigationProperty: string): RefExpressionDecorator;
/** get metadata value of ODataMethod on the prototype chain of target or targetKey
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getMethod(target: any, targetKey: any): any;
/** Gives the entity key
 * @param name
 */
export declare function key(name?: string): any;
/** Gives the entity key
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare function key(target: any, targetKey: string, parameterIndex: number): any;
/** Gives the decorated key parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getKeys(target: any, targetKey: any): any;
/** Gives the identifier of the referenced entity.
 * @param name
 */
export declare function link(name?: string): any;
/** Gives the identifier of the referenced entity.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare function link(target: any, targetKey: string, parameterIndex: number): any;
/** Gives the decorated link parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getLinks(target: any, targetKey: any): any;
/** Finds the given OData method
 * @param {any} target
 * @param {any} method
 * @param {any} keys
 */
export declare function findODataMethod(target: any, method: any, keys: any): {
    call: string;
    key: any;
    link: any;
};
/** Provides access to all OData query options.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const query: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated query parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getQueryParameter(target: any, targetKey: any): any;
/** Gives filter information and provides the AST tree of the OData $filter.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const filter: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated filter parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getFilterParameter(target: any, targetKey: any): any;
/** Gives the body of the OData request.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const body: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated body parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getBodyParameter(target: any, targetKey: any): any;
/** Gives the current execution context.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const context: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated context parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getContextParameter(target: any, targetKey: any): any;
/** Gives a writable stream that will perform OData result transformation on the result and then sends it forward to your response stream.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const stream: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated stream parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getStreamParameter(target: any, targetKey: any): any;
/** Gives the result from the last part from the resource path of the OData URL. This ensures the access to an entity in context of your action or function.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const result: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated result parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getResultParameter(target: any, targetKey: any): any;
/** Gives the url that was provided either in request body as @odata.id or in query parameters as $id.
 * @param target            The prototype of the class for an instance member
 * @param targetKey         The name of the class method
 * @param parameterIndex    The ordinal index of the parameter in the function’s parameter list
 */
export declare const id: (target: any, targetKey: any, parameterIndex: number) => void;
/** Gives the decorated id parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getIdParameter(target: any, targetKey: any): any;
/** Gives the decorated type parameter.
 * @param target    The prototype of the class for an instance member
 * @param targetKey The name of the class method
 */
export declare function getTypeParameter(target: any, targetKey: any): any;
/** Sets a parameter decorator for the given parameter.
 * @param name The name of the parameter.
 * @param type OData decorator type.
 */
export declare function parameter(name: string, type: Function): (target?: any, targetKey?: string) => void;
/** Sets parameter decorators for the given parameters.
 * @param parameters Object that contains the name of the parameter as key and the type of the parameter as value.
 */
export declare function parameters(parameters: any): (target?: any, targetKey?: string) => void;
