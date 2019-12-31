import * as React from 'react';

import pageStore, { PageState } from '../stores/page';
import sessionStore, { SessionState } from '../stores/session';

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

import { RefluxComponent } from '../scripts/reflux-util';
import { PlaylogPage } from './game/playlog';
export interface IDefnRoot {
  page: PageState;
  session: SessionState;
}
export interface IPropRoot {
  config: any;
  csrfToken: string;
  data: any;
}
export default class Root extends RefluxComponent<IDefnRoot, IPropRoot, {}> {
  constructor(props: IPropRoot) {
    super(props, {
      page: pageStore,
      session: sessionStore,
    });
  }
  componentDidUpdate(_: IPropRoot, prevState: IDefnRoot) {
    if (prevState.page !== this.state.page) {
      //pageが変わったら一番上へ
      window.scrollTo(0, 0);
    }
  }
  render() {
    const { session } = this.state;
    const pageArea = this.getPage();
    return (
      <div className="root">
        {this.hideHeader() ? null : <Header session={session} />}
        {pageArea}
        <Footer />
      </div>
    );
  }
  protected getPage(): React.ReactElement<any> {
    const {
      props: { config },
      state: {
        page: { page },
        session,
      },
    } = this;
    if (page == null) {
      return <NotFound />;
    }
    switch (page.page) {
      case 'top':
        //top page
        return <Top config={config} session={session} data={page.data} />;
      ///// user
      case 'user.entry':
        //entry page
        return <UserEntry config={config} />;
      case 'user.reset':
        //password reset page
        return <UserReset config={config} />;
      case 'user.ticket':
        //ticket confirmation page
        return (
          <UserTicket
            ticket={page.ticket}
            screen_name={page.screen_name}
            config={config}
          />
        );
      case 'user.page':
        return <UserPage userid={page.userid} data={page.data} />;
      case 'user.my':
        //mypage
        return <UserMy session={session} />;
      case 'user.account':
        //account settings
        return <UserAccount config={config} session={session} />;
      ///// game
      case 'game.new':
        return <GameNew config={config} session={session} />;
      case 'game.play':
        return (
          <GamePlay
            game={page.game}
            metadata={page.metadata}
            owner={page.owner}
            series={page.series}
            defaultPlaylogId={page.defaultPlaylog}
            config={config}
            session={session}
          />
        );
      case 'game.playlog':
        return (
          <PlaylogPage
            game={page.game}
            metadata={page.metadata}
            playlogId={page.playlog.id}
          />
        );
      case 'game.list':
        return <GameList owner={page.owner} tag={page.tag} />;
      case 'game.edit':
        return <GameEdit id={page.id} config={config} session={session} />;
      case 'game.hidden':
        return <GameHidden id={page.id} owner={page.owner} session={session} />;
      /////series
      case 'series.page':
        return (
          <SeriesPage
            series={page.series}
            owner={page.owner}
            metadatas={page.metadatas}
          />
        );
      default:
        //"404"とか
        return <NotFound />;
    }
  }
  protected hideHeader(): boolean {
    const {
      state: {
        page: { page },
      },
    } = this;
    return page?.page === 'game.playlog';
  }
}
