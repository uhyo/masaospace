///<reference path="./node.d.ts" />

//各種のデータを定義
import { User } from 'my-user-mongo';

//ユーザー
export { User };

//一般に見せられるユーザー情報
export interface UserOpenData {
  //ユーザーID（表面用）
  screen_name: string;
  //表示名
  name: string;
  //自己紹介
  profile: string;
  //アイコン（ファイルID）
  icon: string | null;
  //URL
  url: string;
}

export interface UserData extends UserOpenData {
  //登録完了したかどうか
  activated: boolean;
  //ユーザーID（小文字）
  screen_name_lower: string;
  //メールアドレス
  mail: string;

  //作成日時
  created: Date;
}
//ひとつのユーザーを指定
export interface UserOneQuery {
  screen_name_lower?: string;
  mail?: string;
}

//セッション
export interface Session extends Express.Session, UserOpenData {
  //user id. ログインしていなかったらnull
  user: string | null;
}

//チケット
export interface TicketData {
  type: string;
  //user id
  user: string;
  //additioal data
  data?: any;
}
export interface Ticket extends TicketData {
  token: string;
  //created time
  created: Date;
}

//ファイル
export interface FileData {
  //ファイルタイプ（MIME）
  type: string;
  //どのユーザーがアップロードしたか
  owner: string;
  //もともとのファイル名
  name: string;
  //用途
  usage: string;
  //説明
  description: string;
  //サイズ
  size: number;
  //アップロード日時
  created: Date;
}
export interface File extends FileData {
  //ファイルID
  id: string;
  //md5
  md5: string;
}
//ファイルを探すクエリ
export interface FileQuery {
  id?: string;
  ids?: Array<string>;
  owner?: string;
  usage?: string;
}

//正男（各種メタデータ）
//投稿者が編集できる
export interface GameEditableMetadata {
  //タイトル
  title: string;
  //説明
  description: string;
  //タグ
  tags: Array<string>;
  //非公開
  hidden: boolean;
}
//セーブ時に自動生成されないデータ
export interface GameMetadataUpdate extends GameEditableMetadata {
  //ゲームID
  id: number;
  //オーナーユーザーID
  owner: string;
}
///一般に見せられる
export interface GameOpenMetadata extends GameMetadataUpdate {
  //作成日時
  created: Date;
  //閲覧回数
  playcount: number;
}
///ゲームのデータ全部
export interface GameMetadata extends GameOpenMetadata {
  //更新日時
  updated: Date;
}
///ユーザーデータも
export interface GameOpenMetadataWithOwnerData extends GameOpenMetadata {
  //オーナーのユーザーデータ
  user: UserOpenData;
}
//ゲーム本体データ
export interface GameData {
  //ゲームID
  id: number;
  //ゲームのバージョン
  //"2.8", "fx", "kani2"
  version: string;
  //ここにいろいろ入ってる
  params: any;
  //リソース（使用ファイル）
  resources: Array<{
    //何のparamに対応させるか（あれば）
    target: string;
    //ファイルのID
    id: string;
  }>;
  //外部スクリプト
  script: string | null;
}
//過去のデータ
export interface GamePastData {
  id: number;
  created: Date;
  game: GameData;
  metadata: GameMetadata;
}
//ゲームを探すクエリ
export interface GameQuery {
  owner?: string;
  tags?: string;
  ids?: Array<number>;
  hidden?: boolean;

  skip?: number;
  limit?: number;
  sort?: any;
}

//コメント
export interface Comment {
  //コメントID
  id: number;
  //ゲームID
  game: number;
  //ユーザーID
  userid: string;

  //ゲームのオーナーのID
  gameowner: string;

  //内容
  comment: string;
  //添付するプレイログのID(nullable)
  playlog: string | null;
  //プレイログの情報
  cleared: boolean;
  stage: number;
  score: number;
  //日時
  time: Date;
}
export interface CommentWithUserData extends Comment {
  //コメント主のデータ
  user: UserOpenData;
}

//コメントを探すとき
export interface CommentQuery {
  id?: number;
  game?: number;
  userid?: string;

  skip: number;
  limit: number;
  sort: any;
}

//シリーズ
export interface Series {
  //シリーズID
  id: number;
  //シリーズオーナー
  owner: string;
  //シリーズ名
  name: string;
  //説明
  description: string;
  //ゲームIDたち
  games: Array<number>;
  //作成日時
  created: Date;
  //更新日時
  updated: Date;
}

export interface SeriesQuery {
  id?: number;
  owner?: string;
  games?: number;

  skip?: number;
  limit?: number;
  sort?: any;
}

//メール（controllers/mail.tsが扱うもの）
export interface Mail {
  to: string | { name?: string; address: string };
  subject: string;
  text: string;

  type: string;
}

//プレイログ（挿入）
export interface NewPlaylog {
  owner: string; //誰がアップロードしたプレイログか
  dataBase64: string; //base64形式のデータ
}
//プレイログ
export interface Playlog {
  id: string; //プレイログのID(sha)
  owner: string; //誰がアップロードしたプレイログか
  game: number; //ゲームID
  game_id: string; //ステージのgameの_id（変わってるかもしれないので）
  cleared: boolean; //クリアしたかどうか
  stage: number; //到達ステージ
  score: number; //最終スコア

  //プレイログがアップロードされた時間
  created: Date;

  //プレイログのバイナリデータ(Buffer. gzipped)
  data: any;
}

export interface PlaylogQuery {
  id?: string;
  owner?: string;
  game?: number;

  skip?: number;
  limit?: number;
  sort?: any;
}
