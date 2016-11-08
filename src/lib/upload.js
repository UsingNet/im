import reqwest from 'reqwest';
import config from '../config';

class Upload {
  init(cb) {
    var file = document.getElementById('file');
    var editor = document.querySelector('.editor');
    file.addEventListener('change', function(e) {
      var data = new FormData;
      data.append('file', e.target.files[0]);
      reqwest({
        url: config.upload,
        method: 'POST',
        data: data,
        processData: false,
        contentType: false
      }).then((resp) => {
        var obj = JSON.parse(resp);
        cb(obj);
      })
    });
  }
}

export default new Upload;
