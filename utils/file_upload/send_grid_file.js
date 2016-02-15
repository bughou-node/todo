var wrap_error = require('../../../common/utils/track_error.js').wrap_error;

module.exports = function send_grid_file(req, res, next, get_grid_file) {
  if (req.headers['if-modified-since']) {
    res.writeHead(304, 'Not Modified');
    res.end();
    return;
  }
  get_grid_file(function(err, grid_store) {
    if (err) return next(wrap_error(err));
    if (!grid_store.stream) return res.json(grid_store);
    var time = new Date();
    res.setHeader('Last-Modified', time.toGMTString());
    time.setFullYear(time.getFullYear() + 1);
    res.setHeader('Expires', time.toGMTString());
    res.setHeader('Content-Type', grid_store.contentType);
    grid_store.stream(true).on('error', function(err) {
      next(wrap_error(err));
    }).pipe(res);
  });
};
