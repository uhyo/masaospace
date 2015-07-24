///<reference path="./node.d.ts" />

//各種のデータを定義
import mum=require('my-user-mongo');

//ユーザー
export import User=mum.User;

//一般に見せられるユーザー情報
export interface UserOpenData{
    //ユーザーID（表面用）
    screen_name:string;
    //表示名
    name:string;
}

export interface UserData extends UserOpenData{
    //登録完了したかどうか
    activated:boolean;
    //ユーザーID（小文字）
    screen_name_lower:string;
    //メールアドレス
    mail:string;

    //作成日時
    created:Date;
}
//ひとつのユーザーを指定
export interface UserOneQuery{
    screen_name_lower?:string;
    mail?:string;
}

//セッション
export interface Session{
    //user id. ログインしていなかったらnull
    user:string;
    //screen name
    screen_name:string;
    //user name
    name:string;

    //methods provided by express-session
    regenerate(callback:Cont):void;
    destroy(callback:Cont):void;
    reload(callback:Cont):void;
    save(callback:Cont):void;
}


//チケット
export interface TicketData{
    type:string;
    //user id
    user:string;
}
export interface Ticket extends TicketData{
    token:string;
    //created time
    created:Date;
}

//ファイル
export interface FileData{
    //ファイルタイプ（MIME）
    type:string;
    //どのユーザーがアップロードしたか
    owner:string;
    //もともとのファイル名
    name:string;
    //アップロード日時
    created:Date;
}
export interface File extends FileData{
    //ファイルID
    id:string;
}
//ファイルを探すクエリ
export interface FileQuery{
    id?:string;
    owner?:string;
}

//正男（各種メタデータ）
///一般に見せられる
export interface GameOpenMetadata{
    //ゲームID
    id:number;
    //オーナーユーザーID
    owner:string;
    //タイトル
    title:string;
    //説明
    description:string;
    //作成日時
    created:Date;
}
///ゲームのデータ全部
export interface GameMetadata extends GameOpenMetadata{
    //更新日時
    updated:Date;
}
///ユーザーデータも
export interface GameOpenMetadataWithOwnerData extends GameOpenMetadata{
    //オーナーのユーザーデータ
    user:UserOpenData;
}
//ゲーム本体データ
export interface GameData{
    //ゲームID
    id:number;
    //ゲームのバージョン
    //"2.8", "fx"
    version:string;
    //ここにいろいろ入ってる
    params:any;
    //リソース（使用ファイル）
    resources:Array<{
        //何のparamに対応させるか（あれば）
        target:string;
        //ファイルのID
        id:string;
    }>;
}
//ゲームを探すクエリ
export interface GameQuery{
    owner?:string;

    skip:number;
    limit:number;
    sort:any;
}

//メール（controllers/mail.tsが扱うもの）
export interface Mail{
    to: string | {name?:string;address:string};
    subject: string;
    text: string;

    type: string;
}
