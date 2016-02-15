/* 常量定义
 * @param {Object} data 常量定义数据 {
 *   symbol: [ value, name ]
 * }
 * @return {Object} 形如 {
 *   symbol2value: ...,
 *   value2name: ...,
 * }
 */

exports.const_define = function (data) {
  var symbol2value = { };
  var value2name   = { };

  for (var symbol in data) {
    var tmp = data[symbol];
    var value = tmp[0], name = tmp[1];

    if (value2name[value]) throw 'duplicate value: ' + value;

    symbol2value[symbol] = value;
    value2name[value] = name;
  }

  return { symbol2value: symbol2value, value2name: value2name };
};

exports.make_bits = function () {
  var byte = 0;
  for (var pos in arguments) {
    if (arguments[pos]) {
      byte = byte | (1 << pos);
    }
  }
  return byte;
};
