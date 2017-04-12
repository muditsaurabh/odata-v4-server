export declare const getFunctionParameters: (fn: Function, name?: string) => any;
export declare const getAllPropertyNames: (proto: any) => string[];
export declare function isIterator(value: any): boolean;
export declare function isPromise(value: any): boolean;
export declare function isStream(stream: any): boolean;
export interface PropertyDecorator<T> {
    (target?: any, targetKey?: string): T;
}
export interface Decorator {
    (target?: any, targetKey?: string, parameterIndex?: number | TypedPropertyDescriptor<any>): any;
}
