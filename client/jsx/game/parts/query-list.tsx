import * as React from 'react';

import api from '../../../actions/api';
import Loading from '../../commons/loading';
import GameList from './game-list';

import {
    GameAllMetadata,
} from '../../data';

export interface IPropQueryList{
    query: {
        owner?: string;
        tag?: string;
    };
    limit?: number;
}
export interface IStateQueryList{
    loading: boolean;
    page: number;
    games: Array<GameAllMetadata>;
}
export default class QueryList extends React.Component<IPropQueryList, IStateQueryList>{
    constructor(props: IPropQueryList){
        super(props);
        this.state = {
            loading: true,
            page:0,
            games: [],
        };
    }
    componentDidMount(){
        const {
            props: {
                query,
                limit,
            },
            state: {
                page,
            },
        } = this;
        const lim = limit || 30;
        api("/api/game/find",{
            owner: query.owner,
            tag: query.tag,

            skip: page * lim,
            limit: lim,
        }).then((result)=>{
            this.setState({
                loading: false,
                games: result.metadatas,
            });
        });
    }
    render(){
        if(this.state.loading){
            //ローディング状態
            return <Loading/>;
        }
        return <GameList games={this.state.games} zero="正男が見つかりませんでした。" />;
    }
}
