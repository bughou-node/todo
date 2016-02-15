var wrap_error= require('../../../common/utils/track_error.js').wrap_error,
  mongoose = require('../../config/mongoose.js'),
  grid_files = require('./grid_files.js');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var util = require('util');
var _ = require('underscore');

function make_query(value) {
  if (typeof value === 'string')
    return { user_id: value };
  else
    return value;
}

//上传图片
exports.add_file = function(query, collection, file, single, callback) {
  query = make_query(query);
  collection.findOne(query, file.field, function(err, result) {
    if (err) return callback(wrap_error(err));
    if (single && result && result[file.field] && result[file.field].length > 0) {
      remove_file(query, collection, file.field, result[file.field], single, function(err, r) {
        if (err) return callback(wrap_error(err));
        save_file(query, collection, file, single, callback);
      });
    }
    else save_file(query, collection, file, single, callback);
  });
};

//保存图片
function save_file(query, collection, file, single, callback) {
  grid_files.save(file, function(err, file_id) {
    if (err) return callback(wrap_error(err));
    save_file_id(query, collection, file.field, file_id, single, function(err) {
      callback(err, { field: file.field, file_id: file_id });
    });
  });
};

exports.get_file = function(query, collection, thumbnail, field, file_id, callback) {
  query = make_query(query);
  collection.findOne(query, field, function(err, result) {
    if (err) return callback(wrap_error(err));
    if (!result || !result[field]) 
      return callback(null, { message: "this user haven't this file" });

    var value = result[field];
    if (!util.isArray(value)) 
      return grid_files.get(value, thumbnail, callback);

    if (value.indexOf(file_id) >= 0) 
      grid_files.get(file_id, thumbnail, callback);
    else callback(null, { message: "this user haven't this file" })
  });
};

exports.remove_file = remove_file;

function remove_file(query, collection, field, file_id, single, callback) {
  query = make_query(query);
  collection.findOne(query, field, function(err, result) {
    if (err) return callback(wrap_error(err));
    var condition = _.clone(query);
    condition[field] = file_id;

    var updates = { };
    (updates['$set'] = { }).updated_at = new Date();
    if (single) {
      (updates['$unset'] = { })[field] = 1;
    } else {
      (updates['$pull'] = { })[field] = file_id;
    }
    collection.update(condition, updates, function(err, r) {
      if (err) return callback(wrap_error(err));

      if (r && r.ok === 1) grid_files.remove(file_id, callback);
      else callback();
    });
  });
};


function save_file_id(query, collection, field, file_id, single, callback) {
  collection.findOne(query, file_id, function(err, doc) {
    if (err) return callback(wrap_error(err));
    var file_id_now = doc && doc[field];
    if (file_id_now) {
      if (single && file_id_now === file_id ||
      !single && file_id_now.indexOf(file_id) >= 0
      ) return callback();
    }
    add_file_id(query, collection, field, file_id, single, callback);
  });
};

function add_file_id(query, collection, field, file_id, single, callback) {
  var updates = { };
  var now = new Date();
  (updates['$set'] = { }).updated_at = now;
  if (single) {
    updates['$set'][field] = file_id;
  } else {
    (updates['$addToSet'] = { })[field] = file_id;
  }
  updates['$setOnInsert'] = { created_at: now };

  collection.update(query, updates, { upsert: true }, function(err, r) {
    if (err) return callback(wrap_error(err));
    if (r && r.ok === 1) return callback();
    callback(null, { message: 'save file id failed' });
  });
}
