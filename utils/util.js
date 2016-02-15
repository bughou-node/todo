var ObjectId = require('mongoose').Types.ObjectId;
var util = require('util');
module.exports = util;

util.isEmptyObject = function (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

util.isEmpty = function isEmpty (obj) {
  if (!obj) return true;

  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

util.is_valid_object_id = function (str) {
  return /^[0-9a-f]{24}$/i.test(str);
};

util.get_uuid = function () {
  return ObjectId().toString();
};

util.get_current_page = function (page, size, count) {
  if (page) {
    page = parseInt(page);
    if (!page || page < 1) page = 1;
  }
  else page = 1;
  var page_total = Math.ceil(count / size) || 1;
  if (page > page_total) page = page_total;
  return page;
};

util.get_value = function (object, path) {
  if (typeof (path) === 'string') 
    path = path.split('.');
  for (var i = 0, key; key = path[i]; i++) {
    if (!object) return;
    object = object[key];
  }
  return object;
};


