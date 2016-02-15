
module.exports =  function(doc, funcs) {
  var errors = { };
  var data  = { };

  for (var key in funcs) {
    var error = funcs[key](doc[key], doc);
    if (error) errors[key] = error;
    else data[key] = doc[key];
  }

  return Object.keys(errors).length > 0 ?
    { error: errors, data: data } : { data: data };
};
