var connection = require('../../config/mongoose.js').connection,
  db = connection.db,
  collection = db.collection('fs.files'),
  GridStore = require('mongodb').GridStore,
  ObjectID = require('mongodb').ObjectID,
  sharp = require('sharp'),
  crypto = require('crypto'),
  wrap_error= require('../../../common/utils/track_error.js').wrap_error;


exports.save = function(file, callback) {
  var md5 = crypto.createHash('md5').update(file.content).digest('hex');
  collection.findOneAndUpdate(
    { md5: md5 }, { $inc: { 'metadata.ref_count': 1 } },
    { projection: { _id: 1 } }, function(err, r) {
      if (err) return callback(wrap_error(err));
      if (r && r.value) callback(null, r.value._id.toString());
      else create(file, callback);
    });
}

exports.get = function(file_id, thumbnail, callback) {
  //thumbnail为true，就是缩略图，为false就是原图
  var root = thumbnail ? 'thumbnail' : 'fs';
  new GridStore(
    db, new ObjectID(file_id), 'r', { root: root }
  ).open(function(err, gs) {
    if (err) return callback(wrap_error(err));
    callback(null, gs);
  });
}

exports.remove = function(file_id, callback) {
  file_id = new ObjectID(file_id);
  collection.findOneAndUpdate(
    { _id:  file_id }, { $inc: { 'metadata.ref_count': -1 } }, { projection: { 'metadata.ref_count': 1 } },
    function(err, r) {
      if (err) return callback(wrap_error(err));
      // ref_count is the value before minus 1
      var ref_count = r.value.metadata && r.value.metadata.ref_count;
      if (ref_count > 1) return callback();

      GridStore.unlink(db, file_id, function(err, r) {
        GridStore.unlink(db, file_id, {root: 'thumbnail'}, callback);
      });
    });
}


function create(file, callback) {
  create_file(file, function(err, doc) {
    if (err) return callback(wrap_error(err));
    create_thumbnail(file, doc._id, function(err) {
      if (err) return callback(wrap_error(err));
      callback(null, doc._id.toString());
    });
  });
}

function create_file(file, callback) {
  new GridStore(db, new ObjectID(), file.name, 'w', {
    content_type: file.mimetype,
    metadata: { ref_count: 1 }
  }).open(function(err, gs) {
    if (err) return callback(wrap_error(err));
    gs.write(file.content, function(err, gs) {
      if (err) return callback(wrap_error(err));
      gs.close(callback);
    });
  });
}


function create_thumbnail(file, file_id, callback) {
  thumbnail_stream(file, file_id, function(err, stream) {
    if (err) return callback(wrap_error(err));
    stream.on('error', function(err) {
      callback(wrap_error(err));
    }).on('end', function() {
      callback();
    });

    sharp(file.content).resize(240, 160).max()
    .on('error', function(err) {
      callback(wrap_error(err));
    }).pipe(stream);
  });
}

function thumbnail_stream(file, file_id, callback) {
  new GridStore(db, file_id, file.name, 'w', {
    root: 'thumbnail',
    content_type: file.mimetype,
  }).open(function(err, gs) {
    if (err) return callback(wrap_error(err));
    callback(null, gs.stream(true));
  });
}

connection.on('connected', function(){
  collection.ensureIndex('md5', { unique: true }, function(err, r) {
    if (err) throw err;
  });
});

