import * as React from 'react';

import * as path from '../scripts/path';

import QueryList from './game/parts/query-list';

import {
    Session,
} from './data';

export interface IPropTop{
    config: any;
    session: Session;
    data: {
        popularTags: Array<string>;
    };
}
export default ({config, session, data: {popularTags}}: IPropTop)=>{
    //人気のタグ表示
    let tags=null, welcome=null;
    if(popularTags.length>0){
        tags=<div className="top-tags">
            <p><span className="icon icon-tag"/>人気のタグ： {
                popularTags.map((tag,i)=>{
                    return <span key={i}>
                        <a href={path.gameListByTag(tag)}>{tag}</a>
                        {"\u3000"}
                    </span>
                })
            }</p>
        </div>;
    }
    if (session.loggedin!==true){
        welcome = <div className="information">
            <p>{config.service.name}にようこそ！</p>
            <p>正男を共有できるサービスです。</p>
            <p>現在利用可能な機能は、ユーザー登録と正男の投稿です。</p>
            <p>さっそく<a href="/entry/page">新規登録</a>して<a href="/game/new">正男を投稿</a>しましょう！</p>
        </div>;
    }
    return <div>
        {welcome}
        <div className="information">
            <p>最近の更新：</p>
            <ul>
                <li>2015-09-10: 正男エディタで正男を作成・編集できるようになりました。</li>
                <li>2015-10-06: スコアランキングに対応しました。</li>
                <li>2016-03-24: スクリプト正男を投稿可能にしました。</li>
            </ul>
        </div>
        {tags}
        <section>
            <h1>最近投稿された正男</h1>
            <QueryList query={{}} limit={15} />
        </section>
    </div>;
};
