import ioredis from 'ioredis';

import { Logger } from '../logger';

function getStringValue(value: any): string {
  return value.toString();
}

export class RedisStore {
  private r: ioredis;
  private log: Logger;
  constructor(r: ioredis, log: Logger) {
    this.r = r;
    this.log = log;

    this.handleErrors();
    this.handleConnections();
  }

  private timeOutReconnectAttempts = 0;

  handleErrors() {
    this.r.on('error', (error: any) => {
      if (error.code === 'ECONNRESET') {
        this.log.error('connection to redis session timedout');
      } else if (error.code === 'ECONNREFUSED') {
        this.log.error('Connection to Redis Session Store refused!');
      } else if (error.code == 'ETIMEDOUT') {
        this.timeOutReconnectAttempts++;

        if (this.timeOutReconnectAttempts === 3) {
          throw new Error('Error connecting to redis after 3 tries');
        }

        this.log.error(JSON.stringify(error));
      } else {
        this.log.error(JSON.stringify(error));
      }
    });
  }

  handleConnections() {
    this.r.on('reconnecting', (err: any) => {
      if (this.r.status === 'reconnecting')
        this.log.info('Reconnecting to Redis Session Store...');
      else this.log.info('Error reconnecting to Redis Session Store.');
    });

    this.r.on('connect', (err: any) => {
      if (!err) this.log.info('Connected to Redis Session Store!');
      if (err) {
        this.log.error('Error connecting to redis');
      }
    });
  }

  async exists(key: string) {
    return await this.r.exists(key);
  }

  async get(key: string) {
    return await new Promise((resolve, reject) => {
      this.r.get(key, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    });
  }

  set(key: string, value: string, expiry?: number) {
    if (undefined === expiry) {
      void this.r.set(key, value);
      return;
    }

    void this.r.set(key, value, 'EX', expiry);
  }

  del(key: string) {
    void this.r.del(key);
  }

  keys(pattern: string) {
    return this.r.keys(pattern);
  }

  async getJSON(key: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.r.get(key, (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(JSON.parse(getStringValue(result)));
        } catch (e) {
          return reject(e);
        }
      });
    });
  }

  setJSON<T>(key: string, value: T, expiry?: number) {
    try {
      const v = JSON.stringify(value);
      if (undefined === expiry) {
        void this.r.set(key, v);
        return;
      }

      void this.r.set(key, v, 'EX', expiry);
    } catch (e) {
      this.log.error(`Unable to set redis value ${e}`);
      return;
    }
  }

  // tslint:disable-next-line: function-name
  static Namespace(ns: string, key: string) {
    return `${ns}:${key}`;
  }

  //checkListLen()
}
