import * as React from 'react';

import GameEdit from './masao-edit';

import api from '../../actions/api';
import * as pageActions from '../../actions/page';
import errorStore from '../../stores/error';

import {
    Session,
    GameMetadata,
    Resource,
    MasaoJSONFormat,
} from '../data';
export interface IPropNew{
    config: any;
    session: Session;
}

export default class New extends React.Component<IPropNew, {}>{
    protected handleSave({game, metadata, resources}: {
        game: MasaoJSONFormat;
        metadata: GameMetadata;
        resources: Array<Resource>;
    }){
        //正男を投稿
        api("/api/game/new", {
            game: JSON.stringify(game),
            metadata: JSON.stringify(metadata),
            resources: JSON.stringify(resources),
        }).then((result)=>{
            //投稿結果ページに移動
            pageActions.load(`/play/${result.id}`);
        }).catch(errorStore.emit);
    }
    render(){
        return <section>
            <h1>新しい正男を投稿</h1>
            <GameEdit config={this.props.config} session={this.props.session} saveButton="投稿する" onSave={this.handleSave} />
        </section>;
    }
}
