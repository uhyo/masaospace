///<reference path="../node.d.ts" />
import * as express from 'express';
import Controller from '../controllers/index';

import {
  masao,
  GameEditableMetadata,
  GameMetadataUpdate,
  GameData,
  GameQuery,
  Resource,
} from '@uhyo/masaospace-util';
// import * as logger from '../logger';
import * as validator from '../validator';

import * as config from 'config';

import * as util from '../util';

export default class C {
  route(router: express.Router, c: Controller): void {
    // ゲームを投稿する
    // IN game: ゲームのmasao-json-format的表現
    // IN metadata: メタデータのJSON表現(title,description,tags,hidden)
    // OUT id: 新しいゲームのid
    router.post('/new', util.apim.useUser, (req, res) => {
      processMasao(req, c, (err, obj) => {
        if (err || obj == null) {
          res.json({
            error: String(err),
          });
          return;
        }
        /*
                var metadata:GameMetadataUpdate={
                    id: null,
                    owner: obj.metadata.owner,
                    title: obj.metadata.title,
                    description: obj.metadata.description,
                    tags: obj.metadata.tags,
                    hidden: obj.metadata.hidden
                };
                */
        c.game.newGame(
          obj.game,
          obj.metadata,
          (err: Error | null, newid: number | null) => {
            if (err != null || newid == null) {
              res.json({
                error: String(err),
              });
              return;
            }
            //できた
            res.json({
              id: newid,
            });
          },
        );
      });
    });
    //ゲームに修正をかける
    router.post('/edit', util.apim.useUser, (req, res) => {
      processMasao(req, c, (err, obj) => {
        if (err || obj == null) {
          res.json({
            error: String(err),
          });
          return;
        }
        const id = parseInt(req.body.id);
        //updatedをセット（createdはeditGameで）
        obj.metadata.id = id;
        c.game.editGame(
          id,
          req.session!.user,
          obj.game,
          obj.metadata,
          (err: Error | null) => {
            if (err) {
              res.json({
                error: String(err),
              });
            } else {
              res.json({
                success: true,
              });
            }
          },
        );
      });
    });

    //ゲームを読む
    //IN: id (number)
    //OUT: {game, metadata}
    router.post('/get', (req, res) => {
      req.validateBody('id').isInteger();

      if (req.validationErrorResponse(res)) {
        return;
      }

      c.game.getGame(parseInt(req.body.id), false, (err, obj) => {
        if (err) {
          res.json({
            error: String(err),
          });
          return;
        }
        if (obj == null) {
          res.json({
            error: 'そのゲームIDは存在しません。',
          });
          return;
        }
        if (
          obj.metadata.hidden === true &&
          (req.session == null || obj.metadata.owner !== req.session.user)
        ) {
          //非公開の場合はオーナーしかアクセスできない
          res.json({
            error: 'そのゲームは非公開です。',
          });
          return;
        }
        res.json(obj);
      });
    });
    //ゲームを探す
    //IN skip:number 何ページ分SKIPするか
    //IN limit:number 最大何件出力するか（capあり）
    //IN owner:string 投稿者による絞り込み
    //IN hidden:string ("true" of "false")非公開フラグ
    //IN tag:string タグによる絞り込み
    //OUT metadatas:Array<GameMetadata>
    router.post('/find', (req, res) => {
      req
        .validateBody('skip')
        .isInteger()
        .optional();
      req
        .validateBody('limit')
        .isInteger()
        .optional();

      if (req.validationErrorResponse(res)) {
        return;
      }

      var qu: GameQuery = {
        sort: { id: -1 },
      };
      if (req.body.skip) {
        qu.skip = parseInt(req.body.skip) || 0;
      }
      if (req.body.limit) {
        let limit = parseInt(req.body.limit) || 10;
        if (limit > 50) {
          limit = 50;
        }
        qu.limit = limit;
      } else if (!req.session!.user || req.session!.user !== req.body.owner) {
        //自分の正男を検索するときだけ制限なし
        qu.limit = 10;
      }

      if (req.body.owner != null) {
        qu.owner = req.body.owner;
      }
      if (req.body.tag != null) {
        qu.tags = req.body.tag;
      }
      if (req.session!.user == null || req.session!.user !== req.body.owner) {
        //非公開の正男は自分のしか検索できない
        qu.hidden = false;
      } else if (req.query.hidden != null) {
        qu.hidden = req.query.hidden === 'true';
      }

      c.game.findGames(qu, (err, docs) => {
        if (err || docs == null) {
          res.json({
            error: String(err),
          });
          return;
        }
        c.game.addUserData(docs, (err, docs) => {
          if (err) {
            res.json({
              error: String(err),
            });
            return;
          }
          res.json({
            metadatas: docs,
          });
        });
      });
    });
  }
}

//だめだったらfalse
function validateMetadata(metadata: GameEditableMetadata): boolean {
  if (
    validator.funcs.isGameTitle(metadata.title) != null ||
    validator.funcs.isGameDescription(metadata.description) != null
  ) {
    return false;
  }
  if ('boolean' !== typeof metadata.hidden) {
    return false;
  }
  if (!Array.isArray(metadata.tags)) {
    //そもそも配列じゃない
    return false;
  }
  if (metadata.tags.length > config.get('game.tag.maxNumber')) {
    //タグが多すぎ
    return false;
  }
  if (
    metadata.tags.some(tag => {
      return validator.funcs.isGameTag(tag) != null;
    })
  ) {
    //まずいタグがある
    return false;
  }
  return true;
}

function validateScript(script: string | undefined): boolean {
  if (script == null) {
    //nullは許す
    return true;
  }
  //拡張JavaScriptスクリプト
  if ('string' !== typeof script) {
    //スクリプトは文字列
    return false;
  }
  if (script.length > config.get('game.script.maxLength')) {
    //長すぎる
    return false;
  }
  return true;
}

//正男のデータをバリデーションとかする
function processMasao(
  req: express.Request,
  c: Controller,
  callback: Callback<{ game: GameData; metadata: GameMetadataUpdate }>,
): void {
  let format: masao.format.MasaoJSONFormat;
  let metadata: GameEditableMetadata;
  let resources: Array<Resource>;
  //JSONを読む
  try {
    const formatobj = JSON.parse(req.body.game);
    format = masao.format.load(formatobj, {
      // nestedErrors: true,
      // logErrors: true,
    });
    metadata = JSON.parse(req.body.metadata);
    resources = JSON.parse(req.body.resources);
  } catch (e) {
    callback(e, null);
    return;
  }
  //ゲームをバリデートする
  if (format == null || metadata == null) {
    callback(new Error('ゲーム情報が不正です。(1)'), null);
    return;
  }
  if (!masao.validateParams(format.params) || !Array.isArray(resources)) {
    callback(new Error('ゲーム情報が不正です。(2)'), null);
    return;
  }
  //メタ情報のバリデーション
  if (!validateMetadata(metadata)) {
    callback(new Error('ゲーム情報が不正です。(3)'), null);
    return;
  }
  //スクリプト
  if (!validateScript(format.script)) {
    callback(new Error('ゲーム情報が不正です。(6)'), null);
    return;
  }
  // データを最小化
  const format2 = masao.minimize(format);

  //リソースがあるか確認する
  let resourceTargetFlag: boolean = false;
  const resourceIds = resources.map(obj => {
    if (obj == null) {
      resourceTargetFlag = true;
      return null;
    }
    if (!(obj.target in masao.resources)) {
      //そんなリソースはない
      resourceTargetFlag = true;
      return null;
    }
    if ('string' !== typeof obj.id) {
      resourceTargetFlag = true;
      return null;
    }
    return obj.id;
  }) as Array<string>;

  if ((resourceTargetFlag as boolean) === true) {
    //resourcesデータにまずいところがあった
    callback(new Error('ゲーム情報が不正です。(4)'), null);
    return;
  }
  c.file.getFiles(
    {
      ids: resourceIds,
      owner: req.session!.user,
    },
    (err, files) => {
      if (err || files == null) {
        callback(err, null);
        return;
      }
      //ファイルが全部存在するか調べる
      const table: Record<string, boolean> = {};
      for (let i = 0; i < files.length; i++) {
        table[files[i].id] = true;
      }
      for (let i = 0; i < resourceIds.length; i++) {
        if (table[resourceIds[i]] !== true) {
          //!?
          callback(new Error('ゲーム情報が不正です。(5)'), null);
          return;
        }
      }
      //ファイルはOKだ
      const gameobj = masao.formatToGame(
        format2,
        resources.map(({ target, id }) => {
          return {
            target,
            id,
          };
        }),
      );
      const metadataobj: GameMetadataUpdate = {
        id: Number.NaN,
        owner: req.session!.user,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        hidden: metadata.hidden,
      };
      callback(null, {
        game: gameobj,
        metadata: metadataobj,
      });
    },
  );
}
