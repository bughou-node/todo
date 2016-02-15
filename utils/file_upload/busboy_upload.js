var Busboy = require('busboy');

var allowed_exts = [ 'png', 'jpg', 'jpeg' ];

function not_allowed_ext(file_name) {
  var ext = file_name.substr(file_name.lastIndexOf('.') + 1).toLowerCase();
  if (allowed_exts.indexOf(ext) < 0) return true;
}


module.exports = function busboy_upload(req, res, callback) {
  //for IE to use text plain
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  var busboy = new Busboy({
    headers: req.headers,
    limits: { files: 1, fileSize: 4 * 1024 * 1024 }
  });

  var valid = false;
  busboy.on('field', function(field_name, value, name_truncated, value_truncated) {
    if (field_name === 'csrf_token' && value === req.session.csrf_token) {
      valid = true;
    }
  });

  busboy.on('file', function(field_name, file_stream, file_name, encoding, mimetype) {
    if (!valid) return callback('CSRF TOKEN error');
    if (not_allowed_ext(file_name)) return callback('文件类型错误');
    if (!/^image\//i.test(mimetype)) return callback('文件格式错误:' + mimetype);

    var limit_error;
    file_stream.on('limit', function(d) {
      limit_error = true;
      callback('文件大小超过限制');
    });

    var bufs = [ ];
    file_stream.on('data', function(d) {
      bufs.push(d);
    });

    file_stream.on('end', function() {
      if (limit_error) return;
      callback(null, {
        field: field_name,
        name: file_name,
        encoding: encoding,
        mimetype: mimetype,
        content: Buffer.concat(bufs)
      });
    });
  });

  req.pipe(busboy);
}