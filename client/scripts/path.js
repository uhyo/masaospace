//path to pages
var queryString=require('query-string');

exports.gameListByTag=function(tag){
    var q=queryString.stringify({tag});
    return `/game/list?${q}`;
};
