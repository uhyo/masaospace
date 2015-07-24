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
 *   user: <string>,
 *   screen_name: <string>,
 *   name: <string>,
 *   profile: <string>
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
 *   user: <string>,
 *   screen_name: <string>,
 *   name: <string>,
 *   profile: <string>
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
 *   name: <string>,
 *   profile: <string>
 * });
 *
 * update.completed({
 *   name: <string>,
 *   profile: <string>
 * });
 * update.failed(error message);
 */

var update = Reflux.createAction({
    asyncResult:true
});

update.listen(function(params){
    update.promise(api("/api/user/update",{
        name: params.name,
        profile: params.profile
    }).then(function(result){
        return {
            name: result.name,
            profile: result.profile
        };
    }));
});

exports.update = update;
