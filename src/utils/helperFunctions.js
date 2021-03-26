import Axios from 'axios';

export const downloadFile = (url) => {
  try
  {
    Axios.get(url, {
      responseType: 'blob',
    }).then(res => {

        var blob = new Blob([res.data], { type: res.headers['content-type'] });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = url.substring(url.lastIndexOf('/')+1);;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      
    });
  }
  catch(e) {
    console.log("ERROR - Downloading file failed: ", e)
  }
}

// https://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript
export function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}
