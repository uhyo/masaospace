import * as React from 'react';

import QueryList from '../game/parts/query-list';
import UserIcon from '../commons/user-icon';

import {
    UserOpenData,
} from '../data';

export interface IPropUserPage{
    userid: string;
    data: UserOpenData;
}
export default ({userid, data}: IPropUserPage)=>{
    const query = {
        owner: userid,
    };
    const {
        name,
        icon,
        profile,
        url,
    } = data;

    let pro;
    if (profile){
        let u = null;
        if(url){
            u = <p>
                <a href={url} className="external" target="_blank">{url}</a>
            </p>;
        }
        pro = <div className="user-page-profile">
            <p>{profile}</p>
            {u}
        </div>;
    }else{
        //プロフィールがない
        pro = <div className="user-page-profile user-page-profile-empty">
            <p>プロフィールが登録されていません。</p>
        </div>;
    }
    return <section className="user-page">
        <h1>{name}</h1>
        <div className="user-page-info">
            <div className="user-page-icon">
                <UserIcon icon={icon} size={128}/>
            </div>
            {pro}
        </div>
        <section className="user-page-list">
            <h1>{name}の正男</h1>
            <QueryList query={query} />
        </section>
    </section>;
};
