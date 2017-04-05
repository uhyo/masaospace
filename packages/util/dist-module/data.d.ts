export declare type MasaoCategory = '2.8' | 'fx' | 'kani2';
export declare type ResourceKind = 'pattern' | 'title' | 'ending' | 'gameover' | 'mapchip' | 'chizu' | 'haikei' | 'se' | 'bgm' | 'other';
export interface UserOpenData {
    screen_name: string;
    name: string;
    profile: string;
    icon: string | null;
    url: string;
}
export interface UserData extends UserOpenData {
    activated: boolean;
    screen_name_lower: string;
    mail: string;
    created: Date;
}
export interface UserOpenDataWithId extends UserOpenData {
    id: string;
}
export interface UserDataWithId extends UserData {
    id: string;
}
export interface File {
    id: string;
    name: string;
    type: string;
    size: number;
    usage: ResourceKind;
    description: string;
}
export interface Session {
    loggedin: boolean;
    user: string;
    screen_name: string;
    name: string;
    icon: string | null;
}
export interface Series {
    id: number;
    name: string;
    description: string;
    games: Array<number>;
}
export interface Game {
    id: number;
    params: Record<string, string>;
    version: MasaoCategory;
    resources: Array<Resource>;
    script: string | null;
}
export declare type GameData = Game;
export interface GameEditableMetadata {
    title: string;
    description: string;
    tags: Array<string>;
    hidden: boolean;
}
export interface GameMetadataUpdate extends GameEditableMetadata {
    id: number;
    owner: string;
}
export interface GameOpenMetadata extends GameMetadataUpdate {
    created: Date;
    playcount: number;
}
export interface GameMetadata extends GameOpenMetadata {
    updated: Date;
}
export interface GameOpenMetadataWithOwnerData extends GameOpenMetadata {
    user: UserOpenData;
}
export interface GamePastData {
    id: number;
    created: Date;
    game: Game;
    metadata: GameMetadata;
}
export interface GameQuery {
    owner?: string;
    tags?: string;
    ids?: Array<number>;
    hidden?: boolean;
    skip?: number;
    limit?: number;
    sort?: any;
}
export interface Resource {
    id: string;
    target: string;
}
export interface Comment {
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
export interface Playlog {
    cleared: boolean;
    stage: number;
    score: number;
    buffer: ArrayBuffer;
}
