import {
    createAction,
    Store,
} from '../scripts/reflux-util';

var userAction=require('../actions/user');

const emitError = createAction<any>();

//エラーメッセージを集約

/*
 * errorStore {
 *   logs: Array<string>
 * }
 *
 */
export interface ErrorState {
    logs: Array<string>;
}

export class ErrorStore extends Store<ErrorState>{
    constructor(){
        super();
        this.state = {
            logs: [],
        };

        const se = this.someError.bind(this);

        this.listenTo(emitError, se);
        this.listenTo(userAction.login.failed, se);
        this.listenTo(userAction.logout.failed, se);
        this.listenTo(userAction.update.failed, se);
    }
    protected someError(err: Error){
        console.error(err);
        this.setState({
            logs: this.state.logs.concat(String(err)),
        });
    }
    public reset(){
        this.setState({
            logs: [],
        });
    }
    public emit(err: any){
        emitError(err);
    }
}

export default new ErrorStore();
