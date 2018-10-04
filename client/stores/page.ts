// page data
import { Store } from '../scripts/reflux-util';

import * as pageAction from '../actions/page';

import { PageData } from '../jsx/data';

export interface PageState {
  title: string | null;
  page: PageData | null;
}

export class PageStore extends Store<PageState> {
  constructor() {
    super();

    this.state = {
      title: null,
      page: null,
    };
    this.listenables = {
      load: pageAction.load.completed,
    };
  }
  protected onLoad({
    title,
    page,
  }: {
    title: string;
    path: string;
    page: PageData;
  }) {
    this.setState({
      title,
      page,
    });
  }
}

export default new PageStore();
