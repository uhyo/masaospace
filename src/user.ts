///<reference path="./node.d.ts" />
//User control
import error=require('./error');
import db=require('./db');

import mum=require('my-user-mongo');

import User=mum.User;
import UserConfig=mum.UserConfig;



//User control
export class UserControl{
    private access:UserAccess;
    constructor(dbaccess:db.DBAccess){
        this.access=new UserAccess(dbaccess);
    }
    //login
    public login(userid:string,password:string,callback:(error:any,result:LoginResult)=>void):void{
        this.access.loadUser({
            userid:userid
        },(error:any,user:User)=>{
            if(error){
                callback(error,null);
                return;
            }
            if(user==null){
                callback(null,{
                    login:false,
                    session:null,
                    error:error.user.Login.AUTH_FAILS
                });
                return;
            }
            //パスワードを確かめる
            if(!user.auth(password)){
                //パスワードが一致しない
                callback(null,{
                    login:false,
                    session:null,
                    error:error.user.Login.AUTH_FAILS
                });
                return;
            }
            //パスワードが一致したのでログイン成功
            //セッション作成
            var session=this.access.createSession({
                userid:user.userid,
                name:user.name
            });
            this.access.saveSession(session,(error:any)=>{
                if(error){
                    callback(error,null);
                    return;
                }
                callback(null,{
                    login:true,
                    session:session,
                    error:null
                });
            });
        });

    }
}

//User db access
export class UserAccess{
    private dbaccess:db.DBAccess;
    constructor(dbaccess:db.DBAccess){
        this.dbaccess=dbaccess;
    }
    //user may be null
    public loadUser(query:LoadUserQuery,callback:(error:any,user:User)=>void):void{
        var dbquery:any={};
        if(query._id!=null){
            dbquery._id=query._id;
        }else if(query.userid!=null){
            dbquery.userid=query.userid;
        }else{
            callback(new Error("invalid LoadUserQuery."),null);
            return;
        }

        this.dbaccess.mongo.collection(this.dbaccess.mongo.C_users,(error:any,coll:db.Collection)=>{
            if(error){
                callback(error,null);
                return;
            }
            coll.findOne(dbquery,(error:any,doc:any)=>{
                if(error){
                    callback(error,null);
                    return;
                }
                if(doc==null){
                    callback(null,null);
                }else{
                    var result=new User();
                    result.initFromDoc(doc);
                    callback(null,result);
                }
            });
        });
    }
    //session load/save
    loadSession(sessionid:string,callback:(error:any,session:Session)=>void):void{
        var c=this.dbaccess.redis.getClient();
        c.hgetall(sessionid+":session",(error:any,result:SessionDoc)=>{
            if(error){
                callback(error,null);
            }else{
                callback(null,{
                    sessionid:sessionid,
                    userid:result.userid,
                    name:result.name,
                    login_time:new Date(Number(result.login_time)),
                    last_time:new Date(Number(result.last_time)),
                });
            }
        });
    }
    saveSession(session:Session,callback:(error:any)=>void):void{
        var c=this.dbaccess.redis.getClient();
        c.hmset(session.sessionid+":session",<SessionDoc>{
            userid:session.userid,
            name:session.name,
            login_time:String(session.login_time.getTime()),
            last_time:String(session.last_time.getTime())
        },callback);
    }
    //session create
    createSession(obj:CreateSessionQuery):Session{
        var now=new Date();
        var sessionid=crypto.pseudoRandomBytes(16).toString("hex");
        return {
            sessionid:sessionid,
            userid:obj.userid,
            name:obj.name,
            login_time:now,
            last_time:now
        };

    }

}

//loginの結果
interface LoginResult{
    //成功したかどうか
    login:boolean;
    //成功した場合はセッション
    session:Session;
    //ログインできない場合のエラーメッセージ
    error:error.user.Login;
}

//load userの条件指定
interface LoadUserQuery{
    userid?:string;
    _id?:db.ObjectId;
}

//セッションデータ
export interface SessionDoc{
    userid:string;
    name:string;
    login_time:string;
    last_time:string;
}
export interface Session{
    sessionid:string;
    userid:string;
    name:string;
    login_time:Date;
    last_time:Date;
}
//作るとき
export interface CreateSessionQuery{
    userid:string;
    name:string;
}

