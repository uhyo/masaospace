// サーバーが出力するpage data
import {
  UserOpenData,
  UserOpenDataWithId,
  Game,
  GameOpenMetadata,
  GameOpenMetadataWithOwnerData,
  Series,
  SeriesOfGame,
} from './data';

export type PageData =
  | UserPages
  | GamePages
  | SeriesPages
  | TopPage
  | NotFoundPage;

// serverのpage routing用
export interface View {
  // HTTP status code
  status?: number;
  title: string | null;
  social: SocialData | null;
  page: PageData | null;
}
/**
 * Cards for SNS.
 */
export interface SocialData {
  image: string | null;
  description: string | null;
}

export interface RouteHandler {
  (obj: any): Promise<View>;
}

export interface TopPage {
  page: 'top';
  data: {
    popularTags: Array<string>;
  };
}
export interface NotFoundPage {
  page: '404';
}

// ========== User ==========
export type UserPages =
  | UserEntryPage
  | UserResetPage
  | UserTicketPage
  | UserPage
  | UserMyPage
  | UserAccountPage;
export interface UserEntryPage {
  page: 'user.entry';
}
export interface UserResetPage {
  page: 'user.reset';
}
export interface UserTicketPage {
  page: 'user.ticket';
  ticket: string;
  screen_name: string;
}
export interface UserPage {
  page: 'user.page';
  userid: string;
  data: UserOpenData;
}
export interface UserMyPage {
  page: 'user.my';
}
export interface UserAccountPage {
  page: 'user.account';
}

// ========== Game ==========
export type GamePages =
  | GameNewPage
  | GamePlayPage
  | GamePlaylogPage
  | GameListPage
  | GameEditPage
  | GameHiddenPage;

export interface GameNewPage {
  page: 'game.new';
}
export interface GamePlayPage {
  page: 'game.play';
  game: Game;
  metadata: GameOpenMetadata;
  owner: UserOpenDataWithId;
  series: Array<SeriesOfGame>;
}

export interface GamePlaylogPage {
  page: 'game.playlog';
  game: Game;
  metadata: GameOpenMetadata;
  playlog: {
    id: string;
  };
}

export interface GameListPage {
  page: 'game.list';
  owner: string;
  tag: string;
}
export interface GameEditPage {
  page: 'game.edit';
  id: number;
}
export interface GameHiddenPage {
  page: 'game.hidden';
  id: number;
  owner: string;
}

// ========== Series ==========
export type SeriesPages = SeriesPage;

export interface SeriesPage {
  page: 'series.page';
  series: Series;
  owner: UserOpenData;
  metadatas: Array<GameOpenMetadataWithOwnerData>;
}
