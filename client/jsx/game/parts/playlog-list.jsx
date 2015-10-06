var React=require('react');

//プレイログの一覧を表示するぞ〜〜〜〜〜〜〜〜
module.exports = React.createClass({
    displayName:"PlaylogList",
    propTypes:{
        playlogs: React.PropTypes.arrayOf(React.PropTypes.shape({
            cleared: React.PropTypes.bool.isRequired,
            stage: React.PropTypes.number.isRequired,
            score: React.PropTypes.number.isRequired,
            buffer: React.PropTypes.object.isRequired
        })),
        onPlay: React.PropTypes.func,
        //再生リンクを何と表示するか
        playString: React.PropTypes.string,
        //選択済を表示したい
        selected: React.PropTypes.number
    },
    getDefaultProps(){
        return {
            playlogs: [],
            playString: "再生"
        };
    },
    render(){
        var selected = this.props.selected;
        return <ul className="game-parts-playlog-list-list">{
            this.props.playlogs.map((obj,i)=>{
                var onPlay=this.props.onPlay, clickHandler=(e)=>{
                    e.preventDefault;
                    onPlay(obj);
                };
                var play=null;
                if(onPlay!=null){
                    play=<span className="clickable" onClick={clickHandler}>{this.props.playString}</span>;
                }
                return <li key={i}>
                    {selected===i ? <span className="game-parts-playlog-list-checked">✔</span> : null} {obj.cleared ? "クリア" : "未クリア"}　スコア:{obj.score}　{play}
                </li>;
            })
        }</ul>;
    }
});
