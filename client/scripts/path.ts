//path to pages
const queryString = require('query-string');

export function gameListByTag(tag: string){
    var q=queryString.stringify({tag});
    return `/game/list?${q}`;
};
