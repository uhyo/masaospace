//Server-side API call

import * as Promise from 'native-promise-only';

declare var _g_csrfToken: string;

//returns Promise!
//path: APIのパス
//params: APIに渡すquery
//contentType: multipart/form-dataとか
//raw: JSONでパースせずにArrayBufferで受け取る
export default function api(
  path: string,
  params?: any,
  contentType?: string,
  raw?: boolean,
): Promise<any> {
  if (params == null) {
    params = {};
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path);
  if (raw) {
    //???
    xhr.responseType = 'arraybuffer';
  }
  var requestBody;
  if (contentType === 'multipart/form-data') {
    //FormDataを使ってあれする
    requestBody = new FormData();
    xhr.setRequestHeader('X-CSRF-Token', _g_csrfToken);
    for (var key in params) {
      if (params[key] != null) {
        requestBody.append(key, params[key]);
      }
    }
  } else {
    var ps = [];
    ps.push('_csrf=' + encodeURIComponent(_g_csrfToken));
    for (var key in params) {
      if (params[key] != null) {
        ps.push(
          encodeURIComponent(key) + '=' + encodeURIComponent(params[key]),
        );
      }
    }
    requestBody = ps.join('&');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  xhr.send(requestBody);

  console.log('API call! ', path, params, requestBody);

  return waitForXHR(xhr, !!raw);
}

export function getApi<Raw extends boolean>(
  path: string,
  params: Partial<Record<string, string>> = {},
  raw?: Raw,
): Promise<Raw extends true ? ArrayBuffer : any> {
  const ps = [];
  for (const key in params) {
    const val = params[key];
    if (val != null) {
      ps.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
    }
  }

  const xhr = new XMLHttpRequest();
  const reqPath = ps.length > 0 ? `${path}?${ps.join('&')}` : path;
  xhr.open('GET', reqPath);
  if (raw) {
    xhr.responseType = 'arraybuffer';
  }

  xhr.send();

  console.log('API call! GET', path, params);

  return waitForXHR(xhr, !!raw);
}

function waitForXHR<R>(xhr: XMLHttpRequest, raw: boolean) {
  return new Promise<R>(function(resolve, reject) {
    xhr.addEventListener('load', () => {
      if (xhr.status !== 200) {
        console.error(xhr.status, xhr.responseText);
        reject(xhr.responseText);
        return;
      }
      if (raw) {
        //そのままうけとる
        resolve(xhr.response);
        return;
      }
      var obj;
      try {
        obj = JSON.parse(xhr.response);
      } catch (e) {
        console.error(xhr.response);
        reject(String(e));
        return;
      }
      if (obj.error != null) {
        console.error(obj.error);
        reject(String(obj.error));
        return;
      }
      console.log(obj);
      resolve(obj);
    });
  });
}
