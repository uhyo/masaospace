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
