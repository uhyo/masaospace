///<reference path="./node.d.ts" />
import domain = require('domain');

import logger = require('./logger');

import db = require('./db');
import web = require('./web');

import Controller from './controllers/index';

export class System {
  private db: db.DBAccess;
  private srv: web.WebServer;
  private c: Controller;
  constructor() {
    this.db = new db.DBAccess();
    this.srv = new web.WebServer();
    this.c = new Controller(this.db);
  }
  init(callback: Cont): void {
    logger.info('System is preparing.');
    var d = domain.create();
    d.on('error', (err: Error) => {
      logger.emergency(err);
      d.removeAllListeners('error');
      callback(err);
    });

    //connect DB
    this.db.connect(
      d.intercept(() => {
        logger.info('DB connection complete.');
        this.c.init(
          d.intercept(() => {
            //web server
            logger.info('Controller initialization complete.');
            this.srv.init(
              this.c,
              d.intercept(() => {
                logger.info('System is ready.');
                callback(null);
              }),
            );
          }),
        );
      }),
    );
  }
}
