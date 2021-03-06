import * as domain from 'domain';

import * as config from 'config';
import * as logger from '../logger';

import * as db from '../db';

import TicketController from './ticket';
import FileController from './file';
import SessionController from './session';
import GameController from './game';
import CommentController from './comment';
import SeriesController from './series';
import PlaylogController from './playlog';
import MailController from './mail';
import * as mum from 'my-user-mongo';

import { addDailyJob } from '../util';

import { UserData } from '@uhyo/masaospace-util';

// 各種の操作
export default class Controller {
  public user: mum.Manager<UserData>;
  public ticket: TicketController;
  public file: FileController;
  public session: SessionController;
  public game: GameController;
  public comment: CommentController;
  public series: SeriesController;
  public playlog: PlaylogController;
  public mail: MailController;

  constructor(private db: db.DBAccess) {}
  init(callback: Cont): void {
    var db = this.db;
    var d = domain.create();
    d.on('error', (err: any) => {
      callback(err);
    });

    //初期化
    this.user = mum.manager({
      db: db.mongo.getClient(),
      collection: {
        user: config.get('mongodb.collection.user'),
      },
      user: {
        userIdLength: config.get('user.idLength'),
      },
    });
    this.ticket = new TicketController(db);
    this.file = new FileController(db);
    this.session = new SessionController(this.user);
    this.game = new GameController(db);
    this.comment = new CommentController(db);
    this.series = new SeriesController(db);
    this.playlog = new PlaylogController(db);
    this.mail = new MailController(db);

    logger.debug('Controller: initialization start.');
    this.user.init(
      d.intercept(() => {
        this.initUser(
          d.intercept(() => {
            logger.debug('Controller.user initialized.');
            this.file.init(
              d.intercept(() => {
                logger.debug('Controller.file initialized.');
                this.ticket.init(
                  d.intercept(() => {
                    logger.debug('Controller.ticket initialized.');
                    this.session.init(
                      d.intercept(() => {
                        logger.debug('Controller.session initialized.');
                        this.game.init(
                          d.intercept(() => {
                            logger.debug('Controller.game initialized.');
                            this.comment.init(
                              d.intercept(() => {
                                logger.debug('Controller.comment initialized.');
                                this.series.init(
                                  d.intercept(() => {
                                    logger.debug(
                                      'Controller.series initialized.',
                                    );
                                    this.playlog.init(
                                      d.intercept(() => {
                                        logger.debug(
                                          'Controller.playlog initialized.',
                                        );
                                        this.mail.init(
                                          d.intercept(() => {
                                            logger.debug(
                                              'Controller.mail initialized.',
                                            );
                                            d.exit();
                                            callback(null);
                                          }),
                                        );
                                      }),
                                    );
                                  }),
                                );
                              }),
                            );
                          }),
                        );
                      }),
                    );
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  }
  //ユーザー関連のコレクションの初期化
  private initUser(callback: Cont): void {
    var d = domain.create();
    d.on('error', (err: Error) => {
      logger.critical(err.toString());
      callback(err);
    });
    this.db.mongo.collection(
      config.get('mongodb.collection.user'),
      d.intercept(coll => {
        //インデックスを
        coll.createIndex(
          {
            id: 1,
          },
          {
            unique: true,
          },
          d.intercept(() => {
            coll.createIndex(
              {
                'data.screen_name_lower': 1,
              },
              {
                unique: true,
              },
              d.intercept(() => {
                coll.createIndex(
                  {
                    'data.mail': 1,
                  },
                  {
                    unique: true,
                  },
                  d.intercept(() => {
                    coll.createIndex(
                      {
                        'data.activated': 1,
                        'data.created': 1,
                      },
                      {},
                      d.intercept(() => {
                        callback(null);
                      }),
                    );
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
    //たまにいらないデータをアレする
    addDailyJob(() => {
      this.db.mongo.collection(
        config.get('mongodb.collection.user'),
        (err, coll) => {
          if (err || coll == null) {
            logger.error(err);
            return;
          }
          //登録したけど手続きを進めなかったユーザーを消す
          var limitDate = new Date(
            Date.now() - config.get('ticket.life') * 1000,
          );
          coll.deleteMany(
            {
              'data.activated': false,
              'data.created': {
                $lt: limitDate,
              },
            },
            err => {
              if (err) {
                logger.error(err.toString());
              }
            },
          );
        },
      );
    });
  }

  getMongoClient() {
    return this.db.mongo.getClient();
  }
  getRedisClient() {
    return this.db.redis.getClient();
  }
}
