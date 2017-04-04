/* entry point! */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from './jsx/root';
import * as userAction from './actions/user';

import handleEvents from './scripts/link';

//init view
const app=document.getElementById('app');
console.log(document.getElementById('initial-data')!.getAttribute('data-data'));

const data=JSON.parse(document.getElementById('initial-data')!.getAttribute('data-data')!);

//global something
if("undefined"!==typeof window){
    (window as any)._g_csrfToken = data.csrfToken;
}

//session
userAction.init(data.session);

const root = React.createElement(Root,data);

ReactDOM.render(root,app);

//link events
handleEvents();

