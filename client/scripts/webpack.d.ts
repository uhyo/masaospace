// webpackのrequire.ensure
interface NodeRequire{
    ensure(
        dependencies: Array<string>,
        callback: (require: <T>(name: string)=> T)=>void,
        errorCallback?: (error: Error)=>void,
        chunkName?: string,
    ): void;
}
