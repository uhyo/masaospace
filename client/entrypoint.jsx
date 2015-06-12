/* entry point! */
var React=require('react');
var Root=require('./jsx/root');

var app=document.getElementById('app');
console.log(document.getElementById('initial-data').getAttribute('data-data'));
var data=JSON.parse(document.getElementById('initial-data').getAttribute('data-data'));
//global something
_g_csrfToken = data.csrfToken;

React.render(React.createElement(Root,data),app);
