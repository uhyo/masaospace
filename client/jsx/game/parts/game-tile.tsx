import * as React from'react';

import Datetime from '../../commons/datetime';
import UserTile from './user-tile';

import {
    GameOpenMetadataWithOwnerData,
} from '../../data';
export interface IPropGameTile{
    metadata: GameOpenMetadataWithOwnerData;
}

export default ({metadata}: IPropGameTile)=>{
    let hiddenFlag=null;
    if(metadata.hidden===true){
        hiddenFlag="（非公開）";
    }
    const {
        screen_name,
        name,
        icon,
        url,
    } = metadata.user;

    return <div className="game-tile">
        <p className="game-tile-title"><a href={"/play/"+metadata.id}>{metadata.title}</a></p>
        <p className="game-tile-time">投稿日時：<Datetime date={new Date(metadata.created)} />{hiddenFlag}</p>
        {metadata.user ? <UserTile
            label="投稿者"
            screen_name={screen_name}
            name={name}
            icon={icon}
            url={url}
            fullWidth /> : null}
    </div>;
};

