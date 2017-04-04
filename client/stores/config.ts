//config store
import {
    createAction,
    Store,
} from '../scripts/reflux-util';

export interface Config{
}

const set = createAction<Config>();

export class ConfigStore extends Store<Config>{
    constructor(){
        super();
        this.listenables = [];

        this.state = {};
        this.listenTo(set,this.seth);
    }
    protected seth(config: Config){
        this.setState(config);
    }
}

export default new ConfigStore();
