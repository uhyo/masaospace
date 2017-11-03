///<reference path="./node.d.ts" />
// Web server
import * as config from 'config';

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as express from 'express';

import * as bodyParser from 'body-parser';
import * as expressSession from 'express-session';
import * as connectRedis from 'connect-redis';
import * as csurf from 'csurf';
// import * as st from 'st';
// import * as ect from 'ect';
const st = require('st');
const ect = require('ect');

// import * as React from 'react';
// import * as ReactDOMServer from 'react-dom/server';

import {Session} from './data';
import {writeUserInfo} from './util';

import {makeFrontRouter} from './front/index';

import * as logger from './logger';
import * as validator from './validator';

import {
    masao,
    RouteHandler,
    SocialData,
} from '@uhyo/masaospace-util';

import Controller from './controllers/index';

export class WebServer{
    private app:express.Express;
    private clientConfig:any;
    constructor(){
    }
    init(c:Controller,callback:Cont):void{
        //client用のconfigを生成
        this.generateClientConfig();

        //open web server
        this.app=express();
        // set some methods
        this.app.request.validationErrorResponse=function(this: express.Request, res: express.Response){
            /* response with validation errors */
            var e=this._validationErrors;
            if(e.length>0){
                // FIXME
                res.json({
                    //TODO
                    error:JSON.stringify(e),
                });
                return true;
            }
            return false;
        };
        //rendering engine
        var views=path.resolve(__dirname,"..","client","views");
        var ectRenderer=ect({
            root:views,
            ext:".ect"
        });
        this.app.set("views",views);
        this.app.set("view engine","ect");
        this.app.set("trust proxy",true as any);
        this.app.engine("ect",ectRenderer.render);
        // switching by hostname
        const mainHostname = config.get("service.hostname"),
              sandboxHostname = config.get("service.sandboxHostname");
        this.app.use((req,res,next)=>{
            //hostnameとsandboxHostnameが一致（テスト環境）する場合はどっちも通す書き方
            if(/^\u002fsandbox\u002f/.test(req.path)){
                //sandbox用のhostnameはsandboxしか提供しない（セキュリティ的に）
                if(req.hostname===sandboxHostname){
                    next();
                }else{
                    res.sendStatus(404);
                }
            }else{
                //それ以外はsandbox用hostnameでは提供しない
                if(req.hostname===mainHostname){
                    next();
                }else{
                    res.sendStatus(404);
                }
            }
        })
        // bodyparser
        this.app.use(bodyParser.urlencoded({
            extended: false,
            limit: '300kb'
        }));
        //static files
        if(config.get("webserver.externalstatic")!==true){
            this.app.use(st({
                path:path.resolve(__dirname,"..","dist"),
                url:"/static",
                index:false,
                cache:false,
            }));
            //uploaded files
            this.app.use(st({
                path:config.get("file.path"),
                url:"/uploaded",
                index:false
            }));
            //favicons
            let m=st({
                path:path.resolve(__dirname,"..","dist","images","favicon"),
                url:"/",
                index:false
            });
            this.app.use((req,res,next)=>{
                if(/^\/(?:favicon\.ico|favicon-.*\.png|apple-touch-icon-.*\.png|android-chrome-.*\.png|mstile-.*\.png|manifest\.json|browserconfig\.xml)$/i.test(req.url)){
                    //favicon系の配信
                    m(req,res);
                }else{
                    next();
                }
            });
        }
        //validator
        this.app.use(validator.forExpress);
        //session
        var sessoption={
            secret: config.get("session.secret"),
            resave: false,
            saveUninitialized: false,
            cookie:{
                secure: config.get("webserver.secure")
            },
            store: new (connectRedis(expressSession))({
                client: c.getRedisClient(),
                ttl: config.get("session.life"),
                db: config.get("redis.db"),
                prefix: "sess:",
                logErrors: true,
            } as any),
        };
        void connectRedis;
        this.app.use(expressSession(sessoption));
        this.app.use(csurf());
        //error handling
        this.app.use((err: Error,req: express.Request,res: express.Response,_next: any)=>{
            if(req.xhr){
                //JSON error response
                logger.error(err);
                res.status(500).json({error: String(err)});
            }else{
                //normal error response
                res.status(500).send(String(err));
            }
        });

        this.route(c);
        this.front(c);

        this.app.listen(config.get("webserver.port"));
        process.nextTick(()=>{
            callback(null);
        });
    }
    //route apis
    route(c:Controller):void{
        var apiroot=express.Router();
        // api/を全部読み込む
        var apipath=path.resolve(__dirname,"api");
        readDir(apipath,apiroot);

        this.app.use("/api",apiroot);

        function readDir(dirpath:string,router:express.IRouter<any>):void{
            //ディレクトリを読む
            var files:Array<string>=fs.readdirSync(dirpath);
            for(var i=0;i<files.length;i++){
                var filepath=path.resolve(dirpath,files[i]);
                var st=fs.statSync(filepath);
                if(st.isDirectory()){
                    //open subdirectory
                    var subroute = express.Router();
                    router.use(files[i], subroute);
                    readDir(filepath,subroute);
                }else if(path.extname(files[i])===".js"){
                    //js file
                    let mod=require(filepath);
                    // ad-hoc
                    if ("function" === typeof mod.default){
                        mod = mod.default;
                    }
                    if("function"===typeof mod){
                        var subroute=express.Router();
                        (<any>router).use("/"+path.basename(files[i],".js"),subroute);
                        (new mod).route(subroute,c);
                    }
                }

            }
        }
    }
    //front pages
    front(c:Controller):void{
        const r = makeFrontRouter(c);

        // pathに対応するページのデータをあげる
        this.app.post("/api/front",(req,res)=>{
            if("string"!==typeof req.body.path){
                res.json({
                    error: "undefined path"
                });
                return;
            }
            var u=url.parse(req.body.path,true);
            //?があるかも
            var re=r.route(u.pathname || '');
            if(re==null){
                res.json({
                    error: "page does not exist"
                });
                return;
            }
            re.result({
                session: req.session,
                ... u.query,
                ... re.params,
            }).then((view)=>{
                if(view.status){
                    if(view.status===404){
                        view.title = "Page not found";
                        view.page = {
                            page: '404',
                        };
                    }
                }
                res.json({
                    title: pageTitle(view.title),
                    page: view.page,
                });
            })
            .catch(err=>{
                res.json({
                    error: String(err),
                });
            });
        });
        // embedding
        this.app.get("/embed/:id",(req,res)=>{
            var id=parseInt(req.params.id);
            //ゲームを探してみる
            c.game.getGame(id,true,(err,obj)=>{
                if(err){
                    logger.error(err);
                    res.sendStatus(500);
                    return;
                }
                if(obj==null){
                    //そのゲームはなかった
                    res.sendStatus(404);
                    return;
                }
                if(obj.metadata.hidden===true){
                    //非公開の正男
                    res.status(403).render("embed-hidden.ect");
                    return;
                }
                //正男をローカライズ
                const localGame=masao.localizeGame(obj.game);
                res.render("embed.ect",{
                    constructorName:  obj.game.version==="2.8" ? "CanvasMasao_v28" : "CanvasMasao",
                    params: localGame.params,
                    metadata: obj.metadata,
                    config: config,
                    'advanced-map': localGame['advanced-map'],
                });
            });
        });
        this.app.get("/sandbox/:id",(req,res)=>{
            var id=parseInt(req.params.id);
            //ゲームを探してみる
            c.game.getGame(id,true,(err,obj)=>{
                if(err){
                    logger.error(err);
                    res.sendStatus(500);
                    return;
                }
                if(obj==null){
                    //そのゲームはなかった
                    res.sendStatus(404);
                    return;
                }
                if(obj.metadata.hidden===true){
                    //非公開の正男
                    res.render("embed-hidden.ect");
                    return;
                }
                //正男をローカライズ
                var localGame=masao.localizeGame(obj.game, config.get("service.domain"));
                res.render("sandbox.ect",{
                    constructorName:  obj.game.version==="2.8" ? "CanvasMasao_v28" : "CanvasMasao",
                    advancedMap: localGame['advanced-map'],
                    params: localGame.params,
                    script: obj.game.script,
                    metadata: obj.metadata,
                    config: config
                });
            });
        });
        this.app.get("*", (req,res)=>{
            var re = r.route(req.path);
            var func = re ? re.result : null;
            var params = re ? re.params : {};
            params = {
                session: req.session,
                ... req.query,
                ... params,
            };
            if(func==null){
                /* 404 */
                res.status(404);
                func = ((_: any)=>{
                    return Promise.resolve({
                        status: 404,
                        title: 'Not Found',
                        page: {
                            page: '404',
                        },
                    });
                }) as RouteHandler;
            }
            func(params).then(view=>{
                if(view.status){
                    //statusを返す
                    if(view.status===404){
                        res.status(404);
                        view.title = "Not Found";
                        view.page = {
                            page: "404",
                        };
                    }else{
                        res.send(view.status);
                        return;
                    }
                }
                var session = req.session!.user!=null ? writeUserInfo(req.session! as Session) : null;
                var initialData={
                    config: this.clientConfig,
                    page: view.page,
                    csrfToken: req.csrfToken(),
                    session:makeClientSession(session),
                };
                res.render("index.ect",{
                    title: pageTitle(view.title),
                    social: socialData(view.social),
                    initial: initialData,
                    // content: ReactDOMServer.renderToString(React.createElement(Root,initialData))
                    content: '',
                });
            })
            .catch(err=>{
                res.send(String(err));
            });
        });
    }

    private generateClientConfig():void{
        //validationなど
        this.clientConfig={
            service: config.get("service"),
            user: config.get("user"),
            game: config.get("game"),
            comment: config.get("comment"),
            filedata: config.get("filedata"),
            series: config.get("series")
        };
    }
}

//クライアント用セッション
function makeClientSession(session:Session):any{
    if(session==null){
        return {
            loggedin: false
        };
    }else{
        return writeUserInfo(session,{
            loggedin: true
        });
    }
}

//タイトル
function pageTitle(title:string | null):string{
    if(title){
        return title+" | "+config.get("service.name");
    }else{
        return config.get("service.name");
    }
}

/**
 * Generate default social page.
 */
function socialData(data: SocialData | null): SocialData {
    const image = data ? data.image : `${config.get('service.url')}icon-with-logo.png`;
    const description = data ? data.description : null;
    return {
        image,
        description,
    };
}
