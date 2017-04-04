import * as React from 'react';

import Datetime from '../commons/datetime';
import UserTile from '../game/parts/user-tile';
import GameList from '../game/parts/game-list';

export interface IPropSeriesPage{
    series: any;
    owner: any;
    metadatas: Array<any>;
}
export default ({series, owner, metadatas}: IPropSeriesPage)=>{
    const m = metadatas.map(metadata=> ({
        ...metadata,
        user: owner,
    }));
    return <section className="series-page">
        <h1>シリーズ: {series.name}</h1>
        <div className="game-play-info">
            <div className="game-play-info-meta">
                <p><Datetime date={new Date(series.created)}/> 作成</p>
                <UserTile {...owner} label="作成者" fullWidth/>
            </div>
            <div className="game-play-info-description">
                <div className="game-play-info-message">
                    <p>{series.description}</p>
                </div>
            </div>
        </div>
        <GameList games={m} zero="このシリーズには正男が登録されていません。" />
    </section>;
};
