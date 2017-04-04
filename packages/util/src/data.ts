// data types

// MasaoSpace上のバージョン分類
export type MasaoCategory = '2.8' | 'fx' | 'kani2';

export type ResourceKind = 'pattern' | 'title' | 'ending' | 'gameover' | 'mapchip' | 'chizu' | 'haikei' | 'se' | 'bgm' | 'other';

export interface UserData{
    id: string;
    name: string;
    screen_name: string;
    mail: string;
    profile: string;
    icon: string | null;
    url: string;
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
    id: number;
    name: string;
    description: string;
    games: Array<number>;
}

export interface Game{
    id: number | null;
    params: Record<string, string>;
    version: MasaoCategory;
    resources: Array<Resource>;
    script: string | null;
}

export interface GameMetadata{
    title: string;
    description: string;
    tags: Array<string>;
    hidden: boolean;
}
export interface GameOpenMetadata extends GameMetadata{
    id: number;
    owner: string;
    created: Date;
    playcount: number;
}
export interface GameAllMetadata extends GameOpenMetadata{
    updated: Date;
    user: UserData;
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
