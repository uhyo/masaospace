var React=require('react');

var pageActions=require('../../actions/page');

module.exports = React.createClass({
    displayName: "GameHidden",
    propTypes: {
        id: React.PropTypes.number,
        owner: React.PropTypes.string,
        session: React.PropTypes.object
    },
    componentWillReceiveProps(nextProps){
        if(nextProps.session.user===nextProps.owner){
            pageActions.load("/play/"+nextProps.id);
        }
    },
    render(){
        return <p>このゲームは非公開です。</p>;
    }
});
