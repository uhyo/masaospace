/* entry point! */
var React=require('react');
var Root=require('./jsx/root');
var userAction=require('./actions/user');
var configStore=require('./stores/config');

//init view
var app=document.getElementById('app');
console.log(document.getElementById('initial-data').getAttribute('data-data'));
var data=JSON.parse(document.getElementById('initial-data').getAttribute('data-data'));

//global something
if("undefined"!==typeof window){
    window._g_csrfToken = data.csrfToken;
}

//session
userAction.init(data.session);

//config
configStore.set(data.config);

var root = React.createElement(Root,data);

React.render(root,app);

//link events
require('./scripts/link')(root);

