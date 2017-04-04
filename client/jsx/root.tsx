import * as React from 'react';

import  {
   PageState,
} from '../stores/page';
import  {
   SessionState,
} from '../stores/session';

import Header from './header';
import Footer from './footer';

import Top from './top';
import UserEntry from './user/entry';
import UserReset from './user/reset';
import UserTicket from './user/ticket';
import UserPage from './user/page';
import UserMy from './user/my';
import UserAccount from './user/account';
import GameNew from './game/new';
import GamePlay from './game/play';
import GameList from './game/list';
import GameEdit from './game/edit';
import GameHidden from './game/hidden';
import SeriesPage from './series/page';
import NotFound from './notfound';

import {
    RefluxComponent,
} from '../scripts/reflux-util';
export interface IDefnRoot{
    page: PageState;
    session: SessionState;
}
export interface IPropRoot{
    config: any;
    csrfToken: string;
    data: any;
}
export default class Root extends RefluxComponent<IDefnRoot, IPropRoot, {}>{
    componentDidUpdate(_: IPropRoot, prevState: IDefnRoot){
        if(prevState.page!==this.state.page){
            //pageが変わったら一番上へ
            window.scrollTo(0,0);
        }
    }
    render(){
        const {
            session,
        } = this.state;
        const [elm, props]=this.getPage();
        return <div className="root">
            <Header session={session} />
            {React.createElement(elm,props)}
            <Footer />
        </div>;
    }
    protected getPage(): [any, any]{
        const {
            props: {
                config,
            },
            state: {
                page,
                session,
            },
        } = this;
        switch(page.page){
            case "top":
                //top page
                return [Top, {
                    config,
                    session,
                    data: page.data,
                }];
            ///// user
            case "user.entry":
                //entry page
                return [UserEntry, {
                    config,
                }];
            case "user.reset":
                //password reset page
                return [UserReset, {
                    config,
                }];
            case "user.ticket":
                //ticket confirmation page
                return [UserTicket, {
                    ticket: page.data.ticket,
                    screen_name: page.data.screen_name,
                    config,
                }];
            case "user.page":
                return [UserPage, {
                    userid: page.data.userid,
                    data: page.data.data,
                }];

            case "user.my":
                //mypage
                return [UserMy, {
                    session,
                }];
            case "user.account":
                //account settings
                return [UserAccount, {
                    config,
                    session,
                }];
            ///// game
            case "game.new":
                return [GameNew, {
                    config,
                    session,
                }];
            case "game.play":
                return [GamePlay, {
                    game: page.data.game,
                    metadata: page.data.metadata,
                    owner: page.data.owner,
                    series: page.data.series,

                    config,
                    session,
                }];
            case "game.list":
                return [GameList, {
                    owner: page.data.owner,
                    tag: page.data.tag,
                }];
            case "game.edit":
                return [GameEdit, {
                    config,
                    session,
                    id: page.data.id
                }];
            case "game.hidden":
                return [GameHidden, {
                    id: page.data.id,
                    owner: page.data.owner,
                    session,
                }];
            /////series
            case "series.page":
                return [SeriesPage, {
                    series: page.data.series,
                    owner: page.data.owner,
                    metadatas: page.data.metadatas,
                }];
            default:
                //"404"とか
                return [NotFound, {}]
        }
    }
}
