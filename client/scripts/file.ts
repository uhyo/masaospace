//ファイルをダウンロードさせる
export function downloadFile(name: string, blob: Blob) {
  var a = document.createElement('a');
  a.download = name;
  a.target = '_blank';
  a.hidden = true;
  a.style.display = 'none';
  var u = URL.createObjectURL(blob);
  a.href = u;
  document.body.appendChild(a);

  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  }, 0);
}

//ユーザーにファイルをセレクトさせる
export function selectFile(callback: (f: File | null) => void) {
  var input = document.createElement('input');
  input.type = 'file';
  input.hidden = true;
  input.style.display = 'none';
  input.addEventListener('change', () => {
    var files = input.files;
    if (files && files[0] != null) {
      callback(files[0]);
    } else {
      callback(null);
    }
  });
  document.body.appendChild(input);
  input.click();

  document.body.removeChild(input);
}
