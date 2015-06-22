//user action
var Reflux=require('reflux');
var api=require('./api');

/* login action
 *
 * login({
 *   userid: <userid>,
 *   password: <password>
 * });
 *
 * login.completed({
 *   screen_name: <string>,
 *   name: <string>
 * });
 * login.failed(error message);
 */

var login = Reflux.createAction({
    asyncResult:true
});

login.listen(function(params){
    login.promise(api("/api/user/login",{
        user: params.userid,
        password: params.password
    }));
});


exports.login = login;

var logout = Reflux.createAction({
    asyncResult:true
});

logout.listen(function(params){
    logout.promise(api("/api/user/logout",{
    }));
});

exports.logout = logout;
