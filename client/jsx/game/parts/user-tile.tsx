import * as React from 'react';

import UserIcon from '../../commons/user-icon';

export interface IPropUserTile{
    id: string;
    screen_name: string;
    name: string;
    icon: string | null;
    url?: string;
    label: string;
    fullWidth?: boolean;
}
export default ({screen_name, name, icon, url, label, fullWidth}: IPropUserTile)=>{
    let className="user-tile";
    if(fullWidth===true){
        className+=" user-tile-fullwidth";
    }
    let urlArea = null;
    if(url){
        //プロトコルを除去
        const urlStr = url.replace(/^https?:\/\//,"");

        urlArea=<div className="user-tile-url">
            URL: <a href={url} rel="external" target="_blank">{urlStr}</a>
        </div>;
    }
    return <div className={className}>
        <div className="user-tile-name">
            {label}
        </div>
        <a className="user-tile-user" href={`/${screen_name}`}>
            <UserIcon icon={icon} size={48} />
            <div>{name}</div>
        </a>
        {urlArea}
    </div>;
};
