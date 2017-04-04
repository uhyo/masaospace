// page data
import {
    Store,
} from '../scripts/reflux-util';

var pageAction=require('../actions/page');

export interface PageState{
    title: string | null;
    page: string;
    data: any;
}

export class PageStore extends Store<PageState>{
    constructor(){
        super();

        this.state = {
            title: null,
            page: '',
            data: null,
        };
        this.listenables = {
            load: pageAction.load.completed,
        };
    }
    protected onLoad({title, page, data}: {
        title: string;
        page: string;
        path: string;
        data: any;
    }){
        this.setState({
            title,
            page,
            data,
        });
    }
}

export default new PageStore();
