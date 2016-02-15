
module.exports = function(req, res, next) {
  var req_flash;
  var res_flash;

  function get_req_flash() {
    if (!req_flash) {
      if (req.session.flash) {
        req_flash = req.session.flash;
        delete req.session.flash;
      } else req_flash = { };
    }
    return req_flash;
  }

  Object.defineProperty(req, 'flash', {
    get: get_req_flash
  });

  Object.defineProperty(res, 'flash', {
    get: function() {
      if (!res_flash) {
        get_req_flash();
        res_flash = res.session.flash = { };
      }
      return res_flash;
    }
  });

  next();
}

