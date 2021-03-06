import * as mongodb from 'mongodb';
import * as redis from 'redis';

import * as config from 'config';
import * as logger from './logger';

export import Collection = mongodb.Collection;
export import ObjectID = mongodb.ObjectID;

//DBアクセス
export class DBAccess {
  public mongo: Mongo;
  public redis: Redis;
  constructor() {
    this.mongo = new Mongo();
    this.redis = new Redis();
  }
  connect(callback: Cont): void {
    this.mongo.connect((err: any) => {
      if (err) {
        callback(err);
        return;
      }
      this.redis.connect((err: any) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null);
      });
    });
  }
  close(): void {
    this.mongo.close();
    this.redis.close();
  }
}
export class Mongo {
  private db: mongodb.Db;
  private connected: boolean;

  constructor() {
    this.connected = false;
  }
  connect(callback: (error: any) => void): void {
    if (this.connected === true) {
      //既に接続されている感
      process.nextTick(() => {
        callback(null);
      });
      return;
    }
    mongodb.MongoClient.connect(
      'mongodb://' +
        config.get('mongodb.user') +
        ':' +
        config.get('mongodb.password') +
        '@' +
        config.get('mongodb.host') +
        ':' +
        config.get('mongodb.port') +
        '/' +
        config.get('mongodb.db'),
      {
        w: 'majority',
        ignoreUndefined: true,
      } as any,
      (error: any, db: mongodb.Db) => {
        if (error) {
          callback(error);
          return;
        }
        this.db = db;
        this.connected = true;
        callback(null);
      },
    );
  }
  getClient(): mongodb.Db {
    return this.db;
  }
  collection(
    name: string,
    callback: (error: any, collection: mongodb.Collection | null) => void,
  ): void {
    if (this.connected !== true || !this.db) {
      callback(new Error('Not connected to DB.'), null);
      return;
    }
    this.db.collection(name, callback);
  }
  close(): void {
    this.db.close();
    this.connected = false;
  }
}
export class Redis {
  private client: redis.RedisClient;
  private connected: boolean;
  constructor() {
    this.connected = false;
  }
  connect(callback: (error: any) => void): void {
    if (this.connected === true) {
      //既に接続されている感
      callback(null);
      return;
    }
    this.client = redis.createClient(
      config.get('redis.port'),
      config.get('redis.host'),
    );
    this.client.on('error', (error: any) => {
      logger.error(error);
    });
    this.client.select(config.get('redis.db'), (error: any) => {
      this.connected = true;
      callback(error);
    });
  }
  getClient(): redis.RedisClient {
    return this.client;
  }
  close(): void {
    this.client.quit();
  }
}
