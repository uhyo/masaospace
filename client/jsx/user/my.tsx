import * as React from 'react';

import NeedLogin from '../commons/need-login';

import {
    Session,
} from '../data';

interface IPropMyPage{
    session: Session;
}
export default ({session}: IPropMyPage)=>{
    let content;
    if (session.loggedin){
        content = <div>
            <p><b>{session.name}</b> ({session.screen_name})</p>
            <p><a href="/my/account">アカウント設定</a></p>
            <p><a href={`/game/list?owner=${session.user}`}>マイ正男</a></p>
        </div>;
    }else{
        content = <NeedLogin />;
    }
    return <section>
        <h1>マイページ</h1>
        {content}
    </section>;
};
