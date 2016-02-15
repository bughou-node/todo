var deepcopy = require('deepcopy');
var onHeaders = require('on-headers');
var crypto = require('crypto');

var session_timeout = 3600; //seconds
var cookie_name     = 'node_session';
var cookie_options  = { 
  signed: true, 
  httpOnly: true,
  maxAge: session_timeout * 1000 // milli seconds
}

module.exports = function(req, res, next){
  res.locals.req = req;

  var req_session;
  var res_session;

  req.__defineGetter__('session', function(){
    if (!req_session) {
      req_session = get_session(true);
      req_session.__defineGetter__('id', function(){
        if (!req_session._id) {
          req_session._id = crypto.randomBytes(30).toString('base64');
          res.session('_id', req_session._id);
        }
        return req_session._id;
      });
    }
    return req_session;
  });

  res.session = function(name, value){
    if (!res_session) res_session = get_session();
    res_session[name] = value;
  };

  res.clear_session = function(){
    res_session = { };
  };

  onHeaders(res, function(){
    if (!res_session) return;
    if (Object.keys(res_session).length > 0){
      res_session.timestamp = Math.round(new Date().getTime() / 1000);
      var string = new Buffer(JSON.stringify(res_session)).toString('base64')
      res.cookie(cookie_name, string, cookie_options);
    } else {
      res.clearCookie(cookie_name);
    }
  });

  
  var session;
  function get_session(for_read){
    if (!session) {
      var data = req.signedCookies[cookie_name];
      session = data ? parse_session(data, for_read) : { }
    }
    return deepcopy(session);
  }

  function parse_session(data, for_read){
    data = JSON.parse(new Buffer(data,'base64').toString());
    var now = new Date().getTime() / 1000;
    var session;
    if (data.timestamp && (now < data.timestamp + session_timeout)){
      session = data;
      //延长会话的有效期
      if (for_read && !res_session && now > data.timestamp + session_timeout / 10)
        res_session = deepcopy(session);
    } else {
      session = { }
      //删除过期的会话
      res_session = deepcopy(session); 
    }
    return session;
  }

  next();
}
