// MasaoSpace-specific masao handling module.

import {
    param,
    format,
    playlog,
    load,
} from 'masao';

import {
    Game,
    GameEditableMetadata,
    MasaoCategory,
    Resource,
    ResourceKind,
    MasaoJSONFormat,
} from './data';

// export raw masao API
export {
    param,
    format,
    playlog,
    load,
};

// パラメータの長さ限度
const maxlen = 120;

const paramKeys = param.paramKeys;

// リソースのparamとその説明
export const resources: Record<string, string> = {
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

export const resourceKeys = Object.keys(resources);

// リソースの種類
export const resourceKinds: Record<ResourceKind, string> = {
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

// kindとparamの対応
export const resourceToKind: Record<string, ResourceKind> = {
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

// パラメータが不正でないかチェックする
export function validateParams(params: Record<string, string>): boolean {
    //条件：余計なパラメータがない、長すぎない
    if("object" !== typeof params){
        return false;
    }
    if(params == null){
        return false;
    }
    const keys = Object.keys(params);
    const plen = keys.length;
    const l = paramKeys.length;
    let cnt = 0;
    for (let i = 0; i < l; i++) {
        const key = paramKeys[i];
        const v = params[key];
        if (v != null) {
            //キーを見つけた
            cnt++;
            //長すぎはだめ
            if(("string" !== typeof v) || (v.length > maxlen)) {
                return false;
            }
        }
    }
    //全部チェック通ったけど……
    if(plen !== cnt){
        //余計なものがあるね
        return false;
    }
    return true;
}

//破壊的にリソース系のパラメータを除去
export function removeResources(params: Record<string, string>): void{
    for (let i = 0; i < resourceKeys.length; i++) {
        const key = resourceKeys[i];
        if (params[key] != null) {
            delete params[key];
        }
    }
}

//非破壊的に余計なパラメータを除去
export function removeInvalidParams(params: Record<string, string>): Record<string, string>{
    const result: Record<string, string> = {};
    for(let i=0;i<paramKeys.length;i++){
        const key=paramKeys[i];
        if(params[key] != null){
            result[key] = params[key];
        }
    }
    return result;
}

// 余計なパラメータとマップデータも除去
export function filterParams(params: Record<string, string>, filter: (key: string, value: string)=>boolean): Record<string, string>{
    const result: Record<string, string> = {};
    for(let i=0; i<paramKeys.length ;i++){
        const key = paramKeys[i];
        const value = params[key];
        if (params[key]!=null && filter(key, value)){
            result[key] = value;
        }
    }
    return result;
}

// 最小のゲーム
export function minimize(game: MasaoJSONFormat): MasaoJSONFormat{
    const {
        'masao-json-format-version': mjfv,
        params,
        version,
        metadata,
        script,
        'advanced-map': advm,
    } = game;

    // advanced-mapを最小に
    const advm2 = advm != null ?
        format.sanitizeAdvancedMap(mjfv, advm, {
            stageNumber: getLastStage(params),
        }) :
        void 0;

    // paramsから余計なものを除去
    const params2 = filterParams(params, (key, value)=>{
        const data = param.data[key];
        if (data.type!=='map' && data.type!=='layer' && data.type!=='resource' && value!==data.default){
            return true;
        }
        return false;
    });

    return {
        'masao-json-format-version': mjfv,
        params: params2,
        version,
        metadata,
        script,
        'advanced-map': advm2,
    };
}

/*
// MasaoSpace的に妥当なバージョンか調べる
export function validateVersion(version: string){
    return version === '2.8' || version === 'fx' || version === 'kani2';
}
*/

//ファイルタイプが妥当か
export function validateResourceKind(kind: string): kind is ResourceKind{
    return kind in resourceKinds;
}

//サーバー側のゲームオブジェクトを実際のcanvas正男用オブジェクトに直したりする
//game: GameDataオブジェクト, domain: データを読み込む元のドメイン
export function localizeGame(game: Game, domain?: string | null){
    if(domain==null){
        domain="";
    }else{
        domain=`//${domain}`;
    }
    const p = {
        ... game.params,
    };

    //デフォルトのリソースをセットする
    for(let key in resourceToKind){
        const kind: ResourceKind = resourceToKind[key];
        let value: string;
        switch(kind){
            case "pattern":
                value=domain+"/static/pattern.gif";
            break;
            case "title":
                value=domain+"/static/title.gif";
            break;
            case "ending":
                value=domain+"/static/ending.gif";
            break;
            case "gameover":
                value=domain+"/static/gameover.gif";
            break;
            case "mapchip":
                value=domain+"/static/mapchip.gif";
            break;
            case "chizu":
                value=domain+"/static/chizu.gif";
            break;
            case "haikei":
                value=domain+"/static/haikei.gif";
            break;
            case "se":
                switch(key){
                    case "filename_se_bomb":
                        value=domain+"/static/sounds/shot.au";
                    break;
                    case "filename_se_block":
                        value=domain+"/static/sounds/bakuhatu.au";
                    break;
                    case "filename_se_chizugamen":
                        value=domain+"/static/sounds/get.au";
                    break;
                    case "filename_se_clear":
                        value=domain+"/static/sounds/clear.au";
                    break;
                    case "filename_se_coin":
                        value=domain+"/static/sounds/coin.au";
                    break;
                    case "filename_se_dengeki":
                        value=domain+"/static/sounds/mgan.au";
                    break;
                    case "filename_se_dokan":
                        value=domain+"/static/sounds/get.au";
                    break;
                    case "filename_se_dosun":
                        value=domain+"/static/sounds/dosun.au";
                    break;
                    case "filename_se_fireball":
                        value=domain+"/static/sounds/shot.au";
                    break;
                    case "filename_se_fumu":
                        value=domain+"/static/sounds/fumu.au";
                    break;
                    case "filename_se_gameover":
                        value=domain+"/static/sounds/gameover.au";
                    break;
                    case "filename_se_get":
                        value=domain+"/static/sounds/get.au";
                    break;
                    case "filename_se_grounder":
                        value=domain+"/static/sounds/mgan.au";
                    break;
                    case "filename_se_happa":
                        value=domain+"/static/sounds/happa.au";
                    break;
                    case "filename_se_hinoko":
                        value=domain+"/static/sounds/mgan.au";
                    break;
                    case "filename_se_item":
                        value=domain+"/static/sounds/item.au";
                    break;
                    case "filename_se_jet":
                        value=domain+"/static/sounds/mgan.au";
                    break;
                    case "filename_se_jump":
                        value=domain+"/static/sounds/jump.au";
                    break;
                    case "filename_se_kaiole":
                        value=domain+"/static/sounds/happa.au";
                    break;
                    case "filename_se_kiki":
                        value=domain+"/static/sounds/kiki.au";
                    break;
                    case "filename_se_miss":
                        value=domain+"/static/sounds/dosun.au";
                    break;
                    case "filename_se_mizu":
                        value=domain+"/static/sounds/mizu.au";
                    break;
                    case "filename_se_mizudeppo":
                        value=domain+"/static/sounds/happa.au";
                    break;
                    case "filename_se_senkuuza":
                        value=domain+"/static/sounds/shot.au";
                    break;
                    case "filename_se_sjump":
                        value=domain+"/static/sounds/sjump.au";
                    break;
                    case "filename_se_start":
                        value=domain+"/static/sounds/item.au";
                    break;
                    case "filename_se_tobasu":
                        value=domain+"/static/sounds/tobasu.au";
                    break;
                    default:
                        value = '';
                        break;
                }
                break;
            case "bgm":
            case "other":
                //TODO
                value="";
                break;
            default:
                //Is this really needed?
                value = '';

        }
        p[key] = value;
    }
    //カスタムリソースをセット
    const usedResources = game.resources;
    for(let i=0; i < usedResources.length; i++){
        if(usedResources[i].target in resources){
            p[usedResources[i].target] = domain+"/uploaded/"+usedResources[i].id;
        }
    }
    return p;
}

//正男のステージがステージ何まであるか調べる
export function getLastStage(params: Record<string, string>): number{
    const st = params.stage_max || param.getDefaultValue("stage_max") || '';
    return parseInt(st) || 1;
}

//masao-json-formatのversion -> masaospaceのversion
export function versionCategory(version: string): MasaoCategory{
    if(version==="2.7" || version==="2.8"){
        return '2.8';
    }
    if(version==="kani" || version==="kani2"){
        return 'kani2';
    }
    return 'fx';
}
// 逆
export function categoryToVersion(category: MasaoCategory): string{
    if(category==="fx"){
        return "fx16";
    }
    return category;
}

// formatの変換
export function formatToMetadata(format: MasaoJSONFormat): Partial<GameEditableMetadata>{
    const {
        metadata,
    } = format;
    const title = metadata!=null && 'string'===typeof metadata.title ? metadata.title : '';
    return {
        title,
    };
}
export function formatToGame(format: MasaoJSONFormat, resources?: Array<Resource>): Game{
    const {
        params,
        version,
        script,
    } = format;

    const game: Game = {
        id: Number.NaN,
        version: versionCategory(version),
        params,
        resources: resources || [],
        script: script || null,
        'advanced-map': format['advanced-map'],
    };
    removeResources(game.params);
    removeInvalidParams(game.params);
    return game;
}
export function gameToFormat(game: Game): MasaoJSONFormat{
    return format.make({
        version: categoryToVersion(game.version),
        params: game.params,
        script: game.script || void 0,
        'advanced-map': game['advanced-map'],
    });
}
