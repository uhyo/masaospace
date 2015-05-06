///<reference path="./node.d.ts" />

//各種のデータを定義
import mum=require('my-user-mongo');

//ユーザー
export import User=mum.User;

export interface UserData{
    //登録完了したかどうか
    activated:boolean;
    //ユーザーID（表面用）
    screen_name:string;
    //ユーザーID（小文字）
    screen_name_lower:string;
    //表示名
    name:string;
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
    //user id
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
    id:string;
}
//ファイルを探すクエリ
export interface FileQuery{
    id?:string;
    owner?:string;
}

//正男（各種メタデータ）
export interface GameMetadata{
    //ゲームID
    id:number;
    //オーナーユーザーID
    owner:string;
    //タイトル
    title:string;
    //作成日時
    created:Date;
    //更新日時
    updated:Date;
}
//ゲーム本体データ
export interface GameData{
    //ゲームID
    id:number;
    //ここにいろいろ入ってる
    params:any;
    //リソース（使用ファイル）
    resources:Array<{
        owner:string;
        id:string;
    }>;
}

