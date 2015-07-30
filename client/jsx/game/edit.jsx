var React=require('react');

var api=require('../../actions/api'),
    pageAction=require('../../actions/page');

var errorStore=require('../../stores/error');

var MasaoEdit = require('./masao-edit.jsx'),
    Loading=require('../commons/loading.jsx');

module.exports = React.createClass({
    displayName:"Edit",
    propTypes:{
        config: React.PropTypes.object.isRequired,
        session: React.PropTypes.object.isRequired,

        id: React.PropTypes.number.isRequired
    },
    getInitialState(){
        return {
            loading: true,
            initialGame: null,
            initialMetadata: null
        };
    },
    componentDidMount(){
        api("/api/game/get",{id: this.props.id})
        .then(({game,metadata})=>{
            this.setState({
                loading: false,
                initialGame: game,
                initialMetadata: metadata
            });
        })
        .catch(errorStore.emit);
    },
    handleSave({game, metadata}){
        var id=this.props.id;

        api("/api/game/edit",{
            id: id,
            game: JSON.stringify(game),
            metadata: JSON.stringify(metadata)
        })
        .then(()=>{
            pageAction.load(`/play/${id}`);
        })
        .catch(errorStore.emit);

    },
    render(){
        if(this.state.loading===true){
            return <Loading/>;
        }
        var game=this.state.initialGame, metadata=this.state.initialMetadata;
        if(game==null || metadata==null){
            return null;
        }
        return <div className="game-edit">
            <MasaoEdit config={this.props.config} session={this.props.session} game={game} metadata={metadata} saveButton="保存" onSave={this.handleSave} />
        </div>;
    },
});
