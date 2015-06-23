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

/* logout action
 *
 * logout();
 *
 * logout.completed({});
 * logout.failed(error message)
 */

var logout = Reflux.createAction({
    asyncResult:true
});

logout.listen(function(params){
    logout.promise(api("/api/user/logout",{
    }));
});

exports.logout = logout;

/* init action
 *
 * //logged in
 * init({
 *   screen_name: <string>,
 *   name: <string>
 * });
 *
 * //logged out
 * init(null);
 */

var init = Reflux.createAction();

exports.init = init;

/* update action
 *
 * update({
 *   name: <string>
 * });
 *
 * update.completed({
 *   name: <string>
 * });
 * update.failed(error message);
 */

var update = Reflux.createAction({
    asyncResult:true
});

update.listen(function(params){
    update.promise(api("/api/user/update",{
        name: params.name
    }).then(function(result){
        return {
            name: result.name
        };
    }));
});

exports.update = update;
