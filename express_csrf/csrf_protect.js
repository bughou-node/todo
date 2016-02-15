module.exports = function(req, res, next) {

  req.__defineGetter__('csrf_token', function() {
    if (!req.session.csrf_token) {
      var s = Math.random().toString(36).replace('0.', '');
      req.session.csrf_token = s;
    }
    return req.session.csrf_token;
  });

  if (req.method === 'POST' && (
    req.headers.csrf_token || req.headers.csrf_token 
  ) !== req.csrf_token) {
    return next(new Error('CSRF TOKEN error'));
  }
  next();
}
