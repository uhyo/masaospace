///<reference path="../node_modules/my-user-mongo/lib.d.ts" />
//node declaration

declare function require(path:string):any;
declare var __dirname:string;

declare var process:{
    nextTick(func:()=>void):void;
    exit(code?:number):void;
};

declare class Buffer{
    constructor(size:number);
    constructor(arr:Array<number>);
    constructor(buffer:Buffer);
    constructor(str:string,encoding?:string);

    static isEncoding(encoding:string):boolean;
    static isBuffer(obj:any):boolean;
    static byteLength(str:string,encoding?:string):number;
    static concat(list:Array<Buffer>,totalLength?:number):Buffer;
    static compare(buf1:Buffer,buf2:Buffer):number;

    length:number;
    write(str:string,offset?:number,length?:number,encoding?:string):number;
    writeUIntLE(value:number,offset:number,byteLength:number,noAssert?:boolean):number;
    writeUIntBE(value:number,offset:number,byteLength:number,noAssert?:boolean):number;
    writeIntLE(value:number,offset:number,byteLength:number,noAssert?:boolean):number;
    writeIntBE(value:number,offset:number,byteLength:number,noAssert?:boolean):number;
    readUIntLE(offset:number,byteLength:number,noAssert?:boolean):number;
    readUIntBE(offset:number,byteLength:number,noAssert?:boolean):number;
    readIntLE(offset:number,byteLength:number,noAssert?:boolean):number;
    readIntBE(offset:number,byteLength:number,noAssert?:boolean):number;
    toString(encoding?:string,start?:number,end?:number):string;
    toJSON():string;
    [index:number]:number;
    equals(otherBuffer:Buffer):boolean;
    compare(otherBuffer:Buffer):number;
    copy(targetBuffer:Buffer,targetStart?:number,sourceStart?:number,sourceEnd?:number):void;
    slice(start?:number,end?:number):Buffer;
    readUInt8(offset:number,noAssert?:boolean):number;
    readUInt16LE(offset:number,noAssert?:boolean):number;
    readUInt32BE(offset:number,noAssert?:boolean):number;
    readUInt32LE(offset:number,noAssert?:boolean):number;
    readUInt16BE(offset:number,noAssert?:boolean):number;
    readInt8(offset:number,noAssert?:boolean):number;
    readInt16LE(offset:number,noAssert?:boolean):number;
    readInt32BE(offset:number,noAssert?:boolean):number;
    readInt32LE(offset:number,noAssert?:boolean):number;
    readInt16BE(offset:number,noAssert?:boolean):number;
    readFloatLE(offset:number,noAssert?:boolean):number;
    readFloatBE(offset:number,noAssert?:boolean):number;
    readDoubleLE(offset:number,noAssert?:boolean):number;
    readDoubleBE(offset:number,noAssert?:boolean):number;
    writeUInt8(value:number,offset:number,noAssert?:boolean):void;
    writeUInt16LE(value:number,offset:number,noAssert?:boolean):void;
    writeUInt32BE(value:number,offset:number,noAssert?:boolean):void;
    writeUInt32LE(value:number,offset:number,noAssert?:boolean):void;
    writeUInt16BE(value:number,offset:number,noAssert?:boolean):void;
    writeInt8(value:number,offset:number,noAssert?:boolean):void;
    writeInt16LE(value:number,offset:number,noAssert?:boolean):void;
    writeInt32BE(value:number,offset:number,noAssert?:boolean):void;
    writeInt32LE(value:number,offset:number,noAssert?:boolean):void;
    writeInt16BE(value:number,offset:number,noAssert?:boolean):void;
    writeFloatLE(value:number,offset:number,noAssert?:boolean):void;
    writeFloatBE(value:number,offset:number,noAssert?:boolean):void;
    writeDoubleLE(value:number,offset:number,noAssert?:boolean):void;
    writeDoubleBE(value:number,offset:number,noAssert?:boolean):void;
    fill(value:any,offset?:number,end?:number):void;

}
declare class SlowBuffer extends Buffer{
}


declare module "events"{
    export class EventEmitter{
        addEventListener(event:string,listener:Function):EventEmitter;
        on(event:string,listener:Function):EventEmitter;
        once(event:string,listener:Function):EventEmitter;
        removeListener(event:string,listener:Function):EventEmitter;
        removeAllListeners(event?:string):EventEmitter;
        setMaxListener(n:number):void;
        listeners(event:string):Function[];
        emit(event:string,...args:any[]):boolean;

        static listenerCount(emitter:EventEmitter,event:string):number;
    }

}
declare module "stream"{
    import events=require('events');
    export class Readable extends events.EventEmitter{
        read(size?:number):any;
        setEncoding(encoding:string):void;
        resume():void;
        pause():void;
        pipe(destination:Writable,options?:{
            end:boolean;
        }):void;
        unpipe(destionation?:Writable):void;
        unshift(chunk:any):void;
    }
    export class Writable extends events.EventEmitter{
        write(chunk:string,encoding?:string,callback?:Function):boolean;
        end(chunk?:string,encoding?:string,callback?:Function):boolean;
    }
    export class Duplex extends events.EventEmitter{
        read(size?:number):any;
        setEncoding(encoding:string):void;
        resume():void;
        pause():void;
        pipe(destination:Writable,options?:{
            end:boolean;
        }):void;
        unpipe(destionation?:Writable):void;
        unshift(chunk:any):void;
        write(chunk:string,encoding?:string,callback?:Function):boolean;
        end(chunk?:string,encoding?:string,callback?:Function):boolean;
    }
}
declare module "net"{
    import events=require('events');
    import stream=require('stream');
    export class Socket extends stream.Duplex{
        connect(port:number,host?:number,callback?:Function):void;
        connect(path:string,callback?:Function):void;
        setEncoding(encoding:string):void;
        write(data:string,encoding?:string,callback?:Function):boolean;
        end(data?:string,encoding?:string):boolean;
        destroy():void;
        pause():void;
        resume():void;
        address():any;
        unref():void;
        ref():void;
        remoteAddress:string;
        remotePort:number;
        localAddress:string;
        localPort:number;
        bytesRead:number;
        bytesWritten:number
    }
    export class Server extends events.EventEmitter{
        listen(port:number,host?:string,backlog?:number,callback?:Function):void;
        listen(path:string,callback?:Function):void;
        close(callback?:Function):void;
        address():{
            port:number;
            family:string;
            address:string;
        };
        unref():void;
        ref():void;
    }

    export function connect(options:any,connectionListener?:Function):Socket;
    export function isIP(input:string):number;
    export function createServer(options?:{
        allowHalfOpen?:boolean;
    },connectionListener?:Function);
}
declare module "path"{
    export function normalize(path:string):string;
    export function join(...path:string[]):string;
    export function resolve(...path:string[]):string;
    export function relative(...paths:string[]):string;
    export function dirname(path:string):string;
    export function basename(path:string,ext?:string):string;
    export function extname(path:string):string;
    export var sep:string;
    export var delimiter:string;
}
declare module "fs"{
    export function readdir(path:string,callback:(err:any,files:string[])=>void):void;
    export function readdirSync(path:string):string[];
    export function readFile(filename:string,options:any,callback:Function):void;
    export function readFile(filename:string,callback:Function):void;
    export function readFileSync(filename:string,options?:any):any;
    export function appendFile(filename:string,data:any,opt:any,callback:Function):void;
    export function appendFile(filename:string,data:any,callback:Function):void;
    export function stat(path:string,callback:(err:any,stat:Stats)=>void):void;
    export function statSync(path:string):Stats;
    export function rename(oldpath:string,newpath:string,callback:(err:any)=>void):void;
    export function unlink(path:string,callback:(err:any)=>void):void;
    export function chmod(path:string,mode:number,callback:(err:any)=>void):void;

    export class Stats{
        isFile():boolean;
        isDirectory():boolean;
        isBlockDevice():boolean;
        isCharacterDevice():boolean;
        isSymbolicLink():boolean;
        isFIFO():boolean;
        isSocket():boolean;

        dev:number;
        ino:number;
        mode:number;
        nlink:number;
        uid:number;
        gid:number;
        rdev:number;
        size:number;
        blksize:number;
        blocks:number;
        atime:Date;
        mtime:Date;
        ctime:Date;
    }
}
declare module "https"{
    import stream=require('stream');
    import net=require('net');

    //listenerはFunctionだが、expressの定義との兼ね合いで
    export function createServer(listener?:any):Server;
    export class Server{
        listen(port:number,hostname?:string,backlog?:number,listener?:Function):void;
        listen(path:string,listener?:Function):void;
        listen(handle:any,listener?:Function):void;
        close(callback?:Function):void;
    }

    export class ServerResponse{
        writeContinue():void;
        writeHead(statusCode:number,statusMessage:string,headers?:Object):void;
        writeHead(statusCode:number,headers?:Object):void;
        setTimeout(msecs:number,callback:Function):void;
        statusCode:number;
        statusMessage:string;
        setHeader(name:string,value:string):void;
        setHeader(name:string,value:Array<string>):void;
        headersSent:boolean;
        sendDate:boolean;
        getHeader(name:string):string;
        removeHeader(name:string):void;
        write(chunk:string/* or Buffer */,encoding:string,callback?:()=>void):boolean;
        write(chunk:string/* or Buffer */,callback?:()=>void):boolean;
        addTrailers(headers:Object):void;
        end(data:string/* or Buffer */,encoding:string,callback?:()=>void):boolean;
        end(data:string/* or Buffer */,callback?:()=>void):boolean;
        end(callback?:()=>void):boolean;
    }
    export function request(options:any /* 省略 */,callback?:(res:IncomingMessage)=>void):ClientRequest;
    export function get(options:any /* 省略 */,callback?:(res:IncomingMessage)=>void):ClientRequest;

    export class Agent{
        /* 省略 */
    }
    export var globalAgent:Agent;

    export class ClientRequest{
        flushHeaders():void;
        write(chunk:string/* or Buffer */,encoding:string,callback?:()=>void):boolean;
        write(chunk:string/* or Buffer */,callback?:()=>void):boolean;
        end(data:string/* or Buffer */,encoding:string,callback?:()=>void):boolean;
        end(data:string/* or Buffer */,callback?:()=>void):boolean;
        end(callback?:()=>void):boolean;
        abort():void;
        setTimeout(timeout:number,callback?:Function):void;
        setNoDelay(noDelay?:boolean):void;
        setSocketKeepAlive(enable?:boolean,initialDelay?:number):void;
    }

    export class IncomingMessage extends stream.Readable{
        httpVersion:string;
        httpVersionMajor:number;
        httpVersionMinor:number;
        headers:Object;
        rawHeaders:Array<string>;
        trailers:Object;
        rawTrailers:Array<string>;
        setTimeout(msecs:number,callback:Function):void;
        method:string;
        url:string;
        statusCode:number;
        statusMessage:string;
        socket:net.Socket;
    }


}
declare module "crypto"{
    import stream=require('stream');

    export function setEngine(engine:string,flags?:number):void;
    export function getCiphers():Array<string>;
    export function getHashes():Array<string>;
    export function createHash(algorithm:string):Hash;
    export function createHmac(algorithm:string,key:any):Hmac;
    export function createCipher(algorithm:string,password:string):Cipher;
    export function createCipheriv(algorithm:string,key:any,iv:any):Cipher;
    export function randomBytes(size:number,callback?:(ex:any,buf:any)=>void):Buffer;
    export function pseudoRandomBytes(size:number,callback?:(ex:any,buf:any)=>void):Buffer;

    export class Hash extends stream.Duplex{
        update(data:any,input_encoding?:string):void;
        digest(encoding?:string):any;
        digest(encoding:"hex"):string;
        digest(encoding:"binary"):Buffer;
        digest(encoding:"base64"):string;
    }

    export class Hmac extends stream.Duplex{
        update(data:any):void;
        digest(encoding?:string):any;
    }

    export class Cipher extends stream.Duplex{
        update(data:any,input_encoding?:string,output_encoding?:string):any;
        final(output_encoding?:string):any;
        setAutoPadding(auto_padding?:boolean):void;
        getAuthTag():any;
        setAAD(buffer:any):void;
    }
}
declare module "domain"{
    import events=require('events');
    export function create():Domain;

    class Domain extends events.EventEmitter{
        run(fn:()=>void):void;
        members:Array<any>;
        add(emitter:events.EventEmitter):void;
        remove(emitter:events.EventEmitter):void;
        bind(callback:Function):any;
        intercept(callback:Function):any;
        enter():void;
        exit():void;
    }
}
//
//
//

declare module "extend"{
    function _m(target:any,...objects:any[]):any;
    function _m(deep:boolean,target:any,...objects:any[]):any;
    export = _m;
}
declare module "mongodb"{
    import stream = require('stream');
    export var MongoClient:{
        connect(url:string,options:{
            // TODO
            db?:{
                w?:any;
                wtimeout?:number;
                fsync?:boolean;
                j?:boolean;
                readPreference?:string;
                readPreferenceTags?:any;
                native_parser?:boolean;
                forceServerObjectId?:boolean;
                pkFactory?:any;
                serializeFunctions?:boolean;
                raw?:boolean;
                retryMiliSeconds?:number;
                numberOfRerties?:number;
                bufferMaxEntries?:number;
            };
            replSet?:{
                ha?:boolean;
                haInterval?:number;
                replicaSet?:string;
                secondaryAcceptableLatencyMS?:number;
                connectWithNoPrimary?:boolean;
                poolSize?:number;
                ssl?:boolean;
                sslValidate?:boolean;
                sslCA?:any;
                sslCert?:any;
                sslKey?:any;
                sslPass?:any;
                socketOptions?:{
                    noDelay?:boolean;
                    keepAlive?:number;
                    connectTimeoutMS?:number;
                    socketTimeoutMS?:number;
                };
            };
            mongos?:{
                ha?:boolean;
                haInterval?:number;
                replicaSet?:string;
                secondaryAcceptableLatencyMS?:number;
                connectWithNoPrimary?:boolean;
                poolSize?:number;
                ssl?:boolean;
                sslValidate?:boolean;
                sslCA?:any;
                sslCert?:any;
                sslKey?:any;
                sslPass?:any;
                socketOptions?:{
                    noDelay?:boolean;
                    keepAlive?:number;
                    connectTimeoutMS?:number;
                    socketTimeoutMS?:number;
                };
            };
            server?:{
                poolSize?:number;
                ssl?:boolean;
                sslValidate?:boolean;
                sslCA?:any;
                sslCert?:any;
                sslKey?:any;
                sslPass?:any;
                autoReconnect?:boolean;
                socketOptions?:{
                    noDelay?:boolean;
                    keepAlive?:number;
                    connectTimeoutMS?:number;
                    socketTimeoutMS?:number;
                };
            };
        },callback:(err:any,db:Db)=>void):void;
        connect(url:string,callback:(err:any,db:Db)=>void):void;
    };
    export class Db{
        constructor(detabaseName:string,topology:any,options?:{
            /* 省略 */
        });
        serverConfig:any;
        bufferMaxEntries:number;
        databaseName:string;
        options:{};
        native_parser:boolean;
        slaveOk:boolean;
        writeConcern:any;
        //一部だけ
        close(force?:boolean,callback?:(error:any)=>void):void;
        collection(name:string,options:{
            w?:any;  //number | string
            wtimeout?:number;
            j?:boolean;
            raw?:boolean;
            pkFactory?:any;
            readPreference?:string;
            serialzeFunctions?:boolean;
            strict?:boolean;
        },callback:(error:any,collection:Collection)=>void):void;
        collection(name:string,callback:(error:any,collection:Collection)=>void):void;
        ensureIndex(name:string,fieldOrSpec:any,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
            unique?:boolean;
            sparse?:boolean;
            background?:boolean;
            dropDups?:boolean;
            min?:number;
            max?:number;
            v?:number;
            expireAfterSeconds?:number;
            name?:any;  //TODO: ???
        },callback:(error:any,result:any)=>void):void;
    }
    export class Collection{
        constructor();
        collectionName:string;
        namespace:string;
        writeConcern:any;
        hint:any;
        //一部だけ
        count(query:any,options:{
            limit?:number;
            skip?:number;
            hint?:string;
            readPreference?:any;
        },callback:(error:any,result:number)=>void):void;
        count(query:any,callback:(error:any,result:number)=>void):void;
        createIndex(fieldOrSpec:any,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
            unique?:boolean;
            sprase?:boolean;
            background?:boolean;
            dropDups?:boolean;
            min?:number;
            max?:number;
            v?:number;
            expireAfterSeconds?:number;
            name?:any;  //???
        },callback:(error:any,result:any)=>void):void;
        createIndex(fieldOrSpec:any,callback:(error:any,result:any)=>void):void;
        deleteMany(filter:any,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        deleteMany(filter:any,callback:(error:any,result:WriteOpResult)=>void):void;
        deleteOne(filter:any,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        deleteOne(filter:any,callback:(error:any,result:WriteOpResult)=>void):void;
        distinct(key:string,query:any,options:{
            readPreference?:any;
        },callback:(error:any,result:Array<any>)=>void):void;
        distinct(key:string,options:{
            readPreference?:any;
        },callback:(error:any,result:Array<any>)=>void):void;
        distinct(key:string,query:any,callback:(error:any,result:Array<any>)=>void):void;
        distinct(key:string,callback:(error:any,result:Array<any>)=>void):void;
        find(query:any):Cursor;
        findOne(query:any,options:{
            limit?:number;
            sort?:any;
            fields?:any;
            skip?:number;
            hint?:any;
            explain?:boolean;
            snapshot?:boolean;
            timeout?:boolean;
            tailable?:boolean;
            batchSize?:number;
            returnKey?:boolean;
            maxScan?:number;
            min?:number;
            max?:number;
            showDiskLoc?:boolean;
            comment?:string;
            raw?:boolean;
            readPreference?:any;
            partial?:boolean;
            maxTimeMS?:number;
        },callback:(error:any,doc:any)=>void):void;
        findOne(query:any,callback:(error:any,doc:any)=>void):void;
        findOneAndDelete(filter:any,options:{
            projection?:any;
            sort?:any;
            maxTimeMS?:number;
        },callback:(error:any,doc:any)=>void):void;
        findOneAndDelete(filter:any,callback:(error:any,doc:any)=>void):void;
        findOneAndReplace(filter:any,replacement:any,options:{
            projection?:any;
            sort?:any;
            maxTimeMS?:number;
            upsert?:boolean;
            returnOriginal?:boolean;
        },callback:(error:any,doc:any)=>void):void;
        findOneAndReplace(filter:any,replacement:any,callback:(error:any,doc:any)=>void):void;
        findOneAndUpdate(filter:any,update:any,options:{
            projection?:any;
            sort?:any;
            maxTimeMS?:number;
            upsert?:boolean;
            returnOriginal?:boolean;
        },callback:(error:any,doc:any)=>void):void;
        findOneAndUpdate(filter:any,update:any,callback:(error:any,doc:any)=>void):void;
        insertMany(docs:Array<any>,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
            serializeFunctions?:boolean;
            forceServerObjectId?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        insertMany(docs:Array<any>,callback:(error:any,result:WriteOpResult)=>void):void;
        insertOne(docs:any,options:{
            w?:any;
            wtimeout?:number;
            j?:boolean;
            serializeFunctions?:boolean;
            forceServerObjectId?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        insertOne(docs:any,callback:(error:any,result:WriteOpResult)=>void):void;
        replaceOne(filter:any,doc:any,options:{
            upsert?:boolean;
            w?:any;
            wtimeout?:number;
            j?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        replaceOne(filter:any,doc:any,callback:(error:any,result:WriteOpResult)=>void):void;
        updateMany(filter:any,update:any,options:{
            upsert?:boolean;
            w?:any;
            wtimeout?:number;
            j?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        updateMany(filter:any,update:any,callback:(error:any,result:WriteOpResult)=>void):void;
        updateOne(filter:any,update:any,options:{
            upsert?:boolean;
            w?:any;
            wtimeout?:number;
            j?:boolean;
        },callback:(error:any,result:WriteOpResult)=>void):void;
        updateOne(filter:any,update:any,callback:(error:any,result:WriteOpResult)=>void):void;
    }
    interface WriteOpResult{
        ops:Array<any>;
        conection:any;
        result:any;
    }

    export class Cursor{
        constructor();
        sortValue:string;
        timeout:boolean;
        readPreference:any;

        //一部だけ
        addCursorFlag(flag:string,value:boolean):Cursor;
        close(callback:(error:any,result:any)=>void):void;
        count(applySkipLimit:boolean,readPreference:any,options:{
            skip?:number;
            limit?:number;
            maxTimeMS?:number;
            hint?:string;
        },callback:(error:any,count:number)=>void):void;
        count(applySkipLimit:boolean,readPreference:any,callback:(error:any,count:number)=>void):void;
        //deprecate
        //each(callback:(error:any,doc:any)=>void):void;
        forEach(iterator:(doc:any)=>any,callback:(error:any)=>void):void;
        limit(value:number):Cursor;
        maxTimeMS(value:number):Cursor;
        next(callback:(error:any,doc:any)=>void):void;
        pause():void;
        pipe(destination:stream.Writable,options?:any):void;
        rewind():void;
        skip(value:number):Cursor;
        sort(keyOrList:any,direction?:number):Cursor;
        toArray(callback:(error:any,documents:Array<any>)=>void):void;
    }

    export class ObjectId{
        constructor(id:any);
        generationTime():number;
    }
}
declare module "redis"{
    import events=require('events');

    interface CreateClientOptions{
        parser?:string;
        return_buffers?:boolean;
        detect_buffers?:boolean;
        socket_nodelay?:boolean;
        socket_keepalive?:boolean;
        no_ready_check?:boolean;
        enable_offline_queue?:boolean;
        retry_max_delay?:number;
        connect_timeout?:any;
        max_attempts?:number;
        auth_pass?:any;
        family?:string;
    }
    export function createClient(port?:number,host?:number,options?:CreateClientOptions):RedisClient;
    export function createClient(options:CreateClientOptions):RedisClient;
    export function createClient(unix_socket:string,options?:CreateClientOptions):RedisClient;
    export function print(error:any,result:any):void;
    export var debug_mode:boolean;

    export class RedisClient extends events.EventEmitter{
        connected:boolean;
        command_queue:{
            length:number;
        };
        offline_queue:{
            length:number;
        };
        retry_delay:number;
        retry_backoff:number;
        auth(password:string,callback:(error:any,result:string)=>void):void;
        end():void;
        unref():void;

        hgetall(key:string,callback:(error:any,result:any)=>void):void;
        hmset(key:string,obj:any,callback?:(error:any,result:string)=>void):void;
        hmset(...arr:Array<any>):void;

        server_info:{
            redis_version:string;
            //省略
        };

        //一部
        append(key:string,value:string,callback?:(error:any,result:number)=>void):void;
        bitcount(key:string,start:number,end:number,callback?:(error:any,result:number)=>void):void;
        bitcount(key:string,callback?:(error:any,result:number)=>void):void;
        del(...keys:Array<string>):void;
        del(keys:Array<string>,callback?:(error:any,result:number)=>void):void;
        exists(key:string,callback:(error:any,result:number)=>void):void;
        expire(key:string,seconds:number,callback?:(error:any,result:number)=>void):void;
        expireat(key:string,timestamp:number,callback?:(error:any,result:number)=>void):void;
        get(key:string,callback:(error:any,result:string)=>void):void;
        getrange(key:string,start:number,end:number,callback:(error:any,result:string)=>void):void;
        getset(key:string,callback:(error:any,result:string)=>void):void;
        hdel(key:string,...fields:Array<string>):void;
        hdel(args:Array<string>,callback:(error:any,result:number)=>void):void;
        hexists(key:string,field:string,callback:(error:any,result:number)=>void):void;
        hget(key:string,field:string,callback:(error:any,result:string)=>void):void;
        hincrby(key:string,field:string,increment:number,callback?:(error:any,result:number)=>void):void;
        hincrbyfloat(key:string,field:string,increment:number,callback?:(error:any,result:number)=>void):void;
        hkeys(key:string,callback:(error:any,result:Array<string>)=>void):void;
        hlen(key:string,callback:(error:any,result:number)=>void):void;
        hmget(...args:Array<any>):void;
        hset(key:string,field:string,value:string,callback?:(error:any,result:number)=>void):void;
        hsetnx(key:string,field:string,value:string,callback?:(error:any,result:number)=>void):void;
        hvals(key:string,callback:(error:any,result:Array<string>)=>void):void;
        incr(key:string,callback?:(error:any,result:number)=>void):void;
        incrby(key:string,increment:number,callback?:(error:any,result:number)=>void):void;
        incrbyfloat(key:string,increment:number,callback?:(error:any,result:number)=>void):void;
        keys(pattern:string,callback:(error:any,result:Array<string>)=>void):void;
        lindex(key:string,index:number,callback:(error:any,result:string)=>void):void;
        linsert(key:string,beforeafter:string,pivot:string,value:string,callback?:(error:any,result:number)=>void):void;
        llen(key:string,callback:(error:any,result:number)=>void):void;
        lpop(key:string,callback:(error:any,result:string)=>void):void;
        lpush(key:string,...values:Array<string>):void;
        lpushx(key:string,value:string,callback?:(error:any,result:number)=>void):void;
        lrange(key:string,start:number,stop:number,callback:(error:any,result:Array<string>)=>void):void;
        lrem(key:string,count:number,value:string,callback?:(error:any,result:number)=>void):void;
        lset(key:string,index:number,value:string,callback?:(error:any,result:string)=>void):void;
        ltrim(key:string,start:number,stop:number,callback?:(error:any,result:string)=>void):void;
        mget(...args:Array<any>):void;
        mset(...vals:Array<string>):void;
        msetnx(...vals:Array<string>):void;
        persist(key:string,callback?:(error:any,result:number)=>void):void;
        pexpire(key:string,milliseconds:number,callback?:(error:any,result:number)=>void):void;
        pexpireat(key:string,millisecondstimestamp:number,callback?:(error:any,result:number)=>void):void;
        psetex(key:string,milliseconds:number,value:string,callback?:(error:any,result:string)=>void):void;
        psubscribe(...patterns:Array<string>):void;
        pttl(key:string,callback:(error:any,result:number)=>void):void;
        publish(channel:string,meessage:string,callback?:(error:any,result:number)=>void):void;
        quit():void;
        randomkey(callback:(error:any,result:string)=>void):void;
        rename(key:string,newkey:string,callback?:(error:any,result:string)=>void):void;
        renamenx(key:string,newkey:string,callback?:(error:any,result:string)=>void):void;
        rpop(key:string,callback:(error:any,result:string)=>void):void;
        rpoplpush(source:string,destination:string,callback?:(error:any,result:string)=>void):void;
        rpush(key:string,...values:Array<string>):void;
        rpushx(key:string,...values:Array<string>):void;
        sadd(key:string,...members:Array<string>):void;
        scard(key:string,callback:(error:any,result:number)=>void):void;
        sdiff(...args:Array<any>):void;
        sdiffstore(...args:Array<any>):void;
        select(index:number,callback?:(error:any,result:string)=>void):void;
        set(key:string,value:string,nxxx?:string,callback?:(error:any,result:string)=>void):void;
        set(key:string,value:string,ex:string,seconds:number,nxxx?:string,callback?:(error:any,result:string)=>void):void;
        setex(key:string,milliseconds:number,value:string,callback?:(error:any,result:string)=>void):void;
        setnx(key:string,value:string,callback?:(error:any,result:string)=>void):void;
        setrange(key:string,offset:number,value:string,callback?:(error:any,result:number)=>void):void;
        sinter(...args:Array<any>):void;
        sinterstore(...args:Array<any>):void;
        sismember(key:string,member:string,callback:(error:any,result:number)=>void):void;
        smembers(key:string,callback:(error:any,result:Array<string>)=>void):void;
        smove(source:string,destination:string,member:string,callback?:(error:any,result:number)=>void):void;
        sort(...args:Array<any>):void;
        spop(key:string,callback:(error:any,result:string)=>void):void;
        srandmember(key:string,count:number,callback:(error:any,result:Array<string>)=>void):void;
        srandmember(key:string,callback:(error:any,result:string)=>void):void;
        srem(key:string,...members:Array<string>):void;
        strlen(key:string,callback:(error:any,result:number)=>void):void;
        subscribe(...channels:Array<string>):void;
        sunion(...args:Array<any>):void;
        sunionstore(destination:string,...keys:Array<string>):void;
        time(callback:(error:any,result:[number,number])=>void):void;
        ttl(key:string,callback:(error:any,result:number)=>void):void;
        type(key:string,callback:(error:any,result:string)=>void):void;
        unsubscribe(...channels:Array<string>):void;
        zadd(key:string,...args:Array<string>):void;
        zcard(key:string,callback:(error:any,result:number)=>void):void;
        zcount(key:string,min:number,max:number,callback:(error:any,result:number)=>void):void;
        zincrby(key:string,increment:number,member:string,callback?:(error:any,result:string)=>void):void;
        zinterstore(...args:Array<any>):void;
        zlexcount(key:string,min:string,max:string,callback:(error:any,result:number)=>void):void;
        zrank(key:string,member:string,callback?:(error:any,result:any)=>void):void;
        zrem(key:string,...members:Array<string>):void;
        zremrangebylex(key:string,min:string,max:string,callback?:(error:any,result:number)=>void):void;
        zremrangebyrank(key:string,start:number,stop:number,callback?:(error:any,result:number)=>void):void;
        zremrangebyscore(key:string,min:number,max:number,callback?:(error:any,result:number)=>void):void;
        zscore(key:string,memer:string,callback:(error:any,result:string)=>void):void;
        zunionstore(...args:Array<any>):void;
    }
}
declare module "express"{
    import stream=require('stream');
    import net=require('net');
    function _express():_express.Express;
    module _express{
        //ほんとうはないけど仮にexport
        export interface RequestHandler{
            //なぜかnextを省略した関数も受け付ける。そういうものか?
            (req:Request,res:Response,next:Function):void;
        }
        export interface ErrorHandler{
            (err:any,req:Request,res:Response,next:Function):void;
        }
        class Express{
            enable(name:string):void;
            disable(name:string):void;
            set(key:string,value:string):void;

            get(path,...callback:RequestHandler[]):void;
            listen(port:number):void;
            post(path,...callback:RequestHandler[]):void;
            use(path,callback:RequestHandler):void;
            use(path,r:_Router):void;
            use(callback:RequestHandler|ErrorHandler):void;
            use(r:_Router):void;

            locals:any;
            socket:net.Socket;
        }
        class Request{
            accepts(str:string):string;
            accepts(strs:string[]):string;
            acceptsLanguages():Array<string>;
            acceptsLanguages(arr:Array<string>):any;    //string|boolean
            acceptsLanguages(...arr:Array<string>):any;
            get(name:string):string;
            header(name:string):string;

            public params:any;
            public query:any;
            public url:string;
            public originalUrl:string;
            public method:string;

            //extention
            public body:any;
            ////csurf
            csrfToken():string;
            ////express-validator
            checkBody(field:string,error:string):Validation;
            checkParam(field:string,error:string):Validation;
            checkQuery(field:string,error:string):Validation;
            assert(field:string,error:string):Validation;
            sanitize(field:string):Sanitize;
            validationErrors(mapped?:boolean):any;

        }
        class Response extends stream.Writable{
            status(code:number):Response;
            set(field:string,value?:string):void;
            set(obj:any):void;
            get(field:string):string;
            redirect(status:number,url:string):void;
            redirect(url:string):void;
            render(name:string,locals:any,callback?:(error:any,html:string)=>void):void;
            render(name:string,callback?:(error:any,html:string)=>void):void;

            charset:string;
            locals:any;
            cookie(name:string,value:any,options?:any):void;

            send(body:any):void;
            sendStatus(code:number):void;
            json(body:any):void;
            json(status:number,body?:any):void;
            jsonp(body:any):void;
            jsonp(status:number,body?:any):void;
            type(type:string):void;
            sendfile(path:string,option?:any,fn?:Function):void;
            
            //本当はないが、このアプリでの拡張view.tsでの拡張用に
            public errorHandler:(err:any)=>void;
            public jsonErrorHandler:(err:any)=>void;
            /// JSONフォーマット対応用
            _redirect(status:number,url?:any):void;
            _redirect(url:string):void;
            _render(...templates:any[]):void;
        }
        export function Router(options?:{
            caseSensitive?:boolean;
            mergeParams?:boolean;
            strict?:boolean;
        }):_Router;
        export class _Router{
            all(path:string,...callbacks:Array<RequestHandler>):void;
            all(...callbacks:Array<RequestHandler>):void;
            get(path:string,...callbacks:Array<RequestHandler>):void;
            get(...callbacks:Array<RequestHandler>):void;
            post(path:string,...callbacks:Array<RequestHandler>):void;
            post(...callbacks:Array<RequestHandler>):void;
            param(name:string,callback:(req:Request,res:Response,next:Function,id:string)=>void):void;

            route(path:string):_Router;
            use(path:string,...callbacks:Array<RequestHandler>):void;
            use(...callbacks:Array<RequestHandler>):void;
        }
        //express-validator
        interface Validation{
            equals(comparision:string):Validation;
            contains(seed:string):Validation;
            matches(pattern:RegExp):Validation;
            matches(pattern:string,modifiers?:string):Validation;
            isEmail(options?:{
                allow_display_name?: boolean;
                allow_utf8_local_part?: boolean;
            }):Validation;
            isURL(options?:{
                protocols?:Array<string>;
                require_tld?:boolean;
                host_blacklist?:boolean;
                allow_trailing_dot?:boolean;
                allow_protocol_relative_urls?:boolean;
            }):Validation;
            isFQDN(options?:{
                require_tld?:boolean;
                allow_underscored?:boolean;
                allow_trailing_dot?:boolean;
            }):Validation;
            isIP(version?:number):Validation;
            isAlpha():Validation;
            isNumeric():Validation;
            isAlphanumberic():Validation;
            isBase64():Validation;
            isHexadecimal():Validation;
            isHexColor():Validation;
            isLowercase():Validation;
            isUppercase():Validation;
            isInt():Validation;
            isFloat():Validation;
            isDivisibleBy(num:number):Validation;
            isNull():Validation;
            isLength(min:number,max?:number):Validation;
            isByteLength(min:number,max?:number):Validation;
            isUUID(version?:number):Validation;
            isDate():Validation;
            isAfter(date?:Date):Validation;
            isBefore(date?:Date):Validation;
            isIn(values:Array<string>):Validation;
            isCreditCard():Validation;
            isISIN():Validation;
            isISBN(version?:number):Validation;
            isMobilePhone(locale:string):Validation;
            isJSON():Validation;
            isMultibyte():Validation;
            isAscii():Validation;
            isFullWidth():Validation;
            isHalfWidth():Validation;
            isVariableWidth():Validation;
            isSurrogatePair():Validation;
            isMongoId():Validation;
            isCurrency(options:{
                symbol?:string;
                require_symbol?:boolean;
                allow_space_after_symbol?:boolean;
                symbol_after_digits?:boolean;
                allow_negative?:boolean;
                parens_for_negatives?:boolean;
                negative_sign_before_digits?:boolean;
                negative_dign_after_digits?:boolean;
                allow_negative_sign_placeholder?:boolean;
                thousands_separator?:boolean;
                decimal_separator?:boolean;
                allow_space_after_digits?:boolean;
            }):Validation;
            optional():Validation;

            //custom validator defined by ./validator.ts
            isUserID():Validation;
            isUserName():Validation;
        }
        interface Sanitize{
            toString():Sanitize;
            toDate():Sanitize;
            toFloat():Sanitize;
            toInt(radix?:number):Sanitize;
            toBoolean(strict?:boolean):Sanitize;
            trim(chars?:Array<string>):Sanitize;
            ltrim(chars?:Array<string>):Sanitize;
            rtrim(chars?:Array<string>):Sanitize;
            escape():Sanitize;
            stripLow(keep_new_lines?:boolean):Sanitize;
            whitelist(chars:Array<string>):Sanitize;
            blacklist(chars:Array<string>):Sanitize;
            normalizeEmail(options?:{
                lowercase?:boolean;
            }):Sanitize;

        }
    }
    export = _express;
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
declare module "serve-static"{
    function _m(root:string,options?:any):any;

    export = _m;
}
declare module "helmet"{
    function _m():any;
    export = _m;
}
declare module "csurf"{
    function _m(options?:{
        cookie?: boolean;
        key?: string;
        path?: string;
        ignoreMethods?: string[];
        value?:(req:any)=>string;
    }):any;
    export = _m;
}
declare module "express-session"{
    export = _m;
    function _m(option:{
        cookie?: {
            path?: string;
            httpOnly?: boolean;
            secure?: boolean;
            maxAge?: number;
        };
        genid?:(req:any)=>string;
        name?: string;
        proxy?: boolean;
        rolling?: boolean;
        saveUninitialized?: boolean;
        secret: string;
        store?: any;
        unset?: string;
    }):any;
}
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
declare module "validator"{
    export function equals(value:string,comparision:string):boolean;
    export function contains(value:string,seed:string):boolean;
    export function matches(value:string,pattern:RegExp):boolean;
    export function matches(value:string,pattern:string,modifiers?:string):boolean;
    export function isEmail(value:string,options?:{
        allow_display_name?: boolean;
        allow_utf8_local_part?: boolean;
    }):boolean;
    export function isURL(value:string,options?:{
        protocols?:Array<string>;
        require_tld?:boolean;
        host_blacklist?:boolean;
        allow_trailing_dot?:boolean;
        allow_protocol_relative_urls?:boolean;
    }):boolean;
    export function isFQDN(value:string,options?:{
        require_tld?:boolean;
        allow_underscored?:boolean;
        allow_trailing_dot?:boolean;
    }):boolean;
    export function isIP(value:string,version?:number):boolean;
    export function isAlpha(value:string):boolean;
    export function isNumeric(value:string):boolean;
    export function isAlphanumberic(value:string):boolean;
    export function isBase64(value:string):boolean;
    export function isHexadecimal(value:string):boolean;
    export function isHexColor(value:string):boolean;
    export function isLowercase(value:string):boolean;
    export function isUppercase(value:string):boolean;
    export function isInt(value:string):boolean;
    export function isFloat(value:string):boolean;
    export function isDivisibleBy(value:string,num:number):boolean;
    export function isNull(value:string):boolean;
    export function isLength(value:string,min:number,max?:number):boolean;
    export function isByteLength(value:string,min:number,max?:number):boolean;
    export function isUUID(value:string,version?:number):boolean;
    export function isDate(value:string):boolean;
    export function isAfter(value:string,date?:Date):boolean;
    export function isBefore(value:string,date?:Date):boolean;
    export function isIn(value:string,values:Array<string>):boolean;
    export function isCreditCard(value:string):boolean;
    export function isISIN(value:string):boolean;
    export function isISBN(value:string,version?:number):boolean;
    export function isMobilePhone(value:string,locale:string):boolean;
    export function isJSON(value:string):boolean;
    export function isMultibyte(value:string):boolean;
    export function isAscii(value:string):boolean;
    export function isFullWidth(value:string):boolean;
    export function isHalfWidth(value:string):boolean;
    export function isVariableWidth(value:string):boolean;
    export function isSurrogatePair(value:string):boolean;
    export function isMongoId(value:string):boolean;
    export function isCurrency(value:string,options:{
        symbol?:string;
        require_symbol?:boolean;
        allow_space_after_symbol?:boolean;
        symbol_after_digits?:boolean;
        allow_negative?:boolean;
        parens_for_negatives?:boolean;
        negative_sign_before_digits?:boolean;
        negative_dign_after_digits?:boolean;
        allow_negative_sign_placeholder?:boolean;
        thousands_separator?:boolean;
        decimal_separator?:boolean;
        allow_space_after_digits?:boolean;
    }):boolean;
}
declare module "express-validator"{
    export = _m;
    function _m(option?:{
        errorFormatter?:(param:string,msg:string,value:string)=>{
            param:string;
            msg:string;
            value:string;
        };
        customValidators?:{
            [name:string]:(value:string,...args:any[])=>boolean;
        };
    }):any;
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
        emergency(...args:string[]):void;
        alert(...args:string[]):void;
        critical(...args:string[]):void;
        error(...args:string[]):void;
        warning(...args:string[]):void;
        notice(...args:string[]):void;
        info(...args:string[]):void;
        debug(...args:string[]):void;
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

// something useful for me
interface Callback<T>{
    (err:any,result:T):void;
}
interface Cont{
    (err:any):void;
}
