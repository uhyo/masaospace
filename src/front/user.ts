import Controller from '../controllers/index';

import * as logger from '../logger';

import { Router } from './data';
import { PageData, View } from '@uhyo/masaospace-util';
import { abstractFileURL } from '../util';

export default function(c: Controller, r: Router): void {
  //about user

  //new entry
  r.add('/entry/page', () => {
    return Promise.resolve({
      title: '新規登録',
      social: null,
      page: {
        page: 'user.entry',
      } as PageData,
    });
  });

  //ticket checker
  r.addPattern(':ticket', /^[0-9a-zA-Z]+$/);
  r.addPattern(':userid', /^[0-9a-zA-Z_]+$/);
  r.add('/entry/ticket/:userid/:ticket', obj => {
    return Promise.resolve({
      title: 'パスワード設定',
      social: null,
      page: {
        page: 'user.ticket',
        screen_name: obj[':userid'],
        ticket: obj[':ticket'],
      } as PageData,
    });
  });

  //reset password
  r.add('/entry/reset', () => {
    return Promise.resolve({
      title: 'パスワード再発行',
      social: null,
      page: {
        page: 'user.reset',
      } as PageData,
    });
  });

  //my page
  r.add('/my', () => {
    return Promise.resolve({
      title: 'マイページ',
      social: null,
      page: {
        page: 'user.my',
      } as PageData,
    });
  });
  r.add('/my/ticket/:ticket', obj => {
    return Promise.resolve({
      title: '各種手続',
      social: null,
      page: {
        page: 'user.ticket',
        ticket: obj[':ticket'],
      } as PageData,
    });
  });

  //user page
  r.add('/:userid', obj => {
    return new Promise((resolve, reject) => {
      c.user.user.findOneUser(
        {
          'data.screen_name_lower': obj[':userid'].toLowerCase(),
          'data.activated': true,
        },
        (err, user) => {
          if (err) {
            logger.error(err);
            reject(err);
            return;
          }
          // XXX user.id == null のチェックは必要?
          if (user == null || user.id == null) {
            resolve({
              status: 404,
              title: null,
              social: null,
              page: null,
            });
            return;
          }
          const d = user.getData();
          const page: PageData = {
            page: 'user.page',
            userid: user.id,
            data: d,
          };
          resolve({
            title: d.name,
            social: {
              image: d.icon != null ? abstractFileURL(d.icon) : null,
              description: d.profile,
            },
            page,
          } as View);
        },
      );
    });
  });
  //account setting
  r.add('/my/account', () => {
    return Promise.resolve({
      title: 'アカウント設定',
      social: null,
      page: {
        page: 'user.account',
      } as PageData,
    });
  });
}
