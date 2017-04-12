export declare class ODataController {
    entitySetName: string;
    elementType: Function;
    static on(method: string, fn: Function | string, ...keys: string[]): void;
    /** Enables the filtering
     * @param fn
     * @param param
     */
    static enableFilter(fn: Function | string, param?: string): void;
}
