/**
 * 金额格式化
 * 
 * @param  {Integer} cents 数额(分)
 * @return {String}       
 */
exports.format = function format (cents) {
  if (isNaN(cents) || !isFinite(cents)) return;
  cents = new String(cents);
  var integer = cents.slice(0, -2).replace(
    /(\d{1,3})(?=(\d{3})+$)/g, '$1,'
  );
  var decimal = cents.slice(-2);
  if (decimal && decimal.length === 1) decimal = '0' + decimal;
  decimal = decimal.replace(/0+$/, '');

  return (integer || '0') + (decimal ? '.' + decimal : '');
};

/**
 * 金额数值化
 * 
 * @param  {String} yuan 数额(元)
 * @return {Integer}       
 */
exports.parse = function parse (yuan) {
  yuan = new String(yuan);
  if (! yuan) return 0;
  var parts = yuan.split('.');
  var integer = parts[0].replace(/,/g, '');
  var decimal = parts[1];
  if (decimal) {
    decimal = decimal.substr(0, 2);
    if (decimal.length === 1) decimal += '0';
  } else decimal = '00';
   
  return parseInt(integer + decimal);
};

