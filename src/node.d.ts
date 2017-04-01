//node declaration

declare module "extend"{
    function _m(target:any,...objects:any[]):any;
    function _m(deep:boolean,target:any,...objects:any[]):any;
    export = _m;
}
declare module "body-parser"{
    export function urlencoded(options?:any):any;
    export function json(options?:any):any;
    export function raw(options?:any):any;
    export function text(options?:any):any;
}
declare module "cookie-parser"{
    function _m(secret?:string):any;

    export = _m;
}
declare module "helmet"{
    function _m():any;
    export = _m;
}
/*
declare module "connect-redis"{
    function _m(expressSession?:any):new(options:Options)=>RedisStore;
    export = _m;
    class RedisStore{
        constructor(options:Options);
    }
    interface Options{
        client?: any;
        host?: string;
        port?: number;
        socket?: any;

        ttl?: number;
        disableTTL?: boolean;
        db?: number;
        pass?: string;
        prefix?: string;
        unref?: boolean;
    }
}
*/
declare module "my-validator"{
    export var error:any;
    export var forExpress:any;
    export var funcs:any;
    export function addCustomValidator(name:string,func:Function):void;
}
declare namespace Express {
    export interface Request {
        validateBody(field: string): any;
        validationErrorResponse(res: Express.Response): boolean;
        _validationErrors: Array<any>;
    }
}

declare module "config"{
    export function get(name:string):any;
    export function has(name:string):boolean;
}
declare module "log"{
    import stream=require('stream');

    export = Log;
    class Log{
        constructor(level:string,stream?:stream.Writable);
        emergency(...args:any[]):void;
        alert(...args:any[]):void;
        critical(...args:any[]):void;
        error(...args:any[]):void;
        warning(...args:any[]):void;
        notice(...args:any[]):void;
        info(...args:any[]):void;
        debug(...args:any[]):void;
    }
}
declare module "random-string"{
    export = randomString;
    function randomString(option?:{
        length?:number;
        numeric?:boolean;
        letters?:boolean;
        special?:boolean;
    }):string;
}
declare module "mkdirp"{
    export = mkdirp;
    function mkdirp(dir:string,opts:number|{
        mode:number;
    },cb:Cont):void;
    function mkdirp(dir:string,cb:Cont):void;
}
declare module "mime"{
    export function lookup(path:string):string;
    export var default_type:string;
    export function extension(type:string):string;
    export function define(obj:{
        [mime:string]:Array<string>;
    }):void;
    export function load(filepath:string):void;
    export module charsets{
        export function lookup(type:string):string;
    }
}
declare module "st"{
    export = st;
    function st(path:string):any;
    function st(options?:{
        path?:string;
        url?:string;
        passthrough?:boolean;
        cache?:boolean|{
            fd?:{
                max?:number;
                maxAge?:number;
            };
            stat?:{
                max?:number;
                maxAge?:number;
            };
            content?:{
                max?:number;
                maxAge?:number;
                cacheControl?:string;
            };
            index?:{
                max?:number;
                maxAge?:number;
            };
            readdir?:{
                max?:number;
                maxAge?:number;
            };
        };
        index?:boolean|string;
        dot?:boolean;
        gzip?:boolean;
    }):any;
}
declare module "ect"{
    export = ECT;
    function ECT(option?:{
        root?:any;
        ext?:string;
        cache?:boolean;
        watch?:boolean;
        open?:string;
        close?:string;
    }):{
        render:any;
    };
}
declare module "react"{
    export function renderToString(componeny:any):string;
    export function createElement(elm:any,data?:any):any;
}
declare module "node-jsx"{
    export function install(option?:{
        extension?:string;
        additionalTransform?:(str: string)=>string;
        harmony?:boolean;
    }):void;
}
declare module "nodemailer"{
    export function createTransport(option?:any):Transport;

    export class Transport{
        sendMail(data:Mail,callback:(error:any,response:any)=>void):void;
        close():void;
    }

    export interface Mail{
        from?:string|Address;
        sender?:string;
        to?:string|Address|Array<string|Address>;
        cc?:string|Address|Array<string|Address>;
        bcc?:string|Address|Array<string|Address>;
        replyTo?:string;
        inReplyTo?:string;
        references?:string|Array<string>;
        subject?:string;
        text?:any;
        html?:any;
        watchHtml?:any;
        headers?:any;
        attachments?:Array<Attachment>;
        alternatives?:Array<Attachment>;
        envelope?:{
            from?:string;
            to?:string|Array<string|Address>;
            cc?:string|Array<string|Address>;
            bcc?:string|Array<string|Address>;
        };
        messageId?:string;
        date?:string;
        encoding?:string;
    }
    interface Address{
        name?:string;
        address:string;
    }

    interface Attachment{
        filename:string;
        cid?:string;
        content:any;
        encoding?:string;
        path?:string;
        contentType?:string;
        contentDisposition?:string;
    }
}
declare module "cron"{
    export class CronJob{
        constructor(cronTime:string|Date,onTick:Function,onComplete?:Function,start?:boolean,timeZone?:string,context?:any);
        start():void;
        stop():void;
    }
    export class CronTime{
        constructor(time:string|Date);
    }
}
declare module "md5-file"{
    export = _m;
    function _m(path:string):string;
    function _m(path:string,callback?:(error:any,result:string)=>void):void;
}
declare module "type-is"{
    export = _m;
    namespace _m{
        export function hasBody(request:any):boolean;
        export function is(mediaType:string,types:Array<string>):string|boolean;
    }
    function _m(request:any,types:Array<string>):string|boolean;
}

// something useful for me
interface Callback<T>{
    (err: Error | null, result:T | null):void;
}
interface Cont{
    (err:any):void;
}
