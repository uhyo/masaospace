//ゲームをアレする
import * as React from 'react';

import {
    masao,
    Game,
} from '../data';

const {
   localizeGame,
} = masao;

declare var CanvasMasao: any;
declare var CanvasMasao_v28: any;

interface IPropGameView{
    game: Game;
    audio_enabled?: boolean;
    playlogCallback?(playlog: any): void;
    playlog?: any;
    allowScripts?: boolean;
}
export default class GameView extends React.PureComponent<IPropGameView, {}>{
    private game: any;
    private gameid: string | null;
    componentDidMount(){
        this.setGame(this.props.game);
    }
    componentWillUnmount(){
        this.endGame();
    }
    componentDidUpdate(prevProps: IPropGameView){
        if(prevProps.game!==this.props.game || prevProps.playlogCallback!==this.props.playlogCallback || prevProps.playlog !== this.props.playlog){
            this.endGame();
            this.setGame(this.props.game);
        }else if(prevProps.audio_enabled!==this.props.audio_enabled){
            if(this.props.audio_enabled){
                if(this.game.__mc && this.game.__mc.soundOn){
                    this.game.__mc.soundOn();
                }
            }else{
                if(this.game.__mc && this.game.__mc.soundOff){
                    this.game.__mc.soundOff();
                }
            }
        }
    }
    protected setGame(game: Game, allowScripts?: boolean){
        const {
            playlog,
            playlogCallback,
            audio_enabled,
        } = this.props;
        if(this.gameid == null){
            this.gameid=Math.random().toString(36).slice(2);
        }
        (this.refs.main as HTMLElement).id = this.gameid;
        const p = localizeGame(game);
        //CanvasMasaoのオプション
        const options: any = {
            extensions: [],
        };
        if(game.version==="kani2"){
            //MasaoKani2だ
            options.extensions.push(CanvasMasao.MasaoKani2);
        }
        if(playlog != null){
            //再生する
            options.extensions.push(CanvasMasao.InputPlayer);
            options.InputPlayer = {
                inputdata: this.props.playlog
            };
        }else if(playlogCallback != null){
            //playlogをとってほしい
            options.extensions.push(CanvasMasao.InputRecorder);
            options.InputRecorder = {
                inputdataCallback: playlogCallback,
                requiresCallback: ()=>{
                    return true;
                },
            };
        }
        if(allowScripts===true && game.script!=null){
            //JavaScriptを許可(scriptがuserJSCallbackを定義する)
            const userJSCallback = eval(
                `(function(){
                    ${game.script}
                    if("undefined"!==typeof userJSCallback){
                        return userJSCallback;
                    }
                })()`);
            if("function"===typeof userJSCallback){
                options.userJSCallback = userJSCallback;
            }
        }
        if (game['advanced-map'] != null){
            options['advance-map'] = game['advanced-map'];
        }

        if(game.version==="2.8"){
            //2.8だ
            this.game=new CanvasMasao_v28.Game(p,this.gameid, options);
        }else{
            this.game=new CanvasMasao.Game(p,this.gameid,options);
        }
        if(audio_enabled !== true){
            if(this.game.__mc && this.game.__mc.soundOff){
                this.game.__mc.soundOff();
            }
        }
    }
    endGame(){
        if(this.game == null){
            return;
        }
        this.game.kill();
        this.game = null;
    }
    render(){
        return <div ref="main" className="game-view" />;
    }
}
