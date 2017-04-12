/** ?????????? */ import "reflect-metadata";
import { ODataController } from "./controller";
import { Decorator } from "./utils";
/** Edm.Binary primitive type property decorator */
export declare const Binary: any;
/** Edm.Boolean primitive type property decorator */
export declare const Boolean: any;
/** Edm.Byte primitive type property decorator */
export declare const Byte: any;
/** Edm.Date primitive type property decorator */
export declare const Date: any;
/** Edm.DateTimeOffset primitive type property decorator */
export declare const DateTimeOffset: any;
/** Edm.Decimal primitive type property decorator */
export declare const Decimal: any;
/** Edm.Double primitive type property decorator */
export declare const Double: any;
/** Edm.Duration primitive type property decorator */
export declare const Duration: any;
/** Edm.Guid primitive type property decorator */
export declare const Guid: any;
/** Edm.Int16 primitive type property decorator */
export declare const Int16: any;
/** Edm.Int32 primitive type property decorator */
export declare const Int32: any;
/** Edm.Int64 primitive type property decorator */
export declare const Int64: any;
/** Edm.SByte primitive type property decorator */
export declare const SByte: any;
/** Edm.Single primitive type property decorator */
export declare const Single: any;
/** Edm.Stream primitive type property decorator */
export declare function Stream(contentType?: string): any;
export declare function Stream(target?: any, targetKey?: string): any;
/** Edm.String primitive type property decorator */
export declare const String: any;
/** Edm.TimeOfDay primitive type property decorator */
export declare const TimeOfDay: any;
/** Edm.Geography primitive type property decorator */
export declare const Geography: any;
/** Edm.GeographyPoint primitive type property decorator */
export declare const GeographyPoint: any;
/** Edm.GeographyLineString primitive type property decorator */
export declare const GeographyLineString: any;
/** Edm.GeographyPolygon primitive type property decorator */
export declare const GeographyPolygon: any;
/** Edm.GeographyMultiPoint primitive type property decorator */
export declare const GeographyMultiPoint: any;
/** Edm.GeographyMultiLineString primitive type property decorator */
export declare const GeographyMultiLineString: any;
/** Edm.GeographyMultiPolygon primitive type property decorator */
export declare const GeographyMultiPolygon: any;
/** Edm.GeographyCollection primitive type property decorator */
export declare const GeographyCollection: any;
/** Edm.Geometry primitive type property decorator */
export declare const Geometry: any;
/** Edm.GeometryPoint primitive type property decorator */
export declare const GeometryPoint: any;
/** Edm.GeometryLineString primitive type property decorator */
export declare const GeometryLineString: any;
/** Edm.GeometryPolygon primitive type property decorator */
export declare const GeometryPolygon: any;
/** Edm.GeometryMultiPoint primitive type property decorator */
export declare const GeometryMultiPoint: any;
/** Edm.GeometryMultiLineString primitive type property decorator */
export declare const GeometryMultiLineString: any;
/** Edm.GeometryMultiPolygon primitive type property decorator */
export declare const GeometryMultiPolygon: any;
/** Edm.GeometryCollection primitive type property decorator */
export declare const GeometryCollection: any;
/** ?????????? */
/** Edm.Collection decorator for describing properties as collections */
export declare function Collection(elementType: Function): Decorator;
/** ?????????? */
export declare function getTypeName(target: Function, propertyKey: string): string;
/** ?????????? */
export declare function getType(target: Function, propertyKey: string): Function | string;
/** Returns true if property is a collection (decorated by Edm.Collection) */
export declare function isCollection(target: Function, propertyKey: string): boolean;
/** ?????????? */
export declare function getProperties(target: Function): string[];
/** ?????????? */
export declare function getParameters(target: Function, targetKey: string): any[];
export declare function getChildren(target: Function): any;
/** Edm.Key decorator for describing properties as keys */
export declare const Key: (target: any, targetKey: any) => void;
/** Returns true if property is a key (decorated by Edm.Key) */
export declare function isKey(target: Function, propertyKey: string): boolean;
/** Returns property names that build up the key (names of properties decorated by Edm.Key) */
export declare function getKeyProperties(target: Function): string[];
/**
 * Returns escaped strings according to the OData format
 * Strings are quoted in single quotes therefore single quotes in strings are converted to two singlequotes.
 * Binary values are converted to hexadecimal strings.
 *
 * @param value Input value of any type
 * @param type  OData type of the provided value
 * @return      Escaped string
 */
export declare function escape(value: any, type: any): any;
/** Edm.Computed decorator for describing computed properties */
export declare const Computed: (target: any, targetKey: any) => void;
/** Returns true if property is computed (decorated by Edm.Computed) */
export declare function isComputed(target: Function, propertyKey: string): boolean;
/** Edm.Nullable decorator for describing nullable properties (which can be missing) */
export declare const Nullable: (target: any, targetKey: any, parameterIndex?: number) => void;
/** Returns true if property is nullable (decorated by Edm.Nullable) */
export declare function isNullable(target: Function, propertyKey: string): boolean;
/** Edm.Required decorator for describing non-nullable properties that must have value (cannot be missing) */
export declare const Required: (target: any, targetKey: any, parameterIndex?: number) => void;
/** Returns true if property is required (decorated by Edm.Required) */
export declare function isRequired(target: Function, propertyKey: string): boolean;
/** Edm.ActionImport decorator for describing unbound actions callable from the service root */
export declare const ActionImport: (target: any, targetKey: any) => void;
/** Edm.Action decorator for describing actions */
export declare const Action: (target: any, targetKey: any) => void;
/** ?????????? */
/** Edm.FunctionImport decorator for describing unbound actions callable from the service root */
export declare function FunctionImport(): any;
/** ?????????? */
/** Edm.FunctionImport decorator for describing unbound actions callable from the service root */
export declare function FunctionImport(returnType?: any): any;
/** ?????????? */
/** Edm.FunctionImport decorator for describing unbound actions callable from the service root */
export declare function FunctionImport(target?: any, targetKey?: string): any;
/** ?????????? */
/** Edm.Function decorator for describing actions */
export declare function Function(): any;
/** ?????????? */
/** Edm.Function decorator for describing actions */
export declare function Function(returnType?: any): any;
/** ?????????? */
/** Edm.Function decorator for describing actions */
export declare function Function(target?: any, targetKey?: string): any;
/** ?????????? */
export declare function getOperations(target: Function): string[];
/** ?????????? */
export declare function getReturnTypeName(target: Function, propertyKey: string): string;
/** ?????????? */
export declare function getReturnType(target: Function, propertyKey: string): Function | string;
/** Returns true if property is a statically callable action (decorated by Edm.ActionImport) */
export declare function isActionImport(target: Function, propertyKey: string): boolean;
/** Returns true if property is a statically callable function (decorated by Edm.FunctionImport) */
export declare function isFunctionImport(target: Function, propertyKey: string): boolean;
/** Returns true if property is an action (decorated by Edm.Action) */
export declare function isAction(target: Function, propertyKey: string): boolean;
/** Returns true if property is an function (decorated by Edm.Function) */
export declare function isFunction(target: Function, propertyKey: string): boolean;
/** Edm.ComplexType decorator for describing properties of complex types */
export declare function ComplexType(type: Function): (target: any, targetKey: any) => void;
/** Returns true if property is a complex type (decorated by Edm.ComplexType) */
export declare function isComplexType(target: Function, propertyKey: string): boolean;
/** Edm.MediaEntity decorator for describing media entity properties */
export declare function MediaEntity(contentType: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
/** Returns true if property is a media entity (decorated by Edm.MediaEntity) */
export declare function isMediaEntity(target: Function): boolean;
/** ?????????? */
export declare function getContentType(target: Function, targetKey?: string): any;
/** Edm.OpenType decorator for describing open type properties */
export declare const OpenType: {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
/** Returns true if property is a open type (decorated by Edm.OpenType) */
export declare function isOpenType(target: Function): boolean;
/** ?????????? */
/** Edm.EntityType decorator for describing entity types */
export declare function EntityType(type?: Function | string): (target: any, targetKey?: string) => void;
/** Returns true if property is an EntityType (decorated by Edm.EntityType) */
export declare function isEntityType(target: Function, propertyKey?: string): boolean;
/** ?????????? */
export declare function register(type: Function): void;
/** ?????????? */
export declare function Convert(converter: Function): (target: any, targetKey: any) => void;
/** ?????????? */
export declare function getConverter(target: Function, propertyKey: string): Function;
/** ?????????? */
export declare function Annotate(...annotation: any[]): (target: any, targetKey?: string) => void;
/** ?????????? */
export declare function getAnnotations(target: Function, targetKey?: string): any[];
/** ?????????? */
/** Edm.ForeignKey decorator for describing properties as foreign keys */
export declare function ForeignKey(...keys: string[]): (target: any, targetKey?: string) => void;
/** ?????????? */
/** Edm.ForeignKey decorator for describing properties as foreign keys */
export declare function getForeignKeys(target: Function, targetKey?: string): string[];
/** ?????????? */
/** Returns property names that are foreign keys (names of properties decorated by Edm.ForeignKey) */
export declare function Partner(property: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
/** ?????????? */
export declare function getPartner(target: any, targetKey: string): any;
/** ?????????? */
/** Edm.EntitySet decorator for describing entity sets */
export declare function EntitySet(name: string): (controller: typeof ODataController) => void;
/** Helper function to use references declared later
 * @param forwardRefFn a function returning the reference
 */
export declare function ForwardRef(forwardRefFn: Function): () => any;
