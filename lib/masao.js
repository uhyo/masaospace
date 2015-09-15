var extend=require('extend');
var masao=require('masao');
exports.param = masao.param;
exports.format= masao.format;

//パラメータの長さ限度
var maxlen = 120;
//正男に使用可能なパラメータの一覧
var paramKeys = [
    "airms_kf",
    "audio_bgm_switch_ogg",
    "audio_bgm_switch_mp3",
    "audio_bgm_switch_wave",
    "audio_se_switch_ogg",
    "audio_se_switch_mp3",
    "audio_se_switch_wave",
    "backcolor_red",
    "backcolor_green",
    "backcolor_blue",
    "backcolor_red_s",
    "backcolor_green_s",
    "backcolor_blue_s",
    "backcolor_red_t",
    "backcolor_green_t",
    "backcolor_blue_t",
    "backcolor_red_f",
    "backcolor_green_f",
    "backcolor_blue_f",
    "boss_destroy_type",
    "boss_hp_max",
    "boss_name",
    "boss_type",
    "boss2_name",
    "boss2_type",
    "boss3_name",
    "boss3_type",
    "chikorin_attack",
    "clear_type",
    "coin1_type",
    "coin3_type",
    "control_parts_visible",
    "dengeki_mkf",
    "dokan_mode",
    "dokan1_type",
    "dokan2_type",
    "dokan3_type",
    "dokan4_type",
    "door_score",
    "dossunsun_type",
    "easy_mode",
    "filename_chizu",
    "filename_ending",
    "filename_fx_bgm_boss",
    "filename_fx_bgm_chizu",
    "filename_fx_bgm_ending",
    "filename_fx_bgm_stage1",
    "filename_fx_bgm_stage2",
    "filename_fx_bgm_stage3",
    "filename_fx_bgm_stage4",
    "filename_fx_bgm_title",
    "filename_gameover",
    "filename_haikei",
    "filename_haikei2",
    "filename_haikei3",
    "filename_haikei4",
    "filename_mapchip",
    "filename_pattern",
    "filename_se_bomb",
    "filename_se_block",
    "filename_se_chizugamen",
    "filename_se_clear",
    "filename_se_coin",
    "filename_se_dengeki",
    "filename_se_dokan",
    "filename_se_dosun",
    "filename_se_fireball",
    "filename_se_fumu",
    "filename_se_gameover",
    "filename_se_get",
    "filename_se_grounder",
    "filename_se_happa",
    "filename_se_hinoko",
    "filename_se_item",
    "filename_se_jet",
    "filename_se_jump",
    "filename_se_kaiole",
    "filename_se_kiki",
    "filename_se_miss",
    "filename_se_mizu",
    "filename_se_mizudeppo",
    "filename_se_senkuuza",
    "filename_se_sjump",
    "filename_se_start",
    "filename_se_tobasu",
    "filename_second_haikei",
    "filename_second_haikei2",
    "filename_second_haikei3",
    "filename_second_haikei4",
    "filename_title",
    "firebar_red1",
    "firebar_green1",
    "firebar_blue1",
    "firebar_red2",
    "firebar_green2",
    "firebar_blue2",
    "firebar1_type",
    "firebar2_type",
    "fs_item_name1",
    "fs_item_name2",
    "fs_item_name3",
    "fs_name",
    "fs_serifu1",
    "fs_serifu2",
    "fx_bgm_loop",
    "fx_bgm_switch",
    "game_speed",
    "gazou_scroll",
    "gazou_scroll_speed_x",
    "gazou_scroll_speed_y",
    "gazou_scroll_x",
    "gazou_scroll_y",
    "grenade_red1",
    "grenade_green1",
    "grenade_blue1",
    "grenade_red2",
    "grenade_green2",
    "grenade_blue2",
    "grenade_shop_score",
    "grenade_type",
    "hitokoto1_name",
    "hitokoto1-1",
    "hitokoto1-2",
    "hitokoto1-3",
    "hitokoto2_name",
    "hitokoto2-1",
    "hitokoto2-2",
    "hitokoto2-3",
    "hitokoto3_name",
    "hitokoto3-1",
    "hitokoto3-2",
    "hitokoto3-3",
    "hitokoto4_name",
    "hitokoto4-1",
    "hitokoto4-2",
    "hitokoto4-3",
    "j_enemy_press",
    "j_fire_equip",
    "j_fire_hf",
    "j_fire_mkf",
    "j_fire_type",
    "j_tail_ap_boss",
    "j_tail_hf",
    "j_tail_type",
    "j_tokugi",
    "j_add_tokugi",
    "j_add_tokugi2",
    "j_add_tokugi3",
    "j_add_tokugi4",
    "jibun_left_shoki",
    "kaishi_red",
    "kaishi_green",
    "kaishi_blue",
    "key1-on-count",
    "key2-on-count",
    "kuragesso_attack",
    "layer_mode",
    "mariri_attack",
    "mcs_haikei_visible",
    "mes1_name",
    "mes2_name",
    "mizunohadou_red",
    "mizunohadou_green",
    "mizunohadou_blue",
    "mizutaro_attack",
    "moji_score",
    "moji_highscore",
    "moji_time",
    "moji_jet",
    "moji_grenade",
    "moji_left",
    "moji_size",
    "now_loading",
    "pause_switch",
    "poppie_attack",
    "score_1up_1",
    "score_1up_2",
    "score_v",
    "scorecolor_red",
    "scorecolor_green",
    "scorecolor_blue",
    "scroll_area",
    "scroll_mode",
    "scroll_mode_s",
    "scroll_mode_t",
    "scroll_mode_f",
    "se_filename",
    "se_switch",
    "second_gazou_priority",
    "second_gazou_scroll",
    "second_gazou_scroll_speed_x",
    "second_gazou_scroll_speed_y",
    "second_gazou_scroll_x",
    "second_gazou_scroll_y",
    "second_gazou_visible",
    "serifu1-1",
    "serifu1-2",
    "serifu1-3",
    "serifu2-1",
    "serifu2-2",
    "serifu2-3",
    "serifu3-1",
    "serifu3-2",
    "serifu3-3",
    "serifu4-1",
    "serifu4-2",
    "serifu4-3",
    "serifu5-1",
    "serifu5-2",
    "serifu5-3",
    "serifu7-1",
    "serifu7-2",
    "serifu7-3",
    "serifu8-1",
    "serifu8-2",
    "serifu8-3",
    "serifu9-1",
    "serifu9-2",
    "serifu9-3",
    "serifu10-1",
    "serifu10-2",
    "serifu10-3",
    "serifu11-1",
    "serifu11-2",
    "serifu11-3",
    "serifu12-1",
    "serifu12-2",
    "serifu12-3",
    "serifu_grenade_shop_name",
    "serifu_grenade_shop-1",
    "serifu_grenade_shop-2",
    "serifu_grenade_shop-3",
    "serifu_grenade_shop-4",
    "serifu_grenade_shop-5",
    "serifu_grenade_shop-6",
    "serifu_key1-on-name",
    "serifu_key1-on-1",
    "serifu_key1-on-2",
    "serifu_key1-on-3",
    "serifu_key1-on-4",
    "serifu_key1-on-5",
    "serifu_key1-on-6",
    "serifu_key1-on-7",
    "serifu_key1-on-8",
    "serifu_key1-on-9",
    "serifu_key1-on-10",
    "serifu_key2-on-name",
    "serifu_key2-on-1",
    "serifu_key2-on-2",
    "serifu_key2-on-3",
    "serifu_key2-on-4",
    "serifu_key2-on-5",
    "serifu_key2-on-6",
    "serifu_key2-on-7",
    "serifu_key2-on-8",
    "serifu_key2-on-9",
    "serifu_key2-on-10",
    "setumei_name",
    "setumei_menu1",
    "setumei_menu2",
    "setumei_menu3",
    "setumei_menu4",
    "shop_item_teika1",
    "shop_item_teika2",
    "shop_item_teika3",
    "shop_item_teika4",
    "shop_item_teika5",
    "shop_item_teika6",
    "shop_item_teika7",
    "shop_item_teika8",
    "shop_item_teika9",
    "shop_item_name1",
    "shop_item_name2",
    "shop_item_name3",
    "shop_item_name4",
    "shop_item_name5",
    "shop_item_name6",
    "shop_item_name7",
    "shop_item_name8",
    "shop_item_name9",
    "shop_name",
    "shop_serifu1",
    "shop_serifu2",
    "shop_serifu3",
    "shop_serifu4",
    "shop_serifu5",
    "shop_serifu6",
    "sleep_time_visible",
    "stage_kaishi",
    "stage_max",
    "stage_select",
    "suberuyuka_hkf",
    "taiking_attack",
    "time_max",
    "ugokuyuka1_type",
    "ugokuyuka2_type",
    "ugokuyuka3_type",
    "url1",
    "url2",
    "url3",
    "url4",
    "variable_sleep_time",
    "view_move_type",
    "water_clear_level",
    "water_clear_switch",
    "water_visible",
    "yachamo_kf",
    "filename_oriboss_left1",
    "filename_oriboss_left2",
    "filename_oriboss_right1",
    "filename_oriboss_right2",
    "filename_oriboss_tubure_left",
    "filename_oriboss_tubure_right",
    "filename_ximage1",
    "filename_ximage2",
    "filename_ximage3",
    "filename_ximage4",
    "j_equip_grenade",
    "j_hp",
    "j_hp_name",
    "oriboss_anime_type",
    "oriboss_destroy",
    "oriboss_fumeru_f",
    "oriboss_hp",
    "oriboss_name",
    "oriboss_speed",
    "oriboss_tail_f",
    "oriboss_ugoki",
    "oriboss_v",
    "oriboss_width",
    "oriboss_height",
    "oriboss_x",
    "oriboss_y",
    "x_image1_view_x",
    "x_image1_x",
    "x_image1_y",
    "x_image2_view_x",
    "x_image2_x",
    "x_image2_y",
    "x_image3_view_x",
    "x_image3_x",
    "x_image3_y",
    "x_image4_view_x",
    "x_image4_x",
    "x_image4_y",
    "bgm_switch",
    "filename_bgm_boss",
    "filename_bgm_chizu",
    "filename_bgm_ending",
    "filename_bgm_stage1",
    "filename_bgm_stage2",
    "filename_bgm_stage3",
    "filename_bgm_stage4",
    "filename_bgm_title",
    "j_equip_fire",
    "oriboss_waza",
    "oriboss_waza_wait",
    "oriboss_waza_select",
    "oriboss_waza_select_option",
    "oriboss_waza1",
    "oriboss_waza1_wait",
    "oriboss_waza2",
    "oriboss_waza2_wait",
    "oriboss_waza3",
    "oriboss_waza3_wait",
    "x_backimage1_filename",
    "x_backimage1_view_x",
    "x_backimage2_filename",
    "x_backimage2_view_x",
    "x_backimage3_filename",
    "x_backimage3_view_x",
    "x_backimage4_filename",
    "x_backimage4_view_x"
];
//マップ系を追加
for (var h = 0; h < 4; h++) {
    var ssfx = ["", "-s", "-t", "-f"][h];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 30; j++) {
            paramKeys.push("map" + i + "-" + j + ssfx);
            paramKeys.push("layer" + i + "-" + j + ssfx);
        }
    }
}
for (var i = 0; i < 9; i++) {
    paramKeys.push("chizu-" + i);
}
//リソースのparamとその説明
var resources = {
    "filename_chizu":"地図画面の背景画像",
    "filename_ending":"エンディング画像",
    "filename_fx_bgm_boss":"ボス戦のBGM",
    "filename_fx_bgm_chizu":"地図画面のBGM",
    "filename_fx_bgm_ending":"エンディング画面のBGM",
    "filename_fx_bgm_stage1":"ステージ1のBGM",
    "filename_fx_bgm_stage2":"ステージ2のBGM",
    "filename_fx_bgm_stage3":"ステージ3のBGM",
    "filename_fx_bgm_stage4":"ステージ4のBGM",
    "filename_fx_bgm_title":"タイトル画面のBGM",
    "filename_gameover":"ゲームオーバー画像",
    "filename_haikei":"背景画像",
    "filename_haikei2":"背景画像（ステージ2）",
    "filename_haikei3":"背景画像（ステージ3）",
    "filename_haikei4":"背景画像（ステージ4）",
    "filename_mapchip":"マップチップ画像（背景レイヤー）",
    "filename_pattern":"パターン画像",
    "filename_title":"タイトル画像",
    "filename_se_bomb":"SE",
    "filename_se_block":"SE",
    "filename_se_chizugamen":"SE",
    "filename_se_clear":"SE",
    "filename_se_coin":"SE",
    "filename_se_dengeki":"SE",
    "filename_se_dokan":"SE",
    "filename_se_dosun":"SE",
    "filename_se_fireball":"SE",
    "filename_se_fumu":"SE",
    "filename_se_gameover":"SE",
    "filename_se_get":"SE",
    "filename_se_grounder":"SE",
    "filename_se_happa":"SE",
    "filename_se_hinoko":"SE",
    "filename_se_item":"SE",
    "filename_se_jet":"SE",
    "filename_se_jump":"SE",
    "filename_se_kaiole":"SE",
    "filename_se_kiki":"SE",
    "filename_se_miss":"SE",
    "filename_se_mizu":"SE",
    "filename_se_mizudeppo":"SE",
    "filename_se_senkuuza":"SE",
    "filename_se_sjump":"SE",
    "filename_se_start":"SE",
    "filename_se_tobasu":"SE",
    "filename_second_haikei":"セカンド背景",
    "filename_second_haikei2":"セカンド背景（ステージ2）",
    "filename_second_haikei3":"セカンド背景（ステージ3）",
    "filename_second_haikei4":"セカンド背景（ステージ4）",
    "filename_bgm_boss":"ボス戦のBGM",
    "filename_bgm_chizu":"地図画面のBGM",
    "filename_bgm_ending":"エンディングのBGM",
    "filename_bgm_stage1":"ステージ1のBGM",
    "filename_bgm_stage2":"ステージ2のBGM",
    "filename_bgm_stage3":"ステージ3のBGM",
    "filename_bgm_stage4":"ステージ4のBGM",
    "filename_bgm_title":"タイトル画面のBGM",
};

//リソースのparam（除去したい）
var resourceKeys = Object.keys(resources);

//リソースの種類
var resourceKinds = {
    "pattern": "パターン画像",
    "title": "タイトル画像",
    "ending": "エンディング画像",
    "gameover": "ゲームオーバー画像",
    "mapchip": "マップチップ画像（背景レイヤー）",
    "chizu": "地図画面の背景画像",
    "haikei": "ステージの背景画像",
    "bgm": "BGM",
    "se": "効果音",
    "other": "その他"
};

//kindとparamの対応
var resourceToKind = {
    "filename_chizu": "chizu",
    "filename_ending":"ending",
    "filename_fx_bgm_boss":"bgm",
    "filename_fx_bgm_chizu":"bgm",
    "filename_fx_bgm_ending":"bgm",
    "filename_fx_bgm_stage1":"bgm",
    "filename_fx_bgm_stage2":"bgm",
    "filename_fx_bgm_stage3":"bgm",
    "filename_fx_bgm_stage4":"bgm",
    "filename_fx_bgm_title":"bgm",
    "filename_gameover":"gameover",
    "filename_haikei":"haikei",
    "filename_haikei2":"haikei",
    "filename_haikei3":"haikei",
    "filename_haikei4":"haikei",
    "filename_mapchip":"mapchip",
    "filename_pattern":"pattern",
    "filename_title":"title",
    "filename_se_bomb":"se",
    "filename_se_block":"se",
    "filename_se_chizugamen":"se",
    "filename_se_clear":"se",
    "filename_se_coin":"se",
    "filename_se_dengeki":"se",
    "filename_se_dokan":"se",
    "filename_se_dosun":"se",
    "filename_se_fireball":"se",
    "filename_se_fumu":"se",
    "filename_se_gameover":"se",
    "filename_se_get":"se",
    "filename_se_grounder":"se",
    "filename_se_happa":"se",
    "filename_se_hinoko":"se",
    "filename_se_item":"se",
    "filename_se_jet":"se",
    "filename_se_jump":"se",
    "filename_se_kaiole":"se",
    "filename_se_kiki":"se",
    "filename_se_miss":"se",
    "filename_se_mizu":"se",
    "filename_se_mizudeppo":"se",
    "filename_se_senkuuza":"se",
    "filename_se_sjump":"se",
    "filename_se_start":"se",
    "filename_se_tobasu":"se",
    "filename_second_haikei":"haikei",
    "filename_second_haikei2":"haikei",
    "filename_second_haikei3":"haikei",
    "filename_second_haikei4":"haikei",
    "filename_bgm_boss":"bgm",
    "filename_bgm_chizu":"bgm",
    "filename_bgm_ending":"bgm",
    "filename_bgm_stage1":"bgm",
    "filename_bgm_stage2":"bgm",
    "filename_bgm_stage3":"bgm",
    "filename_bgm_stage4":"bgm",
    "filename_bgm_title":"bgm",
};

exports.resources = resources;
exports.resourceKeys = resourceKeys;
exports.resourceKinds = resourceKinds;
exports.resourceToKind = resourceToKind;

//パラメータが不正でないか
function validateParams(params) {
    //条件：余計なパラメータがない、長すぎない
    if("object" !== typeof params){
        return false;
    }
    if(params == null){
        return false;
    }
    var keys = Object.keys(params);
    var plen = keys.length;
    var l = paramKeys.length;
    var cnt = 0;
    for (var i = 0; i < l; i++) {
        var key = paramKeys[i], v = params[key];
        if (v != null) {
            //キーを見つけた
            cnt++;
            //長すぎはだめ
            if(("string" !== typeof v) || (v.length > maxlen)) {
                console.log("too long",key,v);
                return false;
            }
        }
    }
    //全部チェック通ったけど……
    if(plen !== cnt){
        //余計なものがあるね
        console.log("extra");
        console.log(keys.filter((key)=>{
            return paramKeys.indexOf(key)<0;
        }));
        return false;
    }
    return true;
}
exports.validateParams = validateParams;

//破壊的にリソース系のパラメータを除去
function removeResources(params) {
    for (var _i = 0; _i < resourceKeys.length; _i++) {
        var key = resourceKeys[_i];
        if (params[key] != null) {
            delete params[key];
        }
    }
}
exports.removeResources = removeResources;

//非破壊的に余計なパラメータを除去
function removeInvalidParams(params){
    var result={};
    for(var i=0;i<paramKeys.length;i++){
        var key=paramKeys[i];
        if(params[key]!=null){
            result[key]=params[key];
        }
    }
    return result;
}
exports.removeInvalidParams=removeInvalidParams;

//バージョン
function validateVersion(version) {
    return version === "2.8" || version === "fx" || version === "kani2";
}
exports.validateVersion = validateVersion;

//ファイルタイプが妥当か
function validateResourceKind(kind){
    return kind in resourceKinds;
}
exports.validateResourceKind = validateResourceKind;

//サーバー側のゲームオブジェクトを実際のcanvas正男用オブジェクトに直したりする
function localizeGame(game){
    var p=extend({},game.params);
    //デフォルトのリソースをセットする
    for(var key in resourceToKind){
        var kind=resourceToKind[key];
        //kindの一覧はlib/masao.jsのresourceKindsに
        var value;
        switch(kind){
            case "pattern":
                value="/static/pattern.gif";
            break;
            case "title":
                value="/static/title.gif";
            break;
            case "ending":
                value="/static/ending.gif";
            break;
            case "gameover":
                value="/static/gameover.gif";
            break;
            case "mapchip":
                value="/static/mapchip.gif";
            break;
            case "chizu":
                value="/static/chizu.gif";
            break;
            case "haikei":
                value="/static/haikei.gif";
            break;
            case "se":
                // いまここ書いてる
                switch(key){
                    case "filename_se_bomb":
                        value="/static/sounds/shot.au";
                    break;
                    case "filename_se_block":
                        value="/static/sounds/bakuhatu.au";
                    break;
                    case "filename_se_chizugamen":
                        value="/static/sounds/get.au";
                    break;
                    case "filename_se_clear":
                        value="/static/sounds/clear.au";
                    break;
                    case "filename_se_coin":
                        value="/static/sounds/coin.au";
                    break;
                    case "filename_se_dengeki":
                        value="/static/sounds/mgan.au";
                    break;
                    case "filename_se_dokan":
                        value="/static/sounds/get.au";
                    break;
                    case "filename_se_dosun":
                        value="/static/sounds/dosun.au";
                    break;
                    case "filename_se_fireball":
                        value="/static/sounds/shot.au";
                    break;
                    case "filename_se_fumu":
                        value="/static/sounds/fumu.au";
                    break;
                    case "filename_se_gameover":
                        value="/static/sounds/gameover.au";
                    break;
                    case "filename_se_get":
                        value="/static/sounds/get.au";
                    break;
                    case "filename_se_grounder":
                        value="/static/sounds/mgan.au";
                    break;
                    case "filename_se_happa":
                        value="/static/sounds/happa.au";
                    break;
                    case "filename_se_hinoko":
                        value="/static/sounds/mgan.au";
                    break;
                    case "filename_se_item":
                        value="/static/sounds/item.au";
                    break;
                    case "filename_se_jet":
                        value="/static/sounds/mgan.au";
                    break;
                    case "filename_se_jump":
                        value="/static/sounds/jump.au";
                    break;
                    case "filename_se_kaiole":
                        value="/static/sounds/happa.au";
                    break;
                    case "filename_se_kiki":
                        value="/static/sounds/kiki.au";
                    break;
                    case "filename_se_miss":
                        value="/static/sounds/dosun.au";
                    break;
                    case "filename_se_mizu":
                        value="/static/sounds/mizu.au";
                    break;
                    case "filename_se_mizudeppo":
                        value="/static/sounds/happa.au";
                    break;
                    case "filename_se_senkuuza":
                        value="/static/sounds/shot.au";
                    break;
                    case "filename_se_sjump":
                        value="/static/sounds/sjump.au";
                    break;
                    case "filename_se_start":
                        value="/static/sounds/item.au";
                    break;
                    case "filename_se_tobasu":
                        value="/static/sounds/tobasu.au";
                    break;
                }
                break;
            case "bgm":
                case "other":
                //TODO
                value="";
            break;
        }
        p[key]=value;
    }
    //カスタムリソースをセット
    var usedResources=game.resources;
    for(var i=0;i < usedResources.length; i++){
        if(usedResources[i].target in resources){
            p[usedResources[i].target] = "/uploaded/"+usedResources[i].id;
        }
    }
    return p;
}
exports.localizeGame = localizeGame;

//masao-json-formatのversion -> masaospaceのversion
function versionCategory(version){
    if(version==="2.7" || version==="2.8"){
        return "2.8";
    }
    if(version==="kani" || version==="kani2"){
        return "kani2";
    }
    return "fx";
}
exports.versionCategory = versionCategory;

//逆
function categoryToVersion(category){
    if(category==="fx"){
        return "fx16";
    }
    return category;
}
exports.categoryToVersion = categoryToVersion;
