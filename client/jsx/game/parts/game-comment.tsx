import * as React from 'react';

import api from '../../../actions/api';

import errorStore from '../../../stores/error';

import Loading from '../../commons/loading';
import NeedLogin from '../../commons/need-login';
import CommentForm from './comment-form';
import Comments from './comments';
import PlaylogList from './playlog-list';

import {
    Session,
    Comment,
} from '../../data';
export interface IPropGameComment{
    game: number;
    playlogs: Array<any>;
    config: any;
    session: Session;
    onPlay(): void;
}
export interface IStateGameComment{
    mode: 'new' | 'score';
    loading: boolean;
    comments: Array<Comment>;
    playlog: number | null;
}
export default class GameComment extends React.Component<IPropGameComment, IStateGameComment>{
    constructor(props: IPropGameComment){
        super(props);
        this.state = {
            //モード（新着順/スコア順）
            mode: "new",
            loading: true,
            comments: [],
            playlog: null,
        };
    }
    componentDidMount(){
        this.load(this.props.game);
    }
    componentWillReceiveProps(nextProps: IPropGameComment){
        if(this.props.game!==nextProps.game){
            this.load(nextProps.game);
        }
    }
    protected handleComment(){
        this.setState({
            playlog: null,
        });
        this.load(this.props.game)
    }
    protected load(game: number, mode?: IStateGameComment['mode']){
        if(mode==null){
            mode=this.state.mode;
        }
        //request
        api("/api/comment/find", {
            game,
            skip: 0,
            limit: 50,
            sort: mode,
        })
        .then((obj)=>{
            this.setState({
                loading: false,
                comments: obj.comments,
            });
        })
        .catch(errorStore.emit);
    }
    render(){
        //プレイログを選択
        const {
            props: {
                game,
                playlogs,
                onPlay,
                config,
                session,
            },
            state: {
                loading,
                playlog,
                comments,
            },
        } = this;
        let playlogArea = null;
        const selectedPlaylog = playlog==null ? null : playlogs[playlog];
        let commentForm, commentsArea;
        if(session.loggedin===false){
            //未ログイン
            commentForm=<NeedLogin>
                <p>コメントを投稿するにはログインする必要があります。</p>
            </NeedLogin>;
        }else{
            if(playlogs.length>0){
                let ps=null;
                if(playlog==null){
                    ps=<p>コメントと一緒にプレイログを投稿するには、以下から選択してください。</p>;
                }else{
                    const clk=(e: React.SyntheticEvent<HTMLElement>)=>{
                        e.preventDefault();
                        this.setState({
                            playlog: null,
                        });
                    };
                    ps=<p><span className="clickable" onClick={clk}>プレイログの投稿を取り消す</span></p>;
                }
                const hp=(obj: any)=>{
                    let idx: number | null = playlogs.indexOf(obj);
                    if(idx<0){
                        idx = null;
                    }
                    console.log("foo!",idx,obj,playlogs);
                    this.setState({
                        playlog: idx,
                    });
                };
                playlogArea=<div className="game-play-comments-playlog">
                    {ps}
                    <PlaylogList playlogs={playlogs} playString="選択" selected={playlog} onPlay={hp}/>
                </div>;
            }
            commentForm=<CommentForm game={game} config={config} playlog={selectedPlaylog && selectedPlaylog.buffer} onComment={this.handleComment}/>
        }
        if(loading===true){
            commentsArea=<Loading/>;
        }else{
            commentsArea=<Comments comments={comments} onPlay={onPlay}/>;
        }
        return <section className="game-play-comments">
            <h1>コメント</h1>
            <div className="game-play-comments-form-wrapper">
                {playlogArea}
                {commentForm}
            </div>
            {this.selecter()}
            {commentsArea}
        </section>;
    }
    protected selecter(){
        const {
            state: {
                comments,
                mode,
            },
        } = this;
        if(comments==null || comments.length===0){
            return null;
        }
        return <div className="game-play-comments-select">{
            ["new","score"].map((m: 'new' | 'score')=>{
                let cl = "game-play-comments-select-box";
                if(mode===m){
                    cl+=" game-play-comments-select-current";
                }
                return <div key={m} className={cl} onClick={this.handleModeChange(m)}>{
                    m==="new" ? "新着順" :
                    m==="score" ? "スコア順" : null
                }</div>;
            })
        }</div>;
    }
    protected handleModeChange(mode: IStateGameComment['mode']){
        return (e: React.SyntheticEvent<HTMLElement>)=>{
            e.preventDefault();
            this.setState({
                mode,
                //loading: true //あえていらない
            });
            this.load(this.props.game, mode);
        }
    }
}
