/* entry point! */
var React=require('react');
var Root=require('./jsx/root');

//init view
var app=document.getElementById('app');
console.log(document.getElementById('initial-data').getAttribute('data-data'));
var data=JSON.parse(document.getElementById('initial-data').getAttribute('data-data'));

//global something
_g_csrfToken = data.csrfToken;


var root = React.createElement(Root,data);

React.render(root,app);

//link events
require('./scripts/link')(root);
