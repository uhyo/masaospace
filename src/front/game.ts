import Controller from '../controllers/index';

import * as logger from '../logger';

import { Router } from './data';
import {
  Game,
  GameOpenMetadata,
  GameOpenMetadataWithOwnerData,
  UserOpenData,
  UserOpenDataWithId,
  SeriesOfGame,
  PageData,
} from '@uhyo/masaospace-util';

import { outUserData } from '../util';

export default function(c: Controller, r: Router): void {
  //about game

  /////play
  r.add('/play/:number', obj => {
    return new Promise((resolve, reject) => {
      // from query
      const playlog: string | undefined = obj.playlog;
      const id = parseInt(obj[':number']);

      //results
      let game: Game | null = null;
      let metadata: GameOpenMetadata | null = null;
      let owner: UserOpenDataWithId | null = null;
      let series: Array<SeriesOfGame> | null = null;
      let errend = false;
      //結果を収集
      var next = (err: any) => {
        if (errend === true) {
          return;
        }
        if (err) {
          errend = true;
          if (err === 'notfound') {
            //みつからない
            resolve({
              status: 404,
              title: null,
              social: null,
              page: null,
            });
          } else {
            reject(err);
          }
          return;
        }
        if (
          game != null &&
          metadata != null &&
          owner != null &&
          series != null
        ) {
          //結果が揃った
          if (metadata.hidden === true && obj.session.user !== metadata.owner) {
            //非公開は見れない
            resolve({
              title: null,
              social: null,
              page: {
                page: 'game.hidden',
                id,
                owner: metadata.owner,
              },
            });
          } else {
            resolve({
              title: metadata.title,
              social: {
                image: null,
                description: metadata.description,
              },
              page: {
                page: 'game.play',
                game,
                metadata,
                owner,
                series,
                defaultPlaylog: playlog,
              },
            });
          }
        }
      };
      //ゲームデータを得る
      c.game.getGame(id, true, (err, obj) => {
        if (err) {
          next(err);
          return;
        }
        if (obj == null) {
          //そんなゲームはないね
          next('notfound');
          return;
        }
        game = obj.game;
        metadata = obj.metadata;
        //ownerの情報も得る
        c.user.user.findOneUser(
          {
            id: obj.metadata.owner,
          },
          (err, usr) => {
            if (err || usr == null) {
              logger.error(err);
              next(err);
              return;
            }
            var data: any = outUserData(usr.getData());
            data.id = usr.id;
            owner = data;
            next(null);
          },
        );
      });
      //シリーズ情報を検索
      c.series.findSeries({ games: id }, (err, docs) => {
        if (err || docs == null) {
          next(err);
          return;
        }
        //情報をいい感じに変形
        series = docs.map(s => {
          const games = s.games;
          for (var i = 0, l = games.length; i < l; i++) {
            if (games[i] === id) {
              //これだ
              break;
            }
          }
          return {
            //シリーズID
            id: s.id,
            //シリーズ名
            name: s.name,
            //前の正男
            prev: i > 0 ? games[i - 1] : null,
            //次の正男
            next: i < l - 1 ? games[i + 1] : null,
          };
        });
        next(null);
      });
    });
  });
  // プレイログプレイヤー
  r.add('/playlog/:id', obj => {
    return new Promise((resolve, reject) => {
      const id: string = obj[':id'];
      c.playlog.findPlaylogs(
        {
          id,
        },
        (err, docs) => {
          if (err || !docs) {
            reject(err);
            return;
          }
          const p = docs[0];
          if (p == null) {
            resolve({
              status: 404,
              title: null,
              social: null,
              page: null,
            });
            return;
          }
          c.game.getGame(p.game, false, (err, result) => {
            if (err || !result) {
              reject(err);
              return;
            }
            resolve({
              title: `プレイログ「${result.metadata.title}」`,
              social: {
                image: null,
                description: null,
              },
              page: {
                page: 'game.playlog',
                game: result.game,
                metadata: result.metadata,
                playlog: {
                  id: p.id,
                },
              },
            });
          });
        },
      );
    });
  });

  /////ついでにシリーズ
  r.add('/series/:number', obj => {
    return new Promise((resolve, reject) => {
      const id = parseInt(obj[':number']);
      //シリーズを探す
      c.series.findSeries(
        {
          id,
          limit: 1,
        },
        (err, docs) => {
          if (err || docs == null) {
            reject(err);
            return;
          }
          var s = docs[0];
          if (s == null) {
            //are----
            resolve({
              status: 404,
              title: null,
              social: null,
              page: null,
            });
            return;
          }
          let metadatas: Array<GameOpenMetadataWithOwnerData> | null = null;
          let owner: UserOpenData | null = null;
          let errend = false;
          const next = (err: any) => {
            if (errend === true) {
              return;
            }
            if (err) {
              errend = true;
              reject(err);
              return;
            }
            if (metadatas != null && owner != null) {
              //結果そろった
              resolve({
                title: `シリーズ: ${s.name}`,
                social: {
                  image: null,
                  description: s.description,
                },
                page: {
                  page: 'series.page',
                  series: s,
                  owner,
                  metadatas,
                },
              });
            }
          };
          //game一覧
          c.game.findGames(
            {
              ids: s.games,
            },
            (err, games) => {
              if (err || games == null) {
                reject(err);
                return;
              }
              //シリーズ内の順に並び替える
              var table = <any>{};
              for (let i = 0; i < games.length; i++) {
                let g = games[i];
                table[g.id] = g;
              }
              metadatas = s.games.map(id => {
                return table[id];
              });
              next(null);
            },
          );
          //owner情報を得る
          c.user.user.findOneUser(
            {
              id: s.owner,
            },
            (err, usr) => {
              if (err || usr == null) {
                logger.error(err);
                next(err);
                return;
              }
              var data: any = outUserData(usr.getData());
              data.id = usr.id;
              owner = data;
              next(null);
            },
          );
        },
      );
    });
  });
  /////list
  r.add('/game/list', obj => {
    //検索条件をアレする
    return Promise.resolve({
      title: '検索結果',
      social: null,
      page: {
        page: 'game.list',
        owner: obj.owner,
        tag: obj.tag,
      } as PageData,
    });
  });

  /////game管理
  r.add('/game/new', () => {
    //新しいゲームを投稿
    return Promise.resolve({
      title: '新しい正男を投稿',
      social: null,
      page: {
        page: 'game.new',
      } as PageData,
    });
  });
  r.add('/game/edit/:number', obj => {
    return Promise.resolve({
      title: '正男を編集',
      social: null,
      page: {
        page: 'game.edit',
        id: parseInt(obj[':number']),
      } as PageData,
    });
  });
}
