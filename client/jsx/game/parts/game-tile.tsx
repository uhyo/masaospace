import * as React from'react';

import Datetime from '../../commons/datetime';
import UserTile from './user-tile';

import {
    GameAllMetadata,
} from '../../data';
export interface IPropGameTile{
    metadata: GameAllMetadata;
}

export default ({metadata}: IPropGameTile)=>{
    let hiddenFlag=null;
    if(metadata.hidden===true){
        hiddenFlag="（非公開）";
    }
    return <div className="game-tile">
        <p className="game-tile-title"><a href={"/play/"+metadata.id}>{metadata.title}</a></p>
        <p className="game-tile-time">投稿日時：<Datetime date={new Date(metadata.created)} />{hiddenFlag}</p>
        {metadata.user ? <UserTile id={metadata.owner} label="投稿者" {...metadata.user} fullWidth/> : null}
    </div>;
};

