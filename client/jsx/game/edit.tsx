import * as React from 'react';

import api from '../../actions/api';
import * as pageAction from '../../actions/page';

import errorStore from '../../stores/error';

import MasaoEdit from './masao-edit';
import Loading from '../commons/loading';

import {
    Session,
    GameEditableMetadata,
    MasaoJSONFormat,
    Resource,
    masao,
} from '../data';

export interface IPropEdit{
    config: any;
    session: Session;
    id: number;
}
export interface IStateEdit{
    loading: boolean;
    initialGame: MasaoJSONFormat | null;
    initialMetadata: GameEditableMetadata | null;
    initialResources: Array<Resource>;
}
export default class Edit extends React.Component<IPropEdit, IStateEdit>{
    constructor(props: IPropEdit){
        super(props);
        this.state = {
            loading: false,
            initialGame: null,
            initialMetadata: null,
            initialResources: [],
        };
    }
    componentDidMount(){
        api("/api/game/get",{
            id: this.props.id,
        })
        .then(({game,metadata})=>{
            this.setState({
                loading: false,
                initialGame: masao.gameToFormat(game),
                initialMetadata: metadata,
                initialResources: game.resources,
            });
        })
        .catch(errorStore.emit);
    }
    protected handleSave({game, metadata, resources}: {game: MasaoJSONFormat; metadata: GameEditableMetadata; resources: Array<Resource>}){
        const {
            id,
        } = this.props;

        api("/api/game/edit",{
            id,
            game: JSON.stringify(game),
            metadata: JSON.stringify(metadata),
            resources: JSON.stringify(resources),
        })
        .then(()=>{
            pageAction.load(`/play/${id}`);
        })
        .catch(errorStore.emit);
    }
    render(){
        const {
            props: {
                config,
                session,
            },
            state: {
                loading,
                initialGame: game,
                initialMetadata: metadata,
                initialResources: resources,
            },
        } = this;
        if(loading===true){
            return <Loading/>;
        }
        if(game==null || metadata==null){
            return null;
        }
        return <div className="game-edit">
            <MasaoEdit config={config} session={session} game={game} metadata={metadata} resources={resources} saveButton="保存" onSave={this.handleSave.bind(this)} />
        </div>;
    }
}
