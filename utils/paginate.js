var url = require('url');

module.exports = function (data, req) {
  return paginate(url.parse(req.url, true), get_last_page(data), 3, 5, 3);
};

function get_page_url (uri, page){
  uri.query.page = page;
  return url.format({ pathname: uri.pathname, query: uri.query });
}

function get_last_page (data) {
  var total = data.total || 0;
  if (total <= 0) return 1;
  return Math.ceil(total / (data.page_size || 15));
}

function get_current_page (page, last) {
  if (page) {
    page = parseInt(page);
    if (!page || page < 1) page = 1;
  } else page = 1;

  if (page > last) page = last;
  return page;
}

function paginate(uri, last, left, middle, right) {
  if (last === 1) return;
  var current = get_current_page(uri.query.page, last);

  var nav = '<ul class="pagination">';
  var prev = current - 1;
  if (prev >= 1) {
    nav += '<li><a href="' + get_page_url(uri, prev) + '">上一页</a></li>';
  }
  else nav += '<li class="disabled"><span>上一页</span></li>';
  /*
   * divide all page number into three parts: left, middle, right。
   * calculate the left end and right start page number。
   */
  var left_end = current - Math.ceil(middle / 2);
  var left_end2 = last - right - middle;
  if (left_end2 < left_end) left_end = left_end2;
  if (left_end < left) left_end = left;
  var right_start = last - right + 1;

  var nav_count = left + middle + right;
  if (last < nav_count) nav_count = last;
  var left_last = left;
  var right_first = left + middle + 1;
  var i, now;
  for (i = now = 1; i <= nav_count; i++) {
    if (i == left_last && now < left_end) {
      nav += '<li><span>...</span></li>';
      now = left_end + 1;
    } else if (i == right_first && now < right_start) {
      nav += '<li><span>...</span></li>';
      now = right_start + 1;
    } else {
      if (now == current) nav += '<li class="active"><span>' + now + '</span></li>';
      else nav += '<li><a href="' + get_page_url(uri, now) + '">' + now + '</a></li>';
      now++;
    }
  }
  var next = current + 1;
  if (next <= last) {
    nav += '<li><a href="' + get_page_url(uri, next) + '">下一页</a></li>';
  }
  else nav += '<li class="disabled"><span>下一页</span></li>';
  nav += '</ul>';

  return nav;
}
