//user action
import api from './api';
import {
    createAction,
    createAsyncAction,
} from '../scripts/reflux-util';

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
 *   profile: <string>,
 *   icon: <string>,
 *   url: <string>
 * });
 * login.failed(error message);
 */

export interface LoginQuery{
    userid: string;
    password: string;
}
export interface LoginResult{
    user: string;
    screen_name: string;
    name: string;
    profile: string;
    icon: string;
    url: string;
}
export const login = createAsyncAction<LoginQuery, LoginResult>();

login.listen((params: {
    userid: string;
    password: string;
})=>{
    login.promise(api("/api/user/login", {
        user: params.userid,
        password: params.password
    }));
});

/* logout action
 *
 * logout();
 *
 * logout.completed({});
 * logout.failed(error message)
 */

export const logout = createAsyncAction<void, void>();

logout.listen(()=>{
    logout.promise(api("/api/user/logout",{
    }));
});

/* init action
 *
 * //logged in
 * init({
 *   user: <string>,
 *   screen_name: <string>,
 *   name: <string>,
 *   profile: <string>,
 *   icon: <string>,
 *   url: <string>
 * });
 *
 * //logged out
 * init(null);
 */

export const init = createAction<{
    user: string;
    screen_name: string;
    name: string;
    profile: string;
    icon: string;
    url: string;
} | null>();

/* update action
 *
 * update({
 *   name: <string>,
 *   profile: <string>,
 *   icon: <string>,
 *   url: <string>
 * });
 *
 * update.completed({
 *   name: <string>,
 *   profile: <string>,
 *   icon: <string>,
 *   url: <string>
 * });
 * update.failed(error message);
 */
export interface UpdateQuery{
    name: string;
    profile: string;
    icon: string | null;
    url: string;
}
export interface UpdateResult{
    name: string;
    profile: string;
    icon: string | null;
    url: string;
}
export const update = createAsyncAction<UpdateQuery, UpdateResult>();

update.listen((params: {
    name: string;
    profile: string;
    icon: string;
    url: string;
})=>{
    update.promise(api("/api/user/update",{
        name: params.name,
        profile: params.profile,
        icon: params.icon,
        url: params.url
    }).then((result)=>{
        return {
            name: result.name,
            profile: result.profile,
            icon: result.icon,
            url: result.url
        };
    }));
});
