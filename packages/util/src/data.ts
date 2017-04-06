// data types

// MasaoSpace上のバージョン分類
export type MasaoCategory = '2.8' | 'fx' | 'kani2';

export type ResourceKind = 'pattern' | 'title' | 'ending' | 'gameover' | 'mapchip' | 'chizu' | 'haikei' | 'se' | 'bgm' | 'other';

//一般に見せられるユーザー情報
export interface UserOpenData{
    //ユーザーID（表面用）
    screen_name:string;
    //表示名
    name:string;
    //自己紹介
    profile:string;
    //アイコン（ファイルID）
    icon:string | null;
    //URL
    url:string;
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

export interface UserOpenDataWithId extends UserOpenData{
    id: string;
}
export interface UserDataWithId extends UserData{
    id: string;
}

export interface File{
    id: string;
    name: string;
    type: string;
    size: number;
    usage: ResourceKind;
    description: string;
}

export interface Session{
    loggedin: boolean;
    user: string;
    screen_name: string;
    name: string;
    icon: string | null;
}

export interface Series{
    // シリーズID
    id: number;
    // オーナー
    owner: string;
    // シリーズ名
    name: string;
    // 説明
    description: string;
    // ゲームたち
    games: Array<number>;
    // 作成日時
    created: Date;
    // 更新日時
    updated: Date;
}

export interface SeriesOfGame{
    id: number;
    name: string;
    prev: number | null;
    next: number | null;
}

export interface Game{
    id: number;
    params: Record<string, string>;
    version: MasaoCategory;
    resources: Array<Resource>;
    script: string | null;
}
export type GameData = Game;

export interface GameEditableMetadata{
    title: string;
    description: string;
    tags: Array<string>;
    hidden: boolean;
}
//セーブ時に自動生成されないデータ
export interface GameMetadataUpdate extends GameEditableMetadata{
    id: number;
    owner: string;
}
///一般に見せられる
export interface GameOpenMetadata extends GameMetadataUpdate{
    created: Date;
    playcount: number;
}
export interface GameMetadata extends GameOpenMetadata{
    updated: Date;
}
///ユーザーデータも
export interface GameOpenMetadataWithOwnerData extends GameOpenMetadata{
    //オーナーのユーザーデータ
    user:UserOpenData;
}

// 過去のゲームデータ
export interface GamePastData{
    id: number;
    created: Date;
    game: Game;
    metadata: GameMetadata;
}
//ゲームを探すクエリ
export interface GameQuery{
    owner?:string;
    tags?:string;
    ids?:Array<number>;
    hidden?:boolean;

    skip?:number;
    limit?:number;
    sort?:any;
}

export interface Resource{
    id: string;
    target: string;
}

export interface Comment{
    id: string;
    userid: string;
    user: UserData;
    comment: string;

    time: number;
    playlog?: string;
    cleared?: boolean;
    score?: boolean;
    stage?: number;
}

export interface Playlog{
    cleared: boolean;
    stage: number;
    score: number;
    buffer: ArrayBuffer;
}
